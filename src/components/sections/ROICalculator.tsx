import { useState, useMemo } from "react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Calculator, DollarSign, TrendingUp, Bus, ArrowRight } from "lucide-react";

const SAVINGS_MULTIPLIERS = {
  routeOptimization: { perRoute: 80000, eliminationRate: 0.12 },
  contractorOversight: { savingsRate: 0.06 },
  staffEfficiency: { hoursPerBus: 15, hourlyRate: 35 },
  parentComm: { callReduction: 0.6, costPerCall: 12, callsPerBus: 200 },
};

export const ROICalculator = ({ onGetAudit }: { onGetAudit?: () => void }) => {
  const [fleetSize, setFleetSize] = useState(100);
  const [routes, setRoutes] = useState(80);
  const [annualBudget, setAnnualBudget] = useState(5000000);

  const savings = useMemo(() => {
    const routeSavings = Math.round(
      routes * SAVINGS_MULTIPLIERS.routeOptimization.eliminationRate *
      SAVINGS_MULTIPLIERS.routeOptimization.perRoute
    );
    const contractorSavings = Math.round(
      annualBudget * SAVINGS_MULTIPLIERS.contractorOversight.savingsRate
    );
    const staffSavings = Math.round(
      fleetSize * SAVINGS_MULTIPLIERS.staffEfficiency.hoursPerBus *
      SAVINGS_MULTIPLIERS.staffEfficiency.hourlyRate
    );
    const commSavings = Math.round(
      fleetSize * SAVINGS_MULTIPLIERS.parentComm.callsPerBus *
      SAVINGS_MULTIPLIERS.parentComm.callReduction *
      SAVINGS_MULTIPLIERS.parentComm.costPerCall
    );
    const total = routeSavings + contractorSavings + staffSavings + commSavings;
    const ridelineCost = 87500;
    const roi = Math.round(total / ridelineCost);

    return { routeSavings, contractorSavings, staffSavings, commSavings, total, roi };
  }, [fleetSize, routes, annualBudget]);

  const formatCurrency = (val: number) =>
    val >= 1000000
      ? `$${(val / 1000000).toFixed(1)}M`
      : `$${(val / 1000).toFixed(0)}K`;

  return (
    <section className="bg-background py-20 md:py-28" id="roi-calculator">
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        <ScrollReveal>
          <div className="text-center mb-12">
            <p className="text-sm font-bold uppercase tracking-widest text-accent mb-3">
              ROI Calculator
            </p>
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
              See Your Savings in <span className="italic text-accent">Real Time</span>
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
              Input your district's details and see how much RideLine could save you in Year 1.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Inputs */}
          <ScrollReveal>
            <div className="rounded-2xl border border-border bg-card p-8 space-y-8">
              <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                <Calculator className="h-5 w-5 text-accent" /> Your District Details
              </h3>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-foreground">Fleet Size</label>
                    <span className="text-sm font-bold text-accent">{fleetSize} buses</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={500}
                    step={5}
                    value={fleetSize}
                    onChange={(e) => setFleetSize(Number(e.target.value))}
                    className="w-full accent-accent"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>10</span><span>500</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-foreground">Number of Routes</label>
                    <span className="text-sm font-bold text-accent">{routes} routes</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={400}
                    step={5}
                    value={routes}
                    onChange={(e) => setRoutes(Number(e.target.value))}
                    className="w-full accent-accent"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>10</span><span>400</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-foreground">Annual Transportation Budget</label>
                    <span className="text-sm font-bold text-accent">{formatCurrency(annualBudget)}</span>
                  </div>
                  <input
                    type="range"
                    min={500000}
                    max={50000000}
                    step={500000}
                    value={annualBudget}
                    onChange={(e) => setAnnualBudget(Number(e.target.value))}
                    className="w-full accent-accent"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>$500K</span><span>$50M</span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Results */}
          <ScrollReveal delay={0.15}>
            <div className="rounded-2xl border border-accent/30 bg-navy p-8 space-y-6">
              <h3 className="font-display text-lg font-bold text-primary-foreground flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-success" /> Estimated Year 1 Savings
              </h3>

              <div className="space-y-4">
                {[
                  { label: "Route Optimization", value: savings.routeSavings, icon: Bus },
                  { label: "Contractor Oversight", value: savings.contractorSavings, icon: DollarSign },
                  { label: "Staff Efficiency", value: savings.staffSavings, icon: Calculator },
                  { label: "Parent Communication", value: savings.commSavings, icon: TrendingUp },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-lg bg-primary-foreground/5 px-4 py-3 border border-primary-foreground/10"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 text-accent" />
                      <span className="text-sm text-primary-foreground/70">{item.label}</span>
                    </div>
                    <span className="font-display text-sm font-bold text-success">
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-primary-foreground/10 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-primary-foreground/70 font-medium">Total Estimated Savings</span>
                  <span className="font-display text-2xl font-bold text-success">
                    {formatCurrency(savings.total)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-primary-foreground/70 font-medium">Estimated ROI</span>
                  <span className="font-display text-2xl font-bold text-accent">
                    {savings.roi}x
                  </span>
                </div>
              </div>

              <button
                onClick={onGetAudit}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-bold text-accent-foreground hover:bg-gold-light transition shadow-lg shadow-accent/20"
              >
                Get Your Exact Savings — Free Audit <ArrowRight className="h-4 w-4" />
              </button>
              <p className="text-xs text-primary-foreground/40 text-center">
                * Estimates based on industry averages. Your free route audit will provide exact figures.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};
