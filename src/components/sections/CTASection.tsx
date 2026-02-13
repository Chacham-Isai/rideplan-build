import { ScrollReveal } from "@/components/ScrollReveal";
import { ArrowRight } from "lucide-react";

export const CTASection = ({ onGetAudit }: { onGetAudit?: () => void }) => (
  <section className="bg-secondary py-20 md:py-28" id="cta">
    <div className="mx-auto max-w-[1200px] px-4 md:px-6">
      <ScrollReveal>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy to-navy-mid p-10 md:p-16 text-center">
          {/* Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-accent/10 blur-[120px]" />

          <div className="relative">
            <h2 className="font-display text-3xl font-bold text-primary-foreground md:text-4xl lg:text-5xl">
              Stop Guessing.{" "}
              <span className="italic text-accent">Start Optimizing.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-primary-foreground/60">
              We'll analyze your data and show you exactly where the savings are. Results delivered in two weeks. No cost. No obligation.
            </p>
            <button
              onClick={onGetAudit}
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-accent px-8 py-4 text-sm font-bold text-accent-foreground hover:bg-gold-light transition shadow-lg shadow-accent/25"
            >
              Schedule Your Free Route Audit <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </ScrollReveal>
    </div>
  </section>
);
