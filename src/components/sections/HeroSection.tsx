import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import fleetImg from "@/assets/rideline-fleet-overview.png";
import dashboardImg from "@/assets/rideline-dashboard.png";
import parentSafetyImg from "@/assets/rideline-parent-safety.webp";
import { AnimatedStat } from "@/components/AnimatedStat";

const stats = [
  { numericValue: 42, prefix: "$", suffix: "B+", label: "Annual U.S. Transp. Spend", divisor: undefined },
  { numericValue: 480, prefix: "", suffix: "K+", label: "School Buses Nationwide", divisor: undefined },
  { numericValue: 59, prefix: "", suffix: "M+", label: "Students Served", divisor: 10 },
  { numericValue: 25, prefix: "12\u2013", suffix: "x", label: "Year 1 ROI", divisor: undefined },
];

export const HeroSection = ({ onGetAudit }: { onGetAudit?: () => void }) => {
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

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="font-display text-4xl font-bold leading-tight text-primary-foreground md:text-5xl lg:text-6xl"
            >
              Every Student.{" "}
              <span className="italic text-accent">Every Day.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-6 max-w-2xl text-lg text-primary-foreground/70 md:text-xl lg:mx-0 mx-auto"
            >
              RideLine replaces spreadsheets, phone calls, and guesswork with a single command center for
              your transportation office. Save <strong className="text-success">$710K\u2013$1.6M</strong> in Year 1.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="mt-10 flex flex-col items-center gap-4 sm:flex-row lg:justify-start sm:justify-center"
            >
              <button
                onClick={onGetAudit}
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-7 py-3.5 text-sm font-bold text-accent-foreground transition-all duration-200 hover:bg-gold-light hover:scale-105 hover:shadow-xl hover:shadow-accent/30 active:scale-[0.98] shadow-lg shadow-accent/20"
              >
                Start Your Free Route Audit <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <button
                onClick={() => handleScroll("#platform")}
                className="inline-flex items-center gap-2 rounded-lg border border-primary-foreground/20 px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:border-primary-foreground/40 hover:scale-105 hover:bg-primary-foreground/5 active:scale-[0.98]"
              >
                <Play className="h-4 w-4" /> See the Platform
              </button>
            </motion.div>
          </div>

          {/* Right: Dashboard preview (desktop) */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="hidden lg:block"
          >
            <div className="relative space-y-4">
              <div className="absolute -inset-4 rounded-2xl bg-gradient-to-br from-accent/20 to-success/10 blur-2xl" />
              <img
                src={dashboardImg}
                alt="RideLine Dashboard \u2014 route management command center"
                className="relative rounded-2xl shadow-2xl shadow-black/40 border border-primary-foreground/10"
              />
              <img
                src={parentSafetyImg}
                alt="Parent waving goodbye to child boarding school bus, and RideLine safe arrival notification on phone"
                loading="lazy"
                className="relative rounded-2xl shadow-xl shadow-black/30 border border-primary-foreground/10"
              />
            </div>
          </motion.div>
        </div>

        {/* Mobile: Product preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-10 lg:hidden"
        >
          <div className="relative mx-auto max-w-md">
            <div className="absolute -inset-3 rounded-2xl bg-gradient-to-br from-accent/15 to-success/10 blur-xl" />
            <img
              src={dashboardImg}
              alt="RideLine Dashboard \u2014 route management command center"
              className="relative rounded-xl shadow-2xl shadow-black/40 border border-primary-foreground/10"
            />
            <img
              src={parentSafetyImg}
              alt="Parent safe arrival notification on phone"
              loading="lazy"
              className="relative -mt-6 mx-auto w-4/5 rounded-xl shadow-xl shadow-black/30 border border-primary-foreground/10"
            />
          </div>
        </motion.div>

        {/* Animated Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 grid grid-cols-2 gap-6 sm:grid-cols-4"
        >
          {stats.map((s, i) => (
            <AnimatedStat
              key={i}
              numericValue={s.numericValue}
              prefix={s.prefix}
              suffix={s.suffix}
              label={s.label}
              divisor={s.divisor}
              startImmediately
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};
