import { ScrollReveal } from "@/components/ScrollReveal";

const rows = [
  { op: "New Enrollment", today: "Check 4 spreadsheets for assignment", after: "Auto-assigned in seconds" },
  { op: "Route Capacity", today: "Paying for 45 routes (maybe?)", after: "AI audit confirms exact need" },
  { op: "Contractor Renewals", today: "Accepting +3% rate hikes blindly", after: "Negotiating with benchmarks" },
  { op: "Summer Mailings", today: "Hand-stuffing 4,000 letters", after: "One-click generation & email" },
  { op: "Parent Support", today: "20+ calls/day about assignments", after: "Self-service parent portal" },
  { op: "State Reporting", today: "2 weeks of manual data pulling", after: "Auto-generated from live data" },
  { op: "Board Requests", today: "Scrambling for 3 days", after: "One-click dashboard" },
];

export const ComparisonTable = () => (
  <section className="bg-background py-20 md:py-28">
    <div className="mx-auto max-w-[1200px] px-4 md:px-6">
      <ScrollReveal>
        <div className="text-center mb-14">
          <p className="text-sm font-bold uppercase tracking-widest text-accent mb-3">The Transformation</p>
          <h2 className="font-display text-3xl font-bold md:text-4xl lg:text-5xl">Before vs. After RideLine</h2>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.15}>
        <div className="overflow-x-auto rounded-2xl border shadow-lg bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Operation</th>
                <th className="px-6 py-4 text-left font-semibold text-destructive">Today</th>
                <th className="px-6 py-4 text-left font-semibold text-success">With RideLine</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-medium">{r.op}</td>
                  <td className="px-6 py-4 text-muted-foreground">{r.today}</td>
                  <td className="px-6 py-4 font-medium text-success">{r.after}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ScrollReveal>
    </div>
  </section>
);
