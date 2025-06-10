"use client";

import { useState, useEffect, useRef, useMemo, forwardRef, useImperativeHandle, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

// Custom cell renderers
const StatusRenderer = (params) => (
  <Badge
    variant={params.value ? "default" : "destructive"}
    className="text-[10px] px-1 py-0 h-4"
    data-testid={`status-badge-${params.data.id}`}
  >
    {params.value ? "Active" : "Inactive"}
  </Badge>
);

const CategoryRenderer = (params) => (
  <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4" data-testid={`category-badge-${params.data.id}`}>
    {params.value}
  </Badge>
);

const BooleanRenderer = (params) => (
  <Badge
    variant={params.value ? "default" : "outline"}
    className="text-[10px] px-1 py-0 h-4"
    data-testid={`boolean-badge-${params.data.id}-${params.colDef.field}`}
  >
    {params.value ? "Yes" : "No"}
  </Badge>
);

const ColorRenderer = (params) => (
  <div className="flex items-center gap-1" data-testid={`color-cell-${params.data.id}`}>
    <div 
      className="w-3 h-3 rounded border border-gray-300" 
      style={{ backgroundColor: params.value }}
      data-testid={`color-swatch-${params.data.id}`}
    ></div>
    <span className="text-[10px]" data-testid={`color-text-${params.data.id}`}>{params.value}</span>
  </div>
);

const ArrayRenderer = (params) => (
  <div className="text-[10px] truncate" title={params.value?.join(", ")} data-testid={`array-cell-${params.data.id}-${params.colDef.field}`}>
    {params.value?.join(", ")}
  </div>
);

const PriceRenderer = (params) => (
  <span data-testid={`price-cell-${params.data.id}-${params.colDef.field}`}>
    {new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(params.value)}
  </span>
);

const PercentageRenderer = (params) => (
  <span data-testid={`percentage-cell-${params.data.id}-${params.colDef.field}`}>
    {params.value ? `${params.value}%` : ""}
  </span>
);

const DateRenderer = (params) => (
  <span data-testid={`date-cell-${params.data.id}`}>
    {new Date(params.value).toLocaleDateString("en-US", {
      year: "2-digit",
      month: "short",
      day: "numeric",
    })}
  </span>
);

// Custom loading overlay
const CustomLoadingOverlay = () => (
  <div className="flex items-center justify-center py-8" data-testid="professional-table-loading">
    <div className="flex items-center gap-2">
      <div className="h-3 w-3 animate-spin rounded-full border border-primary border-t-transparent" data-testid="professional-table-loading-spinner"></div>
      <span className="text-muted-foreground text-xs" data-testid="professional-table-loading-text">Loading items...</span>
    </div>
  </div>
);

// Custom no rows overlay
const CustomNoRowsOverlay = () => (
  <div className="flex flex-col items-center justify-center py-8" data-testid="professional-table-empty">
    <Package className="h-8 w-8 text-muted-foreground mb-2" data-testid="professional-table-empty-icon" />
    <h3 className="text-sm font-semibold mb-1" data-testid="professional-table-empty-title">No items found</h3>
    <p className="text-muted-foreground text-xs mb-2" data-testid="professional-table-empty-description">
      Get started by adding your first item.
    </p>
    <Button asChild size="sm" data-testid="professional-table-empty-add-button">
      <a href="/items/add">Add Item</a>
    </Button>
  </div>
);

export const ProfessionalTable = forwardRef(function ProfessionalTable({
  items,
  loading,
  selectedItemIds,
  onSelectionChange,
  onRowClick,
  focusedItemId,
  onRowFocus,
}, ref) {
  const gridRef = useRef();
  const [columnState, setColumnState] = useState({});
  const [lastClickedItemId, setLastClickedItemId] = useState(null);

  // ✅ Expose refocus method to parent
  useImperativeHandle(ref, () => ({
    refocus: () => {
      if (gridRef.current?.api && items.length > 0) {
        // Find the focused row index
        const focusIndex = focusedItemId 
          ? items.findIndex(item => item.id === focusedItemId)
          : 0;
        const validIndex = focusIndex >= 0 ? focusIndex : 0;
        
        // Set focus back to the grid
        gridRef.current.api.setFocusedCell(validIndex, 'name');
      }
    },
    getGridElement: () => {
      return gridRef.current?.eGridDiv || null;
    }
  }));

  // ✅ FIXED HORIZONTAL SCROLLING FUNCTION
  const handleHorizontalScroll = useCallback((direction) => {
    
    if (!gridRef.current?.api) {
      return;
    }

    const api = gridRef.current.api;
    const focusedCell = api.getFocusedCell();
    if (!focusedCell) {
      return;
    }

    const visibleColumns = api.getAllDisplayedColumns();

    // ✅ FIXED: Get the column ID properly
    const currentColumnId = focusedCell.column.getColId ? focusedCell.column.getColId() : focusedCell.column;

    const currentColumnIndex = visibleColumns.findIndex(col => col.getColId() === currentColumnId);
    
    if (currentColumnIndex === -1) {
      return;
    }

    let targetColumnIndex;
    
    if (direction === 'left') {
      targetColumnIndex = currentColumnIndex - 1;
      if (targetColumnIndex < 0) {
        return; // Don't move beyond first column
      }
    } else {
      targetColumnIndex = currentColumnIndex + 1;
      if (targetColumnIndex >= visibleColumns.length) {
        return; // Don't move beyond last column
      }
    }

    const targetColumn = visibleColumns[targetColumnIndex];
    if (!targetColumn) {
      return;
    }

    // Set focus to the new column
    api.setFocusedCell(focusedCell.rowIndex, targetColumn.getColId());
    
    // ✅ USE AG GRID'S ensureColumnVisible FOR SMOOTH SCROLLING
    setTimeout(() => {
      api.ensureColumnVisible(targetColumn.getColId());
    }, 10);
  }, []);

  // ✅ Sync selectedItemIds with AG Grid selection
  useEffect(() => {
    if (gridRef.current?.api) {
      const api = gridRef.current.api;
      
      // Get all row nodes
      const allNodes = [];
      api.forEachNode((node) => allNodes.push(node));
      
      // Update selection state for each node
      allNodes.forEach((node) => {
        const shouldBeSelected = selectedItemIds.includes(node.data.id);
        const isCurrentlySelected = node.isSelected();
        
        if (shouldBeSelected !== isCurrentlySelected) {
          node.setSelected(shouldBeSelected, false); // false = don't trigger selection event
        }
      });
    }
  }, [selectedItemIds]);

  // Column definitions - same as before but with data-testid
  const columnDefs = useMemo(
    () => [
      {
        field: "select",
        headerName: "",
        width: 50,
        checkboxSelection: true,
        headerCheckboxSelection: true,
        resizable: false,
        sortable: false,
        filter: false,
      },
      // Product Info Fields
      {
        field: "product_code",
        headerName: "Product Code",
        width: 100,
        sortable: true,
        filter: true,
        cellRenderer: (params) => (
          <div className="font-mono text-[10px] font-medium truncate\" data-testid={`product-code-cell-${params.data.id}`}>
            {params.value}
          </div>
        ),
      },
      {
        field: "identifier",
        headerName: "ID",
        width: 80,
        sortable: true,
        filter: true,
        cellRenderer: (params) => (
          <div className="font-mono text-[10px] text-muted-foreground truncate" data-testid={`identifier-cell-${params.data.id}`}>
            {params.value}
          </div>
        ),
      },
      {
        field: "name",
        headerName: "Product Name",
        width: 250,
        sortable: true,
        filter: true,
        cellRenderer: (params) => (
          <div
            className="font-medium text-[11px] truncate"
            title={params.value}
            data-testid={`name-cell-${params.data.id}`}
          >
            {params.value}
          </div>
        ),
      },
      {
        field: "category",
        headerName: "Category",
        width: 120,
        sortable: true,
        filter: true,
        cellRenderer: CategoryRenderer,
      },
      {
        field: "brand",
        headerName: "Brand",
        width: 100,
        sortable: true,
        filter: true,
        cellRenderer: (params) => (
          <div className="text-[10px] font-medium truncate" title={params.value} data-testid={`brand-cell-${params.data.id}`}>
            {params.value}
          </div>
        ),
      },
      {
        field: "manufacturer",
        headerName: "Manufacturer",
        width: 150,
        sortable: true,
        filter: true,
        cellRenderer: (params) => (
          <div className="text-[10px] truncate" title={params.value} data-testid={`manufacturer-cell-${params.data.id}`}>
            {params.value}
          </div>
        ),
      },
      {
        field: "pack_size",
        headerName: "Pack Size",
        width: 100,
        sortable: true,
        filter: true,
        cellRenderer: (params) => (
          <div className="text-[10px] truncate" title={params.value} data-testid={`pack-size-cell-${params.data.id}`}>
            {params.value}
          </div>
        ),
      },
      {
        field: "unit_per_pack",
        headerName: "Units/Pack",
        width: 90,
        sortable: true,
        filter: true,
        cellRenderer: (params) => (
          <div className="text-[10px] text-center" data-testid={`unit-per-pack-cell-${params.data.id}`}>
            {params.value}
          </div>
        ),
      },
      {
        field: "form",
        headerName: "Form",
        width: 100,
        sortable: true,
        filter: true,
        cellRenderer: (params) => (
          <div className="text-[10px] truncate" data-testid={`form-cell-${params.data.id}`}>
            {params.value}
          </div>
        ),
      },
      {
        field: "schedule_type",
        headerName: "Schedule",
        width: 100,
        sortable: true,
        filter: true,
        cellRenderer: (params) => (
          <Badge variant="outline" className="text-[9px] px-1 py-0 h-4" data-testid={`schedule-badge-${params.data.id}`}>
            {params.value}
          </Badge>
        ),
      },
      {
        field: "primary_rack",
        headerName: "Primary Rack",
        width: 100,
        sortable: true,
        filter: true,
        cellRenderer: (params) => (
          <div className="font-mono text-[10px] truncate" data-testid={`primary-rack-cell-${params.data.id}`}>
            {params.value}
          </div>
        ),
      },
      {
        field: "therapeutic",
        headerName: "Therapeutic",
        width: 120,
        sortable: true,
        filter: true,
        cellRenderer: (params) => (
          <div className="text-[10px] truncate" title={params.value} data-testid={`therapeutic-cell-${params.data.id}`}>
            {params.value}
          </div>
        ),
      },
      {
        field: "storage_type",
        headerName: "Storage",
        width: 120,
        sortable: true,
        filter: true,
        cellRenderer: (params) => (
          <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4" data-testid={`storage-badge-${params.data.id}`}>
            {params.value}
          </Badge>
        ),
      },
      {
        field: "loose_sale",
        headerName: "Loose Sale",
        width: 90,
        sortable: true,
        filter: false,
        cellRenderer: BooleanRenderer,
      },
      {
        field: "prescription_required",
        headerName: "Rx Required",
        width: 90,
        sortable: true,
        filter: false,
        cellRenderer: BooleanRenderer,
      },
      {
        field: "is_chronic",
        headerName: "Chronic",
        width: 80,
        sortable: true,
        filter: false,
        cellRenderer: BooleanRenderer,
      },
      {
        field: "is_dpco",
        headerName: "DPCO",
        width: 70,
        sortable: true,
        filter: false,
        cellRenderer: BooleanRenderer,
      },
      {
        field: "color_type",
        headerName: "Color",
        width: 80,
        sortable: false,
        filter: false,
        cellRenderer: ColorRenderer,
      },
      {
        field: "salt_molecule",
        headerName: "Salt/Molecule",
        width: 150,
        sortable: false,
        filter: true,
        cellRenderer: ArrayRenderer,
      },
      {
        field: "weight",
        headerName: "Weight",
        width: 80,
        sortable: true,
        filter: true,
        cellRenderer: (params) => (
          <div className="text-[10px] text-right" data-testid={`weight-cell-${params.data.id}`}>
            {params.value} {params.data.weight_unit}
          </div>
        ),
      },
      // Pricing Info Fields
      {
        field: "hsn_sac",
        headerName: "HSN/SAC",
        width: 100,
        sortable: true,
        filter: true,
        cellRenderer: (params) => (
          <div className="font-mono text-[10px] truncate" data-testid={`hsn-sac-cell-${params.data.id}`}>
            {params.value}
          </div>
        ),
      },
      {
        field: "tax_category",
        headerName: "Tax Category",
        width: 120,
        sortable: true,
        filter: true,
        cellRenderer: (params) => (
          <div className="text-[10px] truncate" title={params.value} data-testid={`tax-category-cell-${params.data.id}`}>
            {params.value}
          </div>
        ),
      },
      {
        field: "sale_rate",
        headerName: "Sale Rate",
        width: 100,
        sortable: true,
        filter: true,
        cellRenderer: PriceRenderer,
      },
      {
        field: "min_margin_sale",
        headerName: "Min Margin %",
        width: 100,
        sortable: true,
        filter: true,
        cellRenderer: PercentageRenderer,
      },
      {
        field: "allow_discount",
        headerName: "Allow Discount",
        width: 100,
        sortable: true,
        filter: false,
        cellRenderer: BooleanRenderer,
      },
      {
        field: "max_discount",
        headerName: "Max Discount %",
        width: 110,
        sortable: true,
        filter: true,
        cellRenderer: PercentageRenderer,
      },
      {
        field: "box_mrp",
        headerName: "Box MRP",
        width: 100,
        sortable: true,
        filter: true,
        cellRenderer: PriceRenderer,
      },
      {
        field: "min_stock",
        headerName: "Min Stock",
        width: 90,
        sortable: true,
        filter: true,
        cellRenderer: (params) => (
          <div className="text-[10px] text-right" data-testid={`min-stock-cell-${params.data.id}`}>
            {params.value}
          </div>
        ),
      },
      {
        field: "max_stock",
        headerName: "Max Stock",
        width: 90,
        sortable: true,
        filter: true,
        cellRenderer: (params) => (
          <div className="text-[10px] text-right" data-testid={`max-stock-cell-${params.data.id}`}>
            {params.value}
          </div>
        ),
      },
      {
        field: "expiry_days",
        headerName: "Expiry Days",
        width: 100,
        sortable: true,
        filter: true,
        cellRenderer: (params) => (
          <div className="text-[10px] text-right" data-testid={`expiry-days-cell-${params.data.id}`}>
            {params.value}
          </div>
        ),
      },
      // Other Fields
      {
        field: "is_returnable",
        headerName: "Returnable",
        width: 90,
        sortable: true,
        filter: false,
        cellRenderer: BooleanRenderer,
      },
      {
        field: "is_active",
        headerName: "Status",
        width: 80,
        sortable: true,
        filter: false,
        cellRenderer: StatusRenderer,
      },
      {
        field: "created_at",
        headerName: "Created",
        width: 100,
        sortable: true,
        filter: false,
        cellRenderer: DateRenderer,
      },
    ],
    []
  );

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

  // ✅ ENHANCED GRID OPTIONS WITH PROPER HORIZONTAL SCROLLING
  const gridOptions = useMemo(
    () => ({
      suppressCellFocus: false,
      enableCellTextSelection: true,
      ensureDomOrder: true,
      suppressRowClickSelection: true,
      rowSelection: "multiple",
      enableCellChangeFlash: false,
      suppressMovableColumns: true,
      headerHeight: 30,
      pagination: false,
      suppressPaginationPanel: true,
      enableRangeSelection: false,
      suppressMultiRangeSelection: true,
      suppressScrollOnNewData: true,
      suppressAnimationFrame: false,
      
      // ✅ FIXED: Now calls handleHorizontalScroll function
      navigateToNextCell: (params) => {
        const { key } = params.event || {};
        const { nextCellPosition } = params;
        
        // ✅ HANDLE LEFT/RIGHT ARROW KEYS BY CALLING handleHorizontalScroll
        if (key === 'ArrowLeft' || key === 'ArrowRight') {
          params.event.preventDefault();
          
          // ✅ NOW CALLING THE handleHorizontalScroll FUNCTION
          const direction = key === 'ArrowLeft' ? 'left' : 'right';
          handleHorizontalScroll(direction);
          
          // ✅ Return null to prevent AG Grid from processing the navigation further
          return null;
        }
        
        // ✅ HANDLE VERTICAL NAVIGATION (UP/DOWN ARROWS)
        if (key === 'ArrowUp' || key === 'ArrowDown') {
          if (nextCellPosition && onRowFocus) {
            const rowData = params.api.getDisplayedRowAtIndex(nextCellPosition.rowIndex);
            if (rowData) {
              onRowFocus(rowData.data.id);
            }
          }
          
          // Ensure row visibility for vertical navigation
          if (nextCellPosition) {
            setTimeout(() => {
              params.api.ensureIndexVisible(nextCellPosition.rowIndex, 'bottom');
            }, 0);
          }
        }
        
        // Return the suggested next cell for all other navigation
        return nextCellPosition;
      },
    }),
    [onRowFocus, handleHorizontalScroll] // ✅ Added handleHorizontalScroll to dependencies
  );

  // Handle row click with focus logic
  const handleRowClick = (event) => {
    const clickedItemId = event.data.id;
    
    // If this is the second click on the same row that's already focused, open the form
    if (clickedItemId === focusedItemId && clickedItemId === lastClickedItemId) {
      onRowClick(clickedItemId);
    } else {
      // First click or different row - just focus it
      onRowFocus(clickedItemId);
      setLastClickedItemId(clickedItemId);
    }
  };

  // Reset last clicked when focus changes externally
  useEffect(() => {
    if (focusedItemId !== lastClickedItemId) {
      setLastClickedItemId(null);
    }
  }, [focusedItemId, lastClickedItemId]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Only handle Enter key when a row is focused
      if (event.key === "Enter" && focusedItemId) {
        event.preventDefault();
        onRowClick(focusedItemId);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [focusedItemId, onRowClick]);

  // Handle cell focus events to sync with our row focus
  const handleCellFocused = (event) => {
    if (event.rowIndex != null) {
      const rowNode = event.api.getDisplayedRowAtIndex(event.rowIndex);
      if (rowNode && rowNode.data && onRowFocus) {
        onRowFocus(rowNode.data.id);
      }
    }
  };

  if (loading) {
    return <CustomLoadingOverlay />;
  }

  if (items.length === 0) {
    return <CustomNoRowsOverlay />;
  }

  return (
    <div className="h-full w-full" data-testid="professional-table-container">
      {/* AG Grid with proper CSS for header positioning and hidden cell focus border */}
      <div className="ag-theme-alpine h-full w-full" data-testid="professional-table-ag-theme">
        {/* ✅ FIXED: Use regular style tag instead of styled-jsx */}
        <style dangerouslySetInnerHTML={{
          __html: `
            .ag-theme-alpine {
              --ag-header-height: 30px;
              --ag-row-height: 24px;
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
              display: none !important;
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
          rowData={items}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          rowHeight={24}
          headerHeight={30}
          suppressRowClickSelection={true}
          rowSelection="multiple"
          onSelectionChanged={(event) => {
            const selectedNodes = event.api.getSelectedNodes();
            const selectedIds = selectedNodes.map((node) => node.data.id);
            onSelectionChange(selectedIds);
          }}
          onRowClicked={handleRowClick}
          onCellFocused={handleCellFocused}
          onColumnResized={(event) => {
            const newColumnState = {};
            event.api.getColumnState().forEach((col) => {
              newColumnState[col.colId] = col.width;
            });
            setColumnState(newColumnState);
          }}
          onGridReady={(params) => {
            // Apply saved column state if exists
            if (Object.keys(columnState).length > 0) {
              const columnApi = params.columnApi || params.api;
              if (columnApi && columnApi.applyColumnState) {
                columnApi.applyColumnState({
                  state: Object.entries(columnState).map(([colId, width]) => ({
                    colId,
                    width,
                  })),
                });
              }
            }
            
            // Set initial focus on the first cell to enable keyboard navigation
            if (params.api && items.length > 0) {
              const initialFocusIndex = focusedItemId 
                ? items.findIndex(item => item.id === focusedItemId)
                : 0;
              const focusIndex = initialFocusIndex >= 0 ? initialFocusIndex : 0;
              
              // Set cell focus for keyboard navigation
              params.api.setFocusedCell(focusIndex, 'name');
              
              // Set our row focus
              if (onRowFocus && items[focusIndex]) {
                onRowFocus(items[focusIndex].id);
              }
            }
          }}
          loadingOverlayComponent={CustomLoadingOverlay}
          noRowsOverlayComponent={CustomNoRowsOverlay}
          getRowStyle={(params) => {
            if (params.data.id === focusedItemId) {
              return { backgroundColor: "#dbeafe", border: "1px solid #3b82f6" };
            }
            return null;
          }}
          gridOptions={gridOptions}
          data-testid="professional-table-ag-grid"
        />
      </div>
    </div>
  );
});