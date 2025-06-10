import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/app/components/app-sidebar.jsx';
import { SidebarInset } from '@/components/ui/sidebar';
import DashboardPage from '@/app/page.jsx';
import ItemsPage from '@/app/items/page.jsx';
import AddItemPage from '@/app/items/add/page.jsx';
import EditItemPage from '@/app/items/add/[itemId]/page.jsx';

function App() {
  return (
    <div data-testid="app-container">
      <SidebarProvider defaultOpen={true} data-testid="app-sidebar-provider">
        <AppSidebar data-testid="app-sidebar-component" />
        <SidebarInset data-testid="app-sidebar-inset">
          <Routes data-testid="app-routes">
            <Route path="/" element={<DashboardPage data-testid="app-route-dashboard" />} />
            <Route path="/items" element={<ItemsPage data-testid="app-route-items" />} />
            <Route path="/items/add" element={<AddItemPage data-testid="app-route-add-item" />} />
            <Route path="/items/add/:itemId" element={<EditItemPage data-testid="app-route-edit-item" />} />
          </Routes>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

export default App;