import { useNavigate } from "react-router-dom";
import { ShieldAlert, Bus, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const pillars = [
  {
    icon: ShieldAlert,
    title: "Parent Safety Portal",
    description: "Report bullying or driver safety concerns anonymously. Reports are automatically routed to the school and bus company, with AI monitoring for repeat patterns on the same bus.",
    cta: "Report a Concern",
    href: "/report",
    accent: "text-red-500",
    bgAccent: "bg-red-500/10",
  },
  {
    icon: Bus,
    title: "Driver Portal",
    description: "Drivers can report incidents, flag maintenance issues, or request schedule changes — all from one simple form. Helps keep communication clear and buses safe.",
    cta: "Driver Portal",
    href: "/driver-portal",
    accent: "text-accent",
    bgAccent: "bg-accent/10",
  },
  {
    icon: Heart,
    title: "Tip Your Driver",
    description: "Show appreciation during holidays, bad weather, or just because. A small tip and a thank-you note go a long way to keep great drivers behind the wheel.",
    cta: "Tip a Driver",
    href: "/tip-driver",
    accent: "text-pink-500",
    bgAccent: "bg-pink-500/10",
  },
];

export const SafetyDriverSection = () => {
  const navigate = useNavigate();
  const { ref, isInView } = useScrollReveal();

  return (
    <section id="safety" className="py-20 bg-muted/30" ref={ref}>
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        <div
          className="text-center mb-14"
          style={{ opacity: isInView ? 1 : 0, transform: isInView ? "none" : "translateY(30px)", transition: "all 0.6s ease" }}
        >
          <span className="inline-block rounded-full bg-accent/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-accent mb-4">
            Safety & Driver Experience
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everyone Has a Voice
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Parents report concerns, drivers communicate needs, and AI watches for patterns — so nothing slips through the cracks.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {pillars.map((p, i) => (
            <div
              key={p.title}
              className="rounded-2xl border bg-card p-8 flex flex-col items-start hover:shadow-lg transition-shadow"
              style={{
                opacity: isInView ? 1 : 0,
                transform: isInView ? "none" : "translateY(30px)",
                transition: `all 0.6s ease ${0.15 * (i + 1)}s`,
              }}
            >
              <div className={`rounded-xl p-3 mb-5 ${p.bgAccent}`}>
                <p.icon className={`h-7 w-7 ${p.accent}`} />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-3">{p.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed flex-1 mb-6">{p.description}</p>
              <Button variant="outline" onClick={() => navigate(p.href)}>
                {p.cta} →
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
