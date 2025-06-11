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
  // ✅ NEW: Pagination-aware select all props
  totalItems = 0, // Total items across all pages
  onSelectAllPages, // Function to select all items across all pages
  onDeselectAll, // Function to deselect all items
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
  }, [selectedI