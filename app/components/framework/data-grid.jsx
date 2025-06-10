"use client";

import { useState, useEffect, useRef, useMemo, forwardRef, useImperativeHandle, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

// Custom loading overlay
const CustomLoadingOverlay = () => (
  <div className="flex items-center justify-center py-8" data-testid="data-grid-loading-overlay">
    <div className="flex items-center gap-2" data-testid="data-grid-loading-content">
      <div className="h-3 w-3 animate-spin rounded-full border border-primary border-t-transparent" data-testid="data-grid-loading-spinner"></div>
      <span className="text-muted-foreground text-xs" data-testid="data-grid-loading-text">Loading data...</span>
    </div>
  </div>
);

// Custom no rows overlay
const CustomNoRowsOverlay = ({ emptyMessage = "No data found", emptyDescription = "No records to display", showAddButton = false, onAddClick }) => (
  <div className="flex flex-col items-center justify-center py-8" data-testid="data-grid-empty-overlay">
    <Package className="h-8 w-8 text-muted-foreground mb-2" data-testid="data-grid-empty-icon" />
    <h3 className="text-sm font-semibold mb-1" data-testid="data-grid-empty-title">{emptyMessage}</h3>
    <p className="text-muted-foreground text-xs mb-2" data-testid="data-grid-empty-description">{emptyDescription}</p>
    {showAddButton && onAddClick && (
      <Button size="sm" onClick={onAddClick} data-testid="data-grid-empty-add-button">
        Add Item
      </Button>
    )}
  </div>
);

export const DataGrid = forwardRef(function DataGrid({
  data = [],
  columnDefs = [],
  loading = false,
  selectedIds = [],
  onSelectionChange,
  onRowClick,
  focusedId,
  onRowFocus,
  showCheckboxes = true,
  enablePagination = false,
  enableHighlight = true, // ✅ Controls both highlighting AND initial focus
  rowHeight = 24,
  headerHeight = 30,
  emptyMessage = "No data found",
  emptyDescription = "No records to display",
  showAddButton = false,
  onAddClick,
  className = "",
  onSelectAll,
  ...gridProps
}, ref) {
  const gridRef = useRef();
  const [lastClickedId, setLastClickedId] = useState(null);
  
  // ✅ CRITICAL FIX: Use local state to track current values for immediate access
  const currentFocusedId = useRef(focusedId);
  const currentSelectedIds = useRef(selectedIds);
  
  // ✅ NEW: Track selection range for Shift+Arrow navigation
  const selectionAnchor = useRef(null);
  const lastSelectionDirection = useRef(null); // Track if we're extending or contracting selection

  // ✅ Update refs when props change
  useEffect(() => {
    currentFocusedId.current = focusedId;
  }, [focusedId]);

  useEffect(() => {
    currentSelectedIds.current = selectedIds;
  }, [selectedIds]);

  // ✅ Expose refocus method and grid element to parent
  useImperativeHandle(ref, () => ({
    refocus: () => {
      if (gridRef.current?.api && data.length > 0 && enableHighlight) {
        // Find the focused row index
        const focusIndex = currentFocusedId.current 
          ? data.findIndex(item => item.id === currentFocusedId.current)
          : 0;
        const validIndex = focusIndex >= 0 ? focusIndex : 0;
        
        // Set focus back to the grid
        const firstColumn = showCheckboxes ? 'select' : finalColumnDefs[0]?.field;
        if (firstColumn) {
          gridRef.current.api.setFocusedCell(validIndex, firstColumn);
        }
      }
    },
    getGridElement: () => {
      return gridRef.current?.eGridDiv || null;
    }
  }));

  // Prepare column definitions with optional checkbox column
  const finalColumnDefs = useMemo(() => {
    const columns = [...columnDefs];
    
    if (showCheckboxes) {
      columns.unshift({
        field: "select",
        headerName: "",
        width: 50,
        checkboxSelection: true,
        headerCheckboxSelection: true,
        resizable: false,
        sortable: false,
        filter: false
      });
    }
    
    return columns;
  }, [columnDefs, showCheckboxes]);

  // Default column definitions
  const defaultColDef = useMemo(
    () => ({
      resizable: true,
      minWidth: 50,
      filter: true,
      filterParams: {
        buttons: ["apply", "clear"],
        closeOnApply: true,
      },
    }),
    []
  );

  // ✅ IMPROVED HORIZONTAL SCROLLING WITH PROPER COLUMN HANDLING
  const handleHorizontalScroll = useCallback((direction) => {
    if (!gridRef.current?.api) return;

    const api = gridRef.current.api;
    const focusedCell = api.getFocusedCell();
    if (!focusedCell) return;

    const visibleColumns = api.getAllDisplayedColumns();
    
    // ✅ CRITICAL FIX: Properly get the column ID from the focused cell
    let currentColumnId;
    if (focusedCell.column) {
      // Try different ways to get the column ID
      currentColumnId = focusedCell.column.getColId ? 
        focusedCell.column.getColId() : 
        focusedCell.column.colId || 
        focusedCell.column;
    }
    
    if (!currentColumnId) {
      console.warn('Could not determine current column ID from focused cell:', focusedCell);
      return;
    }
    
    const currentColumnIndex = visibleColumns.findIndex(col => col.getColId() === currentColumnId);
    
    if (currentColumnIndex === -1) {
      console.warn('Current column not found in visible columns. Column ID:', currentColumnId);
      console.warn('Available column IDs:', visibleColumns.map(col => col.getColId()));
      return;
    }

    let targetColumnIndex;
    
    if (direction === 'left') {
      targetColumnIndex = currentColumnIndex - 1;
      if (targetColumnIndex < 0) return; // Don't move beyond first column
    } else {
      targetColumnIndex = currentColumnIndex + 1;
      if (targetColumnIndex >= visibleColumns.length) return; // Don't move beyond last column
    }

    const targetColumn = visibleColumns[targetColumnIndex];
    if (!targetColumn) return;

    // Set focus to the new column
    api.setFocusedCell(focusedCell.rowIndex, targetColumn.getColId());
    
    // ✅ USE AG GRID'S ensureColumnVisible FOR SMOOTH SCROLLING
    setTimeout(() => {
      api.ensureColumnVisible(targetColumn.getColId());
    }, 10);
  }, []);

  // ✅ CRITICAL FIX: Handle Shift + Arrow key selection - SELECT CURRENT ROW FIRST, THEN MOVE
  const handleShiftArrowNavigation = useCallback((direction) => {
    console.log('🔥 handleShiftArrowNavigation called with direction:', direction);
    console.log('🔥 Current state - focusedId:', currentFocusedId.current, 'selectedIds:', currentSelectedIds.current);
    
    if (!gridRef.current?.api || !currentFocusedId.current || !showCheckboxes || !onSelectionChange || !onRowFocus) {
      console.log('🔥 Early return - missing requirements');
      return;
    }

    const api = gridRef.current.api;
    const currentFocusIndex = data.findIndex(item => item.id === currentFocusedId.current);
    
    if (currentFocusIndex === -1) {
      console.log('🔥 Early return - current focus index not found');
      return;
    }

    console.log('🔥 Current focus index:', currentFocusIndex);

    // ✅ CRITICAL FIX: FIRST - Toggle selection of CURRENT row (where focus is)
    const currentItem = data[currentFocusIndex];
    const isCurrentSelected = currentSelectedIds.current.includes(currentItem.id);
    
    console.log('🔥 Current item:', currentItem.id, 'isCurrentlySelected:', isCurrentSelected);
    
    let newSelectedIds;
    
    if (isCurrentSelected) {
      // ✅ UNCHECK: Remove current item from selection
      console.log('🔥 Current item is selected - UNCHECKING');
      newSelectedIds = currentSelectedIds.current.filter(id => id !== currentItem.id);
    } else {
      // ✅ CHECK: Add current item to selection
      console.log('🔥 Current item is not selected - CHECKING');
      newSelectedIds = [...currentSelectedIds.current, currentItem.id];
    }
    
    console.log('🔥 Calling onSelectionChange with:', newSelectedIds);
    
    // ✅ CRITICAL FIX: Update local ref immediately for next operation
    currentSelectedIds.current = newSelectedIds;
    
    // ✅ CRITICAL FIX: Send update immediately (no debouncing)
    onSelectionChange(newSelectedIds);

    // ✅ SECOND - Move focus to next/previous row
    let targetIndex;
    if (direction === 'down') {
      targetIndex = currentFocusIndex + 1;
      if (targetIndex >= data.length) {
        console.log('🔥 Cannot move down - at last row');
        return; // Don't move beyond last row
      }
    } else {
      targetIndex = currentFocusIndex - 1;
      if (targetIndex < 0) {
        console.log('🔥 Cannot move up - at first row');
        return; // Don't move beyond first row
      }
    }

    console.log('🔥 Moving focus to index:', targetIndex);

    const targetItem = data[targetIndex];
    if (targetItem) {
      // ✅ CRITICAL FIX: Update local ref immediately
      currentFocusedId.current = targetItem.id;
      
      // Update focus immediately (no debounce needed for focus)
      console.log('🔥 Setting focus to item:', targetItem.id);
      onRowFocus(targetItem.id);
      
      // Set AG Grid focus
      const firstColumn = showCheckboxes ? 'select' : finalColumnDefs[0]?.field;
      if (firstColumn) {
        setTimeout(() => {
          if (gridRef.current?.api) {
            gridRef.current.api.setFocusedCell(targetIndex, firstColumn);
          }
        }, 0);
      }
      
      // Ensure row is visible
      setTimeout(() => {
        if (gridRef.current?.api) {
          gridRef.current.api.ensureIndexVisible(targetIndex, 'bottom');
        }
      }, 10);
    }
  }, [data, showCheckboxes, onRowFocus, onSelectionChange, finalColumnDefs]);

  // ✅ CRITICAL FIX: Handle Ctrl+A for select/deselect all - COMPLETELY REWRITTEN
  const handleSelectAll = useCallback(() => {
    console.log('🔥 DataGrid handleSelectAll called');
    console.log('🔥 Current selectedIds:', currentSelectedIds.current);
    console.log('🔥 Total data items:', data.length);
    
    if (!showCheckboxes || !onSelectionChange) {
      console.log('🔥 Early return - checkboxes disabled or no onSelectionChange');
      return;
    }

    const allItemIds = data.map(item => item.id);
    console.log('🔥 All item IDs:', allItemIds);
    
    // ✅ CRITICAL FIX: Check if ALL items are currently selected
    const allSelected = allItemIds.length > 0 && 
                       currentSelectedIds.current.length === allItemIds.length && 
                       allItemIds.every(id => currentSelectedIds.current.includes(id));
    
    console.log('🔥 All selected?', allSelected);
    
    let newSelectedIds;
    if (allSelected) {
      // ✅ All items are selected - DESELECT ALL
      console.log('🔥 Deselecting all items');
      newSelectedIds = [];
    } else {
      // ✅ Not all items are selected - SELECT ALL
      console.log('🔥 Selecting all items');
      newSelectedIds = [...allItemIds];
    }
    
    console.log('🔥 New selection:', newSelectedIds);
    
    // ✅ CRITICAL FIX: Update local ref immediately
    currentSelectedIds.current = newSelectedIds;
    
    // ✅ CRITICAL FIX: Force AG Grid to update BEFORE calling parent
    if (gridRef.current?.api) {
      const api = gridRef.current.api;
      
      // Get all row nodes
      const allNodes = [];
      api.forEachNode((node) => allNodes.push(node));
      
      // Update selection state for each node IMMEDIATELY
      allNodes.forEach((node) => {
        const shouldBeSelected = newSelectedIds.includes(node.data.id);
        node.setSelected(shouldBeSelected, false); // false = don't trigger selection event
      });
      
      console.log('🔥 AG Grid nodes updated, now calling parent onSelectionChange');
    }
    
    // ✅ Send update to parent AFTER AG Grid is updated
    onSelectionChange(newSelectedIds);
  }, [data, showCheckboxes, onSelectionChange]);

  // Grid options with enhanced navigation
  const gridOptions = useMemo(
    () => ({
      suppressCellFocus: false,
      enableCellTextSelection: true,
      ensureDomOrder: true,
      suppressRowClickSelection: true,
      rowSelection: showCheckboxes ? "multiple" : "single",
      enableCellChangeFlash: false,
      suppressMovableColumns: true,
      headerHeight: headerHeight,
      pagination: enablePagination,
      suppressPaginationPanel: !enablePagination,
      enableRangeSelection: false,
      suppressMultiRangeSelection: true,
      suppressScrollOnNewData: true,
      suppressAnimationFrame: false,
      
      // ✅ ENHANCED NAVIGATION WITH PROPER CTRL+DOWN/UP BLOCKING AND SHIFT+ARROW HANDLING
      navigateToNextCell: (params) => {
        const suggestedNextCell = params.nextCellPosition;
        
        // ✅ CRITICAL FIX: Block Ctrl + Down/Up BEFORE any processing
        if (params.event && (params.event.ctrlKey || params.event.metaKey)) {
          if (params.event.key === 'ArrowDown' || params.event.key === 'ArrowUp') {
            console.log('🔥 Blocking Ctrl + Arrow in navigateToNextCell');
            // Completely stop the event and return the current cell to prevent any navigation
            params.event.preventDefault();
            params.event.stopPropagation();
            params.event.stopImmediatePropagation();
            
            // Return the current cell position to maintain focus where it is
            const currentCell = params.previousCellPosition;
            return currentCell || null;
          }
        }

        // ✅ NEW: Handle Shift + Arrow keys for selection and navigation
        if (params.event && params.event.shiftKey) {
          if (params.event.key === 'ArrowDown' || params.event.key === 'ArrowUp') {
            console.log('🔥 Handling Shift + Arrow in navigateToNextCell');
            params.event.preventDefault();
            params.event.stopPropagation();
            params.event.stopImmediatePropagation();
            
            // Handle shift arrow navigation
            const direction = params.event.key === 'ArrowDown' ? 'down' : 'up';
            handleShiftArrowNavigation(direction);
            
            // Return current cell to prevent AG Grid's default navigation
            const currentCell = params.previousCellPosition;
            return currentCell || null;
          }
        }
        
        if (!suggestedNextCell) return null;

        // ✅ CRITICAL FIX: Handle LEFT/RIGHT ARROW KEYS with ensureColumnVisible
        if (params.event && (params.event.key === 'ArrowLeft' || params.event.key === 'ArrowRight')) {
          params.event.preventDefault();
          
          // Use our improved horizontal scroll handler
          const direction = params.event.key === 'ArrowLeft' ? 'left' : 'right';
          handleHorizontalScroll(direction);
          
          // Return null to prevent default AG Grid navigation
          return null;
        }

        // Update row focus when navigating vertically (only if highlight is enabled)
        if (enableHighlight && (params.event?.key === 'ArrowUp' || params.event?.key === 'ArrowDown')) {
          const rowData = params.api.getDisplayedRowAtIndex(suggestedNextCell.rowIndex);
          if (rowData && onRowFocus) {
            // ✅ Update local ref immediately
            currentFocusedId.current = rowData.data.id;
            onRowFocus(rowData.data.id);
          }

          // Ensure row is visible for vertical navigation
          setTimeout(() => {
            if (gridRef.current?.api) {
              gridRef.current.api.ensureIndexVisible(suggestedNextCell.rowIndex, 'bottom');
            }
          }, 0);
        }

        return suggestedNextCell;
      },
    }),
    [onRowFocus, showCheckboxes, enablePagination, headerHeight, enableHighlight, handleHorizontalScroll, handleShiftArrowNavigation]
  );

  // Sync selectedIds with AG Grid selection
  useEffect(() => {
    if (gridRef.current?.api && showCheckboxes) {
      const api = gridRef.current.api;
      
      // Get all row nodes
      const allNodes = [];
      api.forEachNode((node) => allNodes.push(node));
      
      // Update selection state for each node
      allNodes.forEach((node) => {
        const shouldBeSelected = selectedIds.includes(node.data.id);
        const isCurrentlySelected = node.isSelected();
        
        if (shouldBeSelected !== isCurrentlySelected) {
          node.setSelected(shouldBeSelected, false);
        }
      });
    }
  }, [selectedIds, showCheckboxes]);

  // Handle row click with focus logic
  const handleRowClick = useCallback((event) => {
    const clickedId = event.data.id;
    
    // ✅ CRITICAL FIX: Reset selection anchor on regular click
    selectionAnchor.current = null;
    lastSelectionDirection.current = null;
    
    // Only handle focus logic if highlight is enabled
    if (enableHighlight) {
      // If this is the second click on the same row that's already focused, trigger row click
      if (clickedId === currentFocusedId.current && clickedId === lastClickedId && onRowClick) {
        onRowClick(clickedId);
      } else {
        // First click or different row - just focus it
        if (onRowFocus) {
          currentFocusedId.current = clickedId;
          onRowFocus(clickedId);
        }
        setLastClickedId(clickedId);
      }
    } else {
      // If highlight is disabled, directly trigger row click
      if (onRowClick) {
        onRowClick(clickedId);
      }
    }
  }, [lastClickedId, onRowClick, onRowFocus, enableHighlight]);

  // Reset last clicked when focus changes externally
  useEffect(() => {
    if (focusedId !== lastClickedId) {
      setLastClickedId(null);
    }
  }, [focusedId, lastClickedId]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Only handle if grid is focused and we have data
      if (!gridRef.current?.api || data.length === 0) return;

      // Check if the grid container has focus or contains the focused element
      const gridElement = gridRef.current.eGridDiv;
      const isGridFocused = gridElement && (
        gridElement.contains(document.activeElement) ||
        document.activeElement === gridElement
      );

      if (!isGridFocused) return;

      console.log('🔥 DataGrid keydown event:', event.key, 'shiftKey:', event.shiftKey, 'ctrlKey:', event.ctrlKey);

      // ✅ CRITICAL FIX: Block Ctrl + Down/Up at document level with immediate stop
      if ((event.ctrlKey || event.metaKey) && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
        console.log('🔥 Blocking Ctrl + Arrow at document level');
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        // Don't process any further - just return
        return;
      }

      // ✅ NEW: Handle Shift + Arrow keys at document level
      if (event.shiftKey && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
        console.log('🔥 Handling Shift + Arrow at document level');
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        
        // Handle shift arrow navigation
        const direction = event.key === 'ArrowDown' ? 'down' : 'up';
        handleShiftArrowNavigation(direction);
        return;
      }

      // ✅ CRITICAL FIX: Reset selection anchor on non-Shift navigation
      if (!event.shiftKey && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
        selectionAnchor.current = null;
        lastSelectionDirection.current = null;
      }

      // Handle Enter key when a row is focused (only if highlight is enabled)
      if (event.key === "Enter" && currentFocusedId.current && onRowClick && enableHighlight) {
        event.preventDefault();
        onRowClick(currentFocusedId.current);
      }

      // ✅ CRITICAL FIX: Handle Ctrl+A for select all (only if checkboxes are enabled)
      if ((event.key === "a" || event.key === "A") && (event.ctrlKey || event.metaKey) && showCheckboxes) {
        console.log('🔥 Ctrl+A detected in DataGrid');
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        handleSelectAll();
        return;
      }

      // ✅ CRITICAL FIX: Let AG Grid handle LEFT/RIGHT ARROW KEYS
      // Don't prevent default for horizontal navigation - let navigateToNextCell handle it
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        // Let AG Grid's navigateToNextCell handle this
        // The logic is implemented in the navigateToNextCell callback above
        return;
      }
    };

    document.addEventListener("keydown", handleKeyDown, true); // Use capture phase
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [onRowClick, showCheckboxes, data.length, enableHighlight, handleShiftArrowNavigation, handleSelectAll]);

  // Handle cell focus events
  const handleCellFocused = useCallback((event) => {
    // Only handle focus if highlight is enabled
    if (event.rowIndex != null && onRowFocus && enableHighlight) {
      const rowNode = event.api.getDisplayedRowAtIndex(event.rowIndex);
      if (rowNode && rowNode.data) {
        currentFocusedId.current = rowNode.data.id;
        onRowFocus(rowNode.data.id);
      }
    }
  }, [onRowFocus, enableHighlight]);

  // Handle selection change
  const handleSelectionChanged = useCallback((event) => {
    if (showCheckboxes && onSelectionChange) {
      const selectedNodes = event.api.getSelectedNodes();
      const selectedIds = selectedNodes.map((node) => node.data.id);
      console.log('🔥 AG Grid selection changed to:', selectedIds);
      currentSelectedIds.current = selectedIds;
      onSelectionChange(selectedIds);
    }
  }, [showCheckboxes, onSelectionChange]);

  if (loading) {
    return <CustomLoadingOverlay />;
  }

  if (data.length === 0) {
    return (
      <CustomNoRowsOverlay
        emptyMessage={emptyMessage}
        emptyDescription={emptyDescription}
        showAddButton={showAddButton}
        onAddClick={onAddClick}
      />
    );
  }

  return (
    <div className={`h-full w-full ${className}`} data-testid="data-grid-container">
      <div className="ag-theme-alpine h-full w-full" data-testid="data-grid-ag-theme">
        {/* ✅ FIXED: Use regular style tag instead of styled-jsx */}
        <style dangerouslySetInnerHTML={{
          __html: `
            .ag-theme-alpine {
              --ag-header-height: ${headerHeight}px;
              --ag-row-height: ${rowHeight}px;
            }
            
            .ag-theme-alpine .ag-header {
              position: sticky !important;
              top: 0 !important;
              z-index: 10 !important;
              background-color: white !important;
              border-bottom: 1px solid #e5e7eb !important;
            }
            
            .ag-theme-alpine .ag-header-container {
              position: sticky !important;
              top: 0 !important;
              z-index: 10 !important;
              background-color: white !important;
            }
            
            .ag-theme-alpine .ag-header-cell-text {
              font-size: 10px !important;
              font-weight: 600 !important;
            }
            
            .ag-theme-alpine .ag-paging-panel {
              display: ${enablePagination ? 'block' : 'none'} !important;
            }
            
            .ag-theme-alpine .ag-body-viewport {
              overflow-y: auto !important;
            }
            
            .ag-theme-alpine .ag-body-horizontal-scroll {
              overflow-x: auto !important;
            }
            
            /* Ensure header doesn't move during keyboard navigation */
            .ag-theme-alpine .ag-header,
            .ag-theme-alpine .ag-header-container,
            .ag-theme-alpine .ag-header-row {
              transform: none !important;
              -webkit-transform: none !important;
              -ms-transform: none !important;
            }
            
            /* Hide cell focus border but keep functionality */
            .ag-theme-alpine .ag-cell-focus {
              border: none !important;
              outline: none !important;
              box-shadow: none !important;
            }
            
            .ag-theme-alpine .ag-cell-focus:focus {
              border: none !important;
              outline: none !important;
              box-shadow: none !important;
            }
            
            .ag-theme-alpine .ag-cell:focus {
              border: none !important;
              outline: none !important;
              box-shadow: none !important;
            }
            
            .ag-theme-alpine .ag-cell-focus-bottom,
            .ag-theme-alpine .ag-cell-focus-top,
            .ag-theme-alpine .ag-cell-focus-left,
            .ag-theme-alpine .ag-cell-focus-right {
              border: none !important;
            }
            
            /* Ensure cell focus is invisible but functional */
            .ag-theme-alpine .ag-cell-focus::before,
            .ag-theme-alpine .ag-cell-focus::after {
              display: none !important;
            }
          `
        }} />
        <AgGridReact
          ref={gridRef}
          rowData={data}
          columnDefs={finalColumnDefs}
          defaultColDef={defaultColDef}
          rowHeight={rowHeight}
          headerHeight={headerHeight}
          suppressRowClickSelection={true}
          rowSelection={showCheckboxes ? "multiple" : "single"}
          onSelectionChanged={handleSelectionChanged}
          onRowClicked={handleRowClick}
          onCellFocused={handleCellFocused}
          onGridReady={(params) => {
            // ✅ ONLY SET INITIAL FOCUS IF HIGHLIGHT IS ENABLED
            if (params.api && data.length > 0 && enableHighlight) {
              const initialFocusIndex = focusedId 
                ? data.findIndex(item => item.id === focusedId)
                : 0;
              const focusIndex = initialFocusIndex >= 0 ? initialFocusIndex : 0;
              
              // Set cell focus for keyboard navigation
              const firstColumn = showCheckboxes ? 'select' : finalColumnDefs[0]?.field;
              if (firstColumn) {
                params.api.setFocusedCell(focusIndex, firstColumn);
              }
              
              // Set our row focus
              if (onRowFocus && data[focusIndex]) {
                currentFocusedId.current = data[focusIndex].id;
                onRowFocus(data[focusIndex].id);
              }
            }
          }}
          loadingOverlayComponent={CustomLoadingOverlay}
          noRowsOverlayComponent={() => (
            <CustomNoRowsOverlay
              emptyMessage={emptyMessage}
              emptyDescription={emptyDescription}
              showAddButton={showAddButton}
              onAddClick={onAddClick}
            />
          )}
          getRowStyle={(params) => {
            // ✅ CRITICAL FIX: Only apply highlight styling if enableHighlight is true
            if (enableHighlight && params.data.id === focusedId) {
              return { backgroundColor: "#dbeafe", border: "1px solid #3b82f6" };
            }
            // ✅ Return null (no styling) when highlighting is disabled
            return null;
          }}
          gridOptions={gridOptions}
          data-testid="data-grid-ag-grid"
          {...gridProps}
        />
      </div>
    </div>
  );
});