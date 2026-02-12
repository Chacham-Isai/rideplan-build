import { ScrollReveal } from "@/components/ScrollReveal";
import { Check } from "lucide-react";
import routeOptImg from "@/assets/rideline-route-optimization.png";
import costSavingsImg from "@/assets/rideline-cost-savings.png";
import dashboardImg from "@/assets/rideline-dashboard.png";

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
    image: dashboardImg,
    imageAlt: "RideLine Dashboard View",
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
    image: routeOptImg,
    imageAlt: "RideLine Route Optimization",
    reversed: true,
  },
  {
    eyebrow: "Contractor Oversight",
    headline: "You Still Carry the Liability. We Help You Manage It.",
    body: "Your contractors run the buses. You run everything else. RideLine gives you the data to verify every invoice, benchmark every rate, and track every route.",
    checks: [
      "Invoice verification: cross-reference against actual GPS data",
      "Rate benchmarking against neighboring districts",
      "Insurance compliance tracking with automated lapse alerts",
      "Performance scorecards: on-time rates & contract adherence",
      "Broker-ready safety data from telematics",
    ],
    image: costSavingsImg,
    imageAlt: "RideLine Cost Savings",
    reversed: false,
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
              <img
                src={f.image}
                alt={f.imageAlt}
                className="w-full rounded-2xl shadow-xl"
                loading="lazy"
              />
            </div>
          </div>
        </ScrollReveal>
      ))}
    </div>
  </section>
);
