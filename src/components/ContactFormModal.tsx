import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, CheckCircle } from "lucide-react";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  district: z.string().trim().min(1, "District name is required").max(200),
  students: z.string().trim().min(1, "Number of students is required").max(20),
});

type FormData = z.infer<typeof formSchema>;

interface ContactFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ContactFormModal = ({ open, onOpenChange }: ContactFormModalProps) => {
  const [formData, setFormData] = useState<FormData>({ name: "", email: "", district: "", students: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = formSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof FormData, string>> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof FormData;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitted(true);
  };

  const handleClose = (val: boolean) => {
    if (!val) {
      setFormData({ name: "", email: "", district: "", students: "" });
      setErrors({});
      setSubmitted(false);
    }
    onOpenChange(val);
  };

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px]">
        {submitted ? (
          <div className="py-8 text-center">
            <CheckCircle className="mx-auto h-14 w-14 text-success mb-4" />
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">We'll Be in Touch!</DialogTitle>
              <DialogDescription className="mt-2 text-muted-foreground">
                Our team will review your information and reach out within 2 business days to schedule your free route audit.
              </DialogDescription>
            </DialogHeader>
            <button
              onClick={() => handleClose(false)}
              className="mt-6 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">Start Your Free Route Audit</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Share your district info and we'll show you exactly where the savings are — no cost, no obligation.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Jane Smith"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Work Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jane@district.edu"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="district">District Name</Label>
                <Input
                  id="district"
                  placeholder="Northshore Central School District"
                  value={formData.district}
                  onChange={(e) => updateField("district", e.target.value)}
                  className={errors.district ? "border-destructive" : ""}
                />
                {errors.district && <p className="text-xs text-destructive">{errors.district}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="students">Number of Transported Students</Label>
                <Input
                  id="students"
                  placeholder="e.g. 3,500"
                  value={formData.students}
                  onChange={(e) => updateField("students", e.target.value)}
                  className={errors.students ? "border-destructive" : ""}
                />
                {errors.students && <p className="text-xs text-destructive">{errors.students}</p>}
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-bold text-accent-foreground hover:bg-gold-light transition shadow-lg shadow-accent/20"
              >
                Request My Free Audit <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
