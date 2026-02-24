import { ScrollReveal } from "@/components/ScrollReveal";
import { MapPin, FileText, Phone, DollarSign, Users, Accessibility } from "lucide-react";

const problems = [
  {
    icon: MapPin,
    title: "Routes Built on Guesswork",
    body: "Coordinators inherit decades-old routes plotted on paper maps. Without optimization tools, districts run 10–15 redundant routes — burning through $300K–$900K every year on buses that shouldn't exist.",
  },
  {
    icon: FileText,
    title: "Contractor Invoices Go Unchecked",
    body: "Bus companies invoice based on contracted rates with no GPS verification. Districts overpay $150K–$500K annually on routes never driven, miles never traveled, and students never picked up.",
  },
  {
    icon: Phone,
    title: "Parents Flood the Office",
    body: "No tracking, no self-service portal, no automated alerts. Parents call dispatch 20–40 times daily for bus updates, overwhelming 1–2 staff members and creating a bottleneck every morning.",
  },
  {
    icon: DollarSign,
    title: "Zero Cost-Per-Student Visibility",
    body: "88% of districts cannot tell their board what they pay per student, per route, or per contractor. Budgets are lump-sum line items with no accountability or benchmarking data.",
  },
  {
    icon: Users,
    title: "86% Report Driver Shortages",
    body: "Districts cancel routes, double-up runs, and extend walk zones. Over 40% have curtailed service entirely — leading to 12–18% higher chronic absenteeism in affected areas.",
  },
  {
    icon: Accessibility,
    title: "Special Ed Costs Are Spiraling",
    body: "SPED transport runs isolated routes at 3–5× the cost per student. Without ride-sharing coordination, it consumes 30–45% of total transportation spend — and growing 8% year over year.",
  },
];

export const ProblemSection = () => (
  <section className="bg-background py-20 md:py-28" id="problems">
    <div className="mx-auto max-w-[1200px] px-4 md:px-6">
      <ScrollReveal>
        <div className="text-center mb-14">
          <p className="text-sm font-bold uppercase tracking-widest text-destructive mb-3">The Problem</p>
          <h2 className="font-display text-3xl font-bold md:text-4xl lg:text-5xl">
            Your $14M+ budget runs on inherited routes and zero data.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Transportation is your district's largest outsourced line item — yet most coordinators still manage it with spreadsheets, paper maps, and phone trees.
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
