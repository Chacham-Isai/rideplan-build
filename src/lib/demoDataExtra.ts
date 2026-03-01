/**
 * Extra demo data for Communications, Contracts, Compliance,
 * Calendar, Field Trips, and Accident Reports.
 */

import type { DemoDistrictId } from "@/contexts/DemoModeContext";

// ═══ COMMUNICATIONS ═══
export interface DemoCommLog {
  id: string;
  contact_type: string;
  contact_name: string;
  direction: string;
  channel: string;
  subject: string;
  notes: string | null;
  created_at: string;
}

const LAW_COMMS: DemoCommLog[] = [
  { id: "demo-comm-1", contact_type: "parent", contact_name: "Sarah Martinez", direction: "inbound", channel: "phone", subject: "Bus stop safety concern on Main St", notes: "Parent concerned about construction blocking sidewalk near stop. Advised route supervisor will inspect tomorrow.", created_at: "2025-10-15T09:30:00Z" },
  { id: "demo-comm-2", contact_type: "parent", contact_name: "John Williams", direction: "inbound", channel: "phone", subject: "Bus B-105 late 3 days in a row", notes: "Escalated to contractor. Driver spoken to.", created_at: "2025-10-14T14:45:00Z" },
  { id: "demo-comm-3", contact_type: "contractor", contact_name: "East End Bus Co.", direction: "outbound", channel: "email", subject: "Route L-005 on-time performance review", notes: "Sent formal notice re: below-90% OTP for October.", created_at: "2025-10-14T11:00:00Z" },
  { id: "demo-comm-4", contact_type: "school", contact_name: "Number Two School — Principal Rivera", direction: "outbound", channel: "email", subject: "Updated PM dismissal routes", notes: "Sent revised PM route map and stop list for 2nd semester.", created_at: "2025-10-13T15:20:00Z" },
  { id: "demo-comm-5", contact_type: "parent", contact_name: "Maria Garcia", direction: "inbound", channel: "text", subject: "Address change notification", notes: "Family moved to 280 Cedarhurst Ave. Route reassignment in progress.", created_at: "2025-10-13T10:50:00Z" },
  { id: "demo-comm-6", contact_type: "parent", contact_name: "Lisa Thomas", direction: "inbound", channel: "phone", subject: "Late bus inquiry for after-school tutoring", notes: "Informed parent late bus runs T/Th until 4:30 PM.", created_at: "2025-10-12T11:25:00Z" },
  { id: "demo-comm-7", contact_type: "school", contact_name: "LMHS — VP Anderson", direction: "inbound", channel: "phone", subject: "Student behavior on Bus B-141", notes: "VP reports ongoing behavioral issues. Will coordinate with driver and parent.", created_at: "2025-10-11T13:00:00Z" },
  { id: "demo-comm-8", contact_type: "contractor", contact_name: "Lawrence Transit", direction: "outbound", channel: "phone", subject: "19-A certification deadline reminder", notes: "3 drivers have certs expiring in 30 days. Contractor acknowledged.", created_at: "2025-10-10T09:15:00Z" },
  { id: "demo-comm-9", contact_type: "other_district", contact_name: "Cedarhurst UFSD", direction: "outbound", channel: "email", subject: "Shared services piggyback — Route coordination", notes: "Discussed sharing PM route for 8 students in overlapping area.", created_at: "2025-10-09T14:30:00Z" },
  { id: "demo-comm-10", contact_type: "parent", contact_name: "Jennifer Wilson", direction: "inbound", channel: "phone", subject: "Mott Ave stop — poor visibility", notes: "Created service request for stop relocation.", created_at: "2025-10-08T08:40:00Z" },
  { id: "demo-comm-11", contact_type: "parent", contact_name: "Karen Clark", direction: "inbound", channel: "phone", subject: "Driver not waiting for student", notes: "Filed driver complaint. Bus left at 7:12 for 7:15 pickup.", created_at: "2025-10-07T07:50:00Z" },
  { id: "demo-comm-12", contact_type: "school", contact_name: "Number Five School — Mrs. Baker", direction: "inbound", channel: "email", subject: "Field trip bus request — Nov 15", notes: "Confirmed 2 buses available for Museum of Natural History trip.", created_at: "2025-10-06T10:00:00Z" },
  { id: "demo-comm-13", contact_type: "parent", contact_name: "Michael Harris", direction: "inbound", channel: "email", subject: "Snow day policy question", notes: "Directed to district website FAQ and notification system.", created_at: "2025-10-05T16:15:00Z" },
  { id: "demo-comm-14", contact_type: "contractor", contact_name: "East End Bus Co.", direction: "inbound", channel: "phone", subject: "Bus B-133 mechanical breakdown", notes: "Substitute bus deployed within 25 minutes. No students affected.", created_at: "2025-10-04T06:45:00Z" },
  { id: "demo-comm-15", contact_type: "parent", contact_name: "Ashley Lopez", direction: "inbound", channel: "phone", subject: "Kindergarten orientation schedule", notes: "Bus safety orientation scheduled for Oct 20. Sent details.", created_at: "2025-10-02T16:50:00Z" },
];

const OCE_COMMS: DemoCommLog[] = LAW_COMMS.slice(0, 10).map((c, i) => ({
  ...c,
  id: `demo-comm-oce-${i + 1}`,
  contact_name: c.contact_type === "contractor" ? "South Shore Bus" : c.contact_name,
}));

export function getDemoComms(districtId: DemoDistrictId): DemoCommLog[] {
  return districtId === "lawrence" ? LAW_COMMS : OCE_COMMS;
}

// ═══ CONTRACTS ═══
export interface DemoContract {
  id: string;
  contractor_name: string;
  contact_email: string | null;
  contact_phone: string | null;
  contract_start: string;
  contract_end: string;
  annual_value: number;
  routes_count: number;
  rate_per_route: number | null;
  rate_per_mile: number | null;
  status: string;
  notes: string | null;
  renewal_terms: string | null;
}

export interface DemoInvoice {
  id: string;
  contract_id: string;
  invoice_number: string;
  invoice_date: string;
  invoiced_amount: number;
  verified_amount: number | null;
  discrepancy_amount: number | null;
  gps_verified: boolean;
  status: string;
  contractor_name?: string;
}

export interface DemoInsurance {
  id: string;
  contract_id: string;
  provider: string;
  policy_number: string;
  coverage_amount: number;
  expiration_date: string;
  status: string;
  additional_insured: boolean;
  contractor_name?: string;
}

const LAW_CONTRACTS: DemoContract[] = [
  { id: "demo-contract-1", contractor_name: "East End Bus Co.", contact_email: "dispatch@eastendbus.com", contact_phone: "516-555-3001", contract_start: "2024-07-01", contract_end: "2027-06-30", annual_value: 2840000, routes_count: 28, rate_per_route: 101428, rate_per_mile: 4.85, status: "active", notes: "3-year contract with 2% annual escalator", renewal_terms: "Auto-renew for 1 year unless 90-day notice" },
  { id: "demo-contract-2", contractor_name: "Lawrence Transit", contact_email: "ops@lawrencetransit.com", contact_phone: "516-555-3002", contract_start: "2025-01-01", contract_end: "2026-12-31", annual_value: 1560000, routes_count: 15, rate_per_route: 104000, rate_per_mile: 5.10, status: "active", notes: "Handles special ed routes and late buses", renewal_terms: "Board approval required" },
  { id: "demo-contract-3", contractor_name: "Nassau Student Transport", contact_email: "info@nassautransport.com", contact_phone: "516-555-3003", contract_start: "2023-09-01", contract_end: "2025-12-31", annual_value: 420000, routes_count: 4, rate_per_route: 105000, rate_per_mile: 5.25, status: "expiring", notes: "Handles non-public school routes", renewal_terms: "RFP required for renewal" },
];

const LAW_INVOICES: DemoInvoice[] = [
  { id: "demo-inv-1", contract_id: "demo-contract-1", invoice_number: "EEB-2025-OCT", invoice_date: "2025-10-01", invoiced_amount: 236667, verified_amount: 234200, discrepancy_amount: 2467, gps_verified: true, status: "disputed", contractor_name: "East End Bus Co." },
  { id: "demo-inv-2", contract_id: "demo-contract-1", invoice_number: "EEB-2025-SEP", invoice_date: "2025-09-01", invoiced_amount: 236667, verified_amount: 236667, discrepancy_amount: 0, gps_verified: true, status: "approved", contractor_name: "East End Bus Co." },
  { id: "demo-inv-3", contract_id: "demo-contract-2", invoice_number: "LT-2025-OCT", invoice_date: "2025-10-01", invoiced_amount: 130000, verified_amount: null, discrepancy_amount: null, gps_verified: false, status: "pending", contractor_name: "Lawrence Transit" },
  { id: "demo-inv-4", contract_id: "demo-contract-2", invoice_number: "LT-2025-SEP", invoice_date: "2025-09-01", invoiced_amount: 130000, verified_amount: 128500, discrepancy_amount: 1500, gps_verified: true, status: "approved", contractor_name: "Lawrence Transit" },
  { id: "demo-inv-5", contract_id: "demo-contract-3", invoice_number: "NST-2025-OCT", invoice_date: "2025-10-01", invoiced_amount: 35000, verified_amount: null, discrepancy_amount: null, gps_verified: false, status: "pending", contractor_name: "Nassau Student Transport" },
];

const LAW_INSURANCE: DemoInsurance[] = [
  { id: "demo-ins-1", contract_id: "demo-contract-1", provider: "Liberty Mutual", policy_number: "LM-2025-88401", coverage_amount: 5000000, expiration_date: "2026-06-30", status: "active", additional_insured: true, contractor_name: "East End Bus Co." },
  { id: "demo-ins-2", contract_id: "demo-contract-2", provider: "Travelers", policy_number: "TV-2025-55320", coverage_amount: 5000000, expiration_date: "2025-12-31", status: "expiring_soon", additional_insured: true, contractor_name: "Lawrence Transit" },
  { id: "demo-ins-3", contract_id: "demo-contract-3", provider: "Hartford", policy_number: "HF-2025-12098", coverage_amount: 3000000, expiration_date: "2025-11-30", status: "expiring_soon", additional_insured: false, contractor_name: "Nassau Student Transport" },
];

export function getDemoContracts(districtId: DemoDistrictId) {
  if (districtId === "lawrence") return { contracts: LAW_CONTRACTS, invoices: LAW_INVOICES, insurance: LAW_INSURANCE };
  // Oceanside smaller
  return {
    contracts: LAW_CONTRACTS.slice(0, 2).map((c, i) => ({ ...c, id: `demo-contract-oce-${i+1}`, annual_value: Math.round(c.annual_value * 0.7), routes_count: Math.round(c.routes_count * 0.7) })),
    invoices: LAW_INVOICES.slice(0, 3).map((inv, i) => ({ ...inv, id: `demo-inv-oce-${i+1}` })),
    insurance: LAW_INSURANCE.slice(0, 2).map((ins, i) => ({ ...ins, id: `demo-ins-oce-${i+1}` })),
  };
}

// ═══ COMPLIANCE ═══
export interface DemoComplianceData {
  reports: any[];
  training: any[];
  mvStudents: any[];
  edLaw: any[];
  breaches: any[];
}

export function getDemoCompliance(districtId: DemoDistrictId): DemoComplianceData {
  const prefix = districtId === "lawrence" ? "law" : "oce";
  return {
    reports: [
      { id: `demo-cr-${prefix}-1`, report_type: "beds", title: "BEDS Transportation Report — 2025-2026", school_year: "2025-2026", status: "pending", filing_deadline: "2026-02-01", filed_date: null, student_count: districtId === "lawrence" ? 8302 : 5124, route_count: districtId === "lawrence" ? 47 : 32, total_expenditure: districtId === "lawrence" ? 4820000 : 2980000, state_aid_claimed: districtId === "lawrence" ? 3210000 : 1980000, created_at: "2025-10-01T10:00:00Z" },
      { id: `demo-cr-${prefix}-2`, report_type: "stac", title: "STAC-1 Claims — 2025-2026", school_year: "2025-2026", status: "in_progress", filing_deadline: "2026-06-30", filed_date: null, student_count: districtId === "lawrence" ? 156 : 88, route_count: 0, total_expenditure: districtId === "lawrence" ? 890000 : 520000, state_aid_claimed: districtId === "lawrence" ? 712000 : 416000, created_at: "2025-10-01T10:00:00Z" },
      { id: `demo-cr-${prefix}-3`, report_type: "sa3", title: "SA-3 Expenditure Report — 2024-2025", school_year: "2024-2025", status: "filed", filing_deadline: "2025-11-01", filed_date: "2025-10-28", student_count: districtId === "lawrence" ? 7950 : 4890, route_count: districtId === "lawrence" ? 45 : 30, total_expenditure: districtId === "lawrence" ? 4520000 : 2780000, state_aid_claimed: districtId === "lawrence" ? 3050000 : 1870000, created_at: "2025-08-15T10:00:00Z" },
    ],
    training: [
      { id: `demo-tr-${prefix}-1`, title: "Ed Law 2-D Data Privacy Training", training_type: "data_privacy", required_for: "all_staff", status: "in_progress", due_date: "2025-12-01", total_required: districtId === "lawrence" ? 12 : 8, completed_count: districtId === "lawrence" ? 9 : 6 },
      { id: `demo-tr-${prefix}-2`, title: "Bus Evacuation Drill Training", training_type: "safety", required_for: "drivers", status: "completed", due_date: "2025-10-15", total_required: districtId === "lawrence" ? 42 : 28, completed_count: districtId === "lawrence" ? 42 : 28 },
      { id: `demo-tr-${prefix}-3`, title: "Mandated Reporter Refresher", training_type: "compliance", required_for: "all_staff", status: "upcoming", due_date: "2026-01-15", total_required: districtId === "lawrence" ? 12 : 8, completed_count: 0 },
    ],
    mvStudents: [
      { id: `demo-mv-${prefix}-1`, student_name: "Tyler Jackson", grade: "4", school: districtId === "lawrence" ? "Number Three School" : "School #3", living_situation: "doubled_up", school_of_origin: districtId === "lawrence" ? "Number Two School" : "School #1", transportation_provided: true, status: "active" },
      { id: `demo-mv-${prefix}-2`, student_name: "Destiny Rodriguez", grade: "7", school: districtId === "lawrence" ? "Lawrence Middle School" : "Oceanside Middle School", living_situation: "shelter", school_of_origin: null, transportation_provided: true, status: "active" },
    ],
    edLaw: [
      { id: `demo-el-${prefix}-1`, contractor_name: districtId === "lawrence" ? "East End Bus Co." : "South Shore Bus", data_access_level: "student_names_addresses", agreement_signed: true, agreement_date: "2024-08-15", encryption_verified: true, breach_plan_filed: true, parents_notified: true, annual_review_date: "2025-08-15", status: "compliant" },
      { id: `demo-el-${prefix}-2`, contractor_name: districtId === "lawrence" ? "Lawrence Transit" : "Nassau Student Transport", data_access_level: "student_names_addresses", agreement_signed: true, agreement_date: "2025-01-10", encryption_verified: true, breach_plan_filed: true, parents_notified: true, annual_review_date: "2026-01-10", status: "compliant" },
    ],
    breaches: [],
  };
}

// ═══ FIELD TRIPS ═══
export interface DemoFieldTrip {
  id: string;
  trip_name: string;
  destination: string;
  school: string;
  grade_level: string | null;
  departure_date: string;
  departure_time: string;
  return_time: string;
  bus_number: string | null;
  driver_name: string | null;
  student_count: number;
  chaperone_count: number;
  status: string;
  notes: string | null;
  created_at: string;
}

export function getDemoFieldTrips(districtId: DemoDistrictId): DemoFieldTrip[] {
  const prefix = districtId === "lawrence" ? "law" : "oce";
  const schools = districtId === "lawrence"
    ? ["Number Two School", "Number Five School", "Lawrence Middle School", "LMHS"]
    : ["School #3", "School #5", "Oceanside Middle School", "OHS"];

  return [
    { id: `demo-ft-${prefix}-1`, trip_name: "Museum of Natural History", destination: "Central Park West, NYC", school: schools[0], grade_level: "3", departure_date: "2025-11-15", departure_time: "08:00", return_time: "14:30", bus_number: "B-103", driver_name: "James Williams", student_count: 48, chaperone_count: 6, status: "approved", notes: "2 buses needed", created_at: "2025-10-05T10:00:00Z" },
    { id: `demo-ft-${prefix}-2`, trip_name: "Jones Beach Nature Center", destination: "Jones Beach, Wantagh", school: schools[1], grade_level: "5", departure_date: "2025-11-22", departure_time: "09:00", return_time: "13:00", bus_number: null, driver_name: null, student_count: 32, chaperone_count: 4, status: "pending", notes: null, created_at: "2025-10-10T14:00:00Z" },
    { id: `demo-ft-${prefix}-3`, trip_name: "Albany State Capitol Visit", destination: "Albany, NY", school: schools[2], grade_level: "8", departure_date: "2025-12-05", departure_time: "07:00", return_time: "17:00", bus_number: null, driver_name: null, student_count: 45, chaperone_count: 5, status: "pending", notes: "Long day trip — lunch provided", created_at: "2025-10-12T09:00:00Z" },
    { id: `demo-ft-${prefix}-4`, trip_name: "Metropolitan Museum of Art", destination: "5th Ave, NYC", school: schools[3], grade_level: "10", departure_date: "2025-10-25", departure_time: "08:30", return_time: "15:00", bus_number: "B-141", driver_name: "Patricia Johnson", student_count: 55, chaperone_count: 7, status: "completed", notes: "Completed successfully", created_at: "2025-09-15T10:00:00Z" },
    { id: `demo-ft-${prefix}-5`, trip_name: "Cradle of Aviation Museum", destination: "Garden City, NY", school: schools[0], grade_level: "4", departure_date: "2026-01-20", departure_time: "09:00", return_time: "13:30", bus_number: null, driver_name: null, student_count: 28, chaperone_count: 3, status: "pending", notes: null, created_at: "2025-10-14T11:00:00Z" },
  ];
}

// ═══ CALENDAR EVENTS ═══
export interface DemoCalendarEvent {
  id: string;
  title: string;
  event_date: string;
  end_date: string | null;
  event_type: string;
  applies_to: string;
  notes: string | null;
  dismissal_time: string | null;
  delay_minutes: number | null;
  school_year: string;
  created_at: string;
}

export function getDemoCalendarEvents(districtId: DemoDistrictId): DemoCalendarEvent[] {
  const prefix = districtId === "lawrence" ? "law" : "oce";
  return [
    { id: `demo-cal-${prefix}-1`, title: "Labor Day", event_date: "2025-09-01", end_date: null, event_type: "legal_holiday", applies_to: "all", notes: null, dismissal_time: null, delay_minutes: null, school_year: "2025-2026", created_at: "2025-08-01T10:00:00Z" },
    { id: `demo-cal-${prefix}-2`, title: "Columbus Day", event_date: "2025-10-13", end_date: null, event_type: "legal_holiday", applies_to: "all", notes: null, dismissal_time: null, delay_minutes: null, school_year: "2025-2026", created_at: "2025-08-01T10:00:00Z" },
    { id: `demo-cal-${prefix}-3`, title: "Veterans Day", event_date: "2025-11-11", end_date: null, event_type: "legal_holiday", applies_to: "all", notes: null, dismissal_time: null, delay_minutes: null, school_year: "2025-2026", created_at: "2025-08-01T10:00:00Z" },
    { id: `demo-cal-${prefix}-4`, title: "Thanksgiving Break", event_date: "2025-11-27", end_date: "2025-11-28", event_type: "legal_holiday", applies_to: "all", notes: "Thanksgiving + Day After", dismissal_time: null, delay_minutes: null, school_year: "2025-2026", created_at: "2025-08-01T10:00:00Z" },
    { id: `demo-cal-${prefix}-5`, title: "Winter Break", event_date: "2025-12-22", end_date: "2026-01-02", event_type: "legal_holiday", applies_to: "all", notes: "Christmas through New Year", dismissal_time: null, delay_minutes: null, school_year: "2025-2026", created_at: "2025-08-01T10:00:00Z" },
    { id: `demo-cal-${prefix}-6`, title: "MLK Jr. Day", event_date: "2026-01-19", end_date: null, event_type: "legal_holiday", applies_to: "all", notes: null, dismissal_time: null, delay_minutes: null, school_year: "2025-2026", created_at: "2025-08-01T10:00:00Z" },
    { id: `demo-cal-${prefix}-7`, title: "Presidents' Day", event_date: "2026-02-16", end_date: null, event_type: "legal_holiday", applies_to: "all", notes: null, dismissal_time: null, delay_minutes: null, school_year: "2025-2026", created_at: "2025-08-01T10:00:00Z" },
    { id: `demo-cal-${prefix}-8`, title: "Superintendent's Conference Day", event_date: "2025-11-07", end_date: null, event_type: "staff_development", applies_to: "all", notes: "No students — professional development", dismissal_time: null, delay_minutes: null, school_year: "2025-2026", created_at: "2025-08-01T10:00:00Z" },
    { id: `demo-cal-${prefix}-9`, title: "Early Dismissal — Parent Conferences", event_date: "2025-11-20", end_date: null, event_type: "early_dismissal", applies_to: "all", notes: null, dismissal_time: "12:00", delay_minutes: null, school_year: "2025-2026", created_at: "2025-09-01T10:00:00Z" },
    { id: `demo-cal-${prefix}-10`, title: "2-Hour Delay — Weather", event_date: "2025-12-10", end_date: null, event_type: "delay", applies_to: "all", notes: "Forecast calls for icy conditions", dismissal_time: null, delay_minutes: 120, school_year: "2025-2026", created_at: "2025-12-09T18:00:00Z" },
    { id: `demo-cal-${prefix}-11`, title: "Rosh Hashanah", event_date: "2025-10-02", end_date: "2025-10-04", event_type: "religious_observance", applies_to: "non_public_only", notes: null, dismissal_time: null, delay_minutes: null, school_year: "2025-2026", created_at: "2025-08-01T10:00:00Z" },
    { id: `demo-cal-${prefix}-12`, title: "Memorial Day", event_date: "2026-05-25", end_date: null, event_type: "legal_holiday", applies_to: "all", notes: null, dismissal_time: null, delay_minutes: null, school_year: "2025-2026", created_at: "2025-08-01T10:00:00Z" },
  ];
}

// ═══ ACCIDENT REPORTS ═══
export interface DemoAccidentReport {
  id: string;
  bus_number: string;
  incident_date: string;
  incident_time: string | null;
  location: string | null;
  description: string;
  severity: string;
  injuries_reported: boolean;
  police_report_number: string | null;
  driver_name: string | null;
  weather_conditions: string | null;
  road_conditions: string | null;
  status: string;
  students_on_bus: number | null;
  created_at: string;
}

export function getDemoAccidents(districtId: DemoDistrictId): DemoAccidentReport[] {
  const prefix = districtId === "lawrence" ? "law" : "oce";
  return [
    { id: `demo-acc-${prefix}-1`, bus_number: "B-105", incident_date: "2025-10-10", incident_time: "07:35", location: "Main St & Broadway", description: "Minor fender bender with parked car while making right turn. No students injured. Minor paint damage to both vehicles.", severity: "minor", injuries_reported: false, police_report_number: "LPD-2025-4421", driver_name: "James Williams", weather_conditions: "clear", road_conditions: "dry", status: "closed", students_on_bus: 28, created_at: "2025-10-10T08:00:00Z" },
    { id: `demo-acc-${prefix}-2`, bus_number: "B-118", incident_date: "2025-09-22", incident_time: "15:10", location: "Rockaway Tpke near #220", description: "Student fell while exiting bus. Scraped knee. Parent notified immediately. Student refused medical attention.", severity: "minor", injuries_reported: true, police_report_number: null, driver_name: "Maria Garcia", weather_conditions: "rain", road_conditions: "wet", status: "closed", students_on_bus: 34, created_at: "2025-09-22T15:30:00Z" },
    { id: `demo-acc-${prefix}-3`, bus_number: "B-127", incident_date: "2025-10-14", incident_time: "07:50", location: "Central Ave & Prospect Ave", description: "Car ran red light and struck rear corner of bus. Moderate damage to bus rear panel. No student injuries but 3 students complained of neck soreness. EMS evaluated on scene.", severity: "moderate", injuries_reported: true, police_report_number: "LPD-2025-4589", driver_name: "Robert Brown", weather_conditions: "clear", road_conditions: "dry", status: "investigating", students_on_bus: 41, created_at: "2025-10-14T08:15:00Z" },
    { id: `demo-acc-${prefix}-4`, bus_number: "B-133", incident_date: "2025-09-05", incident_time: "14:45", location: "Nassau Blvd", description: "Bus mirror clipped by passing truck. Mirror broken but no other damage. No injuries.", severity: "minor", injuries_reported: false, police_report_number: null, driver_name: "Linda Davis", weather_conditions: "clear", road_conditions: "dry", status: "closed", students_on_bus: 22, created_at: "2025-09-05T15:00:00Z" },
  ];
}

// ═══ BELL SCHEDULES ═══
export interface DemoBellSchedule {
  id: string;
  school: string;
  schedule_name: string;
  am_start: string;
  am_end: string;
  pm_start: string;
  pm_end: string;
  is_default: boolean;
  school_year: string;
}

export function getDemoBellSchedules(districtId: DemoDistrictId): DemoBellSchedule[] {
  const prefix = districtId === "lawrence" ? "law" : "oce";
  const schools = districtId === "lawrence"
    ? ["#2", "#3", "#4", "#5", "#6", "#7", "#8", "#9", "LMHS"]
    : ["#1", "#2", "#3", "#4", "#5", "#6", "OHS"];

  return schools.map((school, i) => ({
    id: `demo-bell-${prefix}-${i + 1}`,
    school,
    schedule_name: "Regular",
    am_start: i < 3 ? "07:45" : i < 6 ? "08:15" : "08:45",
    am_end: i < 3 ? "08:00" : i < 6 ? "08:30" : "09:00",
    pm_start: i < 3 ? "14:30" : i < 6 ? "15:00" : "15:30",
    pm_end: i < 3 ? "14:45" : i < 6 ? "15:15" : "15:45",
    is_default: true,
    school_year: "2025-2026",
  }));
}
