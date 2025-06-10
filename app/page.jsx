import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Users, Building2, BarChart3 } from "lucide-react";

export default function DashboardPage() {
  return (
    <SidebarInset data-testid="dashboard-page">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4" data-testid="dashboard-header">
        <SidebarTrigger className="-ml-1" data-testid="dashboard-sidebar-trigger" />
        <Separator orientation="vertical" className="mr-2 h-4" data-testid="dashboard-separator" />
        <div data-testid="dashboard-header-content">
          <h1 className="text-lg font-semibold" data-testid="dashboard-title">Dashboard</h1>
          <p className="text-sm text-muted-foreground" data-testid="dashboard-subtitle">
            Welcome to your warehouse management system
          </p>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-6" data-testid="dashboard-content">
        {/* Welcome Section */}
        <div className="rounded-lg border bg-card p-6" data-testid="dashboard-welcome-section">
          <h2 className="text-2xl font-bold mb-2" data-testid="dashboard-welcome-title">Welcome to WMS</h2>
          <p className="text-muted-foreground mb-4" data-testid="dashboard-welcome-description">
            Your comprehensive warehouse management solution. Start by managing
            your item master data.
          </p>
          <div className="flex gap-4" data-testid="dashboard-welcome-actions">
            <a
              href="/items"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              data-testid="dashboard-manage-items-link"
            >
              <Package className="mr-2 h-4 w-4" data-testid="dashboard-manage-items-icon" />
              Manage Items
            </a>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" data-testid="dashboard-stats-grid">
          <Card data-testid="dashboard-stat-total-items">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2" data-testid="dashboard-stat-total-items-header">
              <CardTitle className="text-sm font-medium" data-testid="dashboard-stat-total-items-title">Total Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" data-testid="dashboard-stat-total-items-icon" />
            </CardHeader>
            <CardContent data-testid="dashboard-stat-total-items-content">
              <div className="text-2xl font-bold" data-testid="dashboard-stat-total-items-value">8</div>
              <p className="text-xs text-muted-foreground" data-testid="dashboard-stat-total-items-description">
                Pharmaceutical products
              </p>
            </CardContent>
          </Card>

          <Card className="opacity-50" data-testid="dashboard-stat-customers">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2" data-testid="dashboard-stat-customers-header">
              <CardTitle className="text-sm font-medium" data-testid="dashboard-stat-customers-title">Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" data-testid="dashboard-stat-customers-icon" />
            </CardHeader>
            <CardContent data-testid="dashboard-stat-customers-content">
              <div className="text-2xl font-bold" data-testid="dashboard-stat-customers-value">-</div>
              <p className="text-xs text-muted-foreground" data-testid="dashboard-stat-customers-description">Coming soon</p>
            </CardContent>
          </Card>

          <Card className="opacity-50" data-testid="dashboard-stat-vendors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2" data-testid="dashboard-stat-vendors-header">
              <CardTitle className="text-sm font-medium" data-testid="dashboard-stat-vendors-title">Vendors</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" data-testid="dashboard-stat-vendors-icon" />
            </CardHeader>
            <CardContent data-testid="dashboard-stat-vendors-content">
              <div className="text-2xl font-bold" data-testid="dashboard-stat-vendors-value">-</div>
              <p className="text-xs text-muted-foreground" data-testid="dashboard-stat-vendors-description">Coming soon</p>
            </CardContent>
          </Card>

          <Card className="opacity-50" data-testid="dashboard-stat-reports">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2" data-testid="dashboard-stat-reports-header">
              <CardTitle className="text-sm font-medium" data-testid="dashboard-stat-reports-title">Reports</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" data-testid="dashboard-stat-reports-icon" />
            </CardHeader>
            <CardContent data-testid="dashboard-stat-reports-content">
              <div className="text-2xl font-bold" data-testid="dashboard-stat-reports-value">-</div>
              <p className="text-xs text-muted-foreground" data-testid="dashboard-stat-reports-description">Coming soon</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="rounded-lg border bg-card p-6" data-testid="dashboard-quick-actions-section">
          <h3 className="text-lg font-semibold mb-4" data-testid="dashboard-quick-actions-title">Quick Actions</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" data-testid="dashboard-quick-actions-grid">
            <a
              href="/items/add"
              className="flex items-center gap-3 rounded-lg border p-4 hover:bg-accent transition-colors"
              data-testid="dashboard-add-new-item-link"
            >
              <Package className="h-8 w-8 text-blue-600" data-testid="dashboard-add-new-item-icon" />
              <div data-testid="dashboard-add-new-item-content">
                <h4 className="font-medium" data-testid="dashboard-add-new-item-title">Add New Item</h4>
                <p className="text-sm text-muted-foreground" data-testid="dashboard-add-new-item-description">
                  Create a new item in inventory
                </p>
              </div>
            </a>

            <div className="flex items-center gap-3 rounded-lg border p-4 opacity-50 cursor-not-allowed" data-testid="dashboard-add-customer-disabled">
              <Users className="h-8 w-8 text-muted-foreground" data-testid="dashboard-add-customer-icon" />
              <div data-testid="dashboard-add-customer-content">
                <h4 className="font-medium" data-testid="dashboard-add-customer-title">Add Customer</h4>
                <p className="text-sm text-muted-foreground" data-testid="dashboard-add-customer-description">Coming soon</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border p-4 opacity-50 cursor-not-allowed" data-testid="dashboard-add-vendor-disabled">
              <Building2 className="h-8 w-8 text-muted-foreground" data-testid="dashboard-add-vendor-icon" />
              <div data-testid="dashboard-add-vendor-content">
                <h4 className="font-medium" data-testid="dashboard-add-vendor-title">Add Vendor</h4>
                <p className="text-sm text-muted-foreground" data-testid="dashboard-add-vendor-description">Coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarInset>
  );
}