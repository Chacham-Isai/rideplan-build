import { useState } from "react";
import { motion } from "framer-motion";
import { SEOHead } from "@/components/SEOHead";
import { Navigation } from "@/components/sections/Navigation";
import { Footer } from "@/components/sections/Footer";
import { ContactFormModal } from "@/components/ContactFormModal";
import {
  Heart, Shield, Zap, Users, Target, Lightbulb,
  MapPin, ArrowRight, Linkedin, GraduationCap, Bus, Globe
} from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";

const values = [
  {
    icon: Heart,
    title: "Students First",
    description: "Every decision we make starts with one question: does this make school transportation safer, more equitable, and more reliable for the kids who ride the bus?",
  },
  {
    icon: Shield,
    title: "Radical Transparency",
    description: "We believe districts deserve full visibility into every route, every dollar, and every contractor. No black boxes. No hidden fees. Data you can trust.",
  },
  {
    icon: Zap,
    title: "Relentless Simplicity",
    description: "Transportation offices are overwhelmed. We obsess over removing complexity — not adding it. If it takes more than two clicks, we haven't finished designing it.",
  },
  {
    icon: Users,
    title: "Partner, Not Vendor",
    description: "We embed with our districts. We learn their bell schedules, their contractor quirks, their board dynamics. Your success is our only metric.",
  },
  {
    icon: Target,
    title: "Measurable Impact",
    description: "We don't sell promises — we deliver auditable savings. Every district gets a clear before-and-after with verifiable ROI within the first year.",
  },
  {
    icon: Lightbulb,
    title: "Build for the Future",
    description: "Electric buses, autonomous vehicles, micro-transit — school transportation is evolving fast. We build infrastructure that's ready for what's next.",
  },
];

const team = [
  {
    name: "Marcus Chen",
    role: "Co-Founder & CEO",
    bio: "Former transportation director who spent 12 years managing 200+ bus routes across three districts. Built RideLine to solve the problems he lived every day.",
    linkedin: "#",
  },
  {
    name: "Dr. Sarah Okonkwo",
    role: "Co-Founder & CTO",
    bio: "PhD in Operations Research from MIT. Previously led logistics optimization at Amazon. Brings world-class routing algorithms to K-12 transportation.",
    linkedin: "#",
  },
  {
    name: "James Moretti",
    role: "VP of District Partnerships",
    bio: "20-year veteran of public education administration. Former superintendent who understands the politics, budgets, and realities of district decision-making.",
    linkedin: "#",
  },
  {
    name: "Priya Sharma",
    role: "Head of Product",
    bio: "Previously product lead at Clever and ClassDojo. Passionate about building technology that educators actually want to use — not just what looks good in demos.",
    linkedin: "#",
  },
  {
    name: "David Kowalski",
    role: "Head of Engineering",
    bio: "Scaled real-time tracking systems at Via and Uber. Architecting RideLine's platform to handle millions of daily student trips with sub-second accuracy.",
    linkedin: "#",
  },
  {
    name: "Angela Torres",
    role: "Director of Implementation",
    bio: "Former school bus dispatcher turned implementation specialist. Personally onboarded 40+ districts and knows every edge case in student transportation.",
    linkedin: "#",
  },
];

const openings = [
  { title: "Senior Full-Stack Engineer", location: "Remote (US)", department: "Engineering" },
  { title: "District Success Manager", location: "Remote (US)", department: "Partnerships" },
  { title: "Data Scientist — Route Optimization", location: "Remote (US)", department: "Engineering" },
  { title: "Product Designer", location: "Remote (US)", department: "Product" },
  { title: "Sales Development Representative", location: "New York, NY", department: "Growth" },
];

const milestones = [
  { year: "2021", event: "Founded after Marcus optimized routes by hand for 3 districts and saved $2.4M" },
  { year: "2022", event: "Seed round. First 5 district partners onboarded in New York" },
  { year: "2023", event: "Expanded nationwide. Crossed 30K students served" },
  { year: "2024", event: "Series A. Launched AI analytics and parent communication modules" },
  { year: "2025", event: "58K+ students, 15 districts, $47M+ in cumulative savings delivered" },
];

const About = () => {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <SEOHead
        title="About RideLine — Mission, Team & Careers"
        description="Meet the team behind RideLine. We're building the operating system for K-12 school transportation — and we're hiring."
      />
      <Navigation onGetAudit={() => setContactOpen(true)} />

      <main>
        {/* Hero */}
        <section className="bg-navy py-20 md:py-28">
          <div className="mx-auto max-w-[1200px] px-4 md:px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm font-bold uppercase tracking-widest text-accent mb-3"
                >
                  Our Mission
                </motion.p>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="font-display text-3xl font-bold text-primary-foreground md:text-5xl leading-tight"
                >
                  Every student deserves a{" "}
                  <span className="italic text-accent">safe, efficient ride</span> to school.
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-6 text-lg text-primary-foreground/60 leading-relaxed"
                >
                  School transportation is a $28 billion industry running on spreadsheets, phone calls, and guesswork.
                  We started RideLine because we believe technology can make every route safer, every dollar stretch further,
                  and every parent more confident when their child boards the bus.
                </motion.p>
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="hidden lg:grid grid-cols-2 gap-4"
              >
                {[
                  { icon: Bus, stat: "58K+", label: "Students served" },
                  { icon: Globe, stat: "15", label: "District partners" },
                  { icon: GraduationCap, stat: "$47M+", label: "Savings delivered" },
                  { icon: Users, stat: "32", label: "Team members" },
                ].map((s, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-primary-foreground/10 bg-primary-foreground/5 p-5 text-center"
                  >
                    <s.icon className="h-6 w-6 text-accent mx-auto mb-2" />
                    <div className="font-display text-2xl font-bold text-primary-foreground">{s.stat}</div>
                    <p className="text-xs text-primary-foreground/50 mt-1">{s.label}</p>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="bg-background py-16 md:py-24">
          <div className="mx-auto max-w-[800px] px-4 md:px-6">
            <ScrollReveal>
              <h2 className="font-display text-3xl font-bold text-center mb-12 md:text-4xl">Our Journey</h2>
            </ScrollReveal>
            <div className="relative">
              <div className="absolute left-[18px] top-0 bottom-0 w-px bg-border md:left-1/2 md:-translate-x-px" />
              {milestones.map((m, i) => (
                <ScrollReveal key={m.year} delay={i * 0.08}>
                  <div className={`relative flex gap-6 mb-10 md:mb-12 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                    <div className="flex-shrink-0 relative z-10">
                      <div className="h-9 w-9 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-accent-foreground shadow-md md:absolute md:left-1/2 md:-translate-x-1/2">
                        {m.year.slice(2)}
                      </div>
                    </div>
                    <div className={`flex-1 rounded-xl border bg-card p-5 ${i % 2 === 0 ? "md:mr-[calc(50%+24px)]" : "md:ml-[calc(50%+24px)]"}`}>
                      <p className="text-sm font-bold text-accent mb-1">{m.year}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{m.event}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="bg-navy py-20 md:py-28">
          <div className="mx-auto max-w-[1200px] px-4 md:px-6">
            <ScrollReveal>
              <div className="text-center mb-12">
                <p className="text-sm font-bold uppercase tracking-widest text-accent mb-3">What Drives Us</p>
                <h2 className="font-display text-3xl font-bold text-primary-foreground md:text-4xl">Our Values</h2>
              </div>
            </ScrollReveal>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {values.map((v, i) => (
                <ScrollReveal key={v.title} delay={i * 0.08}>
                  <div className="rounded-xl border border-primary-foreground/10 bg-primary-foreground/5 p-6 h-full hover:border-accent/30 transition-colors duration-300">
                    <v.icon className="h-8 w-8 text-accent mb-4" />
                    <h3 className="font-display text-lg font-bold text-primary-foreground mb-2">{v.title}</h3>
                    <p className="text-sm text-primary-foreground/60 leading-relaxed">{v.description}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="bg-background py-20 md:py-28">
          <div className="mx-auto max-w-[1200px] px-4 md:px-6">
            <ScrollReveal>
              <div className="text-center mb-12">
                <p className="text-sm font-bold uppercase tracking-widest text-accent mb-3">Leadership</p>
                <h2 className="font-display text-3xl font-bold md:text-4xl">The Team Behind RideLine</h2>
                <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
                  Transportation directors, engineers, educators, and operators who've lived the problem we're solving.
                </p>
              </div>
            </ScrollReveal>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {team.map((t, i) => (
                <ScrollReveal key={t.name} delay={i * 0.08}>
                  <div className="group rounded-xl border bg-card p-6 hover:shadow-lg hover:border-accent/30 transition-all duration-300 h-full flex flex-col">
                    {/* Avatar placeholder */}
                    <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                      <span className="font-display text-xl font-bold text-accent">
                        {t.name.split(" ").map(n => n[0]).join("")}
                      </span>
                    </div>
                    <h3 className="font-display text-lg font-bold">{t.name}</h3>
                    <p className="text-sm font-semibold text-accent mt-0.5">{t.role}</p>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed flex-1">{t.bio}</p>
                    <a
                      href={t.linkedin}
                      className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-accent transition"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                    </a>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Open Positions */}
        <section className="bg-navy py-20 md:py-28" id="careers">
          <div className="mx-auto max-w-[800px] px-4 md:px-6">
            <ScrollReveal>
              <div className="text-center mb-12">
                <p className="text-sm font-bold uppercase tracking-widest text-accent mb-3">Careers</p>
                <h2 className="font-display text-3xl font-bold text-primary-foreground md:text-4xl">
                  Join the Ride
                </h2>
                <p className="mt-4 text-primary-foreground/60">
                  We're a small, fast-moving team tackling a massive market. If you want your work to matter, we'd love to hear from you.
                </p>
              </div>
            </ScrollReveal>

            <div className="space-y-3">
              {openings.map((job, i) => (
                <ScrollReveal key={job.title} delay={i * 0.06}>
                  <div className="group flex items-center justify-between rounded-xl border border-primary-foreground/10 bg-primary-foreground/5 p-5 hover:border-accent/30 transition-all duration-300 cursor-pointer">
                    <div>
                      <h3 className="font-display text-base font-bold text-primary-foreground group-hover:text-accent transition-colors">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="inline-flex items-center gap-1 text-xs text-primary-foreground/50">
                          <MapPin className="h-3 w-3" /> {job.location}
                        </span>
                        <span className="text-xs text-primary-foreground/30">•</span>
                        <span className="text-xs text-primary-foreground/50">{job.department}</span>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-primary-foreground/30 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                  </div>
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal delay={0.4}>
              <p className="mt-8 text-center text-sm text-primary-foreground/40">
                Don't see the right role? Email <span className="text-accent font-medium">careers@rideline.io</span> — we're always looking for exceptional people.
              </p>
            </ScrollReveal>
          </div>
        </section>
      </main>

      <Footer />
      <ContactFormModal open={contactOpen} onOpenChange={setContactOpen} />
    </div>
  );
};

export default About;
