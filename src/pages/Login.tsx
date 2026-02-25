import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/contexts/AuthContext";
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
  const { session, loading: authLoading } = useAuth();

  // Redirect authenticated users to the app
  useEffect(() => {
    if (session && !authLoading) {
      const redirectUser = async () => {
        const { data: roleData } = await supabase
          .from("district_user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .single();

        if (roleData?.role === "parent") {
          navigate("/app/parent", { replace: true });
        } else {
          navigate("/app/dashboard", { replace: true });
        }
      };
      redirectUser();
    }
  }, [session, authLoading, navigate]);

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

          {/* Social login buttons */}
          <div className="space-y-3 mb-6">
            <button
              type="button"
              onClick={async () => {
                const { error } = await lovable.auth.signInWithOAuth("google", {
                  redirect_uri: window.location.origin + "/login",
                });
                if (error) toast({ title: "Google sign in failed", description: String(error), variant: "destructive" });
              }}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-white/10 bg-white/5 py-3 text-sm font-medium text-white transition-all hover:bg-white/10"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continue with Google
            </button>
            <button
              type="button"
              onClick={async () => {
                const { error } = await lovable.auth.signInWithOAuth("apple", {
                  redirect_uri: window.location.origin + "/login",
                });
                if (error) toast({ title: "Apple sign in failed", description: String(error), variant: "destructive" });
              }}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-white/10 bg-white/5 py-3 text-sm font-medium text-white transition-all hover:bg-white/10"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.32 2.32-1.55 4.3-3.74 4.25z"/></svg>
              Continue with Apple
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-[#1A2340] px-3 text-white/40">or sign in with email</span></div>
          </div>

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

          <div className="mt-4 text-center">
            <Link to="/forgot-password" className="text-sm text-white/40 hover:text-primary transition-colors">
              Forgot your password?
            </Link>
          </div>

          <div className="mt-3 text-center text-sm">
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
