import { useEffect, useState } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  SidebarProvider,
  SidebarTrigger,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import { ShieldAlert, Truck, Heart, Bell, BarChart3, LogOut, ClipboardCheck, FileText, Receipt, Gavel, Route } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { title: "Safety Reports", url: "/admin", icon: ShieldAlert },
  { title: "Driver Reports", url: "/admin/driver-reports", icon: Truck },
  { title: "Residency Audit", url: "/admin/residency", icon: ClipboardCheck },
  { title: "Contracts", url: "/admin/contracts", icon: FileText },
  { title: "Invoices", url: "/admin/invoices", icon: Receipt },
  { title: "Bids", url: "/admin/bids", icon: Gavel },
  { title: "Routes", url: "/admin/routes", icon: Route },
  { title: "Driver Tips", url: "/admin/tips", icon: Heart },
  { title: "Alerts", url: "/admin/alerts", icon: Bell },
  { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
];

const AdminLayout = () => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/admin/login"); return; }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin");

      if (!roles || roles.length === 0) {
        await supabase.auth.signOut();
        navigate("/admin/login");
        return;
      }
      setAuthorized(true);
      setLoading(false);
    };
    check();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate("/admin/login");
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  if (loading || !authorized) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar className="border-r border-sidebar-border">
          <SidebarContent>
            <div className="p-4 border-b border-sidebar-border">
              <h2 className="font-display text-lg font-bold text-sidebar-foreground">RideLine Admin</h2>
            </div>
            <SidebarGroup>
              <SidebarGroupLabel>Reports</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          end={item.url === "/admin"}
                          className="flex items-center gap-2 px-3 py-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent"
                          activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <div className="mt-auto p-4">
              <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </Button>
            </div>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 overflow-auto">
          <header className="h-14 flex items-center border-b border-border px-4">
            <SidebarTrigger className="mr-4" />
            <h1 className="font-display text-lg font-semibold text-foreground">
              {navItems.find(i => location.pathname === i.url || (i.url !== "/admin" && location.pathname.startsWith(i.url)))?.title || "Dashboard"}
            </h1>
          </header>
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
