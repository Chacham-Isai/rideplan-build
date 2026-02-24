import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
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

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
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
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
