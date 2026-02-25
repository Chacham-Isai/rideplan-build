import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDistrict } from "@/contexts/DistrictContext";
import { supabase } from "@/integrations/supabase/client";
import { AppBreadcrumb } from "./AppBreadcrumb";
import { NotificationBell } from "./NotificationBell";
import { DemoSwitcher, DemoBanner } from "./DemoSwitcher";
import { CommandPalette } from "./CommandPalette";
import { ErrorBoundary } from "./ErrorBoundary";
import {
  LayoutDashboard, Users, MapPin, FileText, Shield, BarChart3,
  Settings, Bus, UserPlus, Navigation, LogOut, Menu, X, ChevronLeft,
  User, RefreshCw, ClipboardCheck, MessageSquare, Phone, Upload,
} from "lucide-react";
import logoIcon from "@/assets/rideline-logo-icon.png";
import logoHorizontal from "@/assets/rideline-logo-horizontal.png";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  minRole?: string;
  parentOnly?: boolean;
  badgeKey?: string;
}

const staffNav: NavItem[] = [
  { label: "Dashboard", href: "/app/dashboard", icon: LayoutDashboard },
  { label: "Students", href: "/app/students", icon: Users, minRole: "staff" },
  { label: "Routes", href: "/app/routes", icon: MapPin, minRole: "staff" },
  { label: "Requests", href: "/app/requests", icon: MessageSquare, minRole: "staff", badgeKey: "openRequests" },
  { label: "Communications", href: "/app/communications", icon: Phone, minRole: "staff" },
  { label: "Reports", href: "/app/reports", icon: BarChart3, minRole: "staff" },
  { label: "Registrations", href: "/app/admin/residency", icon: ClipboardCheck, minRole: "staff", badgeKey: "pendingRegistrations" },
  { label: "Contracts", href: "/app/contracts", icon: FileText, minRole: "district_admin", badgeKey: "expiringContracts" },
  { label: "Compliance", href: "/app/compliance", icon: Shield, minRole: "district_admin" },
  { label: "Import Data", href: "/app/admin/import", icon: Upload, minRole: "district_admin" },
  { label: "Settings", href: "/app/settings", icon: Settings, minRole: "district_admin" },
];

const parentNav: NavItem[] = [
  { label: "Dashboard", href: "/app/parent", icon: LayoutDashboard, parentOnly: true },
  { label: "My Students", href: "/app/students", icon: Users, parentOnly: true },
  { label: "Register", href: "/app/parent/register", icon: UserPlus, parentOnly: true },
  { label: "Reapply", href: "/app/parent/reapply", icon: RefreshCw, parentOnly: true },
  { label: "Track Bus", href: "/app/parent/tracking", icon: Navigation, parentOnly: true },
];

const ROLE_LEVEL: Record<string, number> = {
  super_admin: 6, district_admin: 5, transport_director: 4,
  staff: 3, parent: 2, viewer: 1,
};

export const AppLayout = () => {
  const { signOut } = useAuth();
  const { district, profile, role, isParent, loading } = useDistrict();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [badges, setBadges] = useState<Record<string, number>>({});

  // Fetch badge counts
  useEffect(() => {
    if (isParent || loading) return;
    const fetchBadges = async () => {
      const [reqRes, regRes, contractsRes] = await Promise.all([
        supabase.from("service_requests").select("id", { count: "exact", head: true }).in("status", ["open", "in_progress"]),
        supabase.from("student_registrations").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("contracts").select("contract_end, status").eq("status", "active"),
      ]);
      const now = new Date();
      const in90 = new Date(now.getTime() + 90 * 86400000);
      const expiring = (contractsRes.data ?? []).filter(c => new Date(c.contract_end) <= in90 && new Date(c.contract_end) > now).length;
      setBadges({
        openRequests: reqRes.count ?? 0,
        pendingRegistrations: regRes.count ?? 0,
        expiringContracts: expiring,
      });
    };
    fetchBadges();
    const interval = setInterval(fetchBadges, 300000); // 5 min
    return () => clearInterval(interval);
  }, [isParent, loading]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F7F8FA]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const navItems = isParent ? parentNav : staffNav;
  const userLevel = ROLE_LEVEL[role ?? "viewer"] ?? 0;

  const filteredNav = navItems.filter((item) => {
    if (item.parentOnly) return isParent;
    if (!item.minRole) return true;
    return userLevel >= (ROLE_LEVEL[item.minRole] ?? 99);
  });

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-white/10 px-4">
        {collapsed ? (
          <img src={logoIcon} alt="RideLine" className="h-8 w-8" />
        ) : (
          <img src={logoHorizontal} alt="RideLine" className="h-10" />
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {filteredNav.map((item) => {
          const active = location.pathname === item.href || location.pathname.startsWith(item.href + "/");
          const badgeCount = item.badgeKey ? (badges[item.badgeKey] ?? 0) : 0;
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                active
                  ? "bg-white/10 text-white border-l-[3px] border-primary"
                  : "text-white/60 hover:bg-white/5 hover:text-white border-l-[3px] border-transparent"
              }`}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span className="flex-1">{item.label}</span>}
              {!collapsed && badgeCount > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground px-1">
                  {badgeCount > 99 ? "99+" : badgeCount}
                </span>
              )}
              {collapsed && badgeCount > 0 && (
                <span className="absolute right-1 top-0 h-2 w-2 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F7F8FA]">
      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-[#151D33] transition-all duration-300 ${
          collapsed ? "w-16" : "w-60"
        }`}
      >
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center border-t border-white/10 py-3 text-white/40 hover:text-white transition-colors"
        >
          <ChevronLeft className={`h-4 w-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
        </button>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-[#151D33] flex flex-col">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <DemoBanner />
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-1.5 rounded-lg hover:bg-muted"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="text-sm font-semibold text-foreground truncate">
              {district?.name ?? "Loading..."}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <DemoSwitcher />
            <NotificationBell />

            <div className="relative group">
              <button className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-muted transition-colors">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  {profile?.full_name?.charAt(0) ?? "U"}
                </div>
              </button>
              <div className="invisible group-hover:visible absolute right-0 top-full mt-1 w-48 rounded-lg border bg-card py-1 shadow-lg z-50">
                <div className="px-3 py-2 border-b">
                  <p className="text-sm font-medium truncate">{profile?.full_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
                </div>
                <Link to="/app/settings" className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted">
                  <User className="h-4 w-4" /> Profile
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-muted"
                >
                  <LogOut className="h-4 w-4" /> Log Out
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <AppBreadcrumb />
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
      <CommandPalette />
    </div>
  );
};
