import { ScrollReveal } from "@/components/ScrollReveal";
import { MapPin } from "lucide-react";

export const TrustBar = () => (
  <section className="bg-secondary py-6">
    <ScrollReveal>
      <div className="mx-auto flex max-w-[1200px] items-center justify-center gap-3 px-4 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4 text-accent" />
        <span className="font-semibold tracking-wide uppercase text-xs">Serving school districts nationwide</span>
      </div>
    </ScrollReveal>
  </section>
);
