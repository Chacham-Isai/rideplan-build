import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { SEOHead } from "@/components/SEOHead";
import logoHorizontal from "@/assets/rideline-logo-horizontal.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast({ title: "Sign in failed", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    // Fetch role to determine redirect
    const { data: roleData } = await supabase
      .from("district_user_roles")
      .select("role")
      .eq("user_id", data.user.id)
      .single();

    if (roleData?.role === "parent") {
      navigate("/app/parent", { replace: true });
    } else {
      navigate("/app/dashboard", { replace: true });
    }
  };

  return (
    <>
      <SEOHead
        title="Sign In | RideLine"
        description="Sign in to your RideLine district transportation dashboard."
        path="/login"
      />
      <div className="flex min-h-screen items-center justify-center bg-[#151D33] px-4"
        style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)", backgroundSize: "40px 40px" }}
      >
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1A2340] p-8 shadow-2xl">
          <div className="mb-8 flex justify-center">
            <img src={logoHorizontal} alt="RideLine" className="h-12" />
          </div>

          <h1 className="mb-2 text-center font-['Playfair_Display'] text-2xl font-bold text-white">
            Welcome Back
          </h1>
          <p className="mb-6 text-center text-sm text-white/50">
            Sign in to your district dashboard
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-white/70">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@district.edu"
                className="mt-1 border-white/10 bg-white/5 text-white placeholder:text-white/30 focus-visible:ring-primary"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-white/70">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="mt-1 border-white/10 bg-white/5 text-white placeholder:text-white/30 focus-visible:ring-primary"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-white/40">
              Don't have an account?{" "}
              <Link to="/demo" className="text-primary hover:underline">
                Contact us for a demo
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
