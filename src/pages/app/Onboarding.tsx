import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SEOHead } from "@/components/SEOHead";
import { useToast } from "@/hooks/use-toast";
import { LogOut, UserCircle } from "lucide-react";
import logoHorizontal from "@/assets/rideline-logo-horizontal.png";

const Onboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [districtName, setDistrictName] = useState<string | null>(null);
  const [roleName, setRoleName] = useState<string | null>(null);
  const [districtId, setDistrictId] = useState<string | null>(null);
  const [noDistrict, setNoDistrict] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Pre-fill name from auth metadata
    const meta = user.user_metadata;
    if (meta?.full_name) setFullName(meta.full_name);
    else if (meta?.name) setFullName(meta.name);

    // Check for existing profile + district association
    const check = async () => {
      // Check if profile already complete
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, district_id")
        .eq("id", user.id)
        .single();

      if (profile?.full_name && profile?.district_id) {
        // Profile already complete, redirect
        navigate("/app/dashboard", { replace: true });
        return;
      }

      // Check for district role assignment
      const { data: roleData } = await supabase
        .from("district_user_roles")
        .select("role, district_id")
        .eq("user_id", user.id)
        .single();

      if (roleData) {
        setDistrictId(roleData.district_id);
        setRoleName(roleData.role.replace(/_/g, " "));

        const { data: district } = await supabase
          .from("districts")
          .select("name")
          .eq("id", roleData.district_id)
          .single();

        if (district) setDistrictName(district.name);
      } else {
        setNoDistrict(true);
      }

      setChecking(false);
    };

    check();
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !districtId || !fullName.trim()) return;

    setLoading(true);
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: fullName.trim(),
      district_id: districtId,
      email: user.email ?? "",
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    toast({ title: "Welcome!", description: "Your profile has been set up." });
    navigate("/app/dashboard", { replace: true });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/", { replace: true });
  };

  if (checking) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#151D33]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <SEOHead title="Get Started | RideLine" description="Complete your RideLine profile." path="/app/onboarding" />
      <div
        className="flex min-h-screen items-center justify-center bg-[#151D33] px-4"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      >
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1A2340] p-8 shadow-2xl">
          <div className="mb-8 flex justify-center">
            <img src={logoHorizontal} alt="RideLine" className="h-12" />
          </div>

          {noDistrict ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/20">
                <UserCircle className="h-7 w-7 text-amber-400" />
              </div>
              <h1 className="mb-2 font-['Playfair_Display'] text-2xl font-bold text-white">
                Almost There
              </h1>
              <p className="mb-6 text-sm text-white/50">
                Your account hasn't been linked to a district yet. Please contact your
                district administrator or reach out to our support team to get connected.
              </p>
              <p className="mb-6 text-xs text-white/30">
                Signed in as {user?.email}
              </p>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-6 py-3 text-sm font-medium text-white/60 transition-all hover:bg-white/5 hover:text-white"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/20">
                <UserCircle className="h-7 w-7 text-primary" />
              </div>
              <h1 className="mb-2 text-center font-['Playfair_Display'] text-2xl font-bold text-white">
                Welcome to RideLine
              </h1>
              <p className="mb-6 text-center text-sm text-white/50">
                Let's set up your profile to get started.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="fullName" className="text-white/70">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="Your full name"
                    className="mt-1 border-white/10 bg-white/5 text-white placeholder:text-white/30 focus-visible:ring-primary"
                  />
                </div>

                {districtName && (
                  <div>
                    <Label className="text-white/70">District</Label>
                    <div className="mt-1 rounded-md border border-white/5 bg-white/[0.02] px-3 py-2.5 text-sm text-white/60">
                      {districtName}
                    </div>
                  </div>
                )}

                {roleName && (
                  <div>
                    <Label className="text-white/70">Role</Label>
                    <div className="mt-1 rounded-md border border-white/5 bg-white/[0.02] px-3 py-2.5 text-sm capitalize text-white/60">
                      {roleName}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !fullName.trim()}
                  className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg disabled:opacity-50"
                >
                  {loading ? "Setting up..." : "Get Started"}
                </button>
              </form>

              <div className="mt-4 text-center">
                <button
                  onClick={handleSignOut}
                  className="text-xs text-white/30 hover:text-white/50"
                >
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Onboarding;
