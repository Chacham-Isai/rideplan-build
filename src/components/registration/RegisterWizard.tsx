import { useState } from "react";
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

const STEP_LABELS = [
  "Parent Info",
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

export const RegisterWizard = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [data, setData] = useState<RegistrationData>({
    parentName: "",
    email: "",
    phone: "",
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

  const updateData = (partial: Partial<RegistrationData>) => setData(prev => ({ ...prev, ...partial }));
  const next = () => setStep(s => Math.min(s + 1, 5));
  const back = () => setStep(s => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // 1. Create auth account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: { full_name: data.parentName, phone: data.phone, language: data.language },
          emailRedirectTo: window.location.origin,
        },
      });
      if (authError) throw authError;
      const userId = authData.user?.id;
      if (!userId) throw new Error("Account creation failed");

      const schoolYear = currentSchoolYear();

      // 2. Create student registrations
      for (const student of data.students) {
        const { data: reg, error: regError } = await supabase
          .from("student_registrations")
          .insert({
            parent_user_id: userId,
            student_name: student.name,
            dob: student.dob,
            grade: student.grade,
            school: student.school,
            address_line: data.address,
            city: data.city,
            state: data.state,
            zip: data.zip,
            iep_flag: student.iep,
            section_504_flag: student.section504,
            mckinney_vento_flag: student.mckinneyVento,
            foster_care_flag: student.fosterCare,
            school_year: schoolYear,
          })
          .select()
          .single();
        if (regError) throw regError;

        // 3. Upload documents for first student (shared across siblings)
        if (data.students.indexOf(student) === 0) {
          for (const doc of data.documents) {
            const filePath = `${userId}/${reg.id}/${Date.now()}-${doc.file.name}`;
            const { error: uploadError } = await supabase.storage
              .from("residency-documents")
              .upload(filePath, doc.file);
            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage
              .from("residency-documents")
              .getPublicUrl(filePath);

            await supabase.from("residency_documents").insert({
              registration_id: reg.id,
              document_type: doc.type,
              file_url: urlData.publicUrl || filePath,
            });
          }
        }

        // 4. Create attestation
        await supabase.from("residency_attestations").insert({
          registration_id: reg.id,
          parent_user_id: userId,
          attestation_text: "I attest under penalty of perjury that the information provided above is true and accurate, and that I reside at the address stated.",
          signature_text: data.signatureText,
        });

        // 5. Create childcare request if needed
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
        <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
        <h2 className="font-display text-2xl font-bold text-primary mb-2">Registration Submitted!</h2>
        <p className="text-muted-foreground mb-1">
          Your district will review your application. You'll receive an email confirmation at <strong>{data.email}</strong>.
        </p>
        <p className="text-sm text-muted-foreground mb-6">Expected processing time: 5–10 business days.</p>
        <Button onClick={() => navigate("/")} className="bg-primary text-primary-foreground">
          Return to Homepage
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
        {step === 0 && <StepParentInfo data={data} updateData={updateData} onNext={next} />}
        {step === 1 && <StepStudentInfo data={data} updateData={updateData} onNext={next} onBack={back} />}
        {step === 2 && <StepAddress data={data} updateData={updateData} onNext={next} onBack={back} />}
        {step === 3 && <StepDocuments data={data} updateData={updateData} onNext={next} onBack={back} />}
        {step === 4 && <StepChildcare data={data} updateData={updateData} onNext={next} onBack={back} />}
        {step === 5 && <StepReview data={data} updateData={updateData} onBack={back} onSubmit={handleSubmit} submitting={submitting} />}
      </Card>
    </div>
  );
};
