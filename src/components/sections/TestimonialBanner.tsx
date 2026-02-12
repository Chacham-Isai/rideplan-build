import { ScrollReveal } from "@/components/ScrollReveal";

export const TestimonialBanner = () => (
  <section className="bg-navy py-16 md:py-24">
    <div className="mx-auto max-w-[900px] px-4 md:px-6 text-center">
      <ScrollReveal>
        <blockquote className="font-display text-xl italic leading-relaxed text-primary-foreground md:text-2xl lg:text-3xl">
          "At $75K–$100K per year, RideLine costs less than a single route planner salary — while delivering $710K–$1.6M in total annual savings."
        </blockquote>
        <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-accent">
          The RideLine Promise — Proven ROI from Day One
        </p>
      </ScrollReveal>
    </div>
  </section>
);
