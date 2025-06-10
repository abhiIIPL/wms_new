"use client"

import { useState, forwardRef, useImperativeHandle, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Package } from "lucide-react"
import { DataGrid } from "./framework/data-grid"

// Enhanced mock transaction data with comprehensive Amoxicillin history
const mockTransactions = {
  1: [
    {
      id: "TXN-001",
      supplierName: "MediCorp Pharmaceuticals",
      invoiceNumber: "INV-2024-001",
      purchaseDate: "2024-01-20T10:30:00Z",
      quantity: 500,
      agingDays: Math.floor((new Date() - new Date("2024-01-20T10:30:00Z")) / (1000 * 60 * 60 * 24))
    },
    {
      id: "TXN-002",
      supplierName: "MediCorp Pharmaceuticals",
      invoiceNumber: "INV-2024-002",
      purchaseDate: "2024-01-15T14:20:00Z",
      quantity: 300,
      agingDays: Math.floor((new Date() - new Date("2024-01-15T14:20:00Z")) / (1000 * 60 * 60 * 24))
    },
    {
      id: "TXN-003",
      supplierName: "Global Health Supplies",
      invoiceNumber: "INV-2024-003",
      purchaseDate: "2024-01-10T09:15:00Z",
      quantity: 200,
      agingDays: Math.floor((new Date() - new Date("2024-01-10T09:15:00Z")) / (1000 * 60 * 60 * 24))
    },
  ],
  2: [
    {
      id: "TXN-004",
      supplierName: "PharmaTech Solutions",
      invoiceNumber: "INV-2024-004",
      purchaseDate: "2024-01-18T11:45:00Z",
      quantity: 100,
      agingDays: Math.floor((new Date() - new Date("2024-01-18T11:45:00Z")) / (1000 * 60 * 60 * 24))
    },
    {
      id: "TXN-005",
      supplierName: "PharmaTech Solutions",
      invoiceNumber: "INV-2024-005",
      purchaseDate: "2024-01-12T16:30:00Z",
      quantity: 150,
      agingDays: Math.floor((new Date() - new Date("2024-01-12T16:30:00Z")) / (1000 * 60 * 60 * 24))
    },
  ],
}

// Generate comprehensive transaction history for Amoxicillin medicines
const generateAmoxicillinTransactions = (itemId, itemName) => {
  if (!itemName || !itemName.toLowerCase().startsWith('amoxicillin')) {
    return []
  }

  const suppliers = [
    "PharmaTech Solutions",
    "Global Antibiotics Ltd",
    "MediCore Pharmaceuticals",
    "HealthFirst Distributors",
    "BioMed Supply Chain",
    "Apex Pharma Solutions",
    "Premier Medical Supplies",
    "United Pharma Group"
  ]

  const transactions = []
  const baseDate = new Date('2024-01-01')
  
  // Generate 8-12 transactions for Amoxicillin medicines
  const transactionCount = Math.floor(Math.random() * 5) + 8
  
  for (let i = 0; i < transactionCount; i++) {
    // Generate dates going backwards from recent to older
    const daysAgo = Math.floor(Math.random() * 180) + (i * 15) // Spread over 6 months
    const transactionDate = new Date(baseDate)
    transactionDate.setDate(transactionDate.getDate() + daysAgo)
    
    const supplier = suppliers[Math.floor(Math.random() * suppliers.length)]
    const quantity = Math.floor(Math.random() * 800) + 100 // 100-900 units
    const unitCost = (Math.random() * 50 + 10).toFixed(2) // $10-60 per unit
    
    transactions.push({
      id: `TXN-AMX-${itemId}-${String(i + 1).padStart(3, '0')}`,
      supplierName: supplier,
      invoiceNumber: `INV-${transactionDate.getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      purchaseDate: transactionDate.toISOString(),
      quantity: quantity,
      batchNumber: `AMX${String(Math.floor(Math.random() * 9000) + 1000)}`,
      expiryDate: new Date(transactionDate.getTime() + (365 * 24 * 60 * 60 * 1000 * 2)).toISOString(), // 2 years from purchase
      unitCost: parseFloat(unitCost),
      totalCost: parseFloat((unitCost * quantity).toFixed(2)),
      storageLocation: `Rack-${String.fromCharCode(65 + Math.floor(Math.random() * 5))}${Math.floor(Math.random() * 10) + 1}`,
      qualityStatus: Math.random() > 0.1 ? "Approved" : "Pending QC",
      notes: Math.random() > 0.7 ? "Bulk purchase - discount applied" : "",
      agingDays: Math.floor((new Date() - transactionDate) / (1000 * 60 * 60 * 24))
    })
  }
  
  // Sort by date (most recent first)
  return transactions.sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate))
}

export const TransactionHistory = forwardRef(function TransactionHistory({ 
  itemId, 
  itemName, 
  isExpanded = false, 
  onToggle,
  enableHighlight = false // ✅ NEW: Control whether this grid can be highlighted
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

  // Get transactions - check for Amoxicillin first, then fallback to mock data
  let allTransactions = []
  if (itemName && itemName.toLowerCase().startsWith('amoxicillin')) {
    allTransactions = generateAmoxicillinTransactions(itemId, itemName)
  } else {
    allTransactions = mockTransactions[itemId] || []
  }

  // ✅ SHOW ONLY 4 TRANSACTIONS
  const transactions = allTransactions.slice(0, 4)

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const isAmoxicillin = itemName && itemName.toLowerCase().startsWith('amoxicillin')

  // Column definitions for the transaction grid
  const columnDefs = [
    {
      field: "supplierName",
      headerName: "Supplier",
      width: 180,
      cellRenderer: (params) => (
        <div className="font-medium text-[10px] truncate\" title={params.value} data-testid={`transaction-supplier-${params.data.id}`}>
          {params.value}
        </div>
      ),
    },
    {
      field: "quantity",
      headerName: "Quantity",
      width: 100,
      cellRenderer: (params) => (
        <div className="text-[10px] text-right" data-testid={`transaction-quantity-${params.data.id}`}>
          {params.value?.toLocaleString()} units
        </div>
      ),
    },
    {
      field: "agingDays",
      headerName: "Aging",
      width: 80,
      cellRenderer: (params) => (
        <div className={`text-[10px] text-right ${params.value > 90 ? 'text-orange-600' : 'text-gray-600'}`} data-testid={`transaction-aging-${params.data.id}`}>
          {params.value} days
        </div>
      ),
    },
    {
      field: "purchaseDate",
      headerName: "Purchase Date",
      width: 120,
      cellRenderer: (params) => (
        <div className="text-[10px]" data-testid={`transaction-date-${params.data.id}`}>
          {formatDate(params.value)}
        </div>
      ),
    },
    {
      field: "invoiceNumber",
      headerName: "Invoice",
      width: 120,
      cellRenderer: (params) => (
        <div className="font-mono text-[10px] truncate" title={params.value} data-testid={`transaction-invoice-${params.data.id}`}>
          {params.value}
        </div>
      ),
    },
  ]

  // Add Amoxicillin-specific columns
  if (isAmoxicillin) {
    columnDefs.push(
      {
        field: "batchNumber",
        headerName: "Batch",
        width: 80,
        cellRenderer: (params) => (
          <div className="font-mono text-[9px] truncate" title={params.value} data-testid={`transaction-batch-${params.data.id}`}>
            {params.value}
          </div>
        ),
      },
      {
        field: "unitCost",
        headerName: "Unit Cost",
        width: 80,
        cellRenderer: (params) => (
          <div className="text-[10px] text-right" data-testid={`transaction-unit-cost-${params.data.id}`}>
            {formatCurrency(params.value)}
          </div>
        ),
      },
      {
        field: "totalCost",
        headerName: "Total Cost",
        width: 90,
        cellRenderer: (params) => (
          <div className="text-[10px] text-right font-medium" data-testid={`transaction-total-cost-${params.data.id}`}>
            {formatCurrency(params.value)}
          </div>
        ),
      },
      {
        field: "qualityStatus",
        headerName: "Status",
        width: 80,
        cellRenderer: (params) => (
          <Badge 
            variant={params.value === "Approved" ? "default" : "secondary"} 
            className="text-[8px] px-1 py-0 h-3"
            data-testid={`transaction-status-${params.data.id}`}
          >
            {params.value}
          </Badge>
        ),
      }
    )
  }

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
        enableHighlight={enableHighlight} // ✅ CRITICAL: Use the prop to control highlighting
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