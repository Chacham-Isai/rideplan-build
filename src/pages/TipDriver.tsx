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
import { useToast } from "@/hooks/use-toast";
import { Heart, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const schema = z.object({
  bus_number: z.string().trim().max(50).optional(),
  driver_name: z.string().trim().max(100).optional(),
  tip_amount: z.number().min(1, "Minimum tip is $1").max(500, "Maximum tip is $500"),
  message: z.string().trim().max(500).optional(),
  tipper_name: z.string().trim().min(1, "Your name is required").max(100),
  tipper_email: z.string().trim().email("Invalid email").max(255),
}).refine(d => d.bus_number || d.driver_name, { message: "Enter a bus number or driver name", path: ["bus_number"] });

type FormData = z.infer<typeof schema>;

const presetAmounts = [5, 10, 20, 50];

const TipDriver = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const { toast } = useToast();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { tip_amount: 10 },
  });

  const tipAmount = watch("tip_amount");

  const selectPreset = (amount: number) => {
    setSelectedPreset(amount);
    setValue("tip_amount", amount);
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const { error } = await supabase.from("driver_tips" as any).insert({
        bus_number: data.bus_number || null,
        driver_name: data.driver_name || null,
        tip_amount: data.tip_amount,
        message: data.message || null,
        tipper_name: data.tipper_name,
        tipper_email: data.tipper_email,
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
        <SEOHead title="Thank You! — RideLine" description="Your tip has been recorded." />
        <Navigation />
        <main className="flex-1 flex items-center justify-center px-4 py-20">
          <div className="text-center max-w-md">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-6" />
            <h1 className="font-display text-3xl font-bold text-foreground mb-4">Thank You!</h1>
            <p className="text-muted-foreground mb-8">Your appreciation has been recorded. The driver will be notified. Payment processing will be available soon.</p>
            <Button onClick={() => window.location.href = "/"}>Back to Home</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead title="Tip Your Driver — RideLine" description="Show appreciation to your child's bus driver with a tip and thank-you note." />
      <Navigation />
      <main className="flex-1 py-16 px-4">
        <div className="mx-auto max-w-lg">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="h-8 w-8 text-accent" />
            <h1 className="font-display text-3xl font-bold text-foreground">Tip Your Driver</h1>
          </div>
          <p className="text-muted-foreground mb-8">Show your appreciation — especially during holidays, bad weather, or just because they're great.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Bus Number</Label>
                <Input {...register("bus_number")} placeholder="e.g. Bus 42" />
              </div>
              <div className="space-y-2">
                <Label>Driver Name</Label>
                <Input {...register("driver_name")} placeholder="e.g. Mr. Johnson" />
              </div>
            </div>
            {errors.bus_number && <p className="text-sm text-destructive">{errors.bus_number.message}</p>}

            {/* Tip Amount */}
            <div className="space-y-3">
              <Label>Tip Amount *</Label>
              <div className="flex gap-3">
                {presetAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => selectPreset(amt)}
                    className={cn(
                      "flex-1 rounded-lg border-2 py-3 text-lg font-bold transition-all",
                      selectedPreset === amt
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border text-muted-foreground hover:border-accent/50"
                    )}
                  >
                    ${amt}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-medium">Custom: $</span>
                <Input
                  type="number"
                  min={1}
                  max={500}
                  {...register("tip_amount", { valueAsNumber: true })}
                  onChange={(e) => {
                    setSelectedPreset(null);
                    register("tip_amount").onChange(e);
                  }}
                  className="w-24"
                />
              </div>
              {errors.tip_amount && <p className="text-sm text-destructive">{errors.tip_amount.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Thank-You Note (optional)</Label>
              <Textarea {...register("message")} placeholder="Thanks for keeping our kids safe!" rows={3} />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Your Name *</Label>
                <Input {...register("tipper_name")} placeholder="Full name" />
                {errors.tipper_name && <p className="text-sm text-destructive">{errors.tipper_name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" {...register("tipper_email")} placeholder="you@example.com" />
                {errors.tipper_email && <p className="text-sm text-destructive">{errors.tipper_email.message}</p>}
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "Submitting..." : `Send $${tipAmount || 0} Tip`}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Payment processing coming soon. Your tip intent will be recorded and the driver notified.
            </p>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TipDriver;
