import { ScrollReveal } from "@/components/ScrollReveal";
import happyStudentsImg from "@/assets/rideline-happy-students.png";

export const TestimonialBanner = () => (
  <section className="relative overflow-hidden bg-navy py-16 md:py-24">
    {/* Background image */}
    <div className="absolute inset-0">
      <img src={happyStudentsImg} alt="" className="h-full w-full object-cover opacity-[0.1]" />
      <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/95 to-navy" />
    </div>

    <div className="relative mx-auto max-w-[900px] px-4 md:px-6 text-center">
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
