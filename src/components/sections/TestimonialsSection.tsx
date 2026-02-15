import { ScrollReveal } from "@/components/ScrollReveal";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    quote: "RideLine identified 8 unnecessary routes in our first month. We saved $640,000 in Year 1 — and our drivers are happier with more efficient routes.",
    name: "Patricia Hernandez",
    title: "Director of Transportation",
    district: "Westchester County School District",
    savings: "$640K saved",
    metric: "8 routes eliminated",
  },
  {
    quote: "Before RideLine, we were drowning in parent phone calls every morning. Now parents track buses in real-time, and our office calls dropped by 65%.",
    name: "James Okonkwo",
    title: "Transportation Coordinator",
    district: "Bergen County Schools",
    savings: "65% fewer calls",
    metric: "3,200+ parents onboarded",
  },
  {
    quote: "The contractor oversight module caught $180,000 in overbilling we never would have found. RideLine paid for itself before the first semester ended.",
    name: "Linda Chen",
    title: "Chief Financial Officer",
    district: "Suffolk County BOCES",
    savings: "$180K recovered",
    metric: "Invoice fraud detected",
  },
  {
    quote: "STAC reports that used to take our team two weeks are now generated automatically. Compliance has gone from our biggest headache to a non-issue.",
    name: "Robert Williams",
    title: "Superintendent",
    district: "Dutchess County School District",
    savings: "80+ hours saved",
    metric: "Auto-generated reports",
  },
];

export const TestimonialsSection = () => (
  <section className="bg-background py-20 md:py-28" id="testimonials">
    <div className="mx-auto max-w-[1200px] px-4 md:px-6">
      <ScrollReveal>
        <div className="text-center mb-14">
          <p className="text-sm font-bold uppercase tracking-widest text-accent mb-3">
            Trusted by Districts
          </p>
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
            What Transportation Leaders <span className="italic text-accent">Are Saying</span>
          </h2>
        </div>
      </ScrollReveal>

      <div className="grid gap-6 md:grid-cols-2">
        {testimonials.map((t, i) => (
          <ScrollReveal key={i} delay={i * 0.1}>
            <div className="group relative rounded-2xl border border-border bg-card p-6 md:p-8 transition-all duration-300 hover:border-accent/40 hover:shadow-[0_0_40px_-12px_hsl(var(--gold)/0.2)]">
              {/* Quote icon */}
              <Quote className="absolute top-6 right-6 h-8 w-8 text-accent/10 group-hover:text-accent/20 transition-colors" />

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-accent text-accent" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-foreground leading-relaxed mb-6">
                "{t.quote}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center text-sm font-bold text-accent">
                      {t.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.title}</p>
                      <p className="text-xs text-muted-foreground">{t.district}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="inline-block rounded-full bg-success/20 px-3 py-1 text-xs font-semibold text-success">
                    {t.savings}
                  </span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  </section>
);
