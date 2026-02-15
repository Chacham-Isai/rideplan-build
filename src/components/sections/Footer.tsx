import logoDark from "@/assets/rideline-logo-dark.png";
import { Linkedin, Twitter, Facebook } from "lucide-react";

const platformLinks = ["Student Assignment", "Route Optimization", "Contractor Oversight", "Parent Communication", "Compliance & Reporting"];
const companyLinks = ["About", "Careers", "Blog", "Press", "Contact"];
const resourceLinks = ["Case Studies", "ROI Calculator", "Webinars", "Documentation", "Support"];

export const Footer = () => (
  <footer className="bg-navy pt-16 pb-8">
    <div className="mx-auto max-w-[1200px] px-4 md:px-6">
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 pb-12 border-b border-primary-foreground/10">
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
              <li key={l}>
                <a href="#platform" className="text-sm text-primary-foreground/50 hover:text-accent transition-colors">{l}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="font-display text-sm font-bold text-primary-foreground mb-4">Company</h4>
          <ul className="space-y-2">
            {companyLinks.map((l) => {
              const href = l === "About" ? "/about" : l === "Blog" ? "/blog" : l === "Press" ? "/press" : "#";
              return (
                <li key={l}>
                  <a href={href} className="text-sm text-primary-foreground/50 hover:text-accent transition-colors">{l}</a>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h4 className="font-display text-sm font-bold text-primary-foreground mb-4">Resources</h4>
          <ul className="space-y-2">
            {resourceLinks.map((l) => (
              <li key={l}>
                <a href="#" className="text-sm text-primary-foreground/50 hover:text-accent transition-colors">{l}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom */}
      <div className="flex flex-col items-center justify-between gap-4 pt-8 sm:flex-row">
        <p className="text-xs text-primary-foreground/40">© 2026 RideLine. School Transportation, Solved.</p>
        <div className="flex gap-4">
          <a href="#" className="text-primary-foreground/40 hover:text-accent transition-colors" aria-label="LinkedIn"><Linkedin className="h-5 w-5" /></a>
          <a href="#" className="text-primary-foreground/40 hover:text-accent transition-colors" aria-label="Twitter"><Twitter className="h-5 w-5" /></a>
          <a href="#" className="text-primary-foreground/40 hover:text-accent transition-colors" aria-label="Facebook"><Facebook className="h-5 w-5" /></a>
        </div>
      </div>
    </div>
  </footer>
);
