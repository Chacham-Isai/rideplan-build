import { ScrollReveal } from "@/components/ScrollReveal";
import { MapPin } from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";

export const TrustBar = () => {
  const { count, ref } = useCountUp(150, 2000);

  return (
    <section className="bg-secondary py-6" ref={ref}>
      <ScrollReveal>
        <div className="mx-auto flex max-w-[1200px] items-center justify-center gap-3 px-4 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 text-accent" />
          <span className="font-semibold tracking-wide uppercase text-xs">
            Serving <span className="text-accent">{count}+</span> school districts nationwide
          </span>
        </div>
      </ScrollReveal>
    </section>
  );
};
