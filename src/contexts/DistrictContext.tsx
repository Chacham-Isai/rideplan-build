import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useDemoMode } from "@/contexts/DemoModeContext";
import type { Database } from "@/types/supabase";

type District = Database["public"]["Tables"]["districts"]["Row"];

interface DistrictContextValue {
  district: District | null;
  loading: boolean;
  error: string | null;
}

const DistrictContext = createContext<DistrictContextValue>({
  district: null,
  loading: true,
  error: null,
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
    subscription_tier: "pro",
    contact_email: "admin@lawrenceusd.demo",
    contact_phone: null,
    address: "200 McDonald Ave, Lawrence, NY 11559",
    state: "NY",
    zip: "11559",
    logo_url: null,
  } as unknown as District,
  oceanside: {
    id: "demo-oceanside",
    name: "Oceanside USD",
    slug: "oceanside",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    settings: null,
    subscription_tier: "pro",
    contact_email: "admin@oceansideusd.demo",
    contact_phone: null,
    address: "145 Merle Ave, Oceanside, NY 11572",
    state: "NY",
    zip: "11572",
    logo_url: null,
  } as unknown as District,
};

export function DistrictProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { isDemoMode, demoDistrictId } = useDemoMode();
  const [district, setDistrict] = useState<District | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Demo mode — use synthetic district, no Supabase call
    if (isDemoMode && demoDistrictId) {
      setDistrict(DEMO_DISTRICTS_MAP[demoDistrictId] ?? null);
      setLoading(false);
      setError(null);
      return;
    }

    // Not authenticated and not in demo — nothing to load
    if (!user) {
      setDistrict(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchDistrict() {
      setLoading(true);
      setError(null);
      try {
        // Fetch the district the current user belongs to via the user_districts join
        const { data, error: sbError } = await supabase
          .from("user_districts")
          .select("district:districts(*)")
          .eq("user_id", user!.id)
          .limit(1)
          .single();

        if (sbError) throw sbError;
        if (!cancelled) {
          setDistrict((data?.district as unknown as District) ?? null);
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
  }, [user, isDemoMode, demoDistrictId]);

  return (
    <DistrictContext.Provider value={{ district, loading, error }}>
      {children}
    </DistrictContext.Provider>
  );
}

export function useDistrict(): DistrictContextValue {
  const ctx = useContext(DistrictContext);
  if (!ctx) throw new Error("useDistrict must be used within DistrictProvider");
  return ctx;
}
