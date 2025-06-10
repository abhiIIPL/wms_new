"use client"

import { useState, forwardRef, useImperativeHandle, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Package } from "lucide-react"
import { DataGrid } from "./framework/data-grid"

// ✅ STATIC TRANSACTION DATA - Only the required columns
const staticTransactions = [
  {
    id: "TXN-001",
    supplierName: "MediCorp Pharmaceuticals",
    purchaseQuantity: 500,
    agingDays: 15,
    purchaseDateTime: "2024-01-20T10:30:00Z",
    invoiceNo: "INV-2024-001"
  },
  {
    id: "TXN-002", 
    supplierName: "PharmaTech Solutions",
    purchaseQuantity: 300,
    agingDays: 22,
    purchaseDateTime: "2024-01-15T14:20:00Z",
    invoiceNo: "INV-2024-002"
  },
  {
    id: "TXN-003",
    supplierName: "Global Health Supplies", 
    purchaseQuantity: 200,
    agingDays: 35,
    purchaseDateTime: "2024-01-10T09:15:00Z",
    invoiceNo: "INV-2024-003"
  },
  {
    id: "TXN-004",
    supplierName: "HealthFirst Distributors",
    purchaseQuantity: 150,
    agingDays: 8,
    purchaseDateTime: "2024-01-25T16:45:00Z", 
    invoiceNo: "INV-2024-004"
  },
  {
    id: "TXN-005",
    supplierName: "BioMed Supply Chain",
    purchaseQuantity: 400,
    agingDays: 45,
    purchaseDateTime: "2024-01-05T11:20:00Z",
    invoiceNo: "INV-2024-005"
  },
  {
    id: "TXN-006",
    supplierName: "Apex Pharma Solutions",
    purchaseQuantity: 250,
    agingDays: 12,
    purchaseDateTime: "2024-01-22T13:30:00Z",
    invoiceNo: "INV-2024-006"
  }
]

export const TransactionHistory = forwardRef(function TransactionHistory({ 
  itemId, 
  itemName, 
  isExpanded = false, 
  onToggle,
  enableHighlight = false // ✅ Control whether this grid can be highlighted
}, ref) {
  const [focusedTransactionId, setFocusedTransactionId] = useState(null)
  const dataGridRef = useRef()

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

  // ✅ Use static data for all items
  const transactions = staticTransactions

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short", 
      day: "numeric",
    })
  }

  const formatDateTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }) + " " + date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    })
  }

  // ✅ SIMPLIFIED COLUMN DEFINITIONS - Only 5 required columns
  const columnDefs = [
    {
      field: "supplierName",
      headerName: "Supplier Name",
      width: 200,
      cellRenderer: (params) => (
        <div className="font-medium text-[10px] truncate" title={params.value} data-testid={`transaction-supplier-${params.data.id}`}>
          {params.value}
        </div>
      ),
    },
    {
      field: "purchaseQuantity", 
      headerName: "Purchase Quantity",
      width: 140,
      cellRenderer: (params) => (
        <div className="text-[10px] text-right" data-testid={`transaction-quantity-${params.data.id}`}>
          {params.value?.toLocaleString()} units
        </div>
      ),
    },
    {
      field: "agingDays",
      headerName: "Aging Days", 
      width: 100,
      cellRenderer: (params) => (
        <div className={`text-[10px] text-right ${params.value > 30 ? 'text-orange-600' : 'text-gray-600'}`} data-testid={`transaction-aging-${params.data.id}`}>
          {params.value} days
        </div>
      ),
    },
    {
      field: "purchaseDateTime",
      headerName: "Purchase Date & Time",
      width: 160,
      cellRenderer: (params) => (
        <div className="text-[10px]" data-testid={`transaction-datetime-${params.data.id}`}>
          {formatDateTime(params.value)}
        </div>
      ),
    },
    {
      field: "invoiceNo",
      headerName: "Invoice No",
      width: 120,
      cellRenderer: (params) => (
        <div className="font-mono text-[10px] truncate" title={params.value} data-testid={`transaction-invoice-${params.data.id}`}>
          {params.value}
        </div>
      ),
    },
  ]

  // If no transactions, show empty state
  if (transactions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[15vh] bg-orange-50/50 border border-orange-200 rounded-md" data-testid="transaction-history-empty">
        <div className="text-center" data-testid="transaction-history-empty-content">
          <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" data-testid="transaction-history-empty-icon" />
          <p className="text-sm text-muted-foreground" data-testid="transaction-history-empty-title">No purchase history available</p>
          <p className="text-xs text-muted-foreground" data-testid="transaction-history-empty-description">
            {itemName ? `${itemName} has no recorded transactions` : "This item has no recorded transactions"}
          </p>
        </div>
      </div>
    )
  }

  // Return only the DataGrid without any Card wrapper
  return (
    <div className="h-full px-2" data-testid="transaction-history-container">
      <DataGrid
        ref={dataGridRef} // ✅ Pass ref to DataGrid
        data={transactions}
        columnDefs={columnDefs}
        loading={false}
        focusedId={focusedTransactionId}
        onRowFocus={setFocusedTransactionId}
        showCheckboxes={false}
        enablePagination={false}
        enableHighlight={enableHighlight} // ✅ Use the prop to control highlighting
        rowHeight={20}
        headerHeight={24}
        emptyMessage="No transactions found"
        emptyDescription="No purchase history available"
        className="h-full"
        data-testid="transaction-history-data-grid"
      />
    </div>
  )
})