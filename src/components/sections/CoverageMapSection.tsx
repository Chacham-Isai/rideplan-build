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

const districts: District[] = [
  { id: "1", name: "Northshore CSD", state: "NY", x: 72, y: 28, students: "4,200", buses: 62, savings: "$1.2M", status: "active" },
  { id: "2", name: "Lakewood USD", state: "NJ", x: 68, y: 42, students: "3,800", buses: 54, savings: "$980K", status: "active" },
  { id: "3", name: "Capital Region BOCES", state: "NY", x: 74, y: 22, students: "8,500", buses: 120, savings: "$1.6M", status: "active" },
  { id: "4", name: "Fairfield County Schools", state: "CT", x: 76, y: 34, students: "5,100", buses: 72, savings: "$1.1M", status: "active" },
  { id: "5", name: "Montgomery Township", state: "PA", x: 62, y: 44, students: "2,900", buses: 38, savings: "$710K", status: "active" },
  { id: "6", name: "Suffolk BOCES", state: "NY", x: 82, y: 32, students: "6,200", buses: 88, savings: "$1.4M", status: "active" },
  { id: "7", name: "Delaware Valley SD", state: "PA", x: 58, y: 48, students: "3,400", buses: 46, savings: "$850K", status: "onboarding" },
  { id: "8", name: "Chesapeake Bay District", state: "MD", x: 60, y: 58, students: "4,600", buses: 64, savings: "$1.0M", status: "onboarding" },
  { id: "9", name: "Pioneer Valley Regional", state: "MA", x: 78, y: 18, students: "3,100", buses: 42, savings: "$790K", status: "active" },
  { id: "10", name: "Hudson Valley CSD", state: "NY", x: 70, y: 30, students: "5,800", buses: 80, savings: "$1.3M", status: "active" },
  { id: "11", name: "Prince George's County", state: "MD", x: 56, y: 60, students: "7,200", buses: 98, savings: "$1.5M", status: "expansion" },
  { id: "12", name: "Burlington County", state: "NJ", x: 64, y: 46, students: "2,600", buses: 34, savings: "$640K", status: "onboarding" },
  { id: "13", name: "Allegheny IU", state: "PA", x: 38, y: 42, students: "9,100", buses: 130, savings: "$1.8M", status: "expansion" },
  { id: "14", name: "Finger Lakes BOCES", state: "NY", x: 58, y: 22, students: "4,000", buses: 56, savings: "$920K", status: "expansion" },
  { id: "15", name: "Providence Metro", state: "RI", x: 84, y: 22, students: "3,600", buses: 48, savings: "$830K", status: "expansion" },
];

const statusConfig = {
  active: { label: "Active", dotClass: "bg-success", pulseClass: "bg-success", ringClass: "ring-success/30" },
  onboarding: { label: "Onboarding", dotClass: "bg-accent", pulseClass: "bg-accent", ringClass: "ring-accent/30" },
  expansion: { label: "Planned", dotClass: "bg-primary-foreground/40", pulseClass: "bg-primary-foreground/30", ringClass: "ring-primary-foreground/10" },
};

const stateLabels = [
  { abbr: "NY", x: 65, y: 20 },
  { abbr: "PA", x: 48, y: 44 },
  { abbr: "NJ", x: 70, y: 46 },
  { abbr: "CT", x: 80, y: 30 },
  { abbr: "MA", x: 82, y: 16 },
  { abbr: "MD", x: 54, y: 62 },
  { abbr: "RI", x: 87, y: 20 },
];

// Simplified NE/Mid-Atlantic outline paths
const regionPaths = [
  // NY
  "M30,12 L44,10 L56,8 L68,10 L76,16 L80,24 L82,30 L78,36 L70,38 L64,36 L58,34 L50,32 L42,30 L36,26 L30,20 Z",
  // PA
  "M30,32 L50,32 L58,34 L64,36 L66,42 L68,50 L60,54 L50,54 L38,52 L30,48 Z",
  // NJ
  "M66,36 L72,38 L74,44 L72,50 L66,52 L64,46 L64,40 Z",
  // CT
  "M74,28 L82,26 L84,30 L82,34 L76,34 L74,32 Z",
  // MA
  "M74,14 L82,12 L90,14 L90,22 L84,24 L76,22 L74,18 Z",
  // MD
  "M38,54 L50,54 L60,54 L66,56 L68,62 L62,68 L50,66 L40,62 Z",
  // RI
  "M84,18 L90,16 L92,22 L88,24 L84,22 Z",
];

export const CoverageMapSection = () => {
  const [hoveredDistrict, setHoveredDistrict] = useState<District | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);

  const activeDistrict = selectedDistrict || hoveredDistrict;
  const activeCount = districts.filter(d => d.status === "active").length;
  const onboardingCount = districts.filter(d => d.status === "onboarding").length;
  const totalStudents = "58K+";

  return (
    <section className="bg-navy py-20 md:py-28 overflow-hidden" id="coverage">
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        <ScrollReveal>
          <div className="text-center mb-12">
            <p className="text-sm font-bold uppercase tracking-widest text-accent mb-3">Coverage & Expansion</p>
            <h2 className="font-display text-3xl font-bold text-primary-foreground md:text-4xl lg:text-5xl">
              Growing Across the Northeast
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-primary-foreground/60">
              RideLine is transforming school transportation across the Mid-Atlantic and Northeast — with rapid expansion planned.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid lg:grid-cols-[1fr_340px] gap-8 items-start">
          {/* Map */}
          <ScrollReveal>
            <div className="relative rounded-2xl border border-primary-foreground/10 bg-primary-foreground/[0.03] p-4 md:p-8">
              {/* SVG Map */}
              <svg
                viewBox="20 4 80 72"
                className="w-full h-auto"
                style={{ maxHeight: "500px" }}
              >
                {/* Region fills */}
                {regionPaths.map((d, i) => (
                  <path
                    key={i}
                    d={d}
                    fill="hsl(var(--navy-mid))"
                    stroke="hsl(var(--primary-foreground) / 0.1)"
                    strokeWidth="0.3"
                  />
                ))}

                {/* State labels */}
                {stateLabels.map((s) => (
                  <text
                    key={s.abbr}
                    x={s.x}
                    y={s.y}
                    textAnchor="middle"
                    className="fill-primary-foreground/20 text-[3px] font-bold"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {s.abbr}
                  </text>
                ))}

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
                      {/* Pulse ring */}
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
                        r={isActive ? 2 : 1.4}
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
                    <span className="font-bold text-primary-foreground">1,543 districts</span>
                  </div>
                  <div className="h-px bg-primary-foreground/10" />
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-success" />
                    <span className="text-success font-semibold">3 new districts</span>
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
