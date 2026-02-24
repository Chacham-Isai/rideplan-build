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
});

export const useDistrict = () => useContext(DistrictContext);

const STAFF_ROLES = ["staff", "transport_director", "district_admin", "super_admin"];

export const DistrictProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [district, setDistrict] = useState<District | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setDistrict(null);
      setProfile(null);
      setRole(null);
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

        if (roleData) {
          setRole(roleData.role);
        }

        // Fetch district
        const { data: districtData } = await supabase
          .from("districts")
          .select("id, name, state, subscription_tier, subscription_status")
          .eq("id", profileData.district_id)
          .single();

        if (districtData) {
          setDistrict(districtData as District);
        }
      } catch (err) {
        console.error("Error fetching district context:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const isSuperAdmin = role === "super_admin";
  const isAdmin = role === "district_admin" || isSuperAdmin;
  const isTransportDirector = role === "transport_director" || isAdmin;
  const isStaff = STAFF_ROLES.includes(role ?? "");
  const isParent = role === "parent";

  return (
    <DistrictContext.Provider
      value={{ district, profile, role, loading, isAdmin, isStaff, isParent, isSuperAdmin, isTransportDirector }}
    >
      {children}
    </DistrictContext.Provider>
  );
};
