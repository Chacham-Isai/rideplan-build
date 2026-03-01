import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDemoMode } from "@/contexts/DemoModeContext";
import { useDistrict } from "@/contexts/DistrictContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import DemoSwitcher from "@/components/app/DemoSwitcher";
import {
  Bus,
  LayoutDashboard,
  Map,
  Users,
  UserCheck,
  FileText,
  Ticket,
  Settings,
  LogOut,
  Menu,
  X,
  Phone,
  Handshake,
  ShieldCheck,
  AlertTriangle,
  MapPin,
  Calendar,
} from "lucide-react";

const NAV_SECTIONS = [
  {
    label: "Operations",
    items: [
      { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/app/requests", label: "Requests", icon: FileText },
      { to: "/app/communications", label: "Communications", icon: Phone },
    ],
  },
  {
    label: "Transportation",
    items: [
      { to: "/app/students", label: "Students", icon: Users },
      { to: "/app/routes", label: "Routes", icon: Map },
      { to: "/app/drivers", label: "Drivers", icon: UserCheck },
      { to: "/app/bus-passes", label: "Bus Passes", icon: Ticket },
      { to: "/app/calendar", label: "Calendar", icon: Calendar },
      { to: "/app/field-trips", label: "Field Trips", icon: MapPin },
    ],
  },
  {
    label: "Business",
    items: [
      { to: "/app/contracts", label: "Contracts & Bids", icon: Handshake },
      { to: "/app/compliance", label: "Compliance", icon: ShieldCheck },
    ],
  },
  {
    label: "Safety",
    items: [
      { to: "/app/accidents", label: "Accident Reports", icon: AlertTriangle },
    ],
  },
];

export default function AppLayout() {
  const { user, signOut } = useAuth();
  const { isDemoMode, disableDemoMode } = useDemoMode();
  const { district } = useDistrict();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, []);

  const handleSignOut = async () => {
    if (isDemoMode) {
      disableDemoMode();
      navigate("/demo", { replace: true });
    } else {
      await signOut();
      navigate("/login", { replace: true });
    }
  };

  const districtName = district?.name ?? (isDemoMode ? "Demo District" : "Your District");

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-slate-900 border-r border-slate-800 z-30
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:z-auto
          flex flex-col
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-800">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30">
            <Bus className="h-4 w-4 text-blue-400" />
          </div>
          <span className="text-white font-semibold">RidePlan</span>
          {isDemoMode && (
            <Badge className="ml-auto text-xs bg-amber-500/20 text-amber-300 border-amber-500/30">
              Demo
            </Badge>
          )}
        </div>

        {/* District */}
        <div className="px-4 py-3 border-b border-slate-800">
          <p className="text-slate-500 text-xs uppercase tracking-wide mb-0.5">District</p>
          <p className="text-white text-sm font-medium truncate">{districtName}</p>
        </div>

        {isDemoMode && (
          <div className="px-3 pt-3">
            <DemoSwitcher />
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-4 overflow-y-auto">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive
                          ? "bg-blue-500/15 text-blue-300 font-medium"
                          : "text-slate-400 hover:text-white hover:bg-slate-800"
                      }`
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}

          <div>
            <div className="space-y-0.5">
              <NavLink
                to="/app/settings"
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-blue-500/15 text-blue-300 font-medium"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`
                }
              >
                <Settings className="h-4 w-4 shrink-0" />
                Settings
              </NavLink>
            </div>
          </div>
        </nav>

        <Separator className="bg-slate-800" />

        <div className="px-4 py-3">
          <p className="text-slate-500 text-xs truncate mb-2">
            {isDemoMode ? "Demo Mode" : (user?.email ?? "")}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800 gap-2"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            {isDemoMode ? "Exit Demo" : "Sign out"}
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-slate-900 border-b border-slate-800">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-slate-400 hover:text-white p-1"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="text-white font-medium text-sm">RidePlan</span>
          {isDemoMode && (
            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">
              Demo
            </Badge>
          )}
          <div className="ml-auto flex items-center gap-2">
            {sidebarOpen && (
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-slate-400 hover:text-white p-1"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
