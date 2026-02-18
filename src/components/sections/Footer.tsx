import logoDark from "@/assets/rideline-logo-dark.png";
import { Linkedin, Twitter, Facebook } from "lucide-react";

const platformLinks = [
  { label: "Student Assignment", href: "/demo" },
  { label: "Route Optimization", href: "/demo" },
  { label: "Contractor Oversight", href: "/demo" },
  { label: "Parent Communication", href: "/demo" },
  { label: "Compliance & Reporting", href: "/demo" },
];

const companyLinks = [
  { label: "About", href: "/about" },
  { label: "Careers", href: "/careers" },
  { label: "Blog", href: "/blog" },
  { label: "Press", href: "/press" },
];

const resourceLinks = [
  { label: "Blog", href: "/blog" },
  { label: "Resources", href: "/resources" },
  { label: "Request a Demo", href: "/demo" },
];

const safetyLinks = [
  { label: "Report a Concern", href: "/report" },
  { label: "Driver Portal", href: "/driver-portal" },
  { label: "Tip a Driver", href: "/tip-driver" },
];

export const Footer = () => (
  <footer className="bg-navy pt-16 pb-8">
    <div className="mx-auto max-w-[1200px] px-4 md:px-6">
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5 pb-12 border-b border-primary-foreground/10">
        {/* Brand */}
        <div>
          <img src={logoDark} alt="RideLine" className="h-14 mb-4" />
          <p className="text-sm text-primary-foreground/50 leading-relaxed">
            The operating system for K–12 school transportation. Every route. Every dollar. Every student.
          </p>
        </div>

        {/* Platform */}
        <div>
          <h4 className="font-display text-sm font-bold text-primary-foreground mb-4">Platform</h4>
          <ul className="space-y-2">
            {platformLinks.map((l) => (
              <li key={l.label}>
                <a href={l.href} className="text-sm text-primary-foreground/50 hover:text-accent transition-colors">{l.label}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="font-display text-sm font-bold text-primary-foreground mb-4">Company</h4>
          <ul className="space-y-2">
            {companyLinks.map((l) => (
              <li key={l.label}>
                <a href={l.href} className="text-sm text-primary-foreground/50 hover:text-accent transition-colors">{l.label}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h4 className="font-display text-sm font-bold text-primary-foreground mb-4">Resources</h4>
          <ul className="space-y-2">
            {resourceLinks.map((l) => (
              <li key={l.label}>
                <a href={l.href} className="text-sm text-primary-foreground/50 hover:text-accent transition-colors">{l.label}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Safety */}
        <div>
          <h4 className="font-display text-sm font-bold text-primary-foreground mb-4">Safety & Drivers</h4>
          <ul className="space-y-2">
            {safetyLinks.map((l) => (
              <li key={l.label}>
                <a href={l.href} className="text-sm text-primary-foreground/50 hover:text-accent transition-colors">{l.label}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom */}
      <div className="flex flex-col items-center justify-between gap-4 pt-8 sm:flex-row">
        <div className="flex items-center gap-4">
          <p className="text-xs text-primary-foreground/40">© 2026 RideLine. School Transportation, Solved.</p>
          <span className="text-primary-foreground/20 hidden sm:inline">|</span>
          <a href="/privacy" className="text-xs text-primary-foreground/40 hover:text-accent transition-colors">Privacy Policy</a>
          <a href="/terms" className="text-xs text-primary-foreground/40 hover:text-accent transition-colors">Terms of Service</a>
        </div>
      </div>
    </div>
  </footer>
);
