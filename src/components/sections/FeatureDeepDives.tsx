import { ScrollReveal } from "@/components/ScrollReveal";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { AnimatedRouteMap } from "@/components/AnimatedRouteMap";
import { ParentAppAnimated } from "@/components/ParentAppAnimated";
import { DashboardAnimated } from "@/components/DashboardAnimated";
import costSavingsImg from "@/assets/rideline-cost-savings.png";

const features = [
  {
    eyebrow: "Student Assignment Engine",
    headline: "Every Student. Right Bus. Right Stop. No Spreadsheets.",
    body: "When a new student registers, RideLine geocodes their address, assigns the nearest stop with capacity, and generates a digital bus pass — instantly.",
    checks: [
      "Auto-assignment on enrollment from SIS integration",
      "Address change triggers automatic re-routing & parent notification",
      "Walk zone engine uses actual walking distance, not straight-line",
      "Special Ed & McKinney-Vento flagging with IEP compliance",
      "Mass import and bulk assignment for start-of-year",
    ],
    image: null as unknown as string,
    customComponent: "dashboard",
    imageAlt: "RideLine student assignment dashboard",
    reversed: false,
  },
  {
    eyebrow: "Route Optimization",
    headline: "Are You Paying for Routes You Don't Need?",
    body: "Each route costs approximately $85K per year. RideLine's AI analyzes your entire network to identify overlaps, under-utilized buses, and consolidation opportunities.",
    checks: [
      "Overlap elimination: merge buses serving the same neighborhoods",
      "Stop consolidation: 15–25% faster routes",
      "Capacity balancing: fill empty seats on underutilized buses",
      "Bell time modeling: reuse buses across tiers",
      "Dead mile reduction: optimized depot-to-first-stop routing",
    ],
    image: null as unknown as string,
    customComponent: true,
    imageAlt: "RideLine AI-powered route optimization map",
    reversed: true,
  },
  {
    eyebrow: "Contractor Oversight",
    headline: "You Still Carry the Liability. We Help You Manage It.",
    body: "Your contractors run the buses. You run everything else. RideLine gives you the data to verify every invoice, benchmark every rate, manage bids and RFPs, and track contract performance — all in one place.",
    checks: [
      "Invoice verification: cross-reference against actual GPS data",
      "Rate benchmarking against neighboring districts",
      "Bid & RFP management: publish, score, and award competitively",
      "Contract lifecycle: renewals, terms, and compliance tracking",
      "Insurance & safety compliance with automated lapse alerts",
      "Performance scorecards: on-time rates & contract adherence",
    ],
    image: costSavingsImg,
    imageAlt: "RideLine cost savings and contractor oversight dashboard",
    reversed: false,
    static: true,
  },
  {
    eyebrow: "Parent Communication",
    headline: "Parents Informed. Office Phone Silent.",
    body: "RideLine gives every parent real-time visibility into their child's bus — GPS tracking, arrival notifications, digital bus passes, and schedule change alerts — all from their phone.",
    checks: [
      "Real-time GPS tracking with live ETA updates",
      "Push notifications on bus arrival, delays, and cancellations",
      "Digital bus passes replace paper assignment letters",
      "Multilingual self-service portal for parents",
      "60% reduction in office phone calls from day one",
    ],
    image: null as unknown as string,
    customComponent: "parent",
    imageAlt: "Parent receiving real-time school bus notification on their phone",
    reversed: true,
  },
];

export const FeatureDeepDives = () => (
  <section className="bg-background py-20 md:py-28" id="features">
    <div className="mx-auto max-w-[1200px] px-4 md:px-6 space-y-20 md:space-y-28">
      {features.map((f, i) => (
        <ScrollReveal key={i}>
          <div className={`grid gap-10 lg:grid-cols-2 lg:gap-16 items-center ${f.reversed ? "lg:[direction:rtl]" : ""}`}>
            <div className={f.reversed ? "lg:[direction:ltr]" : ""}>
              <p className="text-sm font-bold uppercase tracking-widest text-accent mb-3">{f.eyebrow}</p>
              <h2 className="font-display text-2xl font-bold md:text-3xl lg:text-4xl mb-4">{f.headline}</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">{f.body}</p>
              <ul className="space-y-3">
                {f.checks.map((c, j) => (
                  <li key={j} className="flex items-start gap-3 text-sm">
                    <Check className="h-5 w-5 flex-shrink-0 text-success mt-0.5" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className={f.reversed ? "lg:[direction:ltr]" : ""}>
              {(f as any).customComponent === true ? (
                <AnimatedRouteMap />
              ) : (f as any).customComponent === "dashboard" ? (
                <DashboardAnimated />
              ) : (f as any).customComponent === "parent" ? (
                <ParentAppAnimated />
              ) : (f as any).static ? (
                <div className="relative">
                  <div className="absolute -inset-3 rounded-2xl bg-gradient-to-br from-accent/10 to-success/5 blur-xl opacity-60" />
                  <img src={f.image} alt={f.imageAlt} className="relative w-full rounded-2xl shadow-xl" loading="lazy" />
                </div>
              ) : (
                <motion.div
                  className="relative"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4 + i * 0.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="absolute -inset-3 rounded-2xl bg-gradient-to-br from-accent/10 to-success/5 blur-xl opacity-60" />
                  <img src={f.image} alt={f.imageAlt} className="relative w-full rounded-2xl shadow-xl" loading="lazy" />
                  <motion.div
                    className="absolute inset-0 rounded-2xl bg-gradient-to-t from-accent/5 to-transparent pointer-events-none"
                    animate={{ opacity: [0, 0.4, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.8 }}
                  />
                </motion.div>
              )}
            </div>
          </div>
        </ScrollReveal>
      ))}
    </div>
  </section>
);
