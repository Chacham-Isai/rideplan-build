import { ScrollReveal } from "@/components/ScrollReveal";

const stats = [
  { value: "1,543", accent: "+", label: "Target districts in the Mid-Atlantic & Northeast" },
  { value: "$15", accent: "B", label: "Annual transportation spend in target region" },
  { value: "91", accent: "%", label: "Of districts report driver shortages" },
  { value: "70", accent: "%", label: "Still plan routes on paper & spreadsheets" },
];

export const ByTheNumbers = () => (
  <section className="bg-background py-20 md:py-28">
    <div className="mx-auto max-w-[1200px] px-4 md:px-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <ScrollReveal key={i} delay={i * 0.1}>
            <div className="rounded-xl border bg-card p-8 text-center">
              <div className="font-display text-4xl font-bold md:text-5xl">
                {s.value}
                <span className="text-accent">{s.accent}</span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{s.label}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  </section>
);
