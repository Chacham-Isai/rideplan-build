import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useCountUp } from "@/hooks/useCountUp";
import { TrendingUp, TrendingDown, Bus, Users, DollarSign, Clock, MapPin, Shield } from "lucide-react";

const metrics = [
  {
    icon: Bus,
    label: "Routes Optimized",
    value: 8742,
    prefix: "",
    suffix: "",
    change: "+12%",
    positive: true,
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: DollarSign,
    label: "Savings Delivered",
    value: 47,
    prefix: "$",
    suffix: "M",
    change: "+$8.2M this quarter",
    positive: true,
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    icon: Users,
    label: "Students Served",
    value: 890,
    prefix: "",
    suffix: "K",
    change: "+34K this month",
    positive: true,
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: Clock,
    label: "Avg. Ride Time Reduced",
    value: 18,
    prefix: "",
    suffix: " min",
    change: "−4 min vs. baseline",
    positive: true,
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    icon: MapPin,
    label: "Dead-Head Miles Cut",
    value: 2.1,
    prefix: "",
    suffix: "M mi",
    change: "−22% YoY",
    positive: true,
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: Shield,
    label: "On-Time Rate",
    value: 97.3,
    prefix: "",
    suffix: "%",
    change: "+1.8% vs. industry avg",
    positive: true,
    color: "text-success",
    bgColor: "bg-success/10",
  },
];

// Simulated live activity feed
const activities = [
  "Route 47B consolidated with Route 52A — saved $34K/yr",
  "Northshore CSD: 12 routes optimized, $180K projected savings",
  "Parent portal launched for Lakewood USD — 2,400 families onboarded",
  "Contractor invoice discrepancy flagged: $8,200 adjustment",
  "Walk-zone engine reassigned 340 students — 3 buses freed",
  "Bell-time scenario modeled: 8 routes eliminated, $290K saved",
];

const AnimatedMetric = ({ metric, delay }: { metric: typeof metrics[0]; delay: number }) => {
  const isDecimal = !Number.isInteger(metric.value);
  const { count, ref } = useCountUp(isDecimal ? Math.floor(metric.value * 10) : metric.value, 2500);
  const displayValue = isDecimal ? (count / 10).toFixed(1) : count.toLocaleString();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="rounded-xl border border-primary-foreground/10 bg-primary-foreground/5 p-5 hover:border-accent/30 transition-all duration-300"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`rounded-lg ${metric.bgColor} p-2`}>
          <metric.icon className={`h-5 w-5 ${metric.color}`} />
        </div>
        <span className="text-xs text-primary-foreground/50 uppercase tracking-wide font-medium">{metric.label}</span>
      </div>
      <div className="font-display text-3xl font-bold text-primary-foreground md:text-4xl">
        {metric.prefix}{displayValue}{metric.suffix}
      </div>
      <div className="mt-2 flex items-center gap-1.5 text-xs font-medium">
        {metric.positive ? (
          <TrendingUp className="h-3.5 w-3.5 text-success" />
        ) : (
          <TrendingDown className="h-3.5 w-3.5 text-destructive" />
        )}
        <span className={metric.positive ? "text-success" : "text-destructive"}>{metric.change}</span>
      </div>
    </motion.div>
  );
};

export const LiveStatsDashboard = () => {
  const [activityIndex, setActivityIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setActivityIndex((prev) => (prev + 1) % activities.length);
    }, 3000);
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <section className="bg-navy py-20 md:py-28" id="impact">
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-sm font-bold uppercase tracking-widest text-accent mb-3">Live Impact Dashboard</p>
          <h2 className="font-display text-3xl font-bold text-primary-foreground md:text-4xl lg:text-5xl">
            Measured Results, Not Promises
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-primary-foreground/60">
            Real metrics from districts using RideLine to transform their transportation operations.
          </p>
        </motion.div>

        {/* Live activity ticker */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-10 flex items-center gap-3 rounded-lg border border-accent/20 bg-accent/5 px-5 py-3"
        >
          <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
          </span>
          <span className="text-sm text-primary-foreground/70 font-medium overflow-hidden">
            <motion.span
              key={activityIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="block"
            >
              {activities[activityIndex]}
            </motion.span>
          </span>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map((m, i) => (
            <AnimatedMetric key={m.label} metric={m} delay={i * 0.08} />
          ))}
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center text-xs text-primary-foreground/40"
        >
          *Aggregate data across all RideLine partner districts. Updated quarterly.
        </motion.p>
      </div>
    </section>
  );
};
