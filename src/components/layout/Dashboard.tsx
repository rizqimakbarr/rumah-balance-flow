import { SidebarProvider, Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarTrigger, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { Home, Inbox, Users, Calendar, Settings, Download, Moon, Sun, Plus } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface DashboardProps {
  children: React.ReactNode;
}

const menuItems = [
  { label: "Dashboard", icon: Home, path: "/" },
  { label: "Transactions", icon: Inbox, path: "/transactions" },
  { label: "Budget", icon: Calendar, path: "/budget" },
  { label: "Savings", icon: Circle, path: "/savings" },
  { label: "Family", icon: Users, path: "/family" },
  { label: "Export", icon: Download, path: "/export" },
];

export default function Dashboard({ children }: DashboardProps) {
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/auth");
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <SidebarHeader className="p-4">
            <h1 className="text-xl font-semibold font-sans bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">rumahtangga.io</h1>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      className={`flex items-center gap-3 ${location.pathname === item.path ? "bg-accent text-accent-foreground" : ""}`}
                      onClick={() => navigate(item.path)}
                    >
                      <item.icon size={18} className={location.pathname === item.path ? "text-primary" : ""} />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  className="flex items-center gap-3"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                  <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  className={`flex items-center gap-3 ${location.pathname === "/settings" ? "bg-accent text-accent-foreground" : ""}`}
                  onClick={() => navigate("/settings")}
                >
                  <Settings size={18} className={location.pathname === "/settings" ? "text-primary" : ""} />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  className={`flex items-center gap-3`}
                  onClick={handleLogout}
                >
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 overflow-auto max-h-screen">
          <header className="p-4 flex items-center justify-between border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <h2 className="text-xl font-medium capitalize">{menuItems.find(i => i.path === location.pathname)?.label || "Dashboard"}</h2>
            </div>
            <div className="flex items-center gap-2">
              {location.pathname === "/" || location.pathname === "/transactions" ? (
                <Button size="sm" className="gap-1 bg-primary hover:bg-primary/90" onClick={() => document.dispatchEvent(new CustomEvent("open-transaction-modal"))}>
                  <Plus size={16} />
                  <span className="hidden sm:inline">Add Transaction</span>
                </Button>
              ) : null}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-600 text-white flex items-center justify-center font-bold font-sans">
                <span className="text-sm">AT</span>
              </div>
            </div>
          </header>
          <main className="p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
