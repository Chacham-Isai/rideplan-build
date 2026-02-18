import { ScrollReveal } from "@/components/ScrollReveal";
import { MapPin, Shield, Award, Star } from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";

const PARTNER_LOGOS = [
  { name: "NYC DOE", initials: "NYC", accent: "hsl(var(--accent))" },
  { name: "LA Unified", initials: "LAUSD", accent: "hsl(var(--success))" },
  { name: "Chicago PS", initials: "CPS", accent: "hsl(var(--accent))" },
  { name: "Houston ISD", initials: "HISD", accent: "hsl(var(--success))" },
  { name: "Miami-Dade", initials: "MDCPS", accent: "hsl(var(--accent))" },
  { name: "Dallas ISD", initials: "DISD", accent: "hsl(var(--success))" },
  { name: "Fairfax County", initials: "FCPS", accent: "hsl(var(--accent))" },
  { name: "Montgomery Co", initials: "MCPS", accent: "hsl(var(--success))" },
  { name: "DeKalb County", initials: "DCSD", accent: "hsl(var(--accent))" },
  { name: "Wake County", initials: "WCPSS", accent: "hsl(var(--success))" },
  { name: "Prince George's", initials: "PGCPS", accent: "hsl(var(--accent))" },
  { name: "Gwinnett County", initials: "GCPS", accent: "hsl(var(--success))" },
];

const TRUST_BADGES = [
  { icon: Shield, label: "SOC 2 Certified" },
  { icon: Award, label: "FERPA Compliant" },
  { icon: Star, label: "Top Rated 2025" },
];

export const TrustBar = () => {
  const { count, ref } = useCountUp(150, 2000);
  const doubled = [...PARTNER_LOGOS, ...PARTNER_LOGOS];

  return (
    <section className="bg-secondary py-10 overflow-hidden" ref={ref}>
      {/* Trust badges row */}
      <ScrollReveal>
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-center gap-6 px-4 mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-accent" />
            <span className="font-semibold tracking-wide uppercase text-xs">
              Trusted by <span className="text-accent font-bold">{count}+</span> school districts nationwide
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            {TRUST_BADGES.map((badge) => (
              <div
                key={badge.label}
                className="flex items-center gap-1.5 rounded-full border border-success/20 bg-success/5 px-3 py-1"
              >
                <badge.icon className="h-3.5 w-3.5 text-success" />
                <span className="text-[11px] font-semibold text-success whitespace-nowrap">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* Scrolling logo ticker */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-secondary to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-secondary to-transparent z-10 pointer-events-none" />

        <div className="flex animate-scroll-logos">
          {doubled.map((logo, i) => (
            <div
              key={`${logo.name}-${i}`}
              className="flex-shrink-0 mx-4 flex items-center justify-center"
            >
              <div className="group flex items-center gap-2.5 px-4 py-2.5 rounded-lg border border-border/40 bg-background/70 backdrop-blur-sm shadow-sm transition-all duration-300 hover:shadow-md hover:border-accent/30 hover:-translate-y-0.5">
                <div
                  className="w-9 h-9 rounded-md flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: `${logo.accent}15` }}
                >
                  <span
                    className="text-[9px] font-black leading-none tracking-tight"
                    style={{ color: logo.accent }}
                  >
                    {logo.initials}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-foreground/80 whitespace-nowrap">{logo.name}</span>
                  <span className="text-[10px] text-muted-foreground/60">School District</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
