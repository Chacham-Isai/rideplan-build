import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDemoMode } from "@/contexts/DemoModeContext";

/**
 * Renders child routes when the user is authenticated OR in demo mode.
 * Otherwise redirects to /login.
 */
export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const { isDemoMode } = useDemoMode();
  const location = useLocation();

  // Still checking auth state — render nothing to avoid flash
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  // Allow access if authenticated OR in demo mode
  if (user || isDemoMode) {
    return <Outlet />;
  }

  // Not authenticated — redirect to login, preserving intended destination
  return <Navigate to="/login" state={{ from: location }} replace />;
}
