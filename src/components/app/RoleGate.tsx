import type { ReactNode } from "react";
import { useDistrict } from "@/contexts/DistrictContext";
import { ShieldAlert } from "lucide-react";

const ROLE_HIERARCHY: Record<string, number> = {
  super_admin: 6,
  district_admin: 5,
  transport_director: 4,
  staff: 3,
  parent: 2,
  viewer: 1,
};

interface RoleGateProps {
  requires: string;
  children: ReactNode;
}

export const RoleGate = ({ requires, children }: RoleGateProps) => {
  const { role, loading } = useDistrict();

  if (loading) return null;

  const userLevel = ROLE_HIERARCHY[role ?? "viewer"] ?? 0;
  const requiredLevel = ROLE_HIERARCHY[requires] ?? 99;

  // Parent is lateral — only matches parent
  if (requires === "parent" && role === "parent") return <>{children}</>;
  if (role === "parent" && requires !== "parent") {
    return <AccessDenied />;
  }

  if (userLevel >= requiredLevel) return <>{children}</>;

  return <AccessDenied />;
};

const AccessDenied = () => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="rounded-2xl border bg-card p-10 shadow-sm">
      <ShieldAlert className="mx-auto mb-4 h-12 w-12 text-destructive" />
      <h2 className="font-['Playfair_Display'] text-2xl font-bold text-foreground">
        Access Denied
      </h2>
      <p className="mt-2 max-w-sm text-muted-foreground">
        You don't have permission to view this page. Contact your district administrator for access.
      </p>
    </div>
  </div>
);
