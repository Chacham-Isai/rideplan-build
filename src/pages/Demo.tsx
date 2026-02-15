import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SEOHead } from "@/components/SEOHead";
import { Navigation } from "@/components/sections/Navigation";
import { Footer } from "@/components/sections/Footer";
import { ContactFormModal } from "@/components/ContactFormModal";
import {
  Users, Route, ClipboardCheck, MessageSquare, Shield, Brain,
  ArrowRight, ArrowLeft, CheckCircle, Monitor, Smartphone, BarChart3
} from "lucide-react";
import dashboardImg from "@/assets/rideline-dashboard.png";
import parentTrackingImg from "@/assets/rideline-parent-tracking.webp";
import routeOptImg from "@/assets/rideline-route-optimization.png";
import coverageMapImg from "@/assets/rideline-coverage-map.png";
import analyticsImg from "@/assets/rideline-school-bus-analytics.webp";
import fleetImg from "@/assets/rideline-fleet-overview.png";

const tourSteps = [
  {
    id: "command-center",
    icon: Monitor,
    title: "Command Center Dashboard",
    subtitle: "Your single source of truth",
    description: "See every route, bus, and student in one real-time view. Filter by school, contractor, or status. Spot issues before they become problems.",
    image: dashboardImg,
    highlights: [
      "Live GPS tracking across all vehicles",
      "At-a-glance route health scores",
      "Daily exception alerts & notifications",
      "One-click drill-down into any route",
    ],
  },
  {
    id: "route-optimization",
    icon: Route,
    title: "AI Route Optimization",
    subtitle: "Eliminate waste automatically",
    description: "Our algorithms analyze every route against actual ridership, bell times, and geography to consolidate overlapping runs and reduce deadhead miles.",
    image: routeOptImg,
    highlights: [
      "Identifies 5–10 unnecessary routes per district",
      "Scenario modeling for bell-time changes",
      "Walk-zone engine with geocoded boundaries",
      "Before/after cost comparison reports",
    ],
  },
  {
    id: "student-assignment",
    icon: Users,
    title: "Student Assignment Engine",
    subtitle: "Right kid, right bus, right stop",
    description: "Automatically assigns students to optimal stops and routes based on address, eligibility, capacity constraints, and special requirements.",
    image: coverageMapImg,
    highlights: [
      "Batch import from your SIS",
      "Automatic stop optimization",
      "Special needs & IEP accommodations",
      "Parent notification letters auto-generated",
    ],
  },
  {
    id: "parent-portal",
    icon: Smartphone,
    title: "Parent Communication Hub",
    subtitle: "60% fewer office calls",
    description: "Parents get real-time bus tracking, digital passes, delay alerts, and a self-service portal — in their language. Your office phone stops ringing.",
    image: parentTrackingImg,
    highlights: [
      "Real-time GPS bus tracking for parents",
      "Automated delay & schedule change alerts",
      "Multilingual support (20+ languages)",
      "Digital bus pass with QR code",
    ],
  },
  {
    id: "contractor-oversight",
    icon: ClipboardCheck,
    title: "Contractor Oversight",
    subtitle: "Never overpay again",
    description: "Cross-reference every contractor invoice against actual GPS data. Benchmark rates against neighboring districts. Flag discrepancies instantly.",
    image: fleetImg,
    highlights: [
      "GPS-verified invoice reconciliation",
      "Per-route & per-mile rate benchmarking",
      "Contractor performance scorecards",
      "Automated payment approval workflows",
    ],
  },
  {
    id: "analytics",
    icon: BarChart3,
    title: "AI Analytics & Reporting",
    subtitle: "Board-ready intelligence",
    description: "Ask questions in plain English and get instant answers. Predictive enrollment modeling, compliance auto-reporting, and executive dashboards.",
    image: analyticsImg,
    highlights: [
      "Natural language data queries",
      "Predictive enrollment modeling",
      "Auto-generated BEDS, STAC, IDEA reports",
      "Board presentation export",
    ],
  },
];

const Demo = () => {
  const [contactOpen, setContactOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const step = tourSteps[activeStep];

  return (
    <div className="min-h-screen">
      <SEOHead
        title="Product Tour — RideLine"
        description="Explore how RideLine's platform manages routes, students, contractors, and parent communication from one command center."
      />
      <Navigation onGetAudit={() => setContactOpen(true)} />

      <main>
        {/* Hero */}
        <section className="bg-navy py-16 md:py-24">
          <div className="mx-auto max-w-[1200px] px-4 md:px-6 text-center">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-bold uppercase tracking-widest text-accent mb-3"
            >
              Interactive Product Tour
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display text-3xl font-bold text-primary-foreground md:text-5xl"
            >
              See RideLine in Action
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4 max-w-2xl mx-auto text-primary-foreground/60 text-lg"
            >
              Click through each module to explore how districts save $710K–$1.6M in Year 1.
            </motion.p>
          </div>
        </section>

        {/* Step Navigation Pills */}
        <section className="bg-background border-b sticky top-[60px] z-30">
          <div className="mx-auto max-w-[1200px] px-4 md:px-6">
            <div className="flex gap-1 overflow-x-auto py-3 scrollbar-hide">
              {tourSteps.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setActiveStep(i)}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    activeStep === i
                      ? "bg-accent text-accent-foreground shadow-md"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <s.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{s.title.split(" ").slice(0, 2).join(" ")}</span>
                  <span className="sm:hidden">{i + 1}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Step Content */}
        <section className="bg-background py-16 md:py-24">
          <div className="mx-auto max-w-[1200px] px-4 md:px-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.35 }}
                className="grid lg:grid-cols-2 gap-12 items-center"
              >
                {/* Text */}
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 border border-accent/20 px-3 py-1 text-xs font-semibold text-accent mb-4">
                    <step.icon className="h-3.5 w-3.5" />
                    Step {activeStep + 1} of {tourSteps.length}
                  </div>
                  <h2 className="font-display text-3xl font-bold md:text-4xl">{step.title}</h2>
                  <p className="text-accent font-semibold mt-1">{step.subtitle}</p>
                  <p className="mt-4 text-muted-foreground leading-relaxed">{step.description}</p>

                  <ul className="mt-8 space-y-3">
                    {step.highlights.map((h, i) => (
                      <motion.li
                        key={h}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + i * 0.08 }}
                        className="flex items-start gap-3 text-sm"
                      >
                        <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </motion.li>
                    ))}
                  </ul>

                  {/* Nav buttons */}
                  <div className="mt-10 flex items-center gap-3">
                    <button
                      onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                      disabled={activeStep === 0}
                      className="inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium transition disabled:opacity-30 hover:bg-muted"
                    >
                      <ArrowLeft className="h-4 w-4" /> Back
                    </button>
                    {activeStep < tourSteps.length - 1 ? (
                      <button
                        onClick={() => setActiveStep(activeStep + 1)}
                        className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-accent-foreground hover:bg-gold-light transition shadow-md"
                      >
                        Next Module <ArrowRight className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setContactOpen(true)}
                        className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-accent-foreground hover:bg-gold-light transition shadow-md"
                      >
                        Start Your Free Audit <ArrowRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Image */}
                <div className="relative">
                  <div className="absolute -inset-4 rounded-2xl bg-gradient-to-br from-accent/10 to-success/5 blur-2xl" />
                  <img
                    src={step.image}
                    alt={`${step.title} — RideLine platform screenshot`}
                    className="relative rounded-2xl shadow-2xl border border-border"
                  />
                  {/* Progress bar */}
                  <div className="mt-6 flex gap-1.5">
                    {tourSteps.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                          i <= activeStep ? "bg-accent" : "bg-border"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </section>
      </main>

      <Footer />
      <ContactFormModal open={contactOpen} onOpenChange={setContactOpen} />
    </div>
  );
};

export default Demo;
