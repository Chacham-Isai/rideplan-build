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
import { Bus, CheckCircle2 } from "lucide-react";

const schema = z.object({
  report_type: z.enum(["incident", "maintenance", "schedule", "other"], { required_error: "Select a type" }),
  driver_name: z.string().trim().min(1, "Name is required").max(100),
  bus_number: z.string().trim().min(1, "Bus number is required").max(50),
  route_info: z.string().trim().max(200).optional(),
  description: z.string().trim().min(10, "Please provide at least 10 characters").max(2000),
  contact_info: z.string().trim().max(255).optional(),
});

type FormData = z.infer<typeof schema>;

const DriverPortal = () => {
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
      const { error } = await supabase.from("driver_reports" as any).insert({
        report_type: data.report_type,
        driver_name: data.driver_name,
        bus_number: data.bus_number,
        route_info: data.route_info || null,
        description: data.description,
        contact_info: data.contact_info || null,
      });
      if (error) throw error;
      setSubmitted(true);
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to submit", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <SEOHead title="Report Submitted — RideLine" description="Your driver report has been submitted." />
        <Navigation />
        <main className="flex-1 flex items-center justify-center px-4 py-20">
          <div className="text-center max-w-md">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-6" />
            <h1 className="font-display text-3xl font-bold text-foreground mb-4">Report Submitted</h1>
            <p className="text-muted-foreground mb-8">Thank you. Your report has been received and will be reviewed promptly.</p>
            <Button onClick={() => window.location.href = "/"}>Back to Home</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead title="Driver Portal — RideLine" description="Drivers can report incidents, request schedule changes, or flag maintenance issues." />
      <Navigation />
      <main className="flex-1 py-16 px-4">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center gap-3 mb-2">
            <Bus className="h-8 w-8 text-accent" />
            <h1 className="font-display text-3xl font-bold text-foreground">Driver Portal</h1>
          </div>
          <p className="text-muted-foreground mb-8">Report an incident, request maintenance, or submit a schedule change.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label>Report Type *</Label>
              <Select onValueChange={(v) => setValue("report_type", v as any)} value={reportType}>
                <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="incident">Incident Report</SelectItem>
                  <SelectItem value="maintenance">Maintenance Request</SelectItem>
                  <SelectItem value="schedule">Schedule Request</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.report_type && <p className="text-sm text-destructive">{errors.report_type.message}</p>}
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Your Name *</Label>
                <Input {...register("driver_name")} placeholder="Full name" />
                {errors.driver_name && <p className="text-sm text-destructive">{errors.driver_name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Bus Number *</Label>
                <Input {...register("bus_number")} placeholder="e.g. Bus 42" />
                {errors.bus_number && <p className="text-sm text-destructive">{errors.bus_number.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Route Info (optional)</Label>
              <Input {...register("route_info")} placeholder="e.g. Route 7 — Lincoln Elementary" />
            </div>

            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea {...register("description")} placeholder="Describe the issue or request..." rows={5} />
              {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Contact Info (optional)</Label>
              <Input {...register("contact_info")} placeholder="Phone or email for follow-up" />
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

export default DriverPortal;
