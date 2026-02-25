import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { SEOHead } from "@/components/SEOHead";
import { CheckCircle2, XCircle, Eye, EyeOff, Check, X } from "lucide-react";
import logoHorizontal from "@/assets/rideline-logo-horizontal.png";

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[a-z]/, "Must contain a lowercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const requirements = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "Uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "Number", test: (p: string) => /[0-9]/.test(p) },
];

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [expired, setExpired] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check for recovery session
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        // User arrived via recovery link — form is ready
      }
    });

    // Check if we have a valid session from the recovery link
    const checkSession = async () => {
      const hash = window.location.hash;
      if (hash.includes("error=")) {
        setExpired(true);
      }
    };
    checkSession();

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = passwordSchema.safeParse({ password, confirmPassword });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      if (error.message.includes("expired") || error.message.includes("invalid")) {
        setExpired(true);
      } else {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
      setLoading(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => navigate("/login", { replace: true }), 3000);
  };

  if (expired) {
    return (
      <>
        <SEOHead title="Link Expired | RideLine" description="Password reset link has expired." path="/reset-password" />
        <div className="flex min-h-screen items-center justify-center bg-[#151D33] px-4"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)", backgroundSize: "40px 40px" }}
        >
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1A2340] p-8 shadow-2xl text-center">
            <div className="mb-8 flex justify-center">
              <img src={logoHorizontal} alt="RideLine" className="h-12" />
            </div>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/20">
              <XCircle className="h-7 w-7 text-red-400" />
            </div>
            <h1 className="mb-2 font-['Playfair_Display'] text-2xl font-bold text-white">Link Expired</h1>
            <p className="mb-6 text-sm text-white/50">This password reset link has expired or is invalid.</p>
            <Link to="/forgot-password" className="inline-block w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90">
              Request a New Link
            </Link>
            <Link to="/login" className="mt-4 inline-block text-sm text-white/40 hover:text-white/60">
              Back to Sign In
            </Link>
          </div>
        </div>
      </>
    );
  }

  if (success) {
    return (
      <>
        <SEOHead title="Password Updated | RideLine" description="Your password has been reset." path="/reset-password" />
        <div className="flex min-h-screen items-center justify-center bg-[#151D33] px-4"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)", backgroundSize: "40px 40px" }}
        >
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1A2340] p-8 shadow-2xl text-center">
            <div className="mb-8 flex justify-center">
              <img src={logoHorizontal} alt="RideLine" className="h-12" />
            </div>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/20">
              <CheckCircle2 className="h-7 w-7 text-primary" />
            </div>
            <h1 className="mb-2 font-['Playfair_Display'] text-2xl font-bold text-white">Password Updated</h1>
            <p className="text-sm text-white/50">Redirecting to sign in...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead title="Reset Password | RideLine" description="Set a new password for your RideLine account." path="/reset-password" />
      <div className="flex min-h-screen items-center justify-center bg-[#151D33] px-4"
        style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)", backgroundSize: "40px 40px" }}
      >
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1A2340] p-8 shadow-2xl">
          <div className="mb-8 flex justify-center">
            <img src={logoHorizontal} alt="RideLine" className="h-12" />
          </div>

          <h1 className="mb-2 text-center font-['Playfair_Display'] text-2xl font-bold text-white">
            Set New Password
          </h1>
          <p className="mb-6 text-center text-sm text-white/50">
            Choose a strong password for your account.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="password" className="text-white/70">New Password</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="border-white/10 bg-white/5 pr-10 text-white placeholder:text-white/30 focus-visible:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-white/70">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="mt-1 border-white/10 bg-white/5 text-white placeholder:text-white/30 focus-visible:ring-primary"
              />
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-400">{errors.confirmPassword}</p>}
            </div>

            {/* Password requirements */}
            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
              <p className="mb-2 text-xs font-medium text-white/40">Password Requirements</p>
              <div className="space-y-1">
                {requirements.map((req) => {
                  const met = req.test(password);
                  return (
                    <div key={req.label} className="flex items-center gap-2 text-xs">
                      {met ? (
                        <Check className="h-3 w-3 text-green-400" />
                      ) : (
                        <X className="h-3 w-3 text-white/20" />
                      )}
                      <span className={met ? "text-green-400" : "text-white/30"}>
                        {req.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
