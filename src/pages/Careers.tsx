import { useState } from "react";
import { motion } from "framer-motion";
import { SEOHead } from "@/components/SEOHead";
import { Navigation } from "@/components/sections/Navigation";
import { Footer } from "@/components/sections/Footer";
import { ContactFormModal } from "@/components/ContactFormModal";
import { ScrollReveal } from "@/components/ScrollReveal";
import {
  Heart, Zap, Globe, GraduationCap, Clock, DollarSign,
  MapPin, ArrowRight, Briefcase, Users, TreePine, Laptop,
} from "lucide-react";

/* ── Culture Values ── */
const cultureValues = [
  {
    icon: Heart,
    title: "Mission That Matters",
    description: "Every line of code you write helps a kid get to school safely. We're not optimizing ad clicks — we're solving real problems for real communities.",
  },
  {
    icon: Users,
    title: "Small Team, Big Impact",
    description: "We're a tight-knit crew where everyone's work ships to production. No layers of bureaucracy — just smart people making things happen.",
  },
  {
    icon: Zap,
    title: "Move Fast, Stay Thoughtful",
    description: "We ship weekly. But we also think deeply about the districts we serve. Speed without empathy doesn't work in education.",
  },
  {
    icon: GraduationCap,
    title: "Learn Constantly",
    description: "Conference budgets, book stipends, and dedicated learning time. We invest in your growth because better people build better products.",
  },
];

/* ── Perks & Benefits ── */
const perks = [
  { icon: Laptop, title: "Remote-First", description: "Work from anywhere in the US. We gather quarterly for team retreats." },
  { icon: DollarSign, title: "Competitive Pay + Equity", description: "Top-of-market salary with meaningful equity in a high-growth company." },
  { icon: TreePine, title: "Unlimited PTO", description: "We trust you to manage your time. Minimum 3 weeks encouraged." },
  { icon: Clock, title: "Flexible Hours", description: "Async by default. Overlap with your team 4 hours/day — the rest is up to you." },
  { icon: Heart, title: "Full Benefits", description: "Medical, dental, vision for you and your family. 401(k) with match." },
  { icon: Globe, title: "Quarterly Retreats", description: "In-person offsites in great locations. Team-building without the cringe." },
];

/* ── Open Positions ── */
const departments = ["All", "Engineering", "Product", "Partnerships", "Growth", "Operations"] as const;

const openings = [
  {
    title: "Senior Full-Stack Engineer",
    department: "Engineering",
    location: "Remote (US)",
    type: "Full-time",
    description: "Build the core platform that powers route optimization, real-time tracking, and contractor management for school districts nationwide.",
  },
  {
    title: "Staff Backend Engineer",
    department: "Engineering",
    location: "Remote (US)",
    type: "Full-time",
    description: "Design and scale our data pipeline processing millions of daily student transport events with sub-second latency requirements.",
  },
  {
    title: "Data Scientist — Route Optimization",
    department: "Engineering",
    location: "Remote (US)",
    type: "Full-time",
    description: "Develop ML models that optimize bus routing across complex constraints including bell times, walk zones, and contractor capacity.",
  },
  {
    title: "Product Designer",
    department: "Product",
    location: "Remote (US)",
    type: "Full-time",
    description: "Design intuitive interfaces for transportation coordinators who are replacing decades-old spreadsheet workflows.",
  },
  {
    title: "District Success Manager",
    department: "Partnerships",
    location: "Remote (US)",
    type: "Full-time",
    description: "Own the relationship with 8–12 school districts, driving adoption, measuring ROI, and ensuring every partner hits their savings targets.",
  },
  {
    title: "Sales Development Representative",
    department: "Growth",
    location: "New York, NY",
    type: "Full-time",
    description: "Generate qualified pipeline by engaging transportation directors and superintendents at K-12 districts across the country.",
  },
  {
    title: "Implementation Specialist",
    department: "Operations",
    location: "Remote (US)",
    type: "Full-time",
    description: "Lead district onboarding — from data migration and route analysis to training and go-live support.",
  },
  {
    title: "Product Marketing Manager",
    department: "Growth",
    location: "Remote (US)",
    type: "Full-time",
    description: "Craft positioning, case studies, and sales enablement materials that translate our technology into language superintendents care about.",
  },
];

const Careers = () => {
  const [contactOpen, setContactOpen] = useState(false);
  const [activeDept, setActiveDept] = useState<string>("All");

  const filtered = activeDept === "All" ? openings : openings.filter((o) => o.department === activeDept);

  return (
    <div className="min-h-screen">
      <SEOHead
        title="Careers at RideLine — Join the Team Transforming School Transportation"
        description="We're hiring mission-driven engineers, designers, and operators to build the operating system for K-12 school transportation. Remote-first, competitive pay, real impact."
      />
      <Navigation onGetAudit={() => setContactOpen(true)} />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-navy py-20 md:py-28">
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "linear-gradient(hsl(var(--gold)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--gold)) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }} />
          <div className="absolute top-1/3 left-1/4 h-[400px] w-[400px] rounded-full bg-accent/5 blur-[120px]" />

          <div className="relative mx-auto max-w-[900px] px-4 text-center md:px-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <p className="text-sm font-bold uppercase tracking-widest text-accent mb-4">We're Hiring</p>
              <h1 className="font-display text-4xl font-bold text-primary-foreground md:text-5xl lg:text-6xl">
                Build Software That Gets{" "}
                <span className="italic text-accent">Kids to School Safely</span>
              </h1>
              <p className="mt-6 text-lg text-primary-foreground/60 max-w-2xl mx-auto">
                RideLine is on a mission to modernize the $42B school transportation industry. Join a small, fast-moving team where your work directly impacts millions of students and families.
              </p>
              <a
                href="#positions"
                className="mt-8 inline-flex items-center gap-2 rounded-lg bg-accent px-8 py-4 text-sm font-bold text-accent-foreground hover:bg-gold-light transition shadow-lg shadow-accent/25"
              >
                View Open Positions <ArrowRight className="h-4 w-4" />
              </a>
            </motion.div>
          </div>
        </section>

        {/* Culture Values */}
        <section className="bg-background py-20 md:py-28">
          <div className="mx-auto max-w-[1100px] px-4 md:px-6">
            <ScrollReveal>
              <div className="text-center mb-14">
                <p className="text-sm font-bold uppercase tracking-widest text-accent mb-3">Our Culture</p>
                <h2 className="font-display text-3xl font-bold md:text-4xl">
                  Why People Love Working Here
                </h2>
              </div>
            </ScrollReveal>

            <div className="grid gap-8 sm:grid-cols-2">
              {cultureValues.map((v, i) => (
                <ScrollReveal key={v.title} delay={i * 0.08}>
                  <div className="rounded-xl border border-border bg-card p-8 h-full hover:border-accent/30 hover:shadow-md transition-all">
                    <div className="rounded-lg bg-accent/10 p-3 w-fit mb-4">
                      <v.icon className="h-6 w-6 text-accent" />
                    </div>
                    <h3 className="font-display text-lg font-bold mb-2">{v.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{v.description}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Perks & Benefits */}
        <section className="bg-secondary py-20 md:py-28">
          <div className="mx-auto max-w-[1100px] px-4 md:px-6">
            <ScrollReveal>
              <div className="text-center mb-14">
                <p className="text-sm font-bold uppercase tracking-widest text-accent mb-3">Perks & Benefits</p>
                <h2 className="font-display text-3xl font-bold md:text-4xl">
                  We Take Care of Our Team
                </h2>
              </div>
            </ScrollReveal>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {perks.map((p, i) => (
                <ScrollReveal key={p.title} delay={i * 0.06}>
                  <div className="rounded-xl border border-border bg-card p-6 text-center h-full">
                    <div className="rounded-full bg-accent/10 p-3 w-fit mx-auto mb-4">
                      <p.icon className="h-5 w-5 text-accent" />
                    </div>
                    <h3 className="font-display text-base font-bold mb-1">{p.title}</h3>
                    <p className="text-sm text-muted-foreground">{p.description}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Open Positions */}
        <section className="bg-background py-20 md:py-28" id="positions">
          <div className="mx-auto max-w-[1000px] px-4 md:px-6">
            <ScrollReveal>
              <div className="text-center mb-10">
                <p className="text-sm font-bold uppercase tracking-widest text-accent mb-3">Open Positions</p>
                <h2 className="font-display text-3xl font-bold md:text-4xl">
                  Find Your Role
                </h2>
                <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
                  We're looking for people who want to do the best work of their careers — and make a real difference while doing it.
                </p>
              </div>
            </ScrollReveal>

            {/* Department filter */}
            <ScrollReveal>
              <div className="flex flex-wrap justify-center gap-2 mb-10">
                {departments.map((d) => (
                  <button
                    key={d}
                    onClick={() => setActiveDept(d)}
                    className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                      activeDept === d
                        ? "bg-accent text-accent-foreground shadow-md"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </ScrollReveal>

            {/* Job cards */}
            <div className="space-y-4">
              {filtered.map((job, i) => (
                <ScrollReveal key={job.title} delay={i * 0.05}>
                  <div className="group rounded-xl border border-border bg-card p-6 hover:border-accent/30 hover:shadow-md transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Briefcase className="h-4 w-4 text-accent flex-shrink-0" />
                          <h3 className="font-display text-lg font-bold">{job.title}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{job.description}</p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {job.location}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-0.5 text-accent font-medium">
                            {job.department}
                          </span>
                          <span>{job.type}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setContactOpen(true)}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition whitespace-nowrap"
                      >
                        Apply Now <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p>No open positions in this department right now. Check back soon!</p>
              </div>
            )}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="bg-secondary py-20 md:py-28">
          <div className="mx-auto max-w-[800px] px-4 md:px-6">
            <ScrollReveal>
              <div className="rounded-2xl bg-gradient-to-br from-navy to-navy-mid p-10 md:p-14 text-center relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] rounded-full bg-accent/10 blur-[100px]" />
                <div className="relative">
                  <h2 className="font-display text-2xl font-bold text-primary-foreground md:text-3xl">
                    Don't See Your Role?
                  </h2>
                  <p className="mt-3 text-primary-foreground/60 max-w-md mx-auto text-sm">
                    We're always looking for exceptional people. Send us your resume and tell us why you're excited about RideLine.
                  </p>
                  <button
                    onClick={() => setContactOpen(true)}
                    className="mt-8 inline-flex items-center gap-2 rounded-lg bg-accent px-8 py-4 text-sm font-bold text-accent-foreground hover:bg-gold-light transition shadow-lg shadow-accent/25"
                  >
                    Get In Touch <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>

      <Footer />
      <ContactFormModal open={contactOpen} onOpenChange={setContactOpen} />
    </div>
  );
};

export default Careers;
