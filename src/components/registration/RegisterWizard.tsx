import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { StepParentInfo } from "./steps/StepParentInfo";
import { StepStudentInfo } from "./steps/StepStudentInfo";
import { StepAddress } from "./steps/StepAddress";
import { StepDocuments } from "./steps/StepDocuments";
import { StepChildcare } from "./steps/StepChildcare";
import { StepReview } from "./steps/StepReview";
import { CheckCircle } from "lucide-react";

export type RegistrationData = {
  // Parent
  parentName: string;
  email: string;
  phone: string;
  language: string;
  password: string;
  // Students
  students: {
    name: string;
    dob: string;
    grade: string;
    school: string;
    iep: boolean;
    section504: boolean;
    mckinneyVento: boolean;
    fosterCare: boolean;
  }[];
  // Address
  address: string;
  city: string;
  state: string;
  zip: string;
  // Documents
  documents: { file: File; type: string }[];
  // Childcare
  needsChildcare: boolean;
  childcare?: {
    providerName: string;
    providerAddress: string;
    days: string[];
    transportType: "am" | "pm" | "both";
  };
  // Signature
  signatureText: string;
  billOfRightsAcknowledged: boolean;
};

const STEP_LABELS_FULL = [
  "Parent Info",
  "Student Info",
  "Address",
  "Documents",
  "Childcare",
  "Review & Sign",
];

const STEP_LABELS_INAPP = [
  "Student Info",
  "Address",
  "Documents",
  "Childcare",
  "Review & Sign",
];

const currentSchoolYear = () => {
  const now = new Date();
  const year = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
  return `${year}-${year + 1}`;
};

type WizardProps = {
  mode?: "public" | "in-app";
  prefill?: {
    parentName?: string;
    email?: string;
    phone?: string;
    districtId?: string;
  };
};

export const RegisterWizard = ({ mode = "public", prefill }: WizardProps) => {
  const navigate = useNavigate();
  const isInApp = mode === "in-app";
  const STEP_LABELS = isInApp ? STEP_LABELS_INAPP : STEP_LABELS_FULL;
  const maxStep = STEP_LABELS.length - 1;

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resolvedDistrictId, setResolvedDistrictId] = useState<string | null>(prefill?.districtId ?? null);
  const [data, setData] = useState<RegistrationData>({
    parentName: prefill?.parentName ?? "",
    email: prefill?.email ?? "",
    phone: prefill?.phone ?? "",
    language: "English",
    password: "",
    students: [{ name: "", dob: "", grade: "", school: "", iep: false, section504: false, mckinneyVento: false, fosterCare: false }],
    address: "",
    city: "",
    state: "NY",
    zip: "",
    documents: [],
    needsChildcare: false,
    signatureText: "",
    billOfRightsAcknowledged: false,
  });

  // Resolve district slug from URL for public mode
  useEffect(() => {
    if (isInApp) return;
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get("district");
    if (slug) {
      supabase.from("districts_public").select("id").eq("slug", slug).maybeSingle().then(({ data: d }) => {
        if (d) setResolvedDistrictId(d.id);
      });
    }
    if (!resolvedDistrictId) {
      setResolvedDistrictId("a1b2c3d4-e5f6-7890-abcd-ef1234567890");
    }
  }, [isInApp]);

  const updateData = (partial: Partial<RegistrationData>) => setData(prev => ({ ...prev, ...partial }));
  const next = () => setStep(s => Math.min(s + 1, maxStep));
  const back = () => setStep(s => Math.max(s - 1, 0));

  const validateRegistrationData = (d: RegistrationData): string | null => {
    // Validate parent info
    if (!isInApp) {
      if (!d.parentName.trim() || d.parentName.length > 100) return "Invalid parent name";
      if (!d.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email) || d.email.length > 255) return "Invalid email";
      if (d.phone && d.phone.length > 20) return "Phone number too long";
      if (!d.password || d.password.length < 8) return "Password must be at least 8 characters";
    }
    // Validate students
    if (d.students.length === 0 || d.students.length > 10) return "Invalid number of students";
    for (const s of d.students) {
      if (!s.name.trim() || s.name.length > 100) return `Invalid student name: ${s.name || "(empty)"}`;
      if (!s.dob || !/^\d{4}-\d{2}-\d{2}$/.test(s.dob)) return `Invalid date of birth for ${s.name}`;
      if (!s.grade.trim() || s.grade.length > 10) return `Invalid grade for ${s.name}`;
      if (!s.school.trim() || s.school.length > 200) return `Invalid school for ${s.name}`;
    }
    // Validate address
    if (!d.address.trim() || d.address.length > 300) return "Invalid address";
    if (!d.city.trim() || d.city.length > 100) return "Invalid city";
    if (!d.state.trim() || d.state.length > 2) return "Invalid state";
    if (!d.zip.trim() || !/^\d{5}(-\d{4})?$/.test(d.zip)) return "Invalid ZIP code";
    // Validate signature
    if (!d.signatureText.trim() || d.signatureText.length > 200) return "Signature is required";
    return null;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Client-side validation
      const validationError = validateRegistrationData(data);
      if (validationError) throw new Error(validationError);

      let userId: string;

      if (isInApp) {
        // In-app: user already authenticated
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) throw new Error("You must be logged in");
        userId = currentUser.id;
      } else {
        // Public: create auth account
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: data.email.trim(),
          password: data.password,
          options: {
            data: { full_name: data.parentName.trim(), phone: data.phone.trim(), language: data.language },
            emailRedirectTo: window.location.origin,
          },
        });
        if (authError) throw authError;
        userId = authData.user?.id ?? "";
        if (!userId) throw new Error("Account creation failed");
      }

      const schoolYear = currentSchoolYear();
      const districtId = resolvedDistrictId ?? "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

      // Create student registrations
      for (const student of data.students) {
        const { data: reg, error: regError } = await supabase
          .from("student_registrations")
          .insert({
            parent_user_id: userId,
            district_id: districtId,
            student_name: student.name.trim().slice(0, 100),
            dob: student.dob,
            grade: student.grade.trim().slice(0, 10),
            school: student.school.trim().slice(0, 200),
            address_line: data.address.trim().slice(0, 300),
            city: data.city.trim().slice(0, 100),
            state: data.state.trim().slice(0, 2),
            zip: data.zip.trim().slice(0, 10),
            iep_flag: student.iep,
            section_504_flag: student.section504,
            mckinney_vento_flag: student.mckinneyVento,
            foster_care_flag: student.fosterCare,
            school_year: schoolYear,
          })
          .select()
          .single();
        if (regError) throw regError;

        // Upload documents for first student (shared across siblings)
        if (data.students.indexOf(student) === 0) {
          for (const doc of data.documents) {
            const filePath = `${userId}/${reg.id}/${Date.now()}-${doc.file.name}`;
            const { error: uploadError } = await supabase.storage
              .from("residency-documents")
              .upload(filePath, doc.file);
            if (uploadError) throw uploadError;

            await supabase.from("residency_documents").insert({
              registration_id: reg.id,
              document_type: doc.type,
              file_url: filePath,
            });
          }
        }

        // Create attestation
        await supabase.from("residency_attestations").insert({
          registration_id: reg.id,
          parent_user_id: userId,
          attestation_text: "I attest under penalty of perjury that the information provided above is true and accurate, and that I reside at the address stated.",
          signature_text: data.signatureText,
        });

        // Create childcare request if needed
        if (data.needsChildcare && data.childcare) {
          await supabase.from("childcare_requests").insert({
            registration_id: reg.id,
            provider_name: data.childcare.providerName,
            provider_address: data.childcare.providerAddress,
            days_needed: data.childcare.days,
            transport_type: data.childcare.transportType,
            school_year: schoolYear,
          });
        }
      }

      setSubmitted(true);
      toast.success("Registration submitted successfully!");
    } catch (err: any) {
      toast.error(err.message || "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className="p-8 text-center">
        <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
        <h2 className="font-display text-2xl font-bold text-primary mb-2">Registration Submitted!</h2>
        <p className="text-muted-foreground mb-1">
          Your district will review your application. You'll receive an email confirmation at <strong>{data.email}</strong>.
        </p>
        <p className="text-sm text-muted-foreground mb-6">Expected processing time: 5–10 business days.</p>
        <Button onClick={() => navigate(isInApp ? "/app/parent" : "/")} className="bg-primary text-primary-foreground">
          {isInApp ? "Back to Dashboard" : "Return to Homepage"}
        </Button>
      </Card>
    );
  }

  const progress = ((step + 1) / STEP_LABELS.length) * 100;

  return (
    <div>
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-xs font-medium text-muted-foreground mb-2">
          {STEP_LABELS.map((label, i) => (
            <span key={label} className={i <= step ? "text-primary font-semibold" : ""}>
              {label}
            </span>
          ))}
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card className="p-6 md:p-8">
        {isInApp ? (
          <>
            {step === 0 && <StepStudentInfo data={data} updateData={updateData} onNext={next} onBack={() => {}} />}
            {step === 1 && <StepAddress data={data} updateData={updateData} onNext={next} onBack={back} />}
            {step === 2 && <StepDocuments data={data} updateData={updateData} onNext={next} onBack={back} />}
            {step === 3 && <StepChildcare data={data} updateData={updateData} onNext={next} onBack={back} />}
            {step === 4 && <StepReview data={data} updateData={updateData} onBack={back} onSubmit={handleSubmit} submitting={submitting} />}
          </>
        ) : (
          <>
            {step === 0 && <StepParentInfo data={data} updateData={updateData} onNext={next} />}
            {step === 1 && <StepStudentInfo data={data} updateData={updateData} onNext={next} onBack={back} />}
            {step === 2 && <StepAddress data={data} updateData={updateData} onNext={next} onBack={back} />}
            {step === 3 && <StepDocuments data={data} updateData={updateData} onNext={next} onBack={back} />}
            {step === 4 && <StepChildcare data={data} updateData={updateData} onNext={next} onBack={back} />}
            {step === 5 && <StepReview data={data} updateData={updateData} onBack={back} onSubmit={handleSubmit} submitting={submitting} />}
          </>
        )}
      </Card>
    </div>
  );
};
