import { ScrollReveal } from "@/components/ScrollReveal";
import { Users, Route, ClipboardCheck, MessageSquare, Shield, Brain } from "lucide-react";
import administratorImg from "@/assets/rideline-administrator.png";

const modules = [
  {
    icon: Users,
    title: "Student Assignment",
    body: "Every kid matched to the right bus, right stop, right route — automatically. Geocoded addresses, walk zone engine, capacity management, and mass assignment tools.",
    tag: "Auto-assign in seconds",
  },
  {
    icon: Route,
    title: "Route Optimization",
    body: "AI identifies overlapping routes and under-utilized buses to determine actual need vs. paid routes. Eliminates 5–10 unnecessary routes per district.",
    tag: "$400K–$900K saved",
  },
  {
    icon: ClipboardCheck,
    title: "Contractor Oversight",
    body: "Cross-reference invoices against actual GPS data. Benchmark per-route and per-mile rates against neighboring districts. Never pay for services not received.",
    tag: "Invoice verification",
  },
  {
    icon: MessageSquare,
    title: "Parent Communication",
    body: "Real-time GPS tracking, digital bus passes, automated assignment letters, schedule change alerts, and a multilingual self-service portal for parents.",
    tag: "60% fewer office calls",
  },
  {
    icon: Shield,
    title: "Compliance & Reporting",
    body: "Auto-generated BEDS, STAC, IDEA, and McKinney-Vento reports. All compliance data stored and ready for instant retrieval. Audit-ready at all times.",
    tag: "Auto-generated",
  },
  {
    icon: Brain,
    title: "AI Analytics",
    body: "Natural language queries, predictive enrollment modeling, scenario modeling for bell time changes, and board-ready dashboards with real-time cost visibility.",
    tag: "Predictive intelligence",
  },
];

export const PlatformSection = () => (
  <section className="bg-navy py-20 md:py-28" id="platform">
    <div className="mx-auto max-w-[1200px] px-4 md:px-6">
      <ScrollReveal>
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-accent mb-3">The Platform</p>
            <h2 className="font-display text-3xl font-bold text-primary-foreground md:text-4xl lg:text-5xl">
              One command center for everything your office does.
            </h2>
            <p className="mt-4 max-w-2xl text-primary-foreground/60">
              RideLine is the first purpose-built operating system for K–12 school transportation. Five modules. One platform. Total control.
            </p>
          </div>
          <div className="relative">
            <div className="absolute -inset-3 rounded-2xl bg-gradient-to-br from-accent/10 to-success/5 blur-xl" />
            <img
              src={administratorImg}
              alt="District administrator using RideLine platform"
              className="relative rounded-2xl shadow-xl border border-primary-foreground/10"
              loading="lazy"
            />
          </div>
        </div>
      </ScrollReveal>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((m, i) => (
          <ScrollReveal key={i} delay={i * 0.08}>
            <div className="group rounded-xl border border-primary-foreground/10 bg-primary-foreground/5 p-6 transition-all duration-300 hover:border-accent/50 hover:shadow-[0_0_30px_-10px_hsl(var(--gold)/0.3)]">
              <m.icon className="h-8 w-8 text-accent mb-4" />
              <h3 className="font-display text-lg font-bold text-primary-foreground mb-2">{m.title}</h3>
              <p className="text-sm text-primary-foreground/60 leading-relaxed mb-4">{m.body}</p>
              <span className="inline-block rounded-full bg-success/20 px-3 py-1 text-xs font-semibold text-success">
                {m.tag}
              </span>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  </section>
);
