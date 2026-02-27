/**
 * Mock data for demo mode — provides realistic dashboard data
 * without needing any Supabase queries (bypasses RLS).
 */

import { DEMO_DISTRICTS, type DemoDistrictId } from "@/contexts/DemoModeContext";

// School breakdowns per district
const LAWRENCE_SCHOOLS = [
  { school: "#2", students: 1420, routes: 8 },
  { school: "#4", students: 1210, routes: 7 },
  { school: "#5", students: 1080, routes: 6 },
  { school: "#6", students: 990, routes: 6 },
  { school: "#3", students: 870, routes: 5 },
  { school: "#9", students: 810, routes: 4 },
  { school: "#7", students: 740, routes: 4 },
  { school: "LMHS", students: 680, routes: 4 },
  { school: "#8", students: 502, routes: 3 },
];

const OCEANSIDE_SCHOOLS = [
  { school: "#1", students: 980, routes: 6 },
  { school: "#3", students: 870, routes: 5 },
  { school: "#4", students: 810, routes: 5 },
  { school: "#6", students: 740, routes: 4 },
  { school: "#5", students: 690, routes: 4 },
  { school: "OHS", students: 580, routes: 4 },
  { school: "#2", students: 454, routes: 4 },
];

const LAWRENCE_TIER = [
  { name: "Tier 1", value: 18 },
  { name: "Tier 2", value: 17 },
  { name: "Tier 3", value: 12 },
];

const OCEANSIDE_TIER = [
  { name: "Tier 1", value: 13 },
  { name: "Tier 2", value: 11 },
  { name: "Tier 3", value: 8 },
];

export interface DemoStats {
  totalStudents: number;
  totalRoutes: number;
  activeRoutes: number;
  avgOnTime: number;
  totalMiles: number;
  pendingRegistrations: number;
  avgRideTime: number;
  avgCostPerStudent: number;
}

export interface DemoDashboardData {
  stats: DemoStats;
  schoolData: { school: string; students: number; routes: number }[];
  tierData: { name: string; value: number }[];
  openRequests: number;
  urgentRequests: number;
  expiringCerts: number;
  expiredCerts: number;
  busPassesIssued: number;
  activeDrivers: number;
  totalDrivers: number;
}

const DEMO_DATA: Record<DemoDistrictId, DemoDashboardData> = {
  lawrence: {
    stats: {
      totalStudents: 8302,
      totalRoutes: 47,
      activeRoutes: 44,
      avgOnTime: 94.2,
      totalMiles: 1840,
      pendingRegistrations: 23,
      avgRideTime: 28,
      avgCostPerStudent: 1240,
    },
    schoolData: LAWRENCE_SCHOOLS,
    tierData: LAWRENCE_TIER,
    openRequests: 14,
    urgentRequests: 3,
    expiringCerts: 5,
    expiredCerts: 1,
    busPassesIssued: 7890,
    activeDrivers: 38,
    totalDrivers: 42,
  },
  oceanside: {
    stats: {
      totalStudents: 5124,
      totalRoutes: 32,
      activeRoutes: 30,
      avgOnTime: 96.1,
      totalMiles: 1120,
      pendingRegistrations: 11,
      avgRideTime: 24,
      avgCostPerStudent: 1180,
    },
    schoolData: OCEANSIDE_SCHOOLS,
    tierData: OCEANSIDE_TIER,
    openRequests: 8,
    urgentRequests: 1,
    expiringCerts: 3,
    expiredCerts: 0,
    busPassesIssued: 4820,
    activeDrivers: 26,
    totalDrivers: 28,
  },
};

export function getDemoDashboardData(districtId: DemoDistrictId): DemoDashboardData {
  return DEMO_DATA[districtId];
}

export function getDemoDistrictLabel(districtId: DemoDistrictId): string {
  return DEMO_DISTRICTS.find((d) => d.id === districtId)?.label ?? districtId;
}
