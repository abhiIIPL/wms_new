"use client";

import { useState, useEffect, useRef, useMemo, useCallback, forwardRef, useImperativeHandle } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";

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
  enableHighlight = true,
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

  // ✅ Expose refocus method and grid element to parent
  useImperativeHandle(ref, () => ({
    refocus: () => {
      if (gridRef.current?.api && data.length > 0 && enableHighlight) {
        // Find the focused row index
        const focusIndex = focusedId 
          ? data.findIndex(item => item.id === focusedId)
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

  // ✅ IMPROVED HORIZONTAL SCROLLING WITH ensureColumnVisible
  const handleHorizontalScroll = useCallback((direction) => {
    if (!gridRef.current?.api) return;

    const api = gridRef.current.api;
    const focusedCell = api.getFocusedCell();
    if (!focusedCell) return;

    const visibleColumns = api.getAllDisplayedColumns();
    const currentColumnIndex = visibleColumns.findIndex(col => col.getColId() === focusedCell.column);
    
    if (currentColumnIndex === -1) return;

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

  // ✅ NUCLEAR OPTION: Completely disable AG Grid's keyboard navigation
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
      
      // ✅ NUCLEAR OPTION: Disable ALL keyboard navigation
      suppressKeyboardEvent: () => true, // Block ALL keyboard events from AG Grid
      
      // ✅ DISABLE ALL CLIPBOARD OPERATIONS
      processDataFromClipboard: () => null,
      sendToClipboard: () => null,
      
      // ✅ DISABLE RANGE SELECTION
      enableRangeSelection: false,
      enableRangeHandle: false,
      enableFillHandle: false,
      
      // ✅ DISABLE CELL EDITING
      editable: false,
      
      // ✅ DISABLE SORTING VIA KEYBOARD
      suppressMultiSort: true,
      
      // ✅ DISABLE FILTERING VIA KEYBOARD
      suppressMenuHide: true,
      
      // ✅ COMPLETELY DISABLE NAVIGATION
      navigateToNextCell: () => null,
      tabToNextCell: () => null,
      navigateToNextHeader: () => null,
      tabToNextHeader: () => null,
    }),
    [onRowFocus, showCheckboxes, enablePagination, headerHeight, enableHighlight, handleHorizontalScroll]
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
    
    // Only handle focus logic if highlight is enabled
    if (enableHighlight) {
      // If this is the second click on the same row that's already focused, trigger row click
      if (clickedId === focusedId && clickedId === lastClickedId && onRowClick) {
        onRowClick(clickedId);
      } else {
        // First click or different row - just focus it
        if (onRowFocus) {
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
  }, [focusedId, lastClickedId, onRowClick, onRowFocus, enableHighlight]);

  // Reset last clicked when focus changes externally
  useEffect(() => {
    if (focusedId !== lastClickedId) {
      setLastClickedId(null);
    }
  }, [focusedId, lastClickedId]);

  // ✅ CUSTOM KEYBOARD NAVIGATION - Completely replace AG Grid's
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

      // ✅ COMPLETELY BLOCK ALL CTRL/CMD COMBINATIONS
      if (event.ctrlKey || event.metaKey) {
        // Only allow Ctrl+A for select all
        if ((event.key === "a" || event.key === "A") && showCheckboxes && onSelectAll) {
          event.preventDefault();
          onSelectAll();
          return;
        }
        
        // Block everything else
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return;
      }

      // Handle Enter key when a row is focused (only if highlight is enabled)
      if (event.key === "Enter" && focusedId && onRowClick && enableHighlight) {
        event.preventDefault();
        onRowClick(focusedId);
        return;
      }

      // ✅ CUSTOM ARROW KEY NAVIGATION
      if (enableHighlight && focusedId) {
        const currentIndex = data.findIndex(item => item.id === focusedId);
        let newIndex = currentIndex;

        switch (event.key) {
          case 'ArrowUp':
            event.preventDefault();
            newIndex = Math.max(0, currentIndex - 1);
            break;
          case 'ArrowDown':
            event.preventDefault();
            newIndex = Math.min(data.length - 1, currentIndex + 1);
            break;
          case 'Home':
            event.preventDefault();
            newIndex = 0;
            break;
          case 'End':
            event.preventDefault();
            newIndex = data.length - 1;
            break;
          case 'ArrowLeft':
            event.preventDefault();
            handleHorizontalScroll('left');
            return;
          case 'ArrowRight':
            event.preventDefault();
            handleHorizontalScroll('right');
            return;
          default:
            return;
        }

        if (newIndex !== currentIndex && data[newIndex]) {
          onRowFocus(data[newIndex].id);
          
          // Ensure the row is visible
          setTimeout(() => {
            if (gridRef.current?.api) {
              gridRef.current.api.ensureIndexVisible(newIndex, 'middle');
            }
          }, 0);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown, true); // Use capture phase
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [focusedId, onRowClick, showCheckboxes, onSelectAll, data, enableHighlight, onRowFocus, handleHorizontalScroll]);

  // Handle cell focus events
  const handleCellFocused = useCallback((event) => {
    // Only handle focus if highlight is enabled
    if (event.rowIndex != null && onRowFocus && enableHighlight) {
      const rowNode = event.api.getDisplayedRowAtIndex(event.rowIndex);
      if (rowNode && rowNode.data) {
        onRowFocus(rowNode.data.id);
      }
    }
  }, [onRowFocus, enableHighlight]);

  // Handle selection change
  const handleSelectionChanged = useCallback((event) => {
    if (showCheckboxes && onSelectionChange) {
      const selectedNodes = event.api.getSelectedNodes();
      const selectedIds = selectedNodes.map((node) => node.data.id);
      onSelectionChange(selectedIds);
    }
  }, [showCheckboxes, onSelectionChange]);

  // ✅ Grid ready handler with complete keyboard override
  const handleGridReady = useCallback((params) => {
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
        onRowFocus(data[focusIndex].id);
      }
    }

    // ✅ NUCLEAR OPTION: Completely override AG Grid's keyboard handling
    const gridElement = gridRef.current?.eGridDiv;
    if (gridElement) {
      // Remove any existing AG Grid keyboard listeners
      const allElements = gridElement.querySelectorAll('*');
      allElements.forEach(element => {
        // Clone and replace to remove all event listeners
        if (element.tagName === 'DIV' && element.getAttribute('role') === 'gridcell') {
          const newElement = element.cloneNode(true);
          element.parentNode.replaceChild(newElement, element);
        }
      });

      // Add our own keyboard handler with highest priority
      const nuclearKeyHandler = (event) => {
        // Block ALL keyboard events that could cause issues
        if (event.ctrlKey || event.metaKey) {
          if (event.key !== 'a' && event.key !== 'A') { // Allow Ctrl+A only
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            return false;
          }
        }
        
        // Block problematic keys
        if (['F2', 'Delete', 'Backspace', 'Tab'].includes(event.key)) {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          return false;
        }
        
        return true;
      };

      // Add with highest priority
      gridElement.addEventListener('keydown', nuclearKeyHandler, true);
      gridElement.addEventListener('keyup', nuclearKeyHandler, true);
      gridElement.addEventListener('keypress', nuclearKeyHandler, true);
      
      // Store reference for cleanup
      gridElement._nuclearKeyHandler = nuclearKeyHandler;
    }
  }, [data, enableHighlight, focusedId, showCheckboxes, finalColumnDefs, onRowFocus]);

  // ✅ Clean up all custom key handlers
  useEffect(() => {
    return () => {
      const gridElement = gridRef.current?.eGridDiv;
      if (gridElement && gridElement._nuclearKeyHandler) {
        gridElement.removeEventListener('keydown', gridElement._nuclearKeyHandler, true);
        gridElement.removeEventListener('keyup', gridElement._nuclearKeyHandler, true);
        gridElement.removeEventListener('keypress', gridElement._nuclearKeyHandler, true);
        delete gridElement._nuclearKeyHandler;
      }
    };
  }, []);

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
          onGridReady={handleGridReady}
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