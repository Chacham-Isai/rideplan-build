import { useState } from "react";
import { motion } from "framer-motion";
import { SEOHead } from "@/components/SEOHead";
import { Navigation } from "@/components/sections/Navigation";
import { Footer } from "@/components/sections/Footer";
import { ContactFormModal } from "@/components/ContactFormModal";
import {
  FileText, Download, BookOpen, ClipboardList, Calculator,
  Shield, ArrowRight, Lock, CheckCircle, Loader2
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const leadSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Valid email required"),
  district: z.string().trim().min(1, "District is required"),
});

type LeadData = z.infer<typeof leadSchema>;

const resources = [
  {
    category: "Guides",
    items: [
      {
        icon: BookOpen,
        title: "The Complete Guide to School Bus Route Optimization",
        description: "A 20-page playbook covering walk zones, bell-time scenarios, and contractor benchmarking strategies used by top-performing districts.",
        tag: "Most Popular",
        tagColor: "bg-accent/20 text-accent",
      },
      {
        icon: FileText,
        title: "Parent Communication Best Practices",
        description: "How leading districts reduced office calls by 60% with real-time tracking, multilingual alerts, and digital bus passes.",
        tag: "New",
        tagColor: "bg-success/20 text-success",
      },
    ],
  },
  {
    category: "Templates",
    items: [
      {
        icon: ClipboardList,
        title: "Transportation Technology RFP Template",
        description: "A ready-to-use RFP template with evaluation criteria, scoring rubrics, and technical requirements for modern routing software.",
        tag: "Template",
        tagColor: "bg-muted text-muted-foreground",
      },
      {
        icon: Calculator,
        title: "ROI Calculation Workbook",
        description: "Plug in your district's numbers and calculate projected savings from route consolidation, contractor oversight, and efficiency gains.",
        tag: "Spreadsheet",
        tagColor: "bg-muted text-muted-foreground",
      },
    ],
  },
  {
    category: "Whitepapers",
    items: [
      {
        icon: Shield,
        title: "Data Security & FERPA Compliance in School Transportation",
        description: "How to evaluate transportation technology vendors against FERPA, COPPA, and state privacy requirements. Includes a vendor assessment checklist.",
        tag: "Compliance",
        tagColor: "bg-destructive/15 text-destructive",
      },
      {
        icon: FileText,
        title: "The $42B Opportunity: Modernizing U.S. School Transportation",
        description: "Market analysis of transportation inefficiencies across 13,000+ districts with case studies from early adopters saving $710K–$1.6M annually.",
        tag: "Research",
        tagColor: "bg-accent/20 text-accent",
      },
    ],
  },
];

const Resources = () => {
  const [contactOpen, setContactOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState("");
  const [form, setForm] = useState<LeadData>({ name: "", email: "", district: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof LeadData, string>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleDownload = (title: string) => {
    setSelectedResource(title);
    setDownloadOpen(true);
    setSubmitted(false);
    setForm({ name: "", email: "", district: "" });
    setErrors({});
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = leadSchema.safeParse(form);
    if (!result.success) {
      const errs: Partial<Record<keyof LeadData, string>> = {};
      result.error.issues.forEach((i) => { errs[i.path[0] as keyof LeadData] = i.message; });
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    // Store lead in audit_requests table (reusing existing table)
    await supabase.from("audit_requests").insert({
      name: result.data.name,
      email: result.data.email,
      district: result.data.district,
      students: "Resource: " + selectedResource,
    });
    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen">
      <SEOHead
        title="Resource Center — RideLine"
        description="Free guides, templates, and whitepapers for K-12 transportation leaders. Download RFP templates, ROI workbooks, and best practice guides."
      />
      <Navigation onGetAudit={() => setContactOpen(true)} />

      <main>
        {/* Hero */}
        <section className="bg-navy py-16 md:py-24">
          <div className="mx-auto max-w-[1200px] px-4 md:px-6 text-center">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-bold uppercase tracking-widest text-accent mb-3"
            >
              Resource Center
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display text-3xl font-bold text-primary-foreground md:text-5xl"
            >
              Guides, Templates & Research
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4 max-w-2xl mx-auto text-primary-foreground/60 text-lg"
            >
              Free resources to help your district optimize routes, reduce costs, and modernize transportation operations.
            </motion.p>
          </div>
        </section>

        {/* Resources Grid */}
        <section className="bg-background py-16 md:py-24">
          <div className="mx-auto max-w-[1200px] px-4 md:px-6">
            {resources.map((cat, ci) => (
              <div key={cat.category} className={ci > 0 ? "mt-16" : ""}>
                <h2 className="font-display text-2xl font-bold mb-8">{cat.category}</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  {cat.items.map((item, i) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="group rounded-xl border bg-card p-6 hover:shadow-lg hover:border-accent/30 transition-all duration-300"
                    >
                      <div className="flex items-start gap-4">
                        <div className="rounded-lg bg-accent/10 p-3">
                          <item.icon className="h-6 w-6 text-accent" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${item.tagColor}`}>
                              {item.tag}
                            </span>
                          </div>
                          <h3 className="font-display text-lg font-bold leading-snug">{item.title}</h3>
                          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                          <button
                            onClick={() => handleDownload(item.title)}
                            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-gold-light transition"
                          >
                            <Lock className="h-3.5 w-3.5" /> Download Free
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
      <ContactFormModal open={contactOpen} onOpenChange={setContactOpen} />

      {/* Lead Capture Modal */}
      <Dialog open={downloadOpen} onOpenChange={setDownloadOpen}>
        <DialogContent className="sm:max-w-[440px]">
          {submitted ? (
            <div className="py-8 text-center">
              <CheckCircle className="mx-auto h-14 w-14 text-success mb-4" />
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">Check Your Inbox!</DialogTitle>
                <DialogDescription className="mt-2 text-muted-foreground">
                  We've sent <strong>"{selectedResource}"</strong> to your email. Check your inbox (and spam folder) within the next few minutes.
                </DialogDescription>
              </DialogHeader>
              <button
                onClick={() => setDownloadOpen(false)}
                className="mt-6 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-xl">Get Your Free Resource</DialogTitle>
                <DialogDescription className="text-muted-foreground text-sm">
                  Enter your info and we'll email you <strong>"{selectedResource}"</strong> right away.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleLeadSubmit} className="mt-4 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="lead-name">Full Name</Label>
                  <Input
                    id="lead-name"
                    placeholder="Jane Smith"
                    value={form.name}
                    onChange={(e) => { setForm(p => ({ ...p, name: e.target.value })); setErrors(p => ({ ...p, name: undefined })); }}
                    className={errors.name ? "border-destructive" : ""}
                  />
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lead-email">Work Email</Label>
                  <Input
                    id="lead-email"
                    type="email"
                    placeholder="jane@district.edu"
                    value={form.email}
                    onChange={(e) => { setForm(p => ({ ...p, email: e.target.value })); setErrors(p => ({ ...p, email: undefined })); }}
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lead-district">District Name</Label>
                  <Input
                    id="lead-district"
                    placeholder="Northshore Central School District"
                    value={form.district}
                    onChange={(e) => { setForm(p => ({ ...p, district: e.target.value })); setErrors(p => ({ ...p, district: undefined })); }}
                    className={errors.district ? "border-destructive" : ""}
                  />
                  {errors.district && <p className="text-xs text-destructive">{errors.district}</p>}
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-bold text-accent-foreground hover:bg-gold-light transition shadow-md disabled:opacity-60"
                >
                  {submitting ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</>
                  ) : (
                    <><Download className="h-4 w-4" /> Send Me the Resource</>
                  )}
                </button>
                <p className="text-center text-xs text-muted-foreground">No spam. Unsubscribe anytime.</p>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Resources;
