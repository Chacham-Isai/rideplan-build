import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

// Demo districts with their known IDs from the database
export const DEMO_DISTRICTS = {
  "a1b2c3d4-e5f6-7890-abcd-ef1234567890": {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    name: "Lawrence UFSD",
    state: "NY",
    city: "Lawrence",
    subscription_tier: "enterprise",
    subscription_status: "active",
    studentCount: 8302,
    routeCount: 47,
    activeRoutes: 44,
  },
  "b2c3d4e5-f6a7-8901-bcde-f12345678901": {
    id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    name: "Oceanside UFSD",
    state: "NY",
    city: "Oceanside",
    subscription_tier: "professional",
    subscription_status: "active",
    studentCount: 5124,
    routeCount: 32,
    activeRoutes: 30,
  },
} as const;

export type DemoDistrictId = keyof typeof DEMO_DISTRICTS;

interface DemoModeContextType {
  isDemoMode: boolean;
  demoDistrictId: string | null;
  demoRole: string | null;
  startDemoMode: (districtId: string, role: string) => void;
  exitDemoMode: () => void;
}

const DemoModeContext = createContext<DemoModeContextType>({
  isDemoMode: false,
  demoDistrictId: null,
  demoRole: null,
  startDemoMode: () => {},
  exitDemoMode: () => {},
});

export const useDemoMode = () => useContext(DemoModeContext);

export const DemoModeProvider = ({ children }: { children: ReactNode }) => {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoDistrictId, setDemoDistrictId] = useState<string | null>(null);
  const [demoRole, setDemoRole] = useState<string | null>(null);

  const startDemoMode = useCallback((districtId: string, role: string) => {
    setIsDemoMode(true);
    setDemoDistrictId(districtId);
    setDemoRole(role);
  }, []);

  const exitDemoMode = useCallback(() => {
    setIsDemoMode(false);
    setDemoDistrictId(null);
    setDemoRole(null);
  }, []);

  return (
    <DemoModeContext.Provider value={{ isDemoMode, demoDistrictId, demoRole, startDemoMode, exitDemoMode }}>
      {children}
    </DemoModeContext.Provider>
  );
};
