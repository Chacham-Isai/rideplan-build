import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const LABEL_MAP: Record<string, string> = {
  app: "Home",
  dashboard: "Dashboard",
  students: "Students",
  routes: "Routes",
  contracts: "Contracts",
  compliance: "Compliance",
  reports: "Reports",
  settings: "Settings",
  parent: "Parent Portal",
  register: "Register",
  reapply: "Reapply",
  tracking: "Tracking",
  admin: "Admin",
  users: "Users",
  residency: "Residency",
  invoices: "Invoices",
  bids: "Bids",
};

export const AppBreadcrumb = () => {
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1) return null;

  const crumbs = segments.map((seg, i) => ({
    label: LABEL_MAP[seg] ?? seg,
    path: "/" + segments.slice(0, i + 1).join("/"),
    isLast: i === segments.length - 1,
  }));

  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
      {crumbs.map((c) => (
        <span key={c.path} className="flex items-center gap-1">
          {!c.isLast ? (
            <>
              <Link to={c.path} className="hover:text-foreground transition-colors">
                {c.label}
              </Link>
              <ChevronRight className="h-3 w-3" />
            </>
          ) : (
            <span className="text-foreground font-medium">{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
};
