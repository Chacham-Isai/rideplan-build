import { useState } from "react";
import { SEOHead } from "@/components/SEOHead";
import { Navigation } from "@/components/sections/Navigation";
import { Footer } from "@/components/sections/Footer";
import { ContactFormModal } from "@/components/ContactFormModal";
import { ChatWidget } from "@/components/ChatWidget";
import { ScrollReveal } from "@/components/ScrollReveal";
import {
  Newspaper,
  Download,
  ExternalLink,
  Calendar,
  FileText,
  Image as ImageIcon,
  Palette,
  ArrowRight,
  Quote,
  TrendingUp,
  Award,
  Users,
} from "lucide-react";
import logoHorizontal from "@/assets/rideline-logo-horizontal.png";
import logoDark from "@/assets/rideline-logo-dark.png";
import logoIcon from "@/assets/rideline-logo-icon.png";

/* ── Press Mentions ── */
const pressMentions = [
  {
    outlet: "EdTech Magazine",
    logo: "ET",
    date: "January 2026",
    title: "RideLine Raises $12M to Modernize School Bus Operations Across the Northeast",
    excerpt:
      "The startup's AI-powered routing platform has already saved partner districts over $47M in aggregate transportation costs, positioning it as the leading challenger to legacy routing systems.",
    url: "#",
    featured: true,
  },
  {
    outlet: "Government Technology",
    logo: "GT",
    date: "December 2025",
    title: "How One NY District Cut Transportation Costs by 22% with AI",
    excerpt:
      "Capital Region BOCES partnered with RideLine to overhaul routing for 8,500 students — the results exceeded projections within the first semester.",
    url: "#",
  },
  {
    outlet: "School Bus Fleet",
    logo: "SBF",
    date: "November 2025",
    title: "The End of Spreadsheet Routing? A Look at Next-Gen Transportation Platforms",
    excerpt:
      "RideLine's contractor oversight module caught $180K in overbilling for Chesapeake Bay District in its first quarter of operation.",
    url: "#",
  },
  {
    outlet: "The 74 Million",
    logo: "74",
    date: "October 2025",
    title: "Parent GPS Tracking Cuts Office Calls by 65% at Bergen County Schools",
    excerpt:
      "Real-time bus tracking and multilingual notifications gave parents peace of mind — and gave transportation staff their mornings back.",
    url: "#",
  },
  {
    outlet: "District Administration",
    logo: "DA",
    date: "September 2025",
    title: "Five Startups Transforming Back-Office Operations for K–12 Districts",
    excerpt:
      "RideLine made the shortlist for its unique combination of route optimization, contractor invoice verification, and compliance automation.",
    url: "#",
  },
  {
    outlet: "StateScoop",
    logo: "SS",
    date: "August 2025",
    title: "New York State Highlights RideLine's Impact on BEDS/STAC Compliance",
    excerpt:
      "Automated compliance reporting helped participating districts eliminate reporting errors and reclaim staff time previously spent on manual data entry.",
    url: "#",
  },
];

/* ── Media Stats ── */
const mediaStats = [
  { icon: Users, label: "Districts Served", value: "47+" },
  { icon: TrendingUp, label: "Total Savings Delivered", value: "$47M" },
  { icon: Award, label: "Industry Awards", value: "6" },
  { icon: Newspaper, label: "Press Mentions", value: "120+" },
];

/* ── Brand Assets ── */
const brandAssets = [
  {
    name: "Logo — Horizontal (Light BG)",
    description: "Full wordmark for use on light backgrounds. PNG with transparency.",
    preview: logoHorizontal,
    icon: ImageIcon,
  },
  {
    name: "Logo — Horizontal (Dark BG)",
    description: "Full wordmark for use on dark backgrounds. PNG with transparency.",
    preview: logoDark,
    icon: ImageIcon,
  },
  {
    name: "Logo — Icon Only",
    description: "Bus icon mark for favicons, social avatars, and app icons.",
    preview: logoIcon,
    icon: ImageIcon,
  },
];

/* ── Brand Colors ── */
const brandColors = [
  { name: "Navy", hex: "#0F1B2D", swatch: "bg-[#0F1B2D]" },
  { name: "Gold / Accent", hex: "#F5A623", swatch: "bg-[#F5A623]" },
  { name: "White", hex: "#FFFFFF", swatch: "bg-white border border-border" },
  { name: "Success Green", hex: "#22C55E", swatch: "bg-[#22C55E]" },
];

const Press = () => {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <SEOHead
        title="Press & Media Kit — RideLine"
        description="Press mentions, media coverage, and downloadable brand assets for RideLine, the operating system for K–12 school transportation."
        path="/press"
      />
      <Navigation onGetAudit={() => setContactOpen(true)} />

      <main>
        {/* ── Hero ── */}
        <section className="bg-navy pt-28 pb-16 md:pt-36 md:pb-24">
          <div className="mx-auto max-w-[1000px] px-4 text-center">
            <ScrollReveal>
              <p className="text-sm font-bold uppercase tracking-widest text-accent mb-3">
                Press & Media
              </p>
              <h1 className="font-display text-3xl font-bold text-primary-foreground md:text-5xl">
                RideLine in the <span className="italic text-accent">News</span>
              </h1>
              <p className="mt-4 text-primary-foreground/60 max-w-xl mx-auto">
                Coverage, milestones, and everything journalists need to tell
                the RideLine story.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* ── Stats Bar ── */}
        <section className="border-b border-border bg-card py-8">
          <div className="mx-auto max-w-[1000px] px-4">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {mediaStats.map((s) => (
                <div key={s.label} className="text-center">
                  <s.icon className="mx-auto mb-2 h-5 w-5 text-accent" />
                  <p className="font-display text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Press Mentions ── */}
        <section className="py-16 md:py-24 bg-background">
          <div className="mx-auto max-w-[1000px] px-4">
            <ScrollReveal>
              <div className="flex items-center gap-2 mb-8">
                <Newspaper className="h-5 w-5 text-accent" />
                <h2 className="font-display text-2xl font-bold md:text-3xl">
                  Press Coverage
                </h2>
              </div>
            </ScrollReveal>

            <div className="space-y-6">
              {pressMentions.map((p, i) => (
                <ScrollReveal key={p.title} delay={i * 0.05}>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group block rounded-xl border p-5 md:p-6 transition-all hover:shadow-md hover:border-accent/40 ${
                      p.featured
                        ? "border-accent/30 bg-accent/[0.03]"
                        : "border-border bg-card"
                    }`}
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:gap-5">
                      {/* Outlet badge */}
                      <div className="flex-shrink-0 flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted font-display text-xs font-bold text-foreground">
                          {p.logo}
                        </span>
                        <div className="md:hidden">
                          <p className="text-xs font-semibold text-foreground">
                            {p.outlet}
                          </p>
                          <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Calendar className="h-3 w-3" /> {p.date}
                          </p>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="hidden md:flex items-center gap-2 mb-1">
                          <p className="text-xs font-semibold text-muted-foreground">
                            {p.outlet}
                          </p>
                          <span className="text-muted-foreground/30">·</span>
                          <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Calendar className="h-3 w-3" /> {p.date}
                          </p>
                          {p.featured && (
                            <span className="ml-auto rounded-full bg-accent/15 px-2.5 py-0.5 text-[10px] font-bold text-accent">
                              Featured
                            </span>
                          )}
                        </div>
                        <h3 className="font-display text-base font-bold leading-snug group-hover:text-accent transition-colors md:text-lg">
                          {p.title}
                        </h3>
                        <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
                          {p.excerpt}
                        </p>
                      </div>

                      <ExternalLink className="hidden md:block h-4 w-4 flex-shrink-0 text-muted-foreground/30 group-hover:text-accent transition-colors mt-1" />
                    </div>
                  </a>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Company Boilerplate ── */}
        <section className="bg-muted/50 py-16 md:py-24">
          <div className="mx-auto max-w-[1000px] px-4">
            <ScrollReveal>
              <div className="flex items-center gap-2 mb-6">
                <Quote className="h-5 w-5 text-accent" />
                <h2 className="font-display text-2xl font-bold md:text-3xl">
                  About RideLine
                </h2>
              </div>
              <div className="rounded-xl border border-border bg-card p-6 md:p-8 space-y-4 text-sm leading-relaxed text-muted-foreground">
                <p>
                  <strong className="text-foreground">RideLine</strong> is the
                  first purpose-built operating system for K–12 school
                  transportation. The platform replaces fragmented spreadsheets,
                  phone calls, and guesswork with a single command center that
                  optimizes routes, verifies contractor invoices, automates
                  compliance reporting, and gives parents real-time visibility
                  into every bus.
                </p>
                <p>
                  Founded in 2024, RideLine serves 47+ districts across the
                  Mid-Atlantic and Northeast, managing transportation for
                  890,000+ students and delivering over $47M in aggregate
                  savings. Districts typically achieve 12–25× ROI in their first
                  year, saving $710K–$1.6M annually.
                </p>
                <p>
                  For media inquiries, contact{" "}
                  <a
                    href="mailto:press@rideline.io"
                    className="text-accent hover:underline font-medium"
                  >
                    press@rideline.io
                  </a>
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ── Brand Assets ── */}
        <section className="py-16 md:py-24 bg-background">
          <div className="mx-auto max-w-[1000px] px-4">
            <ScrollReveal>
              <div className="flex items-center gap-2 mb-2">
                <Download className="h-5 w-5 text-accent" />
                <h2 className="font-display text-2xl font-bold md:text-3xl">
                  Brand Assets
                </h2>
              </div>
              <p className="text-sm text-muted-foreground mb-8">
                Download official logos and brand guidelines. Please don't
                modify, rotate, or recolor the marks.
              </p>
            </ScrollReveal>

            {/* Logos */}
            <div className="grid gap-6 md:grid-cols-3 mb-12">
              {brandAssets.map((a, i) => (
                <ScrollReveal key={a.name} delay={i * 0.08}>
                  <div className="group rounded-xl border border-border bg-card overflow-hidden transition-all hover:shadow-md hover:border-accent/30">
                    <div
                      className={`flex items-center justify-center h-36 p-6 ${
                        a.name.includes("Dark")
                          ? "bg-navy"
                          : "bg-muted/50"
                      }`}
                    >
                      <img
                        src={a.preview}
                        alt={a.name}
                        className="max-h-16 w-auto object-contain"
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="font-display text-sm font-bold">
                        {a.name}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {a.description}
                      </p>
                      <a
                        href={a.preview}
                        download
                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
                      >
                        <Download className="h-3.5 w-3.5" /> Download PNG
                      </a>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            {/* Brand Colors */}
            <ScrollReveal>
              <div className="flex items-center gap-2 mb-4">
                <Palette className="h-5 w-5 text-accent" />
                <h3 className="font-display text-lg font-bold">
                  Brand Colors
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {brandColors.map((c) => (
                  <div
                    key={c.name}
                    className="rounded-xl border border-border bg-card p-4"
                  >
                    <div
                      className={`h-12 w-full rounded-lg mb-3 ${c.swatch}`}
                    />
                    <p className="font-display text-sm font-bold">{c.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {c.hex}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollReveal>

            {/* Typography note */}
            <ScrollReveal>
              <div className="mt-8 rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-accent" />
                  <h4 className="font-display text-sm font-bold">
                    Typography
                  </h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Display:</strong> DM
                  Serif Display — used for headings and hero text.{" "}
                  <strong className="text-foreground">Body:</strong> Inter —
                  used for body copy and UI elements.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="bg-navy py-16">
          <div className="mx-auto max-w-[600px] px-4 text-center">
            <ScrollReveal>
              <h2 className="font-display text-2xl font-bold text-primary-foreground md:text-3xl">
                Media Inquiries?
              </h2>
              <p className="mt-3 text-primary-foreground/60 text-sm">
                For interviews, data requests, or story ideas, reach our
                communications team.
              </p>
              <a
                href="mailto:press@rideline.io"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-bold text-accent-foreground shadow-md hover:bg-gold-light transition-colors"
              >
                Email press@rideline.io <ArrowRight className="h-4 w-4" />
              </a>
            </ScrollReveal>
          </div>
        </section>
      </main>

      <Footer />
      <ContactFormModal open={contactOpen} onOpenChange={setContactOpen} />
      <ChatWidget />
    </div>
  );
};

export default Press;
