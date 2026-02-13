import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import fleetImg from "@/assets/rideline-fleet-overview.png";
import dashboardImg from "@/assets/rideline-dashboard.png";

const stats = [
  { value: "$15B+", label: "Annual Transp. Spend in Region" },
  { value: "120K+", label: "School Buses in Target Market" },
  { value: "5.9M+", label: "Students Served" },
  { value: "12–25x", label: "Year 1 ROI" },
];

export const HeroSection = () => {
  const handleScroll = (href: string) => {
    const el = document.querySelector(href);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <section className="relative overflow-hidden bg-navy py-20 md:py-28 lg:py-36">
      {/* Background fleet image with overlay */}
      <div className="absolute inset-0">
        <img src={fleetImg} alt="" className="h-full w-full object-cover opacity-[0.08]" />
        <div className="absolute inset-0 bg-gradient-to-b from-navy/80 via-navy/95 to-navy" />
      </div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(hsl(var(--gold)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--gold)) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      {/* Radial blobs */}
      <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-accent/5 blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-success/5 blur-[120px]" />

      <div className="relative mx-auto max-w-[1200px] px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-sm font-medium text-gold-light"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              The Operating System for School Transportation
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="font-display text-4xl font-bold leading-tight text-primary-foreground md:text-5xl lg:text-6xl"
            >
              Every Route. Every Dollar.{" "}
              <span className="italic text-accent">Every Student.</span>
            </motion.h1>

            {/* Sub */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-6 max-w-2xl text-lg text-primary-foreground/70 md:text-xl lg:mx-0 mx-auto"
            >
              RideLine replaces spreadsheets, phone calls, and guesswork with a single command center for
              your transportation office. Save <strong className="text-success">$710K–$1.6M</strong> in Year 1.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="mt-10 flex flex-col items-center gap-4 sm:flex-row lg:justify-start sm:justify-center"
            >
              <button
                onClick={() => handleScroll("#cta")}
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-7 py-3.5 text-sm font-bold text-accent-foreground hover:bg-gold-light transition shadow-lg shadow-accent/20"
              >
                Start Your Free Route Audit <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleScroll("#platform")}
                className="inline-flex items-center gap-2 rounded-lg border border-primary-foreground/20 px-7 py-3.5 text-sm font-semibold text-primary-foreground hover:border-primary-foreground/40 transition"
              >
                <Play className="h-4 w-4" /> See the Platform
              </button>
            </motion.div>
          </div>

          {/* Right: Dashboard preview */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="hidden lg:block"
          >
            <div className="relative">
              <div className="absolute -inset-4 rounded-2xl bg-gradient-to-br from-accent/20 to-success/10 blur-2xl" />
              <img
                src={dashboardImg}
                alt="RideLine Dashboard — route management command center"
                className="relative rounded-2xl shadow-2xl shadow-black/40 border border-primary-foreground/10"
              />
            </div>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 grid grid-cols-2 gap-6 sm:grid-cols-4"
        >
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <div className="font-display text-3xl font-bold text-primary-foreground md:text-4xl">
                {s.value}
              </div>
              <div className="mt-1 text-xs text-primary-foreground/50 md:text-sm">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
