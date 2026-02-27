import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useDemoMode } from "@/contexts/DemoModeContext";

interface District {
  id: string;
  name: string;
  slug?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  settings?: any;
  subscription_tier?: string | null;
  subscription_status?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  address?: string | null;
  state?: string;
  zip?: string | null;
  city?: string | null;
  beds_code?: string | null;
  phone?: string | null;
  superintendent_name?: string | null;
  superintendent_email?: string | null;
  student_count?: number | null;
  timezone?: string | null;
  trial_ends_at?: string | null;
  logo_url?: string | null;
}

interface Profile {
  id: string;
  full_name: string;
  email?: string;
  phone?: string | null;
  title?: string | null;
  is_active?: boolean;
  last_login_at?: string | null;
}

interface DistrictContextValue {
  district: District | null;
  loading: boolean;
  error: string | null;
  profile: Profile | null;
  role: string | null;
  isAdmin: boolean;
}

const DistrictContext = createContext<DistrictContextValue>({
  district: null,
  loading: true,
  error: null,
  profile: null,
  role: null,
  isAdmin: false,
});

// Synthetic demo district objects so the rest of the app never sees null
const DEMO_DISTRICTS_MAP: Record<string, District> = {
  lawrence: {
    id: "demo-lawrence",
    name: "Lawrence USD",
    slug: "lawrence",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    settings: null,
    subscription_tier: "enterprise",
    subscription_status: "active",
    contact_email: "admin@lawrenceusd.demo",
    contact_phone: null,
    address: "200 McDonald Ave, Lawrence, NY 11559",
    state: "NY",
    zip: "11559",
    city: "Lawrence",
  },
  oceanside: {
    id: "demo-oceanside",
    name: "Oceanside USD",
    slug: "oceanside",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    settings: null,
    subscription_tier: "professional",
    subscription_status: "active",
    contact_email: "admin@oceansideusd.demo",
    contact_phone: null,
    address: "145 Merle Ave, Oceanside, NY 11572",
    state: "NY",
    zip: "11572",
    city: "Oceanside",
  },
};

const DEMO_PROFILE: Profile = {
  id: "demo-user",
  full_name: "Demo Administrator",
  email: "demo@rideplan.app",
  phone: null,
  title: "Transportation Director",
};

export function DistrictProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { isDemoMode, demoDistrictId, demoRole } = useDemoMode();
  const [district, setDistrict] = useState<District | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    // Demo mode — use synthetic district, no Supabase call
    if (isDemoMode && demoDistrictId) {
      setDistrict(DEMO_DISTRICTS_MAP[demoDistrictId] ?? null);
      setProfile(DEMO_PROFILE);
      setRole(demoRole ?? "district_admin");
      setLoading(false);
      setError(null);
      return;
    }

    // Not authenticated and not in demo — nothing to load
    if (!user) {
      setDistrict(null);
      setProfile(null);
      setRole(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchDistrict() {
      setLoading(true);
      setError(null);
      try {
        // Fetch profile
        const { data: profileData } = await supabase
          .from("profiles" as any)
          .select("*")
          .eq("id", user!.id)
          .single();
        
        if (!cancelled && profileData) {
          setProfile(profileData as any);
        }

        // Fetch district via user_districts join
        const { data, error: sbError } = await supabase
          .from("district_user_roles")
          .select("role, district:districts(*)")
          .eq("user_id", user!.id)
          .limit(1)
          .single();

        if (sbError) throw sbError;
        if (!cancelled) {
          setDistrict((data?.district as unknown as District) ?? null);
          setRole((data?.role as string) ?? "viewer");
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load district");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchDistrict();
    return () => {
      cancelled = true;
    };
  }, [user, isDemoMode, demoDistrictId, demoRole]);

  const isAdmin = role === "district_admin" || role === "super_admin" || role === "transport_director";

  return (
    <DistrictContext.Provider value={{ district, loading, error, profile, role, isAdmin }}>
      {children}
    </DistrictContext.Provider>
  );
}

export function useDistrict(): DistrictContextValue {
  const ctx = useContext(DistrictContext);
  if (!ctx) throw new Error("useDistrict must be used within DistrictProvider");
  return ctx;
}
