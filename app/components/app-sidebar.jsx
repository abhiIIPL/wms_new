"use client"

import { Package, Users, Building2, FolderOpen, FileText, BarChart3, Home, Settings, ChevronRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useCallback, useEffect } from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

// Navigation data structure
const navigationData = {
  main: [
    {
      title: "Dashboard",
      url: "/",
      icon: Home,
    },
  ],
  masters: [
    {
      title: "Masters",
      icon: FolderOpen,
      items: [
        {
          title: "Item Master",
          url: "/items",
          icon: Package,
          isActive: true, // Current focus
        },
        {
          title: "Customer Master",
          url: "/customers",
          icon: Users,
          disabled: true, // Future implementation
        },
        {
          title: "Vendor Master",
          url: "/vendors",
          icon: Building2,
          disabled: true, // Future implementation
        },
        {
          title: "Category Master",
          url: "/categories",
          icon: FolderOpen,
          disabled: true, // Future implementation
        },
      ],
    },
  ],
  operations: [
    {
      title: "Transactions",
      icon: FileText,
      items: [
        {
          title: "Purchase Orders",
          url: "/purchase-orders",
          disabled: true,
        },
        {
          title: "Sales Orders",
          url: "/sales-orders",
          disabled: true,
        },
        {
          title: "Stock Movements",
          url: "/stock-movements",
          disabled: true,
        },
      ],
    },
    {
      title: "Reports",
      icon: BarChart3,
      items: [
        {
          title: "Inventory Report",
          url: "/reports/inventory",
          disabled: true,
        },
        {
          title: "Sales Report",
          url: "/reports/sales",
          disabled: true,
        },
      ],
    },
  ],
}

export function AppSidebar() {
  const { setOpen, setOpenMobile, isMobile } = useSidebar()
  const navigate = useNavigate()

  // Function to handle navigation and close sidebar
  const handleNavigation = useCallback(
    (url, disabled = false) => {
      if (disabled) return

      // Close sidebar for ALL pages except dashboard
      if (url !== "/") {
        if (isMobile) {
          setOpenMobile(false)
        } else {
          setOpen(false)
        }
      }

      // Navigate immediately for dashboard, with small delay for others
      const delay = url === "/" ? 0 : 100
      setTimeout(() => {
        navigate(url)
      }, delay)
    },
    [navigate, isMobile, setOpen, setOpenMobile],
  )

  // Keyboard shortcut: Ctrl + Space to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.code === "Space") {
        event.preventDefault()
        console.log("Keyboard shortcut triggered")
        if (isMobile) {
          setOpenMobile((prev) => !prev)
        } else {
          setOpen((prev) => !prev)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isMobile, setOpen, setOpenMobile])

  return (
    <Sidebar variant="sidebar" className="border-r" data-testid="app-sidebar">
      <SidebarHeader className="border-b px-6 py-4" data-testid="sidebar-header">
        <div className="flex items-center gap-2" data-testid="sidebar-header-content">
          <Package className="h-6 w-6 text-blue-600" data-testid="sidebar-logo-icon" />
          <div data-testid="sidebar-header-text">
            <h1 className="text-lg font-semibold" data-testid="sidebar-title">PharmaWMS</h1>
            <p className="text-xs text-muted-foreground" data-testid="sidebar-subtitle">Pharmaceutical Warehouse</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4 py-4" data-testid="sidebar-content">
        {/* Main Navigation */}
        <SidebarGroup data-testid="sidebar-main-group">
          <SidebarGroupContent data-testid="sidebar-main-group-content">
            <SidebarMenu data-testid="sidebar-main-menu">
              {navigationData.main.map((item, index) => (
                <SidebarMenuItem key={item.title} data-testid={`sidebar-main-item-${index}`}>
                  <SidebarMenuButton asChild data-testid={`sidebar-main-button-${index}`}>
                    <button
                      className="flex items-center gap-3 w-full text-left"
                      onClick={() => handleNavigation(item.url)}
                      data-testid={`sidebar-main-nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <item.icon className="h-4 w-4" data-testid={`sidebar-main-icon-${index}`} />
                      <span data-testid={`sidebar-main-text-${index}`}>{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Masters Section */}
        <SidebarGroup data-testid="sidebar-masters-group">
          <SidebarGroupLabel data-testid="sidebar-masters-label">Masters</SidebarGroupLabel>
          <SidebarGroupContent data-testid="sidebar-masters-group-content">
            <SidebarMenu data-testid="sidebar-masters-menu">
              {navigationData.masters.map((section, sectionIndex) => (
                <Collapsible key={section.title} defaultOpen className="group/collapsible" data-testid={`sidebar-masters-collapsible-${sectionIndex}`}>
                  <SidebarMenuItem data-testid={`sidebar-masters-section-${sectionIndex}`}>
                    <CollapsibleTrigger asChild data-testid={`sidebar-masters-trigger-${sectionIndex}`}>
                      <SidebarMenuButton className="w-full" data-testid={`sidebar-masters-section-button-${sectionIndex}`}>
                        <section.icon className="h-4 w-4" data-testid={`sidebar-masters-section-icon-${sectionIndex}`} />
                        <span data-testid={`sidebar-masters-section-text-${sectionIndex}`}>{section.title}</span>
                        <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" data-testid={`sidebar-masters-chevron-${sectionIndex}`} />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent data-testid={`sidebar-masters-content-${sectionIndex}`}>
                      <SidebarMenuSub data-testid={`sidebar-masters-submenu-${sectionIndex}`}>
                        {section.items.map((item, itemIndex) => (
                          <SidebarMenuSubItem key={item.title} data-testid={`sidebar-masters-subitem-${sectionIndex}-${itemIndex}`}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={item.isActive}
                              className={item.disabled ? "opacity-50 cursor-not-allowed" : ""}
                              data-testid={`sidebar-masters-subbutton-${sectionIndex}-${itemIndex}`}
                            >
                              <button
                                className="flex items-center gap-2 w-full text-left"
                                onClick={() => handleNavigation(item.url, item.disabled)}
                                disabled={item.disabled}
                                data-testid={`sidebar-masters-nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                              >
                                {item.icon && <item.icon className="h-3 w-3" data-testid={`sidebar-masters-subicon-${sectionIndex}-${itemIndex}`} />}
                                <span data-testid={`sidebar-masters-subtext-${sectionIndex}-${itemIndex}`}>{item.title}</span>
                                {item.disabled && <span className="text-xs text-muted-foreground ml-auto" data-testid={`sidebar-masters-soon-${sectionIndex}-${itemIndex}`}>(Soon)</span>}
                              </button>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Operations Section */}
        <SidebarGroup data-testid="sidebar-operations-group">
          <SidebarGroupLabel data-testid="sidebar-operations-label">Operations</SidebarGroupLabel>
          <SidebarGroupContent data-testid="sidebar-operations-group-content">
            <SidebarMenu data-testid="sidebar-operations-menu">
              {navigationData.operations.map((section, sectionIndex) => (
                <Collapsible key={section.title} className="group/collapsible" data-testid={`sidebar-operations-collapsible-${sectionIndex}`}>
                  <SidebarMenuItem data-testid={`sidebar-operations-section-${sectionIndex}`}>
                    <CollapsibleTrigger asChild data-testid={`sidebar-operations-trigger-${sectionIndex}`}>
                      <SidebarMenuButton className="w-full" data-testid={`sidebar-operations-section-button-${sectionIndex}`}>
                        <section.icon className="h-4 w-4" data-testid={`sidebar-operations-section-icon-${sectionIndex}`} />
                        <span data-testid={`sidebar-operations-section-text-${sectionIndex}`}>{section.title}</span>
                        <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" data-testid={`sidebar-operations-chevron-${sectionIndex}`} />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent data-testid={`sidebar-operations-content-${sectionIndex}`}>
                      <SidebarMenuSub data-testid={`sidebar-operations-submenu-${sectionIndex}`}>
                        {section.items.map((item, itemIndex) => (
                          <SidebarMenuSubItem key={item.title} data-testid={`sidebar-operations-subitem-${sectionIndex}-${itemIndex}`}>
                            <SidebarMenuSubButton
                              asChild
                              className={item.disabled ? "opacity-50 cursor-not-allowed" : ""}
                              data-testid={`sidebar-operations-subbutton-${sectionIndex}-${itemIndex}`}
                            >
                              <button
                                className="flex items-center gap-2 w-full text-left"
                                onClick={() => handleNavigation(item.url, item.disabled)}
                                disabled={item.disabled}
                                data-testid={`sidebar-operations-nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                              >
                                {item.icon && <item.icon className="h-3 w-3" data-testid={`sidebar-operations-subicon-${sectionIndex}-${itemIndex}`} />}
                                <span data-testid={`sidebar-operations-subtext-${sectionIndex}-${itemIndex}`}>{item.title}</span>
                                {item.disabled && <span className="text-xs text-muted-foreground ml-auto" data-testid={`sidebar-operations-soon-${sectionIndex}-${itemIndex}`}>(Soon)</span>}
                              </button>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t px-4 py-3" data-testid="sidebar-footer">
        <div className="text-xs text-muted-foreground mb-2 px-2" data-testid="sidebar-keyboard-hint">
          Press <kbd className="px-1 py-0.5 text-xs bg-muted rounded" data-testid="sidebar-kbd-ctrl">Ctrl</kbd> +{" "}
          <kbd className="px-1 py-0.5 text-xs bg-muted rounded" data-testid="sidebar-kbd-space">Space</kbd> to toggle
        </div>
        <SidebarMenu data-testid="sidebar-footer-menu">
          <SidebarMenuItem data-testid="sidebar-footer-item">
            <SidebarMenuButton asChild data-testid="sidebar-footer-button">
              <button
                className="flex items-center gap-3 w-full text-left opacity-50 cursor-not-allowed"
                onClick={() => handleNavigation("/settings", true)}
                disabled={true}
                data-testid="sidebar-settings-nav"
              >
                <Settings className="h-4 w-4" data-testid="sidebar-settings-icon" />
                <span data-testid="sidebar-settings-text">Settings</span>
                <span className="text-xs text-muted-foreground ml-auto" data-testid="sidebar-settings-soon">(Soon)</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail data-testid="sidebar-rail" />
    </Sidebar>
  )
}