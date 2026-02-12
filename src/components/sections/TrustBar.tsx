import { ScrollReveal } from "@/components/ScrollReveal";

const states = ["New York", "New Jersey", "Connecticut", "Pennsylvania", "Maryland", "Delaware"];

export const TrustBar = () => (
  <section className="bg-secondary py-6">
    <ScrollReveal>
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4 text-sm text-muted-foreground">
        <span className="font-medium">Built for districts across</span>
        {states.map((s) => (
          <span key={s} className="font-semibold tracking-wide uppercase text-xs opacity-60">{s}</span>
        ))}
      </div>
    </ScrollReveal>
  </section>
);
