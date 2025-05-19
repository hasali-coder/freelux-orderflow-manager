
import { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  BarChart2,
  Calendar,
  Circle,
  DollarSign,
  Plus,
  User,
  Users
} from "lucide-react";

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { title: "Dashboard", icon: BarChart2, path: "/" },
    { title: "Clients", icon: Users, path: "/clients" },
    { title: "Orders", icon: Calendar, path: "/orders" },
    { title: "Expenses", icon: DollarSign, path: "/expenses" }
  ];

  return (
    <div className="min-h-screen flex w-full">
      <Sidebar 
        defaultCollapsed={false} 
        collapsible
      >
        <SidebarContent>
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-4 py-6`}>
            <Link to="/" className="flex items-center gap-2">
              <Circle className="h-6 w-6 fill-primary stroke-primary-foreground" />
              {!collapsed && (
                <span className="text-xl font-heading font-bold">FreelancePro</span>
              )}
            </Link>
          </div>
          
          <SidebarGroup>
            <SidebarGroupLabel className={collapsed ? 'sr-only' : ''}>
              Navigation
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link to={item.path} className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" />
                        <span className={collapsed ? 'sr-only' : ''}>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      
      <div className="flex flex-col flex-1">
        <header className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <SidebarTrigger />
            <h1 className="text-xl font-heading font-semibold">FreelancePro</h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </header>
        
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
