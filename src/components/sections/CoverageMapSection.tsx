import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollReveal } from "@/components/ScrollReveal";
import { MapPin, Users, Bus, DollarSign, TrendingUp } from "lucide-react";

interface District {
  id: string;
  name: string;
  state: string;
  x: number;
  y: number;
  students: string;
  buses: number;
  savings: string;
  status: "active" | "onboarding" | "expansion";
}

// Districts spread across the entire U.S. — coordinates mapped to a 0–100 viewBox
const districts: District[] = [
  // West Coast
  { id: "1", name: "Seattle Metro SD", state: "WA", x: 14, y: 12, students: "6,800", buses: 94, savings: "$1.4M", status: "active" },
  { id: "2", name: "Portland USD", state: "OR", x: 13, y: 22, students: "5,200", buses: 72, savings: "$1.1M", status: "active" },
  { id: "3", name: "Bay Area Unified", state: "CA", x: 10, y: 42, students: "9,400", buses: 130, savings: "$1.9M", status: "active" },
  { id: "4", name: "Los Angeles USD", state: "CA", x: 14, y: 56, students: "12,000", buses: 168, savings: "$2.4M", status: "active" },
  { id: "5", name: "San Diego CSD", state: "CA", x: 16, y: 62, students: "7,100", buses: 96, savings: "$1.3M", status: "onboarding" },
  // Mountain West
  { id: "6", name: "Phoenix Metro", state: "AZ", x: 22, y: 58, students: "8,200", buses: 110, savings: "$1.6M", status: "active" },
  { id: "7", name: "Denver Public Schools", state: "CO", x: 32, y: 40, students: "7,500", buses: 102, savings: "$1.5M", status: "active" },
  { id: "8", name: "Salt Lake City SD", state: "UT", x: 24, y: 36, students: "4,600", buses: 62, savings: "$920K", status: "onboarding" },
  { id: "9", name: "Boise ISD", state: "ID", x: 20, y: 22, students: "3,200", buses: 44, savings: "$710K", status: "expansion" },
  { id: "10", name: "Las Vegas CSD", state: "NV", x: 18, y: 46, students: "6,100", buses: 84, savings: "$1.2M", status: "expansion" },
  // Midwest
  { id: "11", name: "Chicago Public Schools", state: "IL", x: 58, y: 32, students: "11,500", buses: 158, savings: "$2.2M", status: "active" },
  { id: "12", name: "Minneapolis-St. Paul", state: "MN", x: 52, y: 18, students: "5,800", buses: 78, savings: "$1.1M", status: "active" },
  { id: "13", name: "Detroit Metro ISD", state: "MI", x: 64, y: 28, students: "6,400", buses: 88, savings: "$1.3M", status: "onboarding" },
  { id: "14", name: "Columbus City Schools", state: "OH", x: 68, y: 34, students: "4,900", buses: 66, savings: "$980K", status: "active" },
  { id: "15", name: "Kansas City USD", state: "MO", x: 48, y: 40, students: "3,800", buses: 52, savings: "$830K", status: "expansion" },
  // South
  { id: "16", name: "Dallas-Fort Worth ISD", state: "TX", x: 42, y: 62, students: "10,200", buses: 140, savings: "$2.0M", status: "active" },
  { id: "17", name: "Houston ISD", state: "TX", x: 46, y: 68, students: "8,900", buses: 122, savings: "$1.7M", status: "active" },
  { id: "18", name: "Atlanta Public Schools", state: "GA", x: 68, y: 56, students: "7,200", buses: 98, savings: "$1.4M", status: "active" },
  { id: "19", name: "Charlotte-Mecklenburg", state: "NC", x: 72, y: 50, students: "5,600", buses: 76, savings: "$1.1M", status: "onboarding" },
  { id: "20", name: "Miami-Dade County", state: "FL", x: 74, y: 74, students: "9,800", buses: 134, savings: "$1.8M", status: "active" },
  { id: "21", name: "Nashville Metro", state: "TN", x: 62, y: 48, students: "4,200", buses: 58, savings: "$890K", status: "onboarding" },
  { id: "22", name: "New Orleans Parish", state: "LA", x: 54, y: 66, students: "3,600", buses: 48, savings: "$760K", status: "expansion" },
  // Northeast
  { id: "23", name: "New York City DOE", state: "NY", x: 82, y: 28, students: "14,500", buses: 200, savings: "$2.8M", status: "active" },
  { id: "24", name: "Capital Region BOCES", state: "NY", x: 80, y: 22, students: "8,500", buses: 120, savings: "$1.6M", status: "active" },
  { id: "25", name: "Boston Public Schools", state: "MA", x: 88, y: 22, students: "6,200", buses: 86, savings: "$1.2M", status: "active" },
  { id: "26", name: "Philadelphia SD", state: "PA", x: 80, y: 34, students: "7,800", buses: 106, savings: "$1.5M", status: "active" },
  { id: "27", name: "Montgomery Township", state: "NJ", x: 82, y: 32, students: "2,900", buses: 38, savings: "$710K", status: "onboarding" },
  { id: "28", name: "Washington DC Schools", state: "DC", x: 78, y: 40, students: "5,400", buses: 74, savings: "$1.0M", status: "active" },
];

const statusConfig = {
  active: { label: "Active", dotClass: "bg-success", pulseClass: "bg-success", ringClass: "ring-success/30" },
  onboarding: { label: "Onboarding", dotClass: "bg-accent", pulseClass: "bg-accent", ringClass: "ring-accent/30" },
  expansion: { label: "Planned", dotClass: "bg-primary-foreground/40", pulseClass: "bg-primary-foreground/30", ringClass: "ring-primary-foreground/10" },
};

// Simplified U.S. continental outline
const usOutlinePath =
  "M8,18 L12,8 L18,6 L22,10 L28,8 L34,6 L40,8 L48,6 L54,8 L60,10 L66,12 L72,14 L78,16 L84,18 L90,20 L92,26 L90,30 L88,34 L86,38 L84,42 L82,46 L80,50 L78,54 L76,58 L74,62 L72,66 L70,70 L68,74 L66,76 L62,74 L58,72 L54,70 L50,72 L46,74 L42,72 L38,70 L34,68 L30,66 L26,64 L22,62 L18,60 L14,58 L12,54 L10,50 L8,46 L6,42 L6,36 L6,30 L8,24 Z";

export const CoverageMapSection = () => {
  const [hoveredDistrict, setHoveredDistrict] = useState<District | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);

  const activeDistrict = selectedDistrict || hoveredDistrict;
  const activeCount = districts.filter(d => d.status === "active").length;
  const onboardingCount = districts.filter(d => d.status === "onboarding").length;
  const totalStudents = "190K+";

  return (
    <section className="bg-navy py-20 md:py-28 overflow-hidden" id="coverage">
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        <ScrollReveal>
          <div className="text-center mb-12">
            <p className="text-sm font-bold uppercase tracking-widest text-accent mb-3">Coverage & Expansion</p>
            <h2 className="font-display text-3xl font-bold text-primary-foreground md:text-4xl lg:text-5xl">
              Serving Districts Nationwide
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-primary-foreground/60">
              RideLine is transforming school transportation across the country — with new districts onboarding every month.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid lg:grid-cols-[1fr_340px] gap-8 items-start">
          {/* Map */}
          <ScrollReveal>
            <div className="relative rounded-2xl border border-primary-foreground/10 bg-primary-foreground/[0.03] p-4 md:p-8">
              <svg
                viewBox="0 0 100 82"
                className="w-full h-auto"
                style={{ maxHeight: "500px" }}
              >
                {/* U.S. outline */}
                <path
                  d={usOutlinePath}
                  fill="hsl(var(--navy-mid))"
                  stroke="hsl(var(--primary-foreground) / 0.1)"
                  strokeWidth="0.4"
                />

                {/* District pins */}
                {districts.map((d) => {
                  const cfg = statusConfig[d.status];
                  const isActive = activeDistrict?.id === d.id;
                  return (
                    <g
                      key={d.id}
                      onMouseEnter={() => setHoveredDistrict(d)}
                      onMouseLeave={() => setHoveredDistrict(null)}
                      onClick={() => setSelectedDistrict(selectedDistrict?.id === d.id ? null : d)}
                      className="cursor-pointer"
                    >
                      {/* Pulse ring for active districts */}
                      {d.status === "active" && (
                        <circle
                          cx={d.x}
                          cy={d.y}
                          r={isActive ? 3 : 2}
                          className={`${cfg.pulseClass} opacity-20`}
                          fill="currentColor"
                        >
                          <animate
                            attributeName="r"
                            values={isActive ? "3;5;3" : "2;3.5;2"}
                            dur="2s"
                            repeatCount="indefinite"
                          />
                          <animate
                            attributeName="opacity"
                            values="0.3;0;0.3"
                            dur="2s"
                            repeatCount="indefinite"
                          />
                        </circle>
                      )}
                      {/* Pin dot */}
                      <circle
                        cx={d.x}
                        cy={d.y}
                        r={isActive ? 2.2 : 1.5}
                        className={cfg.dotClass}
                        fill="currentColor"
                        stroke={isActive ? "hsl(var(--gold))" : "hsl(var(--navy))"}
                        strokeWidth={isActive ? 0.6 : 0.4}
                        style={{ transition: "r 0.2s" }}
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Hover tooltip */}
              <AnimatePresence>
                {activeDistrict && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute bottom-4 left-4 right-4 md:left-auto md:right-8 md:bottom-8 md:w-72 rounded-xl border border-accent/20 bg-navy-mid p-4 shadow-2xl"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${statusConfig[activeDistrict.status].dotClass}`}
                      />
                      <span className="text-xs font-semibold uppercase tracking-wide text-primary-foreground/50">
                        {statusConfig[activeDistrict.status].label}
                      </span>
                    </div>
                    <h4 className="font-display text-lg font-bold text-primary-foreground">
                      {activeDistrict.name}
                    </h4>
                    <p className="text-xs text-primary-foreground/50 mb-3">{activeDistrict.state}</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <div className="flex items-center gap-1 text-primary-foreground/40 mb-1">
                          <Users className="h-3 w-3" />
                          <span className="text-[10px] uppercase">Students</span>
                        </div>
                        <p className="text-sm font-bold text-primary-foreground">{activeDistrict.students}</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-primary-foreground/40 mb-1">
                          <Bus className="h-3 w-3" />
                          <span className="text-[10px] uppercase">Buses</span>
                        </div>
                        <p className="text-sm font-bold text-primary-foreground">{activeDistrict.buses}</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-primary-foreground/40 mb-1">
                          <DollarSign className="h-3 w-3" />
                          <span className="text-[10px] uppercase">Savings</span>
                        </div>
                        <p className="text-sm font-bold text-success">{activeDistrict.savings}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </ScrollReveal>

          {/* Sidebar stats & legend */}
          <div className="space-y-6">
            <ScrollReveal delay={0.1}>
              <div className="rounded-xl border border-primary-foreground/10 bg-primary-foreground/5 p-6">
                <h3 className="font-display text-lg font-bold text-primary-foreground mb-4">Network at a Glance</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-primary-foreground/60">Active Districts</span>
                    <span className="font-bold text-primary-foreground">{activeCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-primary-foreground/60">Onboarding</span>
                    <span className="font-bold text-accent">{onboardingCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-primary-foreground/60">Students Served</span>
                    <span className="font-bold text-primary-foreground">{totalStudents}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-primary-foreground/60">Target Market</span>
                    <span className="font-bold text-primary-foreground">13,000+ districts</span>
                  </div>
                  <div className="h-px bg-primary-foreground/10" />
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-success" />
                    <span className="text-success font-semibold">8 new districts</span>
                    <span className="text-primary-foreground/40">this quarter</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="rounded-xl border border-primary-foreground/10 bg-primary-foreground/5 p-6">
                <h3 className="font-display text-sm font-bold text-primary-foreground/60 uppercase tracking-wide mb-4">Legend</h3>
                <div className="space-y-3">
                  {(["active", "onboarding", "expansion"] as const).map((status) => (
                    <div key={status} className="flex items-center gap-3">
                      <span className={`h-3 w-3 rounded-full ${statusConfig[status].dotClass}`} />
                      <span className="text-sm text-primary-foreground/70">{statusConfig[status].label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <p className="text-xs text-primary-foreground/30 text-center">
                Hover or tap any pin to see district details.
              </p>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
};
