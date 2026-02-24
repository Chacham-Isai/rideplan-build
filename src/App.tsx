import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/app/ProtectedRoute";
import { AppLayout } from "@/components/app/AppLayout";
import { RoleGate } from "@/components/app/RoleGate";

// Public pages (existing — untouched)
import Index from "./pages/Index";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Demo from "./pages/Demo";
import Resources from "./pages/Resources";
import About from "./pages/About";
import Press from "./pages/Press";
import Careers from "./pages/Careers";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import SafetyReport from "./pages/SafetyReport";
import DriverPortal from "./pages/DriverPortal";
import TipDriver from "./pages/TipDriver";
import Register from "./pages/Register";
import Reapply from "./pages/Reapply";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./components/admin/AdminLayout";
import SafetyReportsAdmin from "./pages/admin/SafetyReportsAdmin";
import DriverReportsAdmin from "./pages/admin/DriverReportsAdmin";
import TipsAdmin from "./pages/admin/TipsAdmin";
import AlertsAdmin from "./pages/admin/AlertsAdmin";
import AnalyticsAdmin from "./pages/admin/AnalyticsAdmin";
import ResidencyAdmin from "./pages/admin/ResidencyAdmin";
import ContractsAdmin from "./pages/admin/ContractsAdmin";
import InvoicesAdmin from "./pages/admin/InvoicesAdmin";
import BidsAdmin from "./pages/admin/BidsAdmin";
import RoutesAdmin from "./pages/admin/RoutesAdmin";
import ComplianceAdmin from "./pages/admin/ComplianceAdmin";
import NotFound from "./pages/NotFound";

// New auth pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// App pages (behind auth)
import Dashboard from "./pages/app/Dashboard";
import Students from "./pages/app/Students";
import AppRoutes from "./pages/app/AppRoutes";
import Contracts from "./pages/app/Contracts";
import Compliance from "./pages/app/Compliance";
import Reports from "./pages/app/Reports";
import AppSettings from "./pages/app/Settings";
import ParentDashboard from "./pages/app/parent/ParentDashboard";
import ParentRegister from "./pages/app/parent/ParentRegister";
import ParentReapply from "./pages/app/parent/ParentReapply";
import ParentTracking from "./pages/app/parent/ParentTracking";
import UsersAdmin from "./pages/app/admin/UsersAdmin";
import AppResidencyAdmin from "./pages/app/admin/AppResidencyAdmin";
import AppInvoicesAdmin from "./pages/app/admin/AppInvoicesAdmin";
import AppBidsAdmin from "./pages/app/admin/AppBidsAdmin";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* ===== PUBLIC ROUTES (unchanged) ===== */}
              <Route path="/" element={<Index />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/demo" element={<Demo />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/about" element={<About />} />
              <Route path="/press" element={<Press />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/report" element={<SafetyReport />} />
              <Route path="/driver-portal" element={<DriverPortal />} />
              <Route path="/tip-driver" element={<TipDriver />} />
              <Route path="/register" element={<Register />} />
              <Route path="/reapply" element={<Reapply />} />
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* Existing admin routes (unchanged) */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<SafetyReportsAdmin />} />
                <Route path="driver-reports" element={<DriverReportsAdmin />} />
                <Route path="residency" element={<ResidencyAdmin />} />
                <Route path="tips" element={<TipsAdmin />} />
                <Route path="alerts" element={<AlertsAdmin />} />
                <Route path="analytics" element={<AnalyticsAdmin />} />
                <Route path="contracts" element={<ContractsAdmin />} />
                <Route path="invoices" element={<InvoicesAdmin />} />
                <Route path="bids" element={<BidsAdmin />} />
                <Route path="routes" element={<RoutesAdmin />} />
                <Route path="compliance" element={<ComplianceAdmin />} />
              </Route>

              {/* ===== NEW AUTH ROUTES ===== */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* ===== PROTECTED APP ROUTES ===== */}
              <Route path="/app" element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route index element={<Navigate to="/app/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="students" element={<Students />} />
                  <Route path="routes" element={<AppRoutes />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="contracts" element={<RoleGate requires="district_admin"><Contracts /></RoleGate>} />
                  <Route path="compliance" element={<RoleGate requires="district_admin"><Compliance /></RoleGate>} />
                  <Route path="settings" element={<RoleGate requires="district_admin"><AppSettings /></RoleGate>} />

                  {/* Parent portal */}
                  <Route path="parent" element={<ParentDashboard />} />
                  <Route path="parent/register" element={<ParentRegister />} />
                  <Route path="parent/reapply" element={<ParentReapply />} />
                  <Route path="parent/tracking" element={<ParentTracking />} />

                  {/* Admin */}
                  <Route path="admin/users" element={<RoleGate requires="district_admin"><UsersAdmin /></RoleGate>} />
                  <Route path="admin/residency" element={<RoleGate requires="district_admin"><AppResidencyAdmin /></RoleGate>} />
                  <Route path="admin/invoices" element={<RoleGate requires="district_admin"><AppInvoicesAdmin /></RoleGate>} />
                  <Route path="admin/bids" element={<RoleGate requires="district_admin"><AppBidsAdmin /></RoleGate>} />
                </Route>
              </Route>

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
