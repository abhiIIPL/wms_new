"use client";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ItemForm } from "@/app/components/item-form";
import { apiService } from "@/app/components/api-service";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Package } from "lucide-react";

export default function AddItemPage() {
  const navigate = useNavigate();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState(null);
  const [error, setError] = useState(null);

  // Check if we're in edit mode by checking for itemId in params
  const isEditMode = params?.itemId !== undefined;
  const itemId = params?.itemId;

  useEffect(() => {
    const loadItemData = async () => {
      if (isEditMode && itemId) {
        try {
          setLoading(true);
          // First check if we have pre-fetched data
          const cachedData = sessionStorage.getItem(`item_${itemId}`);
          if (cachedData) {
            setInitialData(JSON.parse(cachedData));
            setLoading(false);
            // Clear the cache after using it
            sessionStorage.removeItem(`item_${itemId}`);
            return;
          }

          // If no cached data, fetch from API
          const response = await apiService.getItem(itemId);
          if (response.success) {
            setInitialData(response.data);
          } else {
            setError("Failed to load item data");
            console.error("Failed to load item:", response.error);
          }
        } catch (error) {
          setError("Error loading item data");
          console.error("Error loading item:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadItemData();
  }, [isEditMode, itemId]);

  const handleClose = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <SidebarInset data-testid="add-item-page-loading">
        {/* Sticky Header */}
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-background" data-testid="add-item-page-loading-header">
          <SidebarTrigger className="-ml-1" data-testid="add-item-page-loading-sidebar-trigger" />
          <Separator orientation="vertical" className="mr-2 h-4" data-testid="add-item-page-loading-separator" />
          <div className="flex items-center gap-2" data-testid="add-item-page-loading-header-content">
            <Package className="h-5 w-5 text-blue-600" data-testid="add-item-page-loading-icon" />
            <div data-testid="add-item-page-loading-text">
              <h1 className="text-lg font-semibold" data-testid="add-item-page-loading-title">
                {isEditMode ? "Edit Item" : "Add New Item"}
              </h1>
              <p className="text-sm text-muted-foreground" data-testid="add-item-page-loading-subtitle">
                {isEditMode
                  ? "Edit an item in your inventory"
                  : "Create a new item in your inventory"}
              </p>
            </div>
          </div>
        </header>
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]" data-testid="add-item-page-loading-spinner-container">
          <div className="flex items-center gap-2" data-testid="add-item-page-loading-spinner">
            <div className="h-3 w-3 animate-spin rounded-full border border-primary border-t-transparent" data-testid="add-item-page-loading-spinner-icon"></div>
            <span className="text-muted-foreground text-xs" data-testid="add-item-page-loading-spinner-text">Loading...</span>
          </div>
        </div>
      </SidebarInset>
    );
  }

  if (error) {
    return (
      <SidebarInset data-testid="add-item-page-error">
        {/* Sticky Header */}
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-background" data-testid="add-item-page-error-header">
          <SidebarTrigger className="-ml-1" data-testid="add-item-page-error-sidebar-trigger" />
          <Separator orientation="vertical" className="mr-2 h-4" data-testid="add-item-page-error-separator" />
          <div className="flex items-center gap-2" data-testid="add-item-page-error-header-content">
            <Package className="h-5 w-5 text-blue-600" data-testid="add-item-page-error-icon" />
            <div data-testid="add-item-page-error-text">
              <h1 className="text-lg font-semibold" data-testid="add-item-page-error-title">Error</h1>
            </div>
          </div>
        </header>
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]" data-testid="add-item-page-error-message-container">
          <div className="text-red-500" data-testid="add-item-page-error-message">{error}</div>
        </div>
      </SidebarInset>
    );
  }

  return (
    <SidebarInset data-testid="add-item-page">
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-background" data-testid="add-item-page-header">
        <SidebarTrigger className="-ml-1" data-testid="add-item-page-sidebar-trigger" />
        <Separator orientation="vertical" className="mr-2 h-4" data-testid="add-item-page-separator" />
        <div className="flex items-center gap-2" data-testid="add-item-page-header-content">
          <Package className="h-5 w-5 text-blue-600" data-testid="add-item-page-icon" />
          <div data-testid="add-item-page-header-text">
            <h1 className="text-lg font-semibold" data-testid="add-item-page-title">
              {isEditMode ? "Edit Item" : "Add New Item"}
            </h1>
            <p className="text-sm text-muted-foreground" data-testid="add-item-page-subtitle">
              {isEditMode
                ? "Edit an item in your inventory"
                : "Create a new item in your inventory"}
            </p>
          </div>
        </div>
      </header>

      {/* Form Container - Full height minus header */}
      <div className="h-[calc(100vh-4rem)]" data-testid="add-item-page-form-container">
        <ItemForm
          mode={isEditMode ? "edit" : "create"}
          initialData={initialData}
          onClose={handleClose}
          data-testid="add-item-page-form"
        />
      </div>
    </SidebarInset>
  );
}