import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import logoHorizontal from "@/assets/rideline-logo-horizontal.png";

const navLinks = [
  { label: "Platform", href: "#platform" },
  { label: "Features", href: "#features" },
  { label: "Savings", href: "#roi-calculator" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Blog", href: "/blog", isRoute: true },
];

export const Navigation = ({ onGetAudit }: { onGetAudit?: () => void }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = (href: string, isRoute?: boolean) => {
    setMenuOpen(false);
    if (isRoute) {
      navigate(href);
      return;
    }
    if (location.pathname !== "/") {
      navigate("/" + href);
      return;
    }
    const el = document.querySelector(href);
    if (el) {
      const offset = 80;
      const y = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <nav
      className={`sticky top-0 z-40 transition-shadow duration-300 bg-card ${
        scrolled ? "shadow-lg" : ""
      }`}
    >
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-3 md:px-6">
        <a href="/" onClick={(e) => { e.preventDefault(); navigate("/"); }} className="flex-shrink-0">
          <img src={logoHorizontal} alt="RideLine" className="h-12 md:h-14" />
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <button
              key={l.href}
              onClick={() => handleClick(l.href, (l as any).isRoute)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {l.label}
            </button>
          ))}
          <button
            onClick={onGetAudit}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
          >
            Get Free Audit
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t bg-card px-4 pb-4">
          {navLinks.map((l) => (
            <button
              key={l.href}
              onClick={() => handleClick(l.href, (l as any).isRoute)}
              className="block w-full py-3 text-left text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {l.label}
            </button>
          ))}
          <button
            onClick={() => { setMenuOpen(false); onGetAudit?.(); }}
            className="mt-2 w-full rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Get Free Audit
          </button>
        </div>
      )}
    </nav>
  );
};
