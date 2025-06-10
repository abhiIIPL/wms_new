"use client";

import { useState, useEffect, useRef, useMemo, forwardRef, useImperativeHandle, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";
import { DataGrid } from "./framework/data-grid";

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

export const ProfessionalTable = forwardRef(function ProfessionalTable({
  items,
  loading,
  selectedItemIds,
  onSelectionChange,
  onRowClick,
  focusedItemId,
  onRowFocus,
}, ref) {
  const dataGridRef = useRef();

  // ✅ Expose refocus method to parent
  useImperativeHandle(ref, () => ({
    refocus: () => {
      if (dataGridRef.current && dataGridRef.current.refocus) {
        dataGridRef.current.refocus();
      }
    },
    getGridElement: () => {
      if (dataGridRef.current && dataGridRef.current.getGridElement) {
        return dataGridRef.current.getGridElement();
      }
      return null;
    }
  }));

  // Column definitions - same as before but with data-testid
  const columnDefs = useMemo(
    () => [
      // Product Info Fields
      {
        field: "product_code",
        headerName: "Product Code",
        width: 100,
        sortable: true,
        filter: true,
        cellRenderer: (params) => (
          <div className="font-mono text-[10px] font-medium truncate" data-testid={`product-code-cell-${params.data.id}`}>
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

  // Handle row click with focus logic
  const handleRowClick = useCallback((itemId) => {
    onRowClick(itemId);
  }, [onRowClick]);

  // Handle row focus change
  const handleRowFocus = useCallback((itemId) => {
    onRowFocus(itemId);
  }, [onRowFocus]);

  // Handle selection change
  const handleSelectionChange = useCallback((selectedIds) => {
    onSelectionChange(selectedIds);
  }, [onSelectionChange]);

  // Handle select all
  const handleSelectAll = useCallback(() => {
    const allItemIds = items.map(item => item.id);
    if (selectedItemIds.length === allItemIds.length && 
        allItemIds.every(id => selectedItemIds.includes(id))) {
      onSelectionChange([]);
    } else {
      onSelectionChange(allItemIds);
    }
  }, [items, selectedItemIds, onSelectionChange]);

  return (
    <div className="h-full w-full" data-testid="professional-table-container">
      <DataGrid
        ref={dataGridRef}
        data={items}
        columnDefs={columnDefs}
        loading={loading}
        selectedIds={selectedItemIds}
        onSelectionChange={handleSelectionChange}
        onRowClick={handleRowClick}
        focusedId={focusedItemId}
        onRowFocus={handleRowFocus}
        showCheckboxes={true}
        enablePagination={false}
        enableHighlight={true}
        rowHeight={24}
        headerHeight={30}
        emptyMessage="No items found"
        emptyDescription="Get started by adding your first item."
        showAddButton={true}
        onAddClick={() => window.location.href = "/items/add"}
        onSelectAll={handleSelectAll}
        className="h-full"
        data-testid="professional-table-data-grid"
      />
    </div>
  );
});