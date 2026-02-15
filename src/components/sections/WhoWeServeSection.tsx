import { ScrollReveal } from "@/components/ScrollReveal";
import { User, PieChart, Briefcase, Heart } from "lucide-react";

const personas = [
  {
    icon: Briefcase,
    role: "Transportation Director",
    headline: "Your command center, finally.",
    painPoints: [
      "Drowning in spreadsheets and manual route planning",
      "Spending hours on compliance reports",
      "No visibility into contractor performance",
    ],
    solution: "RideLine gives you a single dashboard to manage routes, monitor contractors, and generate compliance reports automatically — so you can focus on operations, not paperwork.",
    cta: "See how directors save 20+ hours/week",
  },
  {
    icon: PieChart,
    role: "Superintendent / CFO",
    headline: "Turn your biggest cost center into savings.",
    painPoints: [
      "Transportation is 2nd largest budget line item",
      "No data to justify budget decisions to the board",
      "Contractor costs rising with no accountability",
    ],
    solution: "RideLine delivers board-ready dashboards, real-time cost visibility, and AI-powered scenario modeling so you can make data-driven decisions that save $710K–$1.6M annually.",
    cta: "See the financial impact",
  },
  {
    icon: User,
    role: "Route Planner / Dispatcher",
    headline: "Plan routes in minutes, not days.",
    painPoints: [
      "Manually adjusting routes for every enrollment change",
      "Juggling student assignments across dozens of buses",
      "Fielding constant parent calls about bus status",
    ],
    solution: "RideLine's AI auto-assigns students, optimizes routes, and sends real-time updates to parents — eliminating 60% of office calls and hours of daily manual work.",
    cta: "See how planners reclaim their time",
  },
  {
    icon: Heart,
    role: "Parent / Guardian",
    headline: "Know exactly where your child's bus is.",
    painPoints: [
      "Standing at the stop wondering if the bus is coming",
      "No way to know if your child arrived safely",
      "Calling the school office for basic information",
    ],
    solution: "The RideLine parent app gives you real-time GPS tracking, instant arrival notifications, digital bus passes, and a self-service portal in your language — so you always know your child is safe.",
    cta: "See the parent experience",
  },
];

export const WhoWeServeSection = () => (
  <section className="bg-navy py-20 md:py-28" id="who-we-serve">
    <div className="mx-auto max-w-[1200px] px-4 md:px-6">
      <ScrollReveal>
        <div className="text-center mb-14">
          <p className="text-sm font-bold uppercase tracking-widest text-accent mb-3">
            Who We Serve
          </p>
          <h2 className="font-display text-3xl font-bold text-primary-foreground md:text-4xl lg:text-5xl">
            Built for Everyone in the <span className="italic text-accent">Transportation Ecosystem</span>
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-primary-foreground/60">
            Whether you're planning routes, managing budgets, or waiting at the bus stop — RideLine is designed for you.
          </p>
        </div>
      </ScrollReveal>

      <div className="grid gap-6 md:grid-cols-2">
        {personas.map((p, i) => (
          <ScrollReveal key={i} delay={i * 0.1}>
            <div className="group rounded-2xl border border-primary-foreground/10 bg-primary-foreground/5 p-6 md:p-8 transition-all duration-300 hover:border-accent/40 hover:shadow-[0_0_40px_-12px_hsl(var(--gold)/0.3)] h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20 text-accent">
                  <p.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-accent">{p.role}</p>
                  <h3 className="font-display text-lg font-bold text-primary-foreground">{p.headline}</h3>
                </div>
              </div>

              {/* Pain points */}
              <div className="mb-4 space-y-2">
                {p.painPoints.map((point, j) => (
                  <div key={j} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-destructive/60 shrink-0" />
                    <span className="text-sm text-primary-foreground/50">{point}</span>
                  </div>
                ))}
              </div>

              {/* Solution */}
              <p className="text-sm text-primary-foreground/70 leading-relaxed mb-6 flex-1">
                {p.solution}
              </p>

              {/* CTA */}
              <button className="inline-flex items-center text-sm font-semibold text-accent hover:text-gold-light transition-colors">
                {p.cta} →
              </button>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  </section>
);
