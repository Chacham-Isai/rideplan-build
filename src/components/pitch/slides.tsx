import { ReactNode } from "react";

// Shared slide wrapper
const S = ({ children, bg = "bg-[hsl(var(--navy))]" }: { children: ReactNode; bg?: string }) => (
  <div className={`w-full h-full ${bg} flex flex-col justify-center px-[140px] py-[100px] relative overflow-hidden`}>
    {children}
  </div>
);

const Accent = ({ children }: { children: ReactNode }) => (
  <span className="text-[hsl(var(--gold))]">{children}</span>
);

const Stat = ({ value, label }: { value: string; label: string }) => (
  <div className="text-center">
    <div className="text-[72px] font-bold text-[hsl(var(--gold))]" style={{ fontFamily: "var(--font-display)" }}>{value}</div>
    <div className="text-[24px] text-[hsl(var(--primary-foreground))]/70 mt-2">{label}</div>
  </div>
);

const Pill = ({ children }: { children: ReactNode }) => (
  <span className="inline-block px-6 py-2 rounded-full bg-[hsl(var(--gold))]/15 text-[hsl(var(--gold))] text-[20px] font-medium">
    {children}
  </span>
);

// ---- SLIDES ----

export const TitleSlide = () => (
  <S>
    <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[hsl(var(--gold))]/5 blur-[120px]" />
    <Pill>Investor Presentation · 2026</Pill>
    <h1 className="text-[120px] font-bold text-[hsl(var(--primary-foreground))] leading-[1.05] mt-8" style={{ fontFamily: "var(--font-display)" }}>
      icare<Accent>.ai</Accent>
    </h1>
    <p className="text-[36px] text-[hsl(var(--primary-foreground))]/80 mt-6 max-w-[1200px] leading-snug">
      AI-Powered School Transportation Management —<br />
      Safer routes. Smarter spending. Happier communities.
    </p>
    <div className="absolute bottom-[80px] left-[140px] text-[20px] text-[hsl(var(--primary-foreground))]/40">
      Confidential · Not for distribution
    </div>
  </S>
);

export const ProblemSlide = () => (
  <S>
    <Pill>The Problem</Pill>
    <h2 className="text-[72px] font-bold text-[hsl(var(--primary-foreground))] mt-8 leading-tight" style={{ fontFamily: "var(--font-display)" }}>
      A <Accent>$42B+</Accent> Market Running<br />on Paper & Guesswork
    </h2>
    <div className="grid grid-cols-3 gap-16 mt-16">
      <div>
        <div className="text-[56px] font-bold text-[hsl(var(--destructive))]">26M</div>
        <p className="text-[24px] text-[hsl(var(--primary-foreground))]/70 mt-2">students ride school buses daily — the largest mass transit system in the U.S.</p>
      </div>
      <div>
        <div className="text-[56px] font-bold text-[hsl(var(--destructive))]">78%</div>
        <p className="text-[24px] text-[hsl(var(--primary-foreground))]/70 mt-2">of districts still rely on spreadsheets, phone trees, & manual routing</p>
      </div>
      <div>
        <div className="text-[56px] font-bold text-[hsl(var(--destructive))]">$1,300+</div>
        <p className="text-[24px] text-[hsl(var(--primary-foreground))]/70 mt-2">average cost per student per year — with zero visibility into performance</p>
      </div>
    </div>
  </S>
);

export const SolutionSlide = () => (
  <S>
    <Pill>Our Solution</Pill>
    <h2 className="text-[72px] font-bold text-[hsl(var(--primary-foreground))] mt-8 leading-tight" style={{ fontFamily: "var(--font-display)" }}>
      One Platform. <Accent>Complete Control.</Accent>
    </h2>
    <p className="text-[28px] text-[hsl(var(--primary-foreground))]/70 mt-6 max-w-[1200px]">
      icare.ai replaces fragmented tools with a unified, AI-driven platform that optimizes every mile, monitors every bus, and keeps every parent informed.
    </p>
    <div className="grid grid-cols-5 gap-8 mt-16">
      {[
        { icon: "🧠", title: "Student Assignment", desc: "AI-optimized stop & bus matching" },
        { icon: "🗺️", title: "Route Optimization", desc: "15-25% faster routes with real constraints" },
        { icon: "📋", title: "Contractor Oversight", desc: "Invoice auditing & compliance" },
        { icon: "📱", title: "Parent Communication", desc: "Live GPS tracking & digital passes" },
        { icon: "🛡️", title: "Safety & Engagement", desc: "Incident reporting & AI pattern detection" },
      ].map(m => (
        <div key={m.title} className="bg-[hsl(var(--primary-foreground))]/5 rounded-2xl p-8">
          <div className="text-[48px]">{m.icon}</div>
          <div className="text-[22px] font-bold text-[hsl(var(--gold))] mt-4">{m.title}</div>
          <div className="text-[18px] text-[hsl(var(--primary-foreground))]/60 mt-2">{m.desc}</div>
        </div>
      ))}
    </div>
  </S>
);

export const SafetySlide = () => (
  <S>
    <Pill>Safety & Community Suite</Pill>
    <h2 className="text-[72px] font-bold text-[hsl(var(--primary-foreground))] mt-8 leading-tight" style={{ fontFamily: "var(--font-display)" }}>
      AI-Powered <Accent>Safety Intelligence</Accent>
    </h2>
    <div className="grid grid-cols-2 gap-16 mt-16">
      <div className="space-y-10">
        {[
          { title: "Anonymous Reporting Portal", desc: "Parents & students can report bullying, unsafe driving, or concerns — 24/7, no login required." },
          { title: "AI Severity Classification", desc: "Google Gemini analyzes every report in real-time, classifying priority from low to critical." },
          { title: "Pattern Detection Alerts", desc: "3+ incidents on the same bus within 30 days automatically triggers an admin alert." },
          { title: "Driver Appreciation", desc: "Parents can send tips and thank-you messages to great drivers — boosting morale and retention." },
        ].map((f, i) => (
          <div key={i} className="flex gap-6">
            <div className="w-3 h-3 rounded-full bg-[hsl(var(--gold))] mt-3 shrink-0" />
            <div>
              <div className="text-[24px] font-bold text-[hsl(var(--primary-foreground))]">{f.title}</div>
              <div className="text-[20px] text-[hsl(var(--primary-foreground))]/60 mt-1">{f.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center">
        <div className="w-[640px] h-[640px] rounded-3xl bg-gradient-to-br from-[hsl(var(--gold))]/20 to-[hsl(var(--gold))]/5 flex items-center justify-center">
          <div className="text-center">
            <div className="text-[120px]">🛡️</div>
            <div className="text-[28px] text-[hsl(var(--gold))] font-bold mt-4">Live Safety Dashboard</div>
            <div className="text-[20px] text-[hsl(var(--primary-foreground))]/50 mt-2">Real-time admin monitoring</div>
          </div>
        </div>
      </div>
    </div>
  </S>
);

export const MarketSlide = () => (
  <S>
    <Pill>Market Opportunity</Pill>
    <h2 className="text-[72px] font-bold text-[hsl(var(--primary-foreground))] mt-8 leading-tight" style={{ fontFamily: "var(--font-display)" }}>
      Massive, <Accent>Underserved</Accent> Market
    </h2>
    <div className="flex gap-20 mt-16 items-end">
      <Stat value="$42B+" label="Total U.S. Market" />
      <Stat value="480K+" label="School Buses Nationwide" />
      <Stat value="5.9M+" label="Students Eligible" />
      <Stat value="13,800" label="School Districts" />
    </div>
    <div className="mt-16 bg-[hsl(var(--primary-foreground))]/5 rounded-2xl p-10">
      <div className="text-[24px] text-[hsl(var(--primary-foreground))]/70">
        <Accent>TAM:</Accent> $42B total transportation spend · <Accent>SAM:</Accent> $8.4B contracted/outsourced routes · <Accent>SOM:</Accent> $420M initial target (5% of SAM)
      </div>
    </div>
  </S>
);

export const ROISlide = () => (
  <S>
    <Pill>Unit Economics & ROI</Pill>
    <h2 className="text-[72px] font-bold text-[hsl(var(--primary-foreground))] mt-8 leading-tight" style={{ fontFamily: "var(--font-display)" }}>
      <Accent>$710K–$1.6M</Accent> Year 1 Savings
    </h2>
    <p className="text-[24px] text-[hsl(var(--primary-foreground))]/70 mt-4">Per district · Based on 5,000 students, 45 contracted routes</p>
    <div className="grid grid-cols-4 gap-10 mt-16">
      {[
        { val: "15-25%", label: "Route Reduction", desc: "AI consolidation" },
        { val: "$340K", label: "Route Savings", desc: "Fewer buses on the road" },
        { val: "$180K", label: "Staff Efficiency", desc: "Automation of manual processes" },
        { val: "92%", label: "Parent Satisfaction", desc: "Real-time tracking & comms" },
      ].map(r => (
        <div key={r.label} className="bg-[hsl(var(--primary-foreground))]/5 rounded-2xl p-8 text-center">
          <div className="text-[52px] font-bold text-[hsl(var(--gold))]" style={{ fontFamily: "var(--font-display)" }}>{r.val}</div>
          <div className="text-[22px] font-bold text-[hsl(var(--primary-foreground))] mt-3">{r.label}</div>
          <div className="text-[18px] text-[hsl(var(--primary-foreground))]/50 mt-1">{r.desc}</div>
        </div>
      ))}
    </div>
  </S>
);

export const TractionSlide = () => (
  <S>
    <Pill>Traction & Roadmap</Pill>
    <h2 className="text-[72px] font-bold text-[hsl(var(--primary-foreground))] mt-8 leading-tight" style={{ fontFamily: "var(--font-display)" }}>
      Built & <Accent>Live Today</Accent>
    </h2>
    <div className="grid grid-cols-2 gap-20 mt-16">
      <div>
        <div className="text-[28px] font-bold text-[hsl(var(--gold))] mb-6">✅ Delivered</div>
        <ul className="space-y-4 text-[22px] text-[hsl(var(--primary-foreground))]/80">
          <li>• Full marketing site with SEO & blog</li>
          <li>• Parent safety reporting portal (anonymous)</li>
          <li>• Driver incident & maintenance portal</li>
          <li>• AI-powered report triage (Gemini)</li>
          <li>• Admin dashboard with RBAC</li>
          <li>• Driver tipping system (Stripe-ready)</li>
          <li>• Analytics dashboard with trend charts</li>
          <li>• Automated AI pattern-detection alerts</li>
        </ul>
      </div>
      <div>
        <div className="text-[28px] font-bold text-[hsl(var(--primary-foreground))]/40 mb-6">🗓️ Next Milestones</div>
        <ul className="space-y-4 text-[22px] text-[hsl(var(--primary-foreground))]/60">
          <li>• Live GPS tracking integration</li>
          <li>• Route optimization engine (v1)</li>
          <li>• Contractor invoice auditing module</li>
          <li>• Digital bus pass for parents</li>
          <li>• District onboarding & pilot program</li>
          <li>• Mobile app (iOS + Android)</li>
          <li>• STAC/IDEA compliance reporting</li>
          <li>• Multi-district SaaS deployment</li>
        </ul>
      </div>
    </div>
  </S>
);

export const AskSlide = () => (
  <S>
    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[hsl(var(--gold))]/10 to-transparent pointer-events-none" />
    <Pill>The Ask</Pill>
    <h2 className="text-[72px] font-bold text-[hsl(var(--primary-foreground))] mt-8 leading-tight" style={{ fontFamily: "var(--font-display)" }}>
      Raising <Accent>$2.5M</Accent> Seed Round
    </h2>
    <div className="grid grid-cols-3 gap-12 mt-16">
      {[
        { pct: "40%", label: "Engineering", desc: "Route optimization AI, mobile apps, GPS integration" },
        { pct: "30%", label: "Go-to-Market", desc: "District pilots, sales team, conference presence" },
        { pct: "30%", label: "Operations", desc: "Compliance, support infrastructure, team growth" },
      ].map(a => (
        <div key={a.label} className="bg-[hsl(var(--primary-foreground))]/5 rounded-2xl p-10">
          <div className="text-[64px] font-bold text-[hsl(var(--gold))]" style={{ fontFamily: "var(--font-display)" }}>{a.pct}</div>
          <div className="text-[26px] font-bold text-[hsl(var(--primary-foreground))] mt-2">{a.label}</div>
          <div className="text-[20px] text-[hsl(var(--primary-foreground))]/60 mt-3">{a.desc}</div>
        </div>
      ))}
    </div>
    <div className="mt-16 text-center">
      <p className="text-[32px] text-[hsl(var(--primary-foreground))]/80">
        Let's transform how <Accent>26 million students</Accent> get to school.
      </p>
    </div>
  </S>
);

export const SLIDES = [
  { component: TitleSlide, title: "Title" },
  { component: ProblemSlide, title: "Problem" },
  { component: SolutionSlide, title: "Solution" },
  { component: SafetySlide, title: "Safety Suite" },
  { component: MarketSlide, title: "Market" },
  { component: ROISlide, title: "ROI" },
  { component: TractionSlide, title: "Traction" },
  { component: AskSlide, title: "The Ask" },
];
