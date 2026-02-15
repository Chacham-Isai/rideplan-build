import { useState } from "react";
import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Check, X, ArrowRight, Zap, Building2, Crown } from "lucide-react";

const plans = [
  {
    id: "starter",
    name: "Starter",
    icon: Zap,
    description: "For smaller districts getting started with modern routing",
    price: "2,900",
    period: "/mo",
    highlight: false,
    cta: "Start Free Audit",
    students: "Up to 3,000 students",
    features: [
      "Route optimization engine",
      "Student assignment & walk zones",
      "Basic parent notifications",
      "Compliance reporting (BEDS, STAC)",
      "Email support",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    icon: Building2,
    description: "Full platform for mid-size districts with contractor oversight",
    price: "5,900",
    period: "/mo",
    highlight: true,
    badge: "Most Popular",
    cta: "Start Free Audit",
    students: "Up to 8,000 students",
    features: [
      "Everything in Starter",
      "Contractor invoice verification",
      "Real-time GPS parent tracking",
      "Multilingual parent portal",
      "AI analytics & scenario modeling",
      "Dedicated success manager",
      "Priority support",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    icon: Crown,
    description: "Custom deployment for large districts and BOCES",
    price: "Custom",
    period: "",
    highlight: false,
    cta: "Contact Sales",
    students: "Unlimited students",
    features: [
      "Everything in Professional",
      "Multi-district / BOCES support",
      "Custom integrations (SIS, ERP)",
      "Board-ready executive dashboards",
      "Predictive enrollment modeling",
      "On-site training & implementation",
      "Dedicated engineering support",
      "SLA & uptime guarantee",
    ],
  },
];

const comparisonCategories = [
  {
    name: "Route Management",
    features: [
      { name: "AI route optimization", starter: true, professional: true, enterprise: true },
      { name: "Walk-zone engine", starter: true, professional: true, enterprise: true },
      { name: "Bell-time scenario modeling", starter: false, professional: true, enterprise: true },
      { name: "Multi-tier routing", starter: false, professional: true, enterprise: true },
    ],
  },
  {
    name: "Student & Parent",
    features: [
      { name: "Student assignment engine", starter: true, professional: true, enterprise: true },
      { name: "Basic parent notifications", starter: true, professional: true, enterprise: true },
      { name: "Real-time GPS tracking for parents", starter: false, professional: true, enterprise: true },
      { name: "Multilingual parent portal (20+ languages)", starter: false, professional: true, enterprise: true },
      { name: "Digital bus passes (QR code)", starter: false, professional: true, enterprise: true },
    ],
  },
  {
    name: "Contractor & Finance",
    features: [
      { name: "Basic cost reporting", starter: true, professional: true, enterprise: true },
      { name: "GPS-verified invoice reconciliation", starter: false, professional: true, enterprise: true },
      { name: "Per-route & per-mile benchmarking", starter: false, professional: true, enterprise: true },
      { name: "Contractor performance scorecards", starter: false, professional: false, enterprise: true },
      { name: "Automated payment workflows", starter: false, professional: false, enterprise: true },
    ],
  },
  {
    name: "Analytics & Compliance",
    features: [
      { name: "Compliance reporting (BEDS, STAC, IDEA)", starter: true, professional: true, enterprise: true },
      { name: "AI natural language queries", starter: false, professional: true, enterprise: true },
      { name: "Predictive enrollment modeling", starter: false, professional: false, enterprise: true },
      { name: "Board-ready executive dashboards", starter: false, professional: false, enterprise: true },
      { name: "Custom integrations (SIS, ERP)", starter: false, professional: false, enterprise: true },
    ],
  },
  {
    name: "Support & Services",
    features: [
      { name: "Email support", starter: true, professional: true, enterprise: true },
      { name: "Priority support", starter: false, professional: true, enterprise: true },
      { name: "Dedicated success manager", starter: false, professional: true, enterprise: true },
      { name: "On-site training & implementation", starter: false, professional: false, enterprise: true },
      { name: "SLA & uptime guarantee", starter: false, professional: false, enterprise: true },
    ],
  },
];

const CellIcon = ({ included }: { included: boolean }) =>
  included ? (
    <Check className="h-4 w-4 text-success mx-auto" />
  ) : (
    <X className="h-4 w-4 text-muted-foreground/30 mx-auto" />
  );

export const PricingSection = ({ onGetAudit }: { onGetAudit?: () => void }) => {
  const [showComparison, setShowComparison] = useState(false);

  return (
    <section className="bg-background py-20 md:py-28" id="pricing">
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-14">
            <p className="text-sm font-bold uppercase tracking-widest text-accent mb-3">Pricing</p>
            <h2 className="font-display text-3xl font-bold md:text-4xl lg:text-5xl">
              Invest a Fraction, Save a <span className="italic text-accent">Fortune</span>
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
              Every plan includes a free route audit so you see projected savings before committing. Most districts achieve 12–25x ROI in Year 1.
            </p>
          </div>
        </ScrollReveal>

        {/* Plan Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan, i) => (
            <ScrollReveal key={plan.id} delay={i * 0.1}>
              <div
                className={`relative rounded-2xl border p-6 md:p-8 h-full flex flex-col transition-all duration-300 hover:shadow-lg ${
                  plan.highlight
                    ? "border-accent bg-card shadow-[0_0_40px_-12px_hsl(var(--gold)/0.2)]"
                    : "border-border bg-card hover:border-accent/30"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-accent px-4 py-1 text-xs font-bold text-accent-foreground shadow-md">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`rounded-lg p-2 ${plan.highlight ? "bg-accent/15" : "bg-muted"}`}>
                      <plan.icon className={`h-5 w-5 ${plan.highlight ? "text-accent" : "text-muted-foreground"}`} />
                    </div>
                    <h3 className="font-display text-xl font-bold">{plan.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    {plan.price !== "Custom" && <span className="text-sm text-muted-foreground">$</span>}
                    <span className="font-display text-4xl font-bold">{plan.price}</span>
                    {plan.period && <span className="text-sm text-muted-foreground">{plan.period}</span>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{plan.students}</p>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={onGetAudit}
                  className={`w-full inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-bold transition shadow-md ${
                    plan.highlight
                      ? "bg-accent text-accent-foreground hover:bg-gold-light shadow-accent/20"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  {plan.cta} <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* ROI note */}
        <ScrollReveal>
          <div className="mt-10 text-center">
            <p className="text-sm text-muted-foreground">
              All plans billed annually. Month-to-month available at +20%.{" "}
              <strong className="text-success">Every plan starts with a free route audit</strong> — see your projected savings before you commit.
            </p>
          </div>
        </ScrollReveal>

        {/* Toggle comparison */}
        <ScrollReveal>
          <div className="mt-12 text-center">
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="inline-flex items-center gap-2 rounded-lg border px-6 py-3 text-sm font-semibold hover:bg-muted transition"
            >
              {showComparison ? "Hide" : "Show"} Full Feature Comparison
            </button>
          </div>
        </ScrollReveal>

        {/* Comparison Table */}
        {showComparison && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.4 }}
            className="mt-10 overflow-x-auto"
          >
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-4 pr-4 text-left font-display text-base font-bold w-[40%]">Features</th>
                  <th className="py-4 px-4 text-center font-display text-base font-bold">Starter</th>
                  <th className="py-4 px-4 text-center font-display text-base font-bold">
                    <span className="text-accent">Professional</span>
                  </th>
                  <th className="py-4 px-4 text-center font-display text-base font-bold">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {comparisonCategories.map((cat) => (
                  <>
                    <tr key={cat.name}>
                      <td
                        colSpan={4}
                        className="pt-6 pb-2 text-xs font-bold uppercase tracking-widest text-accent"
                      >
                        {cat.name}
                      </td>
                    </tr>
                    {cat.features.map((f) => (
                      <tr key={f.name} className="border-b border-border/50">
                        <td className="py-3 pr-4 text-muted-foreground">{f.name}</td>
                        <td className="py-3 px-4 text-center">
                          <CellIcon included={f.starter} />
                        </td>
                        <td className="py-3 px-4 text-center bg-accent/[0.03]">
                          <CellIcon included={f.professional} />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <CellIcon included={f.enterprise} />
                        </td>
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </div>
    </section>
  );
};
