import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import { Navigation } from "@/components/sections/Navigation";
import { ContactFormModal } from "@/components/ContactFormModal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle, Loader2, LogIn } from "lucide-react";

const Reapply = () => {
  const navigate = useNavigate();
  const [contactOpen, setContactOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [sameAddress, setSameAddress] = useState(true);
  const [signatureText, setSignatureText] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Auth for login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("student_registrations")
      .select("*")
      .eq("parent_user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setRegistrations(data || []));
  }, [user]);

  const handleLogin = async () => {
    setLoggingIn(true);
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
    if (error) toast.error(error.message);
    setLoggingIn(false);
  };

  const handleReapply = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      const now = new Date();
      const year = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
      const schoolYear = `${year}-${year + 1}`;

      for (const reg of registrations) {
        const nextGrade = reg.grade === "12" ? "12" : reg.grade === "K" ? "1" : String(Number(reg.grade) + 1);

        const { data: newReg, error } = await supabase
          .from("student_registrations")
          .insert({
            parent_user_id: user.id,
            student_name: reg.student_name,
            dob: reg.dob,
            grade: nextGrade,
            school: reg.school,
            address_line: reg.address_line,
            city: reg.city,
            state: reg.state,
            zip: reg.zip,
            iep_flag: reg.iep_flag,
            section_504_flag: reg.section_504_flag,
            mckinney_vento_flag: reg.mckinney_vento_flag,
            foster_care_flag: reg.foster_care_flag,
            school_year: schoolYear,
          })
          .select()
          .single();
        if (error) throw error;

        await supabase.from("residency_attestations").insert({
          registration_id: newReg.id,
          parent_user_id: user.id,
          attestation_text: "I attest under penalty of perjury that the information provided is true and accurate.",
          signature_text: signatureText,
        });
      }

      setSubmitted(true);
      toast.success("Reapplication submitted!");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit reapplication");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Reapply for Transportation"
        description="Returning families: confirm your address and re-register for school bus transportation in minutes."
        path="/reapply"
      />
      <Navigation onGetAudit={() => setContactOpen(true)} />
      <main className="pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-6">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 text-sm font-semibold tracking-wider uppercase text-accent mb-4">
              <span className="w-10 h-px bg-accent" />
              Returning Families
            </span>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-primary mb-3">
              Reapply for Transportation
            </h1>
            <p className="text-muted-foreground">
              Welcome back! Confirm your info and re-register in under 3 minutes.
            </p>
          </div>

          {!user ? (
            <Card className="p-6 space-y-4">
              <h2 className="font-display text-lg font-bold text-primary flex items-center gap-2">
                <LogIn className="w-5 h-5" /> Sign In to Your Account
              </h2>
              <div>
                <Label htmlFor="loginEmail">Email</Label>
                <Input id="loginEmail" type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="loginPassword">Password</Label>
                <Input id="loginPassword" type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
              </div>
              <Button onClick={handleLogin} disabled={loggingIn} className="w-full bg-primary text-primary-foreground">
                {loggingIn ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Sign In
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                First time? <a href="/register" className="text-accent underline">Register here</a>
              </p>
            </Card>
          ) : submitted ? (
            <Card className="p-8 text-center">
              <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
              <h2 className="font-display text-2xl font-bold text-primary mb-2">Reapplication Submitted!</h2>
              <p className="text-muted-foreground mb-6">Your district will review your reapplication shortly.</p>
              <Button onClick={() => navigate("/")} className="bg-primary text-primary-foreground">Return to Homepage</Button>
            </Card>
          ) : registrations.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground mb-4">No previous registrations found. Please register as a new family.</p>
              <Button onClick={() => navigate("/register")} className="bg-accent text-accent-foreground">Go to Registration</Button>
            </Card>
          ) : (
            <Card className="p-6 space-y-5">
              <h2 className="font-display text-lg font-bold text-primary">Verify Your Information</h2>

              {registrations.map((reg, i) => (
                <div key={reg.id} className="p-3 bg-secondary rounded-lg text-sm">
                  <p className="font-semibold text-primary">Student: {reg.student_name}</p>
                  <p>Grade {reg.grade} → {reg.grade === "K" ? "1" : reg.grade === "12" ? "12" : Number(reg.grade) + 1} · {reg.school}</p>
                  <p className="text-muted-foreground">{reg.address_line}, {reg.city}, {reg.state} {reg.zip}</p>
                </div>
              ))}

              <label className="flex items-center gap-3">
                <Checkbox checked={sameAddress} onCheckedChange={v => setSameAddress(!!v)} />
                <span className="text-sm font-medium">My address is the same as last year</span>
              </label>

              {!sameAddress && (
                <Alert>
                  <AlertDescription>
                    If your address has changed, please <a href="/register" className="text-accent underline">submit a new registration</a> with updated documents.
                  </AlertDescription>
                </Alert>
              )}

              <label className="flex items-start gap-3">
                <Checkbox checked={acknowledged} onCheckedChange={v => setAcknowledged(!!v)} className="mt-0.5" />
                <span className="text-sm">I acknowledge the Parents' Bill of Rights for Data Privacy.</span>
              </label>

              <div>
                <Label htmlFor="sig">Electronic Signature (type your full legal name)</Label>
                <Input
                  id="sig"
                  value={signatureText}
                  onChange={e => setSignatureText(e.target.value)}
                  className="font-display italic text-lg"
                  placeholder="Your Full Legal Name"
                />
              </div>

              <Button
                onClick={handleReapply}
                disabled={!sameAddress || !acknowledged || signatureText.length < 2 || submitting}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Submitting...</> : "Submit Reapplication"}
              </Button>
            </Card>
          )}
        </div>
      </main>
      <ContactFormModal open={contactOpen} onOpenChange={setContactOpen} />
    </div>
  );
};

export default Reapply;
