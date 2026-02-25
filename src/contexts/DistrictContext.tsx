import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

interface District {
  id: string;
  name: string;
  state: string;
  subscription_tier: string;
  subscription_status: string;
}

interface Profile {
  id: string;
  district_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  title: string | null;
  is_active: boolean;
}

interface DistrictContextType {
  district: District | null;
  profile: Profile | null;
  role: string | null;
  loading: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  isParent: boolean;
  isSuperAdmin: boolean;
  isTransportDirector: boolean;
  demoActive: boolean;
  demoDistrict: District | null;
  demoRole: string | null;
  startDemo: (districtId: string, role: string) => Promise<void>;
  endDemo: () => Promise<void>;
}

const DistrictContext = createContext<DistrictContextType>({
  district: null,
  profile: null,
  role: null,
  loading: true,
  isAdmin: false,
  isStaff: false,
  isParent: false,
  isSuperAdmin: false,
  isTransportDirector: false,
  demoActive: false,
  demoDistrict: null,
  demoRole: null,
  startDemo: async () => {},
  endDemo: async () => {},
});

export const useDistrict = () => useContext(DistrictContext);

const STAFF_ROLES = ["staff", "transport_director", "district_admin", "super_admin"];

export const DistrictProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [district, setDistrict] = useState<District | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Demo state
  const [demoActive, setDemoActive] = useState(false);
  const [demoDistrict, setDemoDistrict] = useState<District | null>(null);
  const [demoRole, setDemoRole] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setDistrict(null);
      setProfile(null);
      setRole(null);
      setDemoActive(false);
      setDemoDistrict(null);
      setDemoRole(null);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (!profileData) {
          setLoading(false);
          return;
        }

        setProfile(profileData as Profile);

        // Fetch role from district_user_roles
        const { data: roleData } = await supabase
          .from("district_user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("district_id", profileData.district_id)
          .single();

        const realRole = roleData?.role ?? null;
        setRole(realRole);

        // Fetch district
        const { data: districtData } = await supabase
          .from("districts")
          .select("id, name, state, subscription_tier, subscription_status")
          .eq("id", profileData.district_id)
          .single();

        if (districtData) {
          setDistrict(districtData as District);
        }

        // Check for active demo session
        const { data: demoData } = await supabase
          .from("demo_sessions")
          .select("impersonating_district_id, impersonating_role")
          .eq("original_user_id", user.id)
          .eq("is_active", true)
          .limit(1)
          .maybeSingle();

        if (demoData) {
          const { data: demoDistData } = await supabase
            .from("districts")
            .select("id, name, state, subscription_tier, subscription_status")
            .eq("id", demoData.impersonating_district_id)
            .single();

          if (demoDistData) {
            setDemoActive(true);
            setDemoDistrict(demoDistData as District);
            setDemoRole(demoData.impersonating_role);
          }
        } else {
          setDemoActive(false);
          setDemoDistrict(null);
          setDemoRole(null);
        }
      } catch (err) {
        console.error("Error fetching district context:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const startDemo = async (districtId: string, impRole: string) => {
    if (!user) return;
    // Deactivate existing sessions
    await supabase
      .from("demo_sessions")
      .update({ is_active: false })
      .eq("original_user_id", user.id)
      .eq("is_active", true);

    // Create new session
    await supabase.from("demo_sessions").insert({
      original_user_id: user.id,
      impersonating_district_id: districtId,
      impersonating_role: impRole,
      is_active: true,
    });

    // Fetch the demo district
    const { data: demoDistData } = await supabase
      .from("districts")
      .select("id, name, state, subscription_tier, subscription_status")
      .eq("id", districtId)
      .single();

    if (demoDistData) {
      setDemoActive(true);
      setDemoDistrict(demoDistData as District);
      setDemoRole(impRole);
    }
  };

  const endDemo = async () => {
    if (!user) return;
    await supabase
      .from("demo_sessions")
      .update({ is_active: false })
      .eq("original_user_id", user.id)
      .eq("is_active", true);

    setDemoActive(false);
    setDemoDistrict(null);
    setDemoRole(null);
  };

  // Effective values: use demo overrides when active
  const effectiveDistrict = demoActive ? demoDistrict : district;
  const effectiveRole = demoActive ? demoRole : role;

  const isSuperAdmin = role === "super_admin"; // Real role, not demo
  const isAdmin = effectiveRole === "district_admin" || effectiveRole === "super_admin";
  const isTransportDirector = effectiveRole === "transport_director" || isAdmin;
  const isStaff = STAFF_ROLES.includes(effectiveRole ?? "");
  const isParent = effectiveRole === "parent";

  return (
    <DistrictContext.Provider
      value={{
        district: effectiveDistrict,
        profile,
        role: effectiveRole,
        loading,
        isAdmin,
        isStaff,
        isParent,
        isSuperAdmin,
        isTransportDirector,
        demoActive,
        demoDistrict,
        demoRole,
        startDemo,
        endDemo,
      }}
    >
      {children}
    </DistrictContext.Provider>
  );
};
