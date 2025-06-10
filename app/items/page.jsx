import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus,
  Search,
  Package,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Filter,
  X,
  Download,
} from "lucide-react";
import { apiService } from "@/app/components/api-service";
import { ProfessionalTable } from "@/app/components/professional-table";
import { TransactionHistory } from "@/app/components/transaction-history";

export default function ItemsPage() {
  const navigate = useNavigate();
  const mainGridRef = useRef(); // ✅ Reference to main grid
  const transactionGridRef = useRef(); // ✅ Reference to transaction grid
  
  // ✅ NEW: Track which grid currently has focus
  const [activeGrid, setActiveGrid] = useState('main'); // 'main' or 'transaction'
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [selectedItemIds, setSelectedItemIds] = useState([]);
  const [focusedItemId, setFocusedItemId] = useState(null);
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);
  const [showSummaryPanel, setShowSummaryPanel] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 50,
    startItem: 0,
    endItem: 0,
    hasNext: false,
    hasPrevious: false,
  });
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [fetchLimit, setFetchLimit] = useState(100);
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);

  // Load items with current filters and pagination
  const loadItems = useCallback(
    async (page = 1, selectPosition = "first") => {
      setLoading(true);
      try {
        const response = await apiService.getItems({
          page,
          limit: fetchLimit,
          search: searchTerm,
          category: filterCategory,
          sortBy: "name",
          sortOrder: "asc",
        });

        if (response.success) {
          setItems(response.data);
          setPagination(response.pagination);

          // Auto-focus item based on position (only if no current focus)
          if (response.data.length > 0 && !focusedItemId) {
            if (selectPosition === "last") {
              setFocusedItemId(response.data[response.data.length - 1].id);
            } else {
              setFocusedItemId(response.data[0].id);
            }
          }
        } else {
          console.error("Failed to load items:", response.error);
        }
      } catch (error) {
        console.error("Error loading items:", error);
      } finally {
        setLoading(false);
      }
    },
    [searchTerm, filterCategory, fetchLimit, focusedItemId]
  );

  // Load items on component mount only
  useEffect(() => {
    loadItems(1);
  }, []); // Empty dependency array - only run on mount

  // Reload when search or filter changes (with debounce) - but don't show loading
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Don't show loading for search/filter changes
      const loadItemsQuiet = async () => {
        try {
          const response = await apiService.getItems({
            page: 1,
            limit: fetchLimit,
            search: searchTerm,
            category: filterCategory,
            sortBy: "name",
            sortOrder: "asc",
          });

          if (response.success) {
            setItems(response.data);
            setPagination(response.pagination);
            
            // Reset focus to first item when filtering
            if (response.data.length > 0) {
              setFocusedItemId(response.data[0].id);
            }
          }
        } catch (error) {
          console.error("Error loading items:", error);
        }
      };

      if (searchTerm || filterCategory !== "all") {
        loadItemsQuiet();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, filterCategory, fetchLimit]);

  // Get unique categories for filter
  const categories = [
    "all",
    "Analgesics",
    "Antibiotics",
    "Diabetes Care",
    "Gastroenterology",
    "Respiratory",
    "Antihistamines",
    "Cardiovascular",
    "Dermatology",
    "Neurology",
    "Oncology",
  ];

  // Get selected items details
  const selectedItems = items.filter((item) =>
    selectedItemIds.includes(item.id)
  );
  const focusedItem = items.find((item) => item.id === focusedItemId);

  // Calculate summary data
  const summaryData = {
    totalValue: items.reduce((sum, item) => sum + item.price, 0),
    selectedValue: selectedItems.reduce((sum, item) => sum + item.price, 0),
    activeItems: items.filter((item) => item.is_active).length,
    inactiveItems: items.filter((item) => !item.is_active).length,
    avgPrice:
      items.length > 0
        ? items.reduce((sum, item) => sum + item.price, 0) / items.length
        : 0,
  };

  // Handle selection change from table
  const handleSelectionChange = useCallback((selectedIds) => {
    console.log('ItemsPage: Selection changed to:', selectedIds);
    setSelectedItemIds(selectedIds);
  }, []);

  // Handle row click from table - simplified to just navigate
  const handleRowClick = (itemId) => {
    navigate(`/items/add/${itemId}`);
  };

  // Handle pagination change
  const handlePaginationChange = useCallback(
    (page, selectPosition = "first") => {
      loadItems(page, selectPosition);
    },
    [loadItems]
  );

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    const currentFirstItem =
      (pagination.currentPage - 1) * pagination.itemsPerPage + 1;
    const newPage = Math.ceil(currentFirstItem / newItemsPerPage);
    loadItems(newPage);
  };

  // Handle fetch limit change
  const handleFetchLimitChange = (newFetchLimit) => {
    setFetchLimit(newFetchLimit);
    loadItems(1);
  };

  // Handle add item
  const handleAddItem = () => {
    navigate("/items/add");
  };

  // Handle export selected items
  const handleExportSelected = () => {
    const itemsToExport = selectedItems.length > 0 ? selectedItems : items;
    const csvContent = [
      ["ID", "Name", "Description", "Price", "Category", "Status", "Created"],
      ...itemsToExport.map((item) => [
        item.id,
        item.name,
        item.description,
        item.price,
        item.category,
        item.is_active ? "Active" : "Inactive",
        new Date(item.created_at).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `items-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Handle row focus change - just update state, no loading
  const handleRowFocus = useCallback((itemId) => {
    setFocusedItemId(itemId);
  }, []);

  // ✅ Function to refocus main grid - ONLY for vertical navigation
  const refocusMainGrid = useCallback(() => {
    if (activeGrid === 'main' && mainGridRef.current && mainGridRef.current.refocus) {
      mainGridRef.current.refocus();
    }
  }, [activeGrid]);

  // ✅ Function to refocus transaction grid
  const refocusTransactionGrid = useCallback(() => {
    if (activeGrid === 'transaction' && transactionGridRef.current && transactionGridRef.current.refocus) {
      transactionGridRef.current.refocus();
    }
  }, [activeGrid]);

  // ✅ Function to switch focus between grids
  const switchToTransactionGrid = useCallback(() => {
    console.log('🔥 Switching focus to transaction grid');
    setActiveGrid('transaction');
    
    // Small delay to ensure the transaction grid is ready
    setTimeout(() => {
      if (transactionGridRef.current && transactionGridRef.current.refocus) {
        transactionGridRef.current.refocus();
      }
    }, 50);
  }, []);

  const switchToMainGrid = useCallback(() => {
    console.log('🔥 Switching focus to main grid');
    setActiveGrid('main');
    
    // Small delay to ensure the main grid is ready
    setTimeout(() => {
      if (mainGridRef.current && mainGridRef.current.refocus) {
        mainGridRef.current.refocus();
      }
    }, 50);
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Don't handle keyboard events if we're in an input or select
      if (
        event.target.tagName === "INPUT" ||
        event.target.tagName === "SELECT" ||
        event.target.tagName === "TEXTAREA"
      ) {
        return;
      }

      // ✅ CRITICAL FIX: Handle Alt + Down Arrow to switch to transaction grid
      if (event.altKey && event.key === 'ArrowDown') {
        console.log('🔥 Alt + Down Arrow detected - switching to transaction grid');
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        
        if (activeGrid === 'main') {
          switchToTransactionGrid();
        }
        return;
      }

      // ✅ CRITICAL FIX: Handle Alt + Up Arrow to switch to main grid
      if (event.altKey && event.key === 'ArrowUp') {
        console.log('🔥 Alt + Up Arrow detected - switching to main grid');
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        
        if (activeGrid === 'transaction') {
          switchToMainGrid();
        }
        return;
      }

      // ✅ CRITICAL FIX: COMPLETELY EXCLUDE Left/Right arrows from page-level handling
      // Let AG Grid handle horizontal navigation entirely
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        return; // Do nothing - let AG Grid handle it
      }

      // ✅ CRITICAL FIX: EXCLUDE Shift + Arrow keys from page-level handling
      // Let DataGrid handle Shift + Arrow navigation entirely
      if (event.shiftKey && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
        return; // Do nothing - let DataGrid handle it
      }

      // ✅ Only refocus for VERTICAL navigation and specific actions
      if (['ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown', 'Enter'].includes(event.key)) {
        if (activeGrid === 'main') {
          refocusMainGrid();
        } else if (activeGrid === 'transaction') {
          refocusTransactionGrid();
        }
      }

      switch (event.key) {
        case "n":
        case "N":
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            handleAddItem();
          }
          break;
        case "a":
        case "A":
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            // Handle select all
            const allItemIds = items.map(item => item.id);
            if (selectedItemIds.length === allItemIds.length && 
                allItemIds.every(id => selectedItemIds.includes(id))) {
              setSelectedItemIds([]);
            } else {
              setSelectedItemIds(allItemIds);
            }
            refocusMainGrid(); // ✅ Refocus after select all
          }
          break;
        case "f":
        case "F":
          if (event.altKey || event.metaKey) {
            event.preventDefault();
            setShowFilterSidebar(!showFilterSidebar);
          }
          break;
        case "s":
        case "S":
          if (event.altKey) {
            event.preventDefault();
            setShowSummaryPanel(!showSummaryPanel);
          }
          break;
        case "PageDown":
          event.preventDefault();
          if (pagination.hasNext) {
            handlePaginationChange(pagination.currentPage + 1, "first");
          }
          break;
        case "PageUp":
          event.preventDefault();
          if (pagination.hasPrevious) {
            handlePaginationChange(pagination.currentPage - 1, "last");
          }
          break;
        case "Enter":
          if (focusedItem && activeGrid === 'main') {
            event.preventDefault();
            handleRowClick(focusedItem.id);
          }
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    focusedItem,
    showFilterSidebar,
    showSummaryPanel,
    pagination,
    handlePaginationChange,
    items,
    selectedItemIds,
    refocusMainGrid,
    refocusTransactionGrid,
    activeGrid,
    switchToTransactionGrid,
    switchToMainGrid,
  ]);

  // ✅ Handle clicks outside grids to refocus the active grid
  useEffect(() => {
    const handleDocumentClick = (event) => {
      // Check if click is outside both grids
      const mainGridElement = mainGridRef.current?.getGridElement?.();
      const transactionGridElement = transactionGridRef.current?.getGridElement?.();
      
      const clickedInMainGrid = mainGridElement && mainGridElement.contains(event.target);
      const clickedInTransactionGrid = transactionGridElement && transactionGridElement.contains(event.target);
      
      if (!clickedInMainGrid && !clickedInTransactionGrid) {
        // Click outside both grids - refocus the active grid
        setTimeout(() => {
          if (activeGrid === 'main') {
            refocusMainGrid();
          } else if (activeGrid === 'transaction') {
            refocusTransactionGrid();
          }
        }, 10);
      } else if (clickedInMainGrid && activeGrid !== 'main') {
        // Clicked in main grid but it's not active - switch to it
        setActiveGrid('main');
      } else if (clickedInTransactionGrid && activeGrid !== 'transaction') {
        // Clicked in transaction grid but it's not active - switch to it
        setActiveGrid('transaction');
      }
    };

    document.addEventListener("click", handleDocumentClick);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, [activeGrid, refocusMainGrid, refocusTransactionGrid]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <SidebarInset data-testid="items-page">
      <header className="flex h-10 shrink-0 items-center gap-2 border-b px-4 bg-background" data-testid="items-page-header">
        <SidebarTrigger className="-ml-1" data-testid="items-page-sidebar-trigger" />
        <Separator orientation="vertical" className="mr-2 h-4" data-testid="items-page-separator" />
        <div className="flex items-center gap-2" data-testid="items-page-header-content">
          <Package className="h-4 w-4 text-blue-600" data-testid="items-page-header-icon" />
          <div data-testid="items-page-header-text">
            <h1 className="text-sm font-semibold" data-testid="items-page-title">Item Master</h1>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-4 text-xs text-muted-foreground" data-testid="items-page-header-stats">
          {/* ✅ Show which grid is currently active */}
          <div className="text-xs text-muted-foreground">
            Active Grid: <span className="font-medium text-blue-600">{activeGrid === 'main' ? 'Items' : 'Transactions'}</span>
          </div>
        </div>
      </header>

      <div className="flex flex-col h-[calc(100vh-2.5rem)]" data-testid="items-page-content">
        <div className="relative flex flex-1 min-h-0" data-testid="items-page-main-content">
          <div className="flex-1 min-h-0 flex flex-col" data-testid="items-page-table-section">
            <div className="flex-1 min-h-0 p-1" data-testid="items-page-table-container">
              <Card className="h-full flex flex-col" data-testid="items-page-table-card">
                <CardContent className="flex-1 min-h-0 p-0" data-testid="items-page-table-card-content">
                  <div className="h-full overflow-hidden" data-testid="items-page-table-wrapper">
                    <ProfessionalTable
                      ref={mainGridRef} // ✅ Pass ref to main grid
                      items={items}
                      loading={loading}
                      selectedItemIds={selectedItemIds}
                      onSelectionChange={handleSelectionChange}
                      onRowClick={handleRowClick}
                      focusedItemId={focusedItemId}
                      onRowFocus={handleRowFocus}
                      enableHighlight={activeGrid === 'main'} // ✅ Only highlight when main grid is active
                      data-testid="items-page-professional-table"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {showFilterSidebar && (
            <>
              <div
                className="fixed inset-0 bg-black/20 z-40"
                onClick={() => setShowFilterSidebar(false)}
                data-testid="items-page-filter-overlay"
              />

              <div className="fixed right-0 top-10 bottom-0 w-80 bg-background border-l shadow-lg z-50 flex flex-col" data-testid="items-page-filter-sidebar">
                <div className="flex items-center justify-between p-3 border-b" data-testid="items-page-filter-header">
                  <h3 className="text-sm font-semibold" data-testid="items-page-filter-title">Filters & Settings</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilterSidebar(false)}
                    className="h-6 w-6 p-0"
                    data-testid="items-page-filter-close-button"
                  >
                    <X className="h-3 w-3" data-testid="items-page-filter-close-icon" />
                  </Button>
                </div>

                <div className="flex-1 overflow-auto p-3 space-y-4" data-testid="items-page-filter-content">
                  <div data-testid="items-page-search-section">
                    <label className="text-xs font-medium mb-1 block" data-testid="items-page-search-label">
                      Search Items
                    </label>
                    <div className="relative" data-testid="items-page-search-input-container">
                      <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" data-testid="items-page-search-icon" />
                      <Input
                        placeholder="Search by name or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-7 h-8 text-xs"
                        data-testid="items-page-search-input"
                      />
                    </div>
                  </div>

                  <div data-testid="items-page-category-section">
                    <label className="text-xs font-medium mb-1 block" data-testid="items-page-category-label">
                      Category
                    </label>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs ring-offset-background file:border-0 file:bg-transparent file:text-xs file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      data-testid="items-page-category-select"
                    >
                      {categories.map((category, index) => (
                        <option key={category} value={category} data-testid={`items-page-category-option-${index}`}>
                          {category === "all" ? "All Categories" : category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div data-testid="items-page-items-per-page-section">
                    <label className="text-xs font-medium mb-1 block" data-testid="items-page-items-per-page-label">
                      Items Per Page
                    </label>
                    <select
                      value={itemsPerPage}
                      onChange={(e) =>
                        handleItemsPerPageChange(Number(e.target.value))
                      }
                      className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs ring-offset-background file:border-0 file:bg-transparent file:text-xs file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      data-testid="items-page-items-per-page-select"
                    >
                      <option value={25} data-testid="items-page-items-per-page-option-25">25</option>
                      <option value={50} data-testid="items-page-items-per-page-option-50">50</option>
                      <option value={100} data-testid="items-page-items-per-page-option-100">100</option>
                      <option value={200} data-testid="items-page-items-per-page-option-200">200</option>
                    </select>
                  </div>

                  <div className="pt-3 border-t" data-testid="items-page-statistics-section">
                    <h4 className="text-xs font-medium mb-2" data-testid="items-page-statistics-title">Statistics</h4>
                    <div className="space-y-1 text-xs" data-testid="items-page-statistics-content">
                      <div className="flex justify-between" data-testid="items-page-stat-total-items">
                        <span className="text-muted-foreground" data-testid="items-page-stat-total-items-label">
                          Total Items:
                        </span>
                        <span className="font-medium" data-testid="items-page-stat-total-items-value">
                          {pagination.totalItems}
                        </span>
                      </div>
                      <div className="flex justify-between" data-testid="items-page-stat-selected">
                        <span className="text-muted-foreground" data-testid="items-page-stat-selected-label">Selected:</span>
                        <span className="font-medium" data-testid="items-page-stat-selected-value">
                          {selectedItems.length}
                        </span>
                      </div>
                      <div className="flex justify-between" data-testid="items-page-stat-active">
                        <span className="text-muted-foreground" data-testid="items-page-stat-active-label">Active:</span>
                        <span className="font-medium text-green-600" data-testid="items-page-stat-active-value">
                          {summaryData.activeItems}
                        </span>
                      </div>
                      <div className="flex justify-between" data-testid="items-page-stat-inactive">
                        <span className="text-muted-foreground" data-testid="items-page-stat-inactive-label">Inactive:</span>
                        <span className="font-medium text-red-600" data-testid="items-page-stat-inactive-value">
                          {summaryData.inactiveItems}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {showSummaryPanel && (
          <div className="flex-shrink-0 border-t bg-muted/20 max-h-[35vh] overflow-hidden" data-testid="items-page-summary-panel">
            <div className="px-4 py-2 h-full" data-testid="items-page-summary-content">
              <div className="flex flex-row-reverse gap-4 h-full" data-testid="items-page-summary-layout">
                <div className="w-[20%] flex-shrink-0" data-testid="items-page-summary-stats">
                  <div className="grid grid-cols-2 gap-2 text-xs" data-testid="items-page-summary-stats-grid">
                    <div className="text-center" data-testid="items-page-summary-total-value">
                      <div className="text-muted-foreground text-[10px]" data-testid="items-page-summary-total-value-label">
                        Total Value
                      </div>
                      <div className="font-semibold text-blue-600 text-xs" data-testid="items-page-summary-total-value-amount">
                        {formatCurrency(summaryData.totalValue)}
                      </div>
                    </div>
                    <div className="text-center" data-testid="items-page-summary-selected-value">
                      <div className="text-muted-foreground text-[10px]" data-testid="items-page-summary-selected-value-label">
                        Selected Value
                      </div>
                      <div className="font-semibold text-green-600 text-xs" data-testid="items-page-summary-selected-value-amount">
                        {formatCurrency(summaryData.selectedValue)}
                      </div>
                    </div>
                    <div className="text-center" data-testid="items-page-summary-avg-price">
                      <div className="text-muted-foreground text-[10px]" data-testid="items-page-summary-avg-price-label">
                        Avg Price
                      </div>
                      <div className="font-semibold text-xs" data-testid="items-page-summary-avg-price-amount">
                        {formatCurrency(summaryData.avgPrice)}
                      </div>
                    </div>
                    <div className="text-center" data-testid="items-page-summary-active-items">
                      <div className="text-muted-foreground text-[10px]" data-testid="items-page-summary-active-items-label">
                        Active Items
                      </div>
                      <div className="font-semibold text-green-600 text-xs" data-testid="items-page-summary-active-items-count">
                        {summaryData.activeItems}
                      </div>
                    </div>
                    <div className="text-center col-span-2" data-testid="items-page-summary-inactive-items">
                      <div className="text-muted-foreground text-[10px]" data-testid="items-page-summary-inactive-items-label">
                        Inactive Items
                      </div>
                      <div className="font-semibold text-red-600 text-xs" data-testid="items-page-summary-inactive-items-count">
                        {summaryData.inactiveItems}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-[80%] flex-shrink-0 overflow-hidden" data-testid="items-page-transaction-history-section">
                  {focusedItem && (
                    <TransactionHistory
                      ref={transactionGridRef} // ✅ Pass ref to transaction grid
                      itemId={focusedItem.id}
                      itemName={focusedItem.name}
                      isExpanded={showTransactionHistory}
                      onToggle={setShowTransactionHistory}
                      enableHighlight={activeGrid === 'transaction'} // ✅ Only highlight when transaction grid is active
                      data-testid="items-page-transaction-history"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex-shrink-0 border-t bg-background" data-testid="items-page-footer">
          <div className="px-4 py-1" data-testid="items-page-footer-content">
            <div className="flex items-center justify-between text-xs" data-testid="items-page-footer-layout">
              <div className="flex items-center gap-3" data-testid="items-page-footer-left">
                <div className="text-muted-foreground text-[10px]" data-testid="items-page-pagination-info">
                  {pagination.startItem}-{pagination.endItem} of{" "}
                  {pagination.totalItems} items
                </div>
                {selectedItems.length > 0 && (
                  <div className="flex items-center gap-1 text-[10px]" data-testid="items-page-selection-info">
                    <span className="text-muted-foreground" data-testid="items-page-selection-label">Selected:</span>
                    <span className="font-medium" data-testid="items-page-selection-count">
                      {selectedItems.length} item
                      {selectedItems.length > 1 ? "s" : ""}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedItemIds([])}
                      className="h-4 px-1 text-[10px]"
                      data-testid="items-page-clear-selection-button"
                    >
                      Clear
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1" data-testid="items-page-pagination-controls">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePaginationChange(1)}
                  disabled={pagination.currentPage === 1}
                  className="h-5 w-5 p-0"
                  data-testid="items-page-pagination-first"
                >
                  <ChevronsLeft className="h-2 w-2" data-testid="items-page-pagination-first-icon" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handlePaginationChange(pagination.currentPage - 1)
                  }
                  disabled={pagination.currentPage === 1}
                  className="h-5 w-5 p-0"
                  data-testid="items-page-pagination-prev"
                >
                  <ChevronLeft className="h-2 w-2" data-testid="items-page-pagination-prev-icon" />
                </Button>
                <span className="px-2 text-[10px]" data-testid="items-page-pagination-current">
                  {pagination.currentPage} / {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handlePaginationChange(pagination.currentPage + 1)
                  }
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="h-5 w-5 p-0"
                  data-testid="items-page-pagination-next"
                >
                  <ChevronRight className="h-2 w-2" data-testid="items-page-pagination-next-icon" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePaginationChange(pagination.totalPages)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="h-5 w-5 p-0"
                  data-testid="items-page-pagination-last"
                >
                  <ChevronsRight className="h-2 w-2" data-testid="items-page-pagination-last-icon" />
                </Button>
              </div>

              <div className="flex items-center gap-1" data-testid="items-page-toolbar">
                {/* Moved toolbar buttons here */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportSelected}
                  className="h-5 text-[10px] px-2"
                  data-testid="items-page-export-button"
                >
                  <Download className="h-2 w-2 mr-1" data-testid="items-page-export-icon" />
                  Export{" "}
                  {selectedItems.length > 0 ? `(${selectedItems.length})` : "All"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilterSidebar(!showFilterSidebar)}
                  className="h-5 text-[10px] px-2"
                  data-testid="items-page-filters-button"
                >
                  <Filter className="h-2 w-2 mr-1" data-testid="items-page-filters-icon" />
                  Filters
                </Button>
                <Button
                  size="sm"
                  className="h-5 text-[10px] px-2"
                  onClick={handleAddItem}
                  data-testid="items-page-add-item-button"
                >
                  <Plus className="h-2 w-2 mr-1" data-testid="items-page-add-item-icon" />
                  Add Item
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md" data-testid="items-page-keyboard-shortcuts">
        <p className="font-medium mb-1" data-testid="items-page-keyboard-shortcuts-title">Keyboard Navigation:</p>
        <div className="flex flex-wrap gap-4 text-xs" data-testid="items-page-keyboard-shortcuts-list">
          <span data-testid="items-page-shortcut-navigate">↑↓ Navigate rows</span>
          <span data-testid="items-page-shortcut-horizontal">←→ Scroll columns</span>
          <span data-testid="items-page-shortcut-open">Enter Open item</span>
          <span data-testid="items-page-shortcut-pages">PgUp/PgDn Change pages</span>
          <span data-testid="items-page-shortcut-home-end">Home/End First/Last on page</span>
          <span data-testid="items-page-shortcut-select-all">Ctrl+A Select/Deselect All</span>
          <span data-testid="items-page-shortcut-new">Ctrl+N New</span>
          <span data-testid="items-page-shortcut-grid-switch" className="font-medium text-blue-600">Alt+↓ Switch to Transactions</span>
          <span data-testid="items-page-shortcut-grid-switch-back" className="font-medium text-blue-600">Alt+↑ Switch to Items</span>
        </div>
      </div>
    </SidebarInset>
  );
}