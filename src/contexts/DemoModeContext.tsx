import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export const DEMO_DISTRICTS = [
  { id: "lawrence", label: "Lawrence USD" },
  { id: "oceanside", label: "Oceanside USD" },
] as const;

export type DemoDistrictId = (typeof DEMO_DISTRICTS)[number]["id"];

interface DemoModeContextType {
  isDemoMode: boolean;
  demoDistrictId: DemoDistrictId | null;
  demoRole: string | null;
  enableDemoMode: (districtId: DemoDistrictId) => void;
  disableDemoMode: () => void;
  /** @deprecated Use enableDemoMode */
  startDemoMode: (districtId: string, role: string) => void;
  /** @deprecated Use disableDemoMode */
  exitDemoMode: () => void;
}

const DemoModeContext = createContext<DemoModeContextType>({
  isDemoMode: false,
  demoDistrictId: null,
  demoRole: null,
  enableDemoMode: () => {},
  disableDemoMode: () => {},
  startDemoMode: () => {},
  exitDemoMode: () => {},
});

export const useDemoMode = () => useContext(DemoModeContext);

export const DemoModeProvider = ({ children }: { children: ReactNode }) => {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoDistrictId, setDemoDistrictId] = useState<DemoDistrictId | null>(null);
  const [demoRole, setDemoRole] = useState<string | null>(null);

  const enableDemoMode = useCallback((districtId: DemoDistrictId) => {
    setIsDemoMode(true);
    setDemoDistrictId(districtId);
    setDemoRole("district_admin");
  }, []);

  const disableDemoMode = useCallback(() => {
    setIsDemoMode(false);
    setDemoDistrictId(null);
    setDemoRole(null);
  }, []);

  const startDemoMode = useCallback((districtId: string, role: string) => {
    setIsDemoMode(true);
    setDemoDistrictId(districtId as DemoDistrictId);
    setDemoRole(role);
  }, []);

  const exitDemoMode = useCallback(() => {
    disableDemoMode();
  }, [disableDemoMode]);

  return (
    <DemoModeContext.Provider value={{ isDemoMode, demoDistrictId, demoRole, enableDemoMode, disableDemoMode, startDemoMode, exitDemoMode }}>
      {children}
    </DemoModeContext.Provider>
  );
};
