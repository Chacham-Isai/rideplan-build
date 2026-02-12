import { ScrollReveal } from "@/components/ScrollReveal";
import { MapPin, FileText, Phone, DollarSign, Users, Accessibility } from "lucide-react";

const problems = [
  {
    icon: MapPin,
    title: "Routes Planned on Legacy Knowledge",
    body: "Coordinators manually plot routes using paper maps and local knowledge. Routes are inherited and rarely re-optimized, wasting $200K–$900K annually.",
  },
  {
    icon: FileText,
    title: "Contractor Invoices Go Unverified",
    body: "Bus companies bill based on contracted rates. No one audits actual miles, students transported, or route adherence — resulting in $100K–$400K in overbilling.",
  },
  {
    icon: Phone,
    title: "Parents Overwhelm the Office",
    body: "Paper assignment letters, phone trees for delays. Parents call dispatch for every bus issue, overwhelming 1–2 staff members with 15–30 complaints daily.",
  },
  {
    icon: DollarSign,
    title: "No Cost-Per-Student Visibility",
    body: "Districts can't tell the board what they pay per student, per route, or per contractor. Budgets are lump-sum line items — 85–90% of districts operate blind.",
  },
  {
    icon: Users,
    title: "91% Report Driver Shortages",
    body: "Districts cancel routes, double-up runs, and extend walk zones. 40% have curtailed services entirely. Students miss school, absenteeism rises 15–20%.",
  },
  {
    icon: Accessibility,
    title: "SPED Costs Are Exploding",
    body: "Special ed transport runs separate routes at 3–5x cost. Minimal ride-sharing or coordination means it consumes 25–40% of your entire transportation budget.",
  },
];

export const ProblemSection = () => (
  <section className="bg-background py-20 md:py-28" id="problems">
    <div className="mx-auto max-w-[1200px] px-4 md:px-6">
      <ScrollReveal>
        <div className="text-center mb-14">
          <p className="text-sm font-bold uppercase tracking-widest text-destructive mb-3">The Problem</p>
          <h2 className="font-display text-3xl font-bold md:text-4xl lg:text-5xl">
            Your $12M+ budget is managed with spreadsheets.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Transportation is your district's largest outsourced line item — yet it runs on paper maps, inherited routes, and zero data.
          </p>
        </div>
      </ScrollReveal>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {problems.map((p, i) => (
          <ScrollReveal key={i} delay={i * 0.08}>
            <div className="group rounded-xl border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-t-destructive hover:border-t-2">
              <p.icon className="h-8 w-8 text-destructive mb-4" />
              <h3 className="font-display text-lg font-bold mb-2">{p.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.body}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  </section>
);
