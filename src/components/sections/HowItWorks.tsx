import { ScrollReveal } from "@/components/ScrollReveal";
import { Search, Settings, Rocket } from "lucide-react";

const steps = [
  {
    icon: Search,
    color: "bg-accent text-accent-foreground",
    title: "Free Route Audit",
    body: "We analyze your current routes, assignments, and contractor rates. You get a report showing exactly where you're overspending.",
    duration: "Weeks 1–2",
  },
  {
    icon: Settings,
    color: "bg-navy text-primary-foreground",
    title: "Configure & Integrate",
    body: "Import student data, connect GPS feeds, map your routes, and customize your dashboards. Full system setup with white-glove support.",
    duration: "Weeks 3–8",
  },
  {
    icon: Rocket,
    color: "bg-success text-success-foreground",
    title: "Launch & Optimize",
    body: "Go live with full automation. Staff training, quarterly performance reviews, and continuous optimization to maximize savings year over year.",
    duration: "Weeks 9–12",
  },
];

export const HowItWorks = () => (
  <section className="bg-secondary py-20 md:py-28" id="how-it-works">
    <div className="mx-auto max-w-[1200px] px-4 md:px-6">
      <ScrollReveal>
        <div className="text-center mb-14">
          <p className="text-sm font-bold uppercase tracking-widest text-accent mb-3">Getting Started</p>
          <h2 className="font-display text-3xl font-bold md:text-4xl lg:text-5xl">
            From analysis to optimization in 12 weeks.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Three steps. Zero disruption. No commitment until you see the savings.
          </p>
        </div>
      </ScrollReveal>

      <div className="relative grid gap-8 md:grid-cols-3">
        {/* Connector line */}
        <div className="absolute top-14 left-[16.66%] right-[16.66%] hidden md:block h-0.5 bg-border" />

        {steps.map((s, i) => (
          <ScrollReveal key={i} delay={i * 0.12}>
            <div className="text-center relative">
              <div className={`mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full ${s.color} shadow-lg relative z-10`}>
                <s.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-bold mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">{s.body}</p>
              <span className="text-xs font-semibold uppercase tracking-wide text-accent">{s.duration}</span>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  </section>
);
