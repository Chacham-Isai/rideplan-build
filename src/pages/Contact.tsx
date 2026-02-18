import { useState } from "react";
import { SEOHead } from "@/components/SEOHead";
import { Navigation } from "@/components/sections/Navigation";
import { Footer } from "@/components/sections/Footer";
import { ScrollReveal } from "@/components/ScrollReveal";
import { ContactFormModal } from "@/components/ContactFormModal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowRight, CheckCircle, Loader2, Mail, MapPin, Phone } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  district: z.string().trim().min(1, "District name is required").max(200),
  students: z.string().trim().min(1, "Number of students is required").max(20),
  message: z.string().trim().max(2000).optional(),
});

type ContactData = z.infer<typeof contactSchema>;

const CONTACT_INFO = [
  { icon: Mail, label: "Email Us", value: "hello@rideline.io", href: "mailto:hello@rideline.io" },
  { icon: Phone, label: "Call Us", value: "(800) 555-RIDE", href: "tel:+18005557433" },
  { icon: MapPin, label: "Headquarters", value: "New York, NY", href: undefined },
];

const Contact = () => {
  const [contactOpen, setContactOpen] = useState(false);
  const [formData, setFormData] = useState<ContactData>({ name: "", email: "", district: "", students: "", message: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactData, string>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ContactData, string>> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof ContactData;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);
    setSubmitError(null);

    const { error } = await supabase.from("audit_requests").insert({
      name: result.data.name,
      email: result.data.email,
      district: result.data.district,
      students: result.data.students,
    });

    setSubmitting(false);
    if (error) {
      setSubmitError("Something went wrong. Please try again.");
      return;
    }
    setSubmitted(true);
  };

  const updateField = (field: keyof ContactData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <div className="min-h-screen">
      <SEOHead
        title="Contact Us"
        description="Get in touch with the RideLine team. Request a free route audit or ask about our school transportation platform."
        path="/contact"
      />
      <Navigation onGetAudit={() => setContactOpen(true)} />

      <main>
        {/* Header */}
        <section className="bg-navy py-16 md:py-24">
          <div className="mx-auto max-w-[1200px] px-4 md:px-6 text-center">
            <ScrollReveal>
              <span className="inline-block rounded-full bg-accent/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent mb-6">
                Get in Touch
              </span>
              <h1 className="font-display text-3xl font-bold text-primary-foreground md:text-5xl">
                Let's Talk <span className="italic text-accent">Transportation</span>
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/60 md:text-lg">
                Whether you're ready for a free route audit or just exploring options, we'd love to hear from you.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* Contact cards + Form */}
        <section className="bg-background py-16 md:py-20">
          <div className="mx-auto max-w-[1200px] px-4 md:px-6">
            <div className="grid lg:grid-cols-5 gap-12">
              {/* Left: Info cards */}
              <div className="lg:col-span-2 space-y-6">
                <ScrollReveal direction="left">
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    Reach Out Anytime
                  </h2>
                  <p className="mt-2 text-muted-foreground text-sm">
                    Our team typically responds within one business day.
                  </p>
                </ScrollReveal>

                <ScrollReveal direction="left" delay={0.1}>
                  <div className="space-y-4">
                    {CONTACT_INFO.map((item) => (
                      <div
                        key={item.label}
                        className="flex items-start gap-4 rounded-xl border border-border/60 bg-card p-5 transition-all hover:shadow-md hover:border-accent/30"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                          <item.icon className="h-5 w-5 text-accent" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {item.label}
                          </p>
                          {item.href ? (
                            <a
                              href={item.href}
                              className="mt-0.5 text-sm font-medium text-foreground hover:text-accent transition-colors"
                            >
                              {item.value}
                            </a>
                          ) : (
                            <p className="mt-0.5 text-sm font-medium text-foreground">{item.value}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollReveal>

                <ScrollReveal direction="left" delay={0.2}>
                  <div className="rounded-xl border border-accent/20 bg-accent/5 p-6">
                    <h3 className="font-display text-lg font-bold text-foreground">Free Route Audit</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Fill out the form and we'll analyze your current routes to find savings of{" "}
                      <strong className="text-success">$710K–$1.6M</strong> — no cost, no obligation.
                    </p>
                  </div>
                </ScrollReveal>
              </div>

              {/* Right: Form */}
              <div className="lg:col-span-3">
                <ScrollReveal direction="right">
                  <div className="rounded-2xl border border-border/60 bg-card p-8 shadow-sm">
                    {submitted ? (
                      <div className="py-12 text-center">
                        <CheckCircle className="mx-auto h-16 w-16 text-success mb-5" />
                        <h3 className="font-display text-2xl font-bold text-foreground">We'll Be in Touch!</h3>
                        <p className="mt-3 text-muted-foreground max-w-md mx-auto">
                          Our team will review your information and reach out within 2 business days to schedule your free route audit.
                        </p>
                        <button
                          onClick={() => {
                            setSubmitted(false);
                            setFormData({ name: "", email: "", district: "", students: "", message: "" });
                          }}
                          className="mt-6 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
                        >
                          Send Another Message
                        </button>
                      </div>
                    ) : (
                      <>
                        <h3 className="font-display text-xl font-bold text-foreground mb-6">
                          Request Your Free Route Audit
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-5">
                          <div className="grid sm:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                              <Label htmlFor="c-name">Full Name *</Label>
                              <Input
                                id="c-name"
                                placeholder="Jane Smith"
                                value={formData.name}
                                onChange={(e) => updateField("name", e.target.value)}
                                className={errors.name ? "border-destructive" : ""}
                              />
                              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor="c-email">Work Email *</Label>
                              <Input
                                id="c-email"
                                type="email"
                                placeholder="jane@district.edu"
                                value={formData.email}
                                onChange={(e) => updateField("email", e.target.value)}
                                className={errors.email ? "border-destructive" : ""}
                              />
                              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                            </div>
                          </div>

                          <div className="grid sm:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                              <Label htmlFor="c-district">District Name *</Label>
                              <Input
                                id="c-district"
                                placeholder="Northshore Central School District"
                                value={formData.district}
                                onChange={(e) => updateField("district", e.target.value)}
                                className={errors.district ? "border-destructive" : ""}
                              />
                              {errors.district && <p className="text-xs text-destructive">{errors.district}</p>}
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor="c-students">Students Transported *</Label>
                              <Input
                                id="c-students"
                                placeholder="e.g. 3,500"
                                value={formData.students}
                                onChange={(e) => updateField("students", e.target.value)}
                                className={errors.students ? "border-destructive" : ""}
                              />
                              {errors.students && <p className="text-xs text-destructive">{errors.students}</p>}
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="c-message">Additional Details (optional)</Label>
                            <Textarea
                              id="c-message"
                              placeholder="Tell us about your transportation challenges, fleet size, or any specific questions..."
                              rows={4}
                              value={formData.message}
                              onChange={(e) => updateField("message", e.target.value)}
                              className={errors.message ? "border-destructive" : ""}
                            />
                            {errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
                          </div>

                          {submitError && <p className="text-sm text-destructive text-center">{submitError}</p>}

                          <button
                            type="submit"
                            disabled={submitting}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3.5 text-sm font-bold text-accent-foreground hover:bg-gold-light hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-accent/20 disabled:opacity-60 disabled:hover:scale-100"
                          >
                            {submitting ? (
                              <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
                            ) : (
                              <>Request My Free Audit <ArrowRight className="h-4 w-4" /></>
                            )}
                          </button>
                        </form>
                      </>
                    )}
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <ContactFormModal open={contactOpen} onOpenChange={setContactOpen} />
    </div>
  );
};

export default Contact;
