import { ScrollReveal } from "@/components/ScrollReveal";

const items = [
  { label: "Route Consolidation", value: "$400K–$900K" },
  { label: "Rate Negotiation Leverage", value: "$150K–$350K" },
  { label: "Insurance Optimization", value: "$50K–$120K" },
  { label: "Staff Productivity Gains", value: "$80K–$150K" },
  { label: "STAC Reimbursement Recovery", value: "$30K–$75K" },
];

export const ROISection = () => (
  <section className="bg-background py-20 md:py-28" id="savings">
    <div className="mx-auto max-w-[1200px] px-4 md:px-6">
      <ScrollReveal>
        <div className="rounded-2xl bg-gradient-to-br from-navy to-navy-mid p-8 md:p-14 lg:p-16 overflow-hidden relative">
          {/* Glow */}
          <div className="absolute top-0 right-0 h-[300px] w-[300px] rounded-full bg-accent/10 blur-[100px]" />

          <div className="relative grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
            {/* Left */}
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-accent mb-4">Year 1 Impact</p>
              <h2 className="font-display text-3xl font-bold text-primary-foreground md:text-4xl mb-4">
                The cost of doing nothing is too high.
              </h2>
              <p className="text-primary-foreground/60 leading-relaxed mb-6">
                Based on a typical district with 5,000 transported students, 45 contracted routes, and your annual transportation budget.
              </p>
              <span className="inline-block rounded-full bg-accent/20 px-5 py-2 text-sm font-bold text-accent">
                ROI: 12–25x in Year 1
              </span>
            </div>

            {/* Right */}
            <div className="space-y-3">
              {items.map((item, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-primary-foreground/5 border border-primary-foreground/10 px-5 py-3">
                  <span className="text-sm text-primary-foreground/70">{item.label}</span>
                  <span className="font-semibold text-success">{item.value}</span>
                </div>
              ))}
              <div className="flex items-center justify-between rounded-lg bg-accent/10 border-2 border-accent/30 px-5 py-4 mt-2">
                <span className="text-sm font-bold text-accent">Total Annual Savings</span>
                <span className="font-display text-xl font-bold text-accent">$710K–$1.6M</span>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </div>
  </section>
);
