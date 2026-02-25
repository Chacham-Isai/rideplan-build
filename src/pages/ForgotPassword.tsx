import { useState } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SEOHead } from "@/components/SEOHead";
import { ArrowLeft, CheckCircle2, Mail } from "lucide-react";
import logoHorizontal from "@/assets/rideline-logo-horizontal.png";

const emailSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address").max(255),
});

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = emailSchema.safeParse({ email });
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setLoading(true);
    try {
      await supabase.auth.resetPasswordForEmail(result.data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      // Always show success to avoid revealing email existence
      setSent(true);
    } catch {
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead
        title="Forgot Password | RideLine"
        description="Reset your RideLine account password."
        path="/forgot-password"
      />
      <div
        className="flex min-h-screen items-center justify-center bg-[#151D33] px-4"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      >
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1A2340] p-8 shadow-2xl">
          <div className="mb-8 flex justify-center">
            <img src={logoHorizontal} alt="RideLine" className="h-12" />
          </div>

          {sent ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/20">
                <CheckCircle2 className="h-7 w-7 text-primary" />
              </div>
              <h1 className="mb-2 font-['Playfair_Display'] text-2xl font-bold text-white">
                Check Your Email
              </h1>
              <p className="mb-6 text-sm text-white/50">
                If an account exists for <span className="text-white/70">{email}</span>,
                you'll receive a password reset link shortly.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/5">
                <Mail className="h-7 w-7 text-white/60" />
              </div>
              <h1 className="mb-2 text-center font-['Playfair_Display'] text-2xl font-bold text-white">
                Forgot Password?
              </h1>
              <p className="mb-6 text-center text-sm text-white/50">
                Enter your email and we'll send you a reset link.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-white/70">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@district.edu"
                    className="mt-1 border-white/10 bg-white/5 text-white placeholder:text-white/30 focus-visible:ring-primary"
                  />
                  {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/60"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
