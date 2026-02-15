import { ScrollReveal } from "@/components/ScrollReveal";
import { ArrowRight, ClipboardCheck, TrendingUp, Shield, BarChart3 } from "lucide-react";

const auditBenefits = [
  {
    icon: ClipboardCheck,
    title: "Full Route Analysis",
    description: "We audit every route, stop, and assignment to find ghost routes, overlapping coverage, and under-utilized buses.",
  },
  {
    icon: TrendingUp,
    title: "Projected Savings Report",
    description: "Get a detailed breakdown of where your district is overspending — with dollar figures you can take to the board.",
  },
  {
    icon: Shield,
    title: "Contractor Invoice Review",
    description: "We cross-reference your invoices against actual service data to flag overbilling and benchmark rates.",
  },
  {
    icon: BarChart3,
    title: "Custom Optimization Plan",
    description: "A prioritized action plan showing which changes deliver the biggest savings in the shortest time.",
  },
];

export const PricingSection = ({ onGetAudit }: { onGetAudit?: () => void }) => {
  return (
    <section className="bg-background py-20 md:py-28" id="pricing">
      <div className="mx-auto max-w-[1000px] px-4 md:px-6">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-12">
            <p className="text-sm font-bold uppercase tracking-widest text-accent mb-3">
              Free Operational Audit
            </p>
            <h2 className="font-display text-3xl font-bold md:text-4xl lg:text-5xl">
              See Your Savings <span className="italic text-accent">Before</span> You Commit
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
              We'll analyze your routes, contractor invoices, and student assignments — then deliver a board-ready report showing exactly where you're overspending. No cost. No obligation.
            </p>
          </div>
        </ScrollReveal>

        {/* Benefits Grid */}
        <div className="grid gap-6 sm:grid-cols-2 mb-12">
          {auditBenefits.map((b, i) => (
            <ScrollReveal key={b.title} delay={i * 0.08}>
              <div className="rounded-xl border border-border bg-card p-6 h-full hover:border-accent/30 hover:shadow-md transition-all">
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-accent/10 p-2.5 flex-shrink-0">
                    <b.icon className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold mb-1">{b.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{b.description}</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* CTA Card */}
        <ScrollReveal>
          <div className="rounded-2xl bg-navy p-8 md:p-12 text-center">
            <h3 className="font-display text-2xl font-bold text-primary-foreground md:text-3xl">
              Most districts save <span className="text-accent">$710K–$1.6M</span> in Year 1
            </h3>
            <p className="mt-3 text-primary-foreground/60 max-w-lg mx-auto text-sm">
              Results delivered in two weeks. Zero disruption to your current operations. Your data stays secure and confidential.
            </p>
            <button
              onClick={onGetAudit}
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-accent px-8 py-4 text-base font-bold text-accent-foreground shadow-lg shadow-accent/20 hover:bg-gold-light transition-colors"
            >
              Schedule Your Free Audit <ArrowRight className="h-5 w-5" />
            </button>
            <p className="mt-4 text-xs text-primary-foreground/40">
              Takes 15 minutes to set up · No contracts · No credit card required
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
