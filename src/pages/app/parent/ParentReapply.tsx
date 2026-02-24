import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDistrict } from "@/contexts/DistrictContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { CheckCircle, Loader2 } from "lucide-react";

const ParentReapply = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { district } = useDistrict();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sameAddress, setSameAddress] = useState(true);
  const [signatureText, setSignatureText] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("student_registrations")
      .select("*")
      .eq("parent_user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setRegistrations(data || []);
        setLoading(false);
      });
  }, [user]);

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
            district_id: reg.district_id,
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (submitted) {
    return (
      <Card className="max-w-2xl mx-auto p-8 text-center">
        <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
        <h2 className="font-display text-2xl font-bold text-primary mb-2">Reapplication Submitted!</h2>
        <p className="text-muted-foreground mb-6">Your district will review your reapplication shortly.</p>
        <Button onClick={() => navigate("/app/parent")} className="bg-primary text-primary-foreground">
          Back to Dashboard
        </Button>
      </Card>
    );
  }

  if (registrations.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto p-6 text-center">
        <p className="text-muted-foreground mb-4">No previous registrations found. Please register as a new family first.</p>
        <Button onClick={() => navigate("/app/parent/register")} className="bg-accent text-accent-foreground">
          Go to Registration
        </Button>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-1">Reapply for Transportation</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back! Confirm your info and re-register in under 3 minutes.
        </p>
      </div>

      <Card className="p-6 space-y-5">
        <h2 className="font-display text-lg font-bold text-primary">Verify Your Information</h2>

        {registrations.map((reg) => (
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
              If your address has changed, please <a href="/app/parent/register" className="text-accent underline">submit a new registration</a> with updated documents.
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
    </div>
  );
};

export default ParentReapply;
