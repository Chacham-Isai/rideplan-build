import { ScrollReveal } from "@/components/ScrollReveal";
import { MapPin } from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";

const PARTNER_LOGOS = [
  { name: "NYC DOE", initials: "NYC" },
  { name: "LA Unified", initials: "LAUSD" },
  { name: "Chicago PS", initials: "CPS" },
  { name: "Houston ISD", initials: "HISD" },
  { name: "Miami-Dade", initials: "MDCPS" },
  { name: "Dallas ISD", initials: "DISD" },
  { name: "Fairfax County", initials: "FCPS" },
  { name: "Montgomery Co", initials: "MCPS" },
  { name: "DeKalb County", initials: "DCSD" },
  { name: "Wake County", initials: "WCPSS" },
  { name: "Prince George's", initials: "PGCPS" },
  { name: "Gwinnett County", initials: "GCPS" },
];

export const TrustBar = () => {
  const { count, ref } = useCountUp(150, 2000);
  const doubled = [...PARTNER_LOGOS, ...PARTNER_LOGOS];

  return (
    <section className="bg-secondary py-8 overflow-hidden" ref={ref}>
      <ScrollReveal>
        <div className="mx-auto flex max-w-[1200px] items-center justify-center gap-3 px-4 text-sm text-muted-foreground mb-6">
          <MapPin className="h-4 w-4 text-accent" />
          <span className="font-semibold tracking-wide uppercase text-xs">
            Trusted by <span className="text-accent">{count}+</span> school districts nationwide
          </span>
        </div>
      </ScrollReveal>

      {/* Scrolling logo ticker */}
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-secondary to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-secondary to-transparent z-10 pointer-events-none" />

        <div className="flex animate-scroll-logos">
          {doubled.map((logo, i) => (
            <div
              key={`${logo.name}-${i}`}
              className="flex-shrink-0 mx-6 flex items-center justify-center"
            >
              <div className="flex items-center gap-2 px-4 py-2 rounded-md border border-border/50 bg-background/50 backdrop-blur-sm">
                <div className="w-8 h-8 rounded bg-accent/10 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-accent leading-none">{logo.initials}</span>
                </div>
                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">{logo.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
