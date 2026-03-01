// App root
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DemoModeProvider } from "@/contexts/DemoModeContext";
import { DistrictProvider } from "@/contexts/DistrictContext";
import ProtectedRoute from "@/components/app/ProtectedRoute";
import AppLayout from "@/components/app/AppLayout";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import DemoLogin from "@/pages/DemoLogin";
import Register from "@/pages/Register";
import NotFound from "@/pages/NotFound";

// App pages
import Dashboard from "@/pages/app/Dashboard";
import Routes_ from "@/pages/app/Routes";
import Students from "@/pages/app/Students";
import Drivers from "@/pages/app/Drivers";
import Requests from "@/pages/app/Requests";
import BusPasses from "@/pages/app/BusPasses";
import Settings from "@/pages/app/Settings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <DemoModeProvider>
          <DistrictProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* Public */}
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/demo" element={<DemoLogin />} />
                  <Route path="/register" element={<Register />} />

                  {/* Protected app shell */}
                  <Route element={<ProtectedRoute />}>
                    <Route element={<AppLayout />}>
                      <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
                      <Route path="/app/dashboard" element={<Dashboard />} />
                      <Route path="/app/routes" element={<Routes_ />} />
                      <Route path="/app/students" element={<Students />} />
                      <Route path="/app/drivers" element={<Drivers />} />
                      <Route path="/app/requests" element={<Requests />} />
                      <Route path="/app/bus-passes" element={<BusPasses />} />
                      <Route path="/app/settings" element={<Settings />} />
                    </Route>
                  </Route>

                  {/* Fallback */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </DistrictProvider>
        </DemoModeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
