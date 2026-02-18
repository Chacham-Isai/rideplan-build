import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logoHorizontal from "@/assets/rideline-logo-horizontal.png";

const navLinks = [
  { label: "Platform", href: "#platform" },
  { label: "Features", href: "#features" },
  { label: "Safety", href: "#safety" },
  { label: "Pricing", href: "#pricing" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Demo", href: "/demo", isRoute: true },
  { label: "Resources", href: "/resources", isRoute: true },
  { label: "About", href: "/about", isRoute: true },
  { label: "Blog", href: "/blog", isRoute: true },
];

const sectionIds = navLinks.filter(l => !l.isRoute).map(l => l.href.slice(1));

export const Navigation = ({ onGetAudit }: { onGetAudit?: () => void }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (location.pathname !== "/") return;
    const observers: IntersectionObserver[] = [];
    const visibleSections = new Map<string, number>();

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            visibleSections.set(id, entry.intersectionRatio);
          } else {
            visibleSections.delete(id);
          }
          // Pick the section with highest ratio
          let best = "";
          let bestRatio = 0;
          visibleSections.forEach((ratio, sId) => {
            if (ratio > bestRatio) { best = sId; bestRatio = ratio; }
          });
          setActiveSection(best);
        },
        { rootMargin: "-80px 0px -40% 0px", threshold: [0, 0.25, 0.5] }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [location.pathname]);

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
        <a href="/" onClick={(e) => { e.preventDefault(); if (location.pathname === "/") { window.scrollTo({ top: 0, behavior: "smooth" }); } else { navigate("/"); } }} className="flex-shrink-0">
          <img src={logoHorizontal} alt="RideLine" className="h-12 md:h-14" />
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => {
            const isActive = !l.isRoute && location.pathname === "/" && activeSection === l.href.slice(1);
            const isBlogActive = l.isRoute && location.pathname.startsWith(l.href);
            return (
              <button
                key={l.href}
                onClick={() => handleClick(l.href, (l as any).isRoute)}
                className={`relative text-sm font-medium transition-colors duration-200 after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:bg-accent after:transition-all after:duration-300 after:ease-out ${
                  isActive || isBlogActive
                    ? "text-accent after:w-full"
                    : "text-muted-foreground hover:text-foreground after:w-0 hover:after:w-full"
                }`}
              >
                {l.label}
              </button>
            );
          })}
          <button
            onClick={onGetAudit}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary/90 hover:scale-105 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98]"
          >
            Get Free Audit
          </button>
        </div>

        {/* Animated hamburger */}
        <button
          className="md:hidden relative w-10 h-10 flex items-center justify-center"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className="sr-only">Menu</span>
          <motion.span
            className="absolute h-0.5 w-6 rounded-full bg-foreground"
            animate={menuOpen ? { rotate: 45, y: 0 } : { rotate: 0, y: -6 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          />
          <motion.span
            className="absolute h-0.5 w-6 rounded-full bg-foreground"
            animate={menuOpen ? { opacity: 0, x: -8 } : { opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.span
            className="absolute h-0.5 w-6 rounded-full bg-foreground"
            animate={menuOpen ? { rotate: -45, y: 0 } : { rotate: 0, y: 6 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          />
        </button>
      </div>

      {/* Animated mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="md:hidden border-t bg-card px-4 pb-4 overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {navLinks.map((l, i) => {
              const isActive = !l.isRoute && location.pathname === "/" && activeSection === l.href.slice(1);
              const isBlogActive = l.isRoute && location.pathname.startsWith(l.href);
              return (
                <motion.button
                  key={l.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.25 }}
                  onClick={() => handleClick(l.href, (l as any).isRoute)}
                  className={`block w-full py-3 text-left text-sm font-medium ${
                    isActive || isBlogActive
                      ? "text-accent"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {l.label}
                </motion.button>
              );
            })}
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: navLinks.length * 0.04, duration: 0.25 }}
              onClick={() => { setMenuOpen(false); onGetAudit?.(); }}
              className="mt-2 w-full rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Get Free Audit
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
