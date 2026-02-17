import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SEOHead } from "@/components/SEOHead";
import { Navigation } from "@/components/sections/Navigation";
import { Footer } from "@/components/sections/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ShieldAlert, CheckCircle2 } from "lucide-react";

const schema = z.object({
  report_type: z.enum(["bullying", "driver_safety", "other"], { required_error: "Select a report type" }),
  school_name: z.string().trim().min(1, "School name is required").max(200),
  bus_number: z.string().trim().min(1, "Bus number is required").max(50),
  incident_date: z.string().min(1, "Date is required"),
  description: z.string().trim().min(10, "Please provide at least 10 characters").max(2000),
  reporter_name: z.string().trim().min(1, "Your name is required").max(100),
  reporter_email: z.string().trim().email("Invalid email").max(255),
  reporter_phone: z.string().trim().max(20).optional(),
});

type FormData = z.infer<typeof schema>;

const SafetyReport = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const reportType = watch("report_type");

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const { error } = await supabase.from("safety_reports" as any).insert({
        report_type: data.report_type,
        school_name: data.school_name,
        bus_number: data.bus_number,
        incident_date: data.incident_date,
        description: data.description,
        reporter_name: data.reporter_name,
        reporter_email: data.reporter_email,
        reporter_phone: data.reporter_phone || null,
      });
      if (error) throw error;

      // Trigger AI analysis
      try {
        await supabase.functions.invoke("analyze-reports", {
          body: { bus_number: data.bus_number, report_type: data.report_type, description: data.description },
        });
      } catch {
        // Non-blocking — analysis runs in background
      }

      setSubmitted(true);
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to submit report", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <SEOHead title="Report Submitted — RideLine" description="Your safety report has been submitted." />
        <Navigation />
        <main className="flex-1 flex items-center justify-center px-4 py-20">
          <div className="text-center max-w-md">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-6" />
            <h1 className="font-display text-3xl font-bold text-foreground mb-4">Report Submitted</h1>
            <p className="text-muted-foreground mb-8">
              Thank you. Your report has been received and the appropriate school or bus company will be notified. If this is an emergency, please call 911.
            </p>
            <Button onClick={() => window.location.href = "/"}>Back to Home</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead title="Report a Safety Concern — RideLine" description="Report bullying or driver safety concerns. Your report will be reviewed and appropriate action will be taken." />
      <Navigation />
      <main className="flex-1 py-16 px-4">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center gap-3 mb-2">
            <ShieldAlert className="h-8 w-8 text-accent" />
            <h1 className="font-display text-3xl font-bold text-foreground">Report a Safety Concern</h1>
          </div>
          <p className="text-muted-foreground mb-8">
            No login required. Your report will be forwarded to the appropriate school or bus company for review.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Report Type */}
            <div className="space-y-2">
              <Label>Report Type *</Label>
              <Select onValueChange={(v) => setValue("report_type", v as any)} value={reportType}>
                <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bullying">Bullying</SelectItem>
                  <SelectItem value="driver_safety">Driver Safety Concern</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.report_type && <p className="text-sm text-destructive">{errors.report_type.message}</p>}
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>School Name *</Label>
                <Input {...register("school_name")} placeholder="e.g. Lincoln Elementary" />
                {errors.school_name && <p className="text-sm text-destructive">{errors.school_name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Bus Number *</Label>
                <Input {...register("bus_number")} placeholder="e.g. Bus 42" />
                {errors.bus_number && <p className="text-sm text-destructive">{errors.bus_number.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Date of Incident *</Label>
              <Input type="date" {...register("incident_date")} />
              {errors.incident_date && <p className="text-sm text-destructive">{errors.incident_date.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>What Happened? *</Label>
              <Textarea {...register("description")} placeholder="Please describe the incident in detail..." rows={5} />
              {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Your Name *</Label>
                <Input {...register("reporter_name")} placeholder="Full name" />
                {errors.reporter_name && <p className="text-sm text-destructive">{errors.reporter_name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" {...register("reporter_email")} placeholder="you@example.com" />
                {errors.reporter_email && <p className="text-sm text-destructive">{errors.reporter_email.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Phone (optional)</Label>
              <Input {...register("reporter_phone")} placeholder="(555) 123-4567" />
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "Submitting..." : "Submit Report"}
            </Button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SafetyReport;
