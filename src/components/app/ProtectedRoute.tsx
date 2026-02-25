import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { DistrictProvider } from "@/contexts/DistrictContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const ProtectedRoute = () => {
  const { session, user, loading } = useAuth();
  const location = useLocation();
  const [profileCheck, setProfileCheck] = useState<"loading" | "complete" | "incomplete">("loading");

  useEffect(() => {
    if (!user) {
      setProfileCheck("loading");
      return;
    }

    // Skip check if already on onboarding page
    if (location.pathname === "/app/onboarding") {
      setProfileCheck("complete");
      return;
    }

    const check = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, district_id")
        .eq("id", user.id)
        .single();

      if (data?.full_name && data?.district_id) {
        setProfileCheck("complete");
      } else {
        setProfileCheck("incomplete");
      }
    };

    check();
  }, [user, location.pathname]);

  if (loading || (session && profileCheck === "loading")) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F7F8FA]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (profileCheck === "incomplete") {
    return <Navigate to="/app/onboarding" replace />;
  }

  return (
    <DistrictProvider>
      <Outlet />
    </DistrictProvider>
  );
};
