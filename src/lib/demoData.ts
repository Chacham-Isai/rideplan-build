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

// ═══════════════════════════════════════════════════════════════
// DEMO ROUTES
// ═══════════════════════════════════════════════════════════════

export type DemoRoute = {
  id: string; route_number: string; school: string; tier: number;
  bus_number: string | null; driver_name: string | null;
  total_students: number | null; capacity: number | null;
  total_miles: number | null; on_time_pct: number | null;
  avg_ride_time_min: number | null; cost_per_student: number | null;
  am_start: string | null; pm_start: string | null; status: string;
  contractor_id: string | null;
};

const DRIVER_NAMES = [
  "Michael Rodriguez", "Patricia Johnson", "James Williams", "Maria Garcia",
  "Robert Brown", "Linda Davis", "William Martinez", "Barbara Wilson",
  "David Anderson", "Susan Thomas", "Richard Jackson", "Jennifer White",
  "Charles Harris", "Margaret Martin", "Joseph Thompson", "Dorothy Moore",
  "Thomas Taylor", "Lisa Lee", "Christopher Clark", "Nancy Lewis",
  "Daniel Robinson", "Karen Walker", "Paul Hall", "Betty Allen",
  "Mark Young", "Sandra King", "Donald Wright", "Ashley Lopez",
  "Steven Hill", "Kimberly Scott", "Andrew Green", "Emily Adams",
  "Kenneth Baker", "Donna Nelson", "Joshua Carter", "Michelle Mitchell",
  "Kevin Perez", "Carol Roberts", "Brian Turner", "Amanda Phillips",
  "George Campbell", "Deborah Parker", "Edward Evans", "Stephanie Edwards",
  "Ronald Collins", "Rebecca Stewart", "Timothy Sanchez",
];

const AM_TIMES = ["6:30", "6:45", "7:00", "7:15", "7:30", "7:45", "8:00", "8:15"];
const PM_TIMES = ["2:00", "2:15", "2:30", "2:45", "3:00", "3:15", "3:30", "3:45"];

// Lawrence: 47 routes, tier distribution 18/17/12, across 9 schools
const LAWRENCE_ROUTES: DemoRoute[] = (() => {
  const schoolSeq = ["#2","#2","#2","#2","#2","#2","#2","#2","#4","#4","#4","#4","#4","#4","#4","#5","#5","#5","#5","#5","#5","#6","#6","#6","#6","#6","#6","#3","#3","#3","#3","#3","#9","#9","#9","#9","#7","#7","#7","#7","LMHS","LMHS","LMHS","LMHS","#8","#8","#8"];
  const tierSeq = [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3,3,3,3];
  return schoolSeq.map((school, i) => ({
    id: `demo-route-law-${i+1}`,
    route_number: `L-${String(i+1).padStart(3,"0")}`,
    school,
    tier: tierSeq[i],
    bus_number: `B-${100+i+1}`,
    driver_name: DRIVER_NAMES[i],
    total_students: [32,28,45,38,22,51,34,27,44,36,29,48,33,25,41,37,30,46,35,23,50,39,31,43,26,47,33,42,28,52,36,24,40,34,29,18,44,38,21,49,35,27,53,31,15,41,37][i],
    capacity: i % 3 === 0 ? 72 : 54,
    total_miles: [18,24,12,28,15,22,31,19,26,14,20,32,17,25,11,23,29,16,27,13,21,30,18,24,10,26,15,28,22,19,31,12,25,17,23,9,20,14,27,32,16,21,29,11,8,24,18][i],
    on_time_pct: [96,94,98,91,95,93,97,92,94,99,96,90,95,93,97,88,94,96,92,98,95,91,97,93,100,89,96,94,92,95,90,97,93,96,91,85,94,98,92,87,95,93,96,98,94,91,93][i],
    avg_ride_time_min: [25,32,19,38,22,28,42,24,30,18,26,44,21,34,20,36,29,23,33,19,27,40,25,31,18,35,22,37,28,24,43,20,34,26,30,45,23,19,36,41,27,32,38,18,22,29,25][i],
    cost_per_student: [1100,1340,980,1480,1050,1220,1560,1130,1290,920,1180,1600,1040,1350,890,1410,1260,1010,1380,950,1200,1520,1100,1310,860,1440,1070,1460,1240,1060,1540,930,1360,1150,1280,1580,1020,900,1420,1500,1190,1330,1470,870,810,1300,1140][i],
    am_start: AM_TIMES[i % AM_TIMES.length],
    pm_start: PM_TIMES[i % PM_TIMES.length],
    status: i === 36 || i === 44 || i === 46 ? "inactive" : "active",
    contractor_id: i === 5 || i === 12 ? "demo-contractor-1" : null,
  }));
})();

// Oceanside: 32 routes, tier distribution 13/11/8, across 7 schools
const OCEANSIDE_ROUTES: DemoRoute[] = (() => {
  const schoolSeq = ["#1","#1","#1","#1","#1","#1","#3","#3","#3","#3","#3","#4","#4","#4","#4","#4","#6","#6","#6","#6","#5","#5","#5","#5","OHS","OHS","OHS","OHS","#2","#2","#2","#2"];
  const tierSeq = [1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3];
  return schoolSeq.map((school, i) => ({
    id: `demo-route-oce-${i+1}`,
    route_number: `O-${String(i+1).padStart(3,"0")}`,
    school,
    tier: tierSeq[i],
    bus_number: `B-${200+i+1}`,
    driver_name: DRIVER_NAMES[i],
    total_students: [34,29,42,36,24,48,31,27,44,38,20,46,33,25,40,35,30,43,28,50,37,22,47,32,26,41,34,19,45,38,23,39][i],
    capacity: i % 4 === 0 ? 72 : 54,
    total_miles: [16,22,11,26,14,20,28,17,23,12,19,30,15,24,10,21,27,13,25,18,29,11,22,16,31,14,20,9,24,18,12,26][i],
    on_time_pct: [97,95,99,92,96,94,98,93,95,100,97,91,96,94,98,89,95,97,93,99,96,92,98,94,88,95,93,97,91,96,99,94][i],
    avg_ride_time_min: [22,30,18,35,20,26,38,21,28,17,24,40,19,32,18,33,27,20,31,17,25,36,22,28,42,21,30,16,34,24,19,29][i],
    cost_per_student: [1050,1280,920,1420,1000,1160,1500,1080,1240,870,1130,1540,990,1300,840,1360,1210,960,1330,900,1150,1470,1040,1260,1560,980,1280,820,1400,1100,940,1320][i],
    am_start: AM_TIMES[i % AM_TIMES.length],
    pm_start: PM_TIMES[i % PM_TIMES.length],
    status: i === 19 || i === 31 ? "inactive" : "active",
    contractor_id: i === 3 ? "demo-contractor-1" : null,
  }));
})();

const DEMO_ROUTES: Record<DemoDistrictId, DemoRoute[]> = {
  lawrence: LAWRENCE_ROUTES,
  oceanside: OCEANSIDE_ROUTES,
};

export function getDemoRoutes(districtId: DemoDistrictId): DemoRoute[] {
  return DEMO_ROUTES[districtId];
}

// ═══════════════════════════════════════════════════════════════
// DEMO STUDENTS (Registrations)
// ═══════════════════════════════════════════════════════════════

export type DemoRegistration = {
  id: string;
  student_name: string;
  grade: string;
  school: string;
  address_line: string;
  city: string;
  zip: string;
  state: string;
  status: string;
  dob: string;
  created_at: string;
  school_year: string;
  iep_flag: boolean;
  mckinney_vento_flag: boolean;
  foster_care_flag: boolean;
  section_504_flag: boolean;
  district_id: string;
  parent_user_id: string;
};

const STUDENT_FIRST = ["Emma","Liam","Olivia","Noah","Ava","Ethan","Sophia","Mason","Isabella","Lucas","Mia","Aiden","Charlotte","Elijah","Amelia","James","Harper","Benjamin","Evelyn","Logan","Abigail","Alexander","Emily","Sebastian","Ella","Jack","Scarlett","Henry","Grace","Owen","Chloe","Daniel","Zoey","Matthew","Lily","Jackson","Hannah","David","Nora","Carter","Riley","Wyatt","Layla","Jayden","Penelope","John","Aria","Luke","Eleanor","Gabriel","Stella","Anthony","Violet","Isaac","Aurora","Dylan","Savannah","Leo","Audrey","Lincoln","Brooklyn","Jaxon","Bella","Asher","Claire","Nathan","Skylar","Caleb","Lucy","Ryan","Anna","Adrian","Caroline","Miles","Genesis","Ezra","Aaliyah","Eli","Kennedy","Landon","Autumn","Hunter","Allison","Andrew","Maya","Joshua","Naomi","Connor","Alice","Jeremiah","Sadie","Julian","Hailey","Aaron","Eva","Christian","Madeline","Cooper","Emilia"];
const STUDENT_LAST = ["Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Rodriguez","Martinez","Hernandez","Lopez","Gonzalez","Wilson","Anderson","Thomas","Taylor","Moore","Jackson","Martin","Lee","Perez","Thompson","White","Harris","Sanchez","Clark","Ramirez","Lewis","Robinson","Walker","Young","Allen","King","Wright","Scott","Torres","Nguyen","Hill","Flores","Green","Adams","Nelson","Baker","Hall","Rivera","Campbell","Mitchell","Carter","Roberts"];

const LAW_STREETS = ["Main St","Broadway","Central Ave","Rockaway Tpke","Cedarhurst Ave","Washington Ave","Prospect Ave","Lawrence Ave","Mott Ave","Doughty Blvd","Sealy Dr","Nassau Blvd","Peninsula Blvd","Franklin Ave","Burnside Ave","Irving Pl","Smith St","Jarvis Ln","Empire Ave","Harrison Ave"];
const OCE_STREETS = ["Atlantic Ave","Long Beach Rd","Merle Ave","Foxhurst Rd","Oceanside Rd","Lawson Ave","Windsor Pkwy","Waukena Ave","Perkins Ave","Brower Ave","Hampton Rd","Marion St","Davison Ave","Lincoln Ave","Nassau Ave","Anchor Ave","Park Ave","Fairview Ave","Henry St","Terrace Ave"];

const LAW_SCHOOLS_FULL = ["Lawrence High School","Lawrence Middle School","Number Two School","Number Three School","Number Four School","Number Five School","Lawrence Early Childhood Center"];
const OCE_SCHOOLS_FULL = ["Oceanside High School","Oceanside Middle School","School #1","School #2","School #3","School #4","School #5","School #6"];

const gradeForSchool = (school: string, idx: number): string => {
  if (school.includes("Early Childhood") || school.includes("Pre")) return ["Pre-K","K"][idx % 2];
  if (school.includes("High")) return ["9","10","11","12"][idx % 4];
  if (school.includes("Middle")) return ["6","7","8"][idx % 3];
  return ["1","2","3","4","5"][idx % 5];
};

const dobForGrade = (grade: string): string => {
  const yearMap: Record<string,number> = {"Pre-K":2021,"K":2020,"1":2019,"2":2018,"3":2017,"4":2016,"5":2015,"6":2014,"7":2013,"8":2012,"9":2011,"10":2010,"11":2009,"12":2008};
  const y = yearMap[grade] ?? 2015;
  return `${y}-${String(1 + (parseInt(grade)||0) % 12).padStart(2,"0")}-${String(5 + (parseInt(grade)||0) * 2 % 25).padStart(2,"0")}`;
};

const LAWRENCE_STUDENTS: DemoRegistration[] = Array.from({length:60}, (_,i) => {
  const school = LAW_SCHOOLS_FULL[i % LAW_SCHOOLS_FULL.length];
  const grade = gradeForSchool(school, i);
  const status = i < 42 ? "approved" : i < 54 ? "pending" : "under_review";
  return {
    id: `demo-reg-law-${i+1}`,
    student_name: `${STUDENT_FIRST[i]} ${STUDENT_LAST[i % STUDENT_LAST.length]}`,
    grade,
    school,
    address_line: `${100 + i * 7} ${LAW_STREETS[i % LAW_STREETS.length]}`,
    city: "Lawrence",
    zip: "11559",
    state: "NY",
    status,
    dob: dobForGrade(grade),
    created_at: `2025-${String(3 + (i % 8)).padStart(2,"0")}-${String(1 + i % 28).padStart(2,"0")}T${String(8 + i % 10).padStart(2,"0")}:${String(i % 60).padStart(2,"0")}:00Z`,
    school_year: "2025-2026",
    iep_flag: i === 3 || i === 14 || i === 27 || i === 41 || i === 52 || i === 58,
    mckinney_vento_flag: i === 11 || i === 39,
    foster_care_flag: i === 22,
    section_504_flag: i === 7 || i === 19 || i === 33 || i === 48 || i === 56,
    district_id: "demo-lawrence",
    parent_user_id: `demo-parent-${i+1}`,
  };
});

const OCEANSIDE_STUDENTS: DemoRegistration[] = Array.from({length:40}, (_,i) => {
  const school = OCE_SCHOOLS_FULL[i % OCE_SCHOOLS_FULL.length];
  const grade = gradeForSchool(school, i);
  const status = i < 28 ? "approved" : i < 36 ? "pending" : "under_review";
  return {
    id: `demo-reg-oce-${i+1}`,
    student_name: `${STUDENT_FIRST[60+i]} ${STUDENT_LAST[(i+10) % STUDENT_LAST.length]}`,
    grade,
    school,
    address_line: `${200 + i * 5} ${OCE_STREETS[i % OCE_STREETS.length]}`,
    city: "Oceanside",
    zip: "11572",
    state: "NY",
    status,
    dob: dobForGrade(grade),
    created_at: `2025-${String(4 + (i % 7)).padStart(2,"0")}-${String(1 + i % 28).padStart(2,"0")}T${String(9 + i % 9).padStart(2,"0")}:${String((i*3) % 60).padStart(2,"0")}:00Z`,
    school_year: "2025-2026",
    iep_flag: i === 5 || i === 18 || i === 31,
    mckinney_vento_flag: i === 24,
    foster_care_flag: i === 37,
    section_504_flag: i === 9 || i === 22 || i === 35,
    district_id: "demo-oceanside",
    parent_user_id: `demo-parent-${61+i}`,
  };
});

const DEMO_STUDENTS: Record<DemoDistrictId, DemoRegistration[]> = {
  lawrence: LAWRENCE_STUDENTS,
  oceanside: OCEANSIDE_STUDENTS,
};

export function getDemoStudents(districtId: DemoDistrictId): DemoRegistration[] {
  return DEMO_STUDENTS[districtId];
}

// ═══════════════════════════════════════════════════════════════
// DEMO SERVICE REQUESTS
// ═══════════════════════════════════════════════════════════════

export type DemoServiceRequest = {
  id: string;
  request_type: string;
  subject: string;
  description: string;
  current_value: string | null;
  requested_value: string | null;
  priority: string;
  status: string;
  created_at: string;
  resolved_at: string | null;
  assigned_to: string | null;
  ai_suggested_priority: string | null;
  ai_suggested_type: string | null;
  caller_name: string | null;
  caller_phone: string | null;
  student_registration_id: string | null;
  student_name?: string;
  student_school?: string;
  student_grade?: string;
  student_dob?: string;
};

const LAWRENCE_REQUESTS: DemoServiceRequest[] = [
  // 14 open / in_progress (3 urgent)
  { id:"demo-req-law-1", request_type:"stop_change", subject:"Request stop change for 142 Main St", description:"Parent requests moving stop closer to home due to construction on Main St blocking sidewalk.", current_value:"Main St & Broadway", requested_value:"142 Main St (in front of house)", priority:"urgent", status:"open", created_at:"2025-10-15T09:12:00Z", resolved_at:null, assigned_to:"Demo Administrator", ai_suggested_priority:"high", ai_suggested_type:"stop_change", caller_name:"Sarah Martinez", caller_phone:"516-555-0142", student_registration_id:"demo-reg-law-1", student_name:"Emma Smith", student_school:"Lawrence High School", student_grade:"9", student_dob:"2011-01-05" },
  { id:"demo-req-law-2", request_type:"driver_issue", subject:"Bus B-105 driver complaint — late 3 days in a row", description:"Parent reports bus has been arriving 15-20 minutes late for the past three school days. Students missing first period.", current_value:null, requested_value:null, priority:"urgent", status:"open", created_at:"2025-10-14T14:30:00Z", resolved_at:null, assigned_to:"Demo Administrator", ai_suggested_priority:"urgent", ai_suggested_type:"driver_issue", caller_name:"John Williams", caller_phone:"516-555-0198", student_registration_id:"demo-reg-law-5", student_name:"Ava Jones", student_school:"Number Four School", student_grade:"3", student_dob:"2017-05-15" },
  { id:"demo-req-law-3", request_type:"address_change", subject:"Address change — family moved to 280 Cedarhurst Ave", description:"Family relocated within district. Need new route assignment for both AM and PM runs.", current_value:"95 Rockaway Tpke", requested_value:"280 Cedarhurst Ave, Lawrence NY 11559", priority:"urgent", status:"in_progress", created_at:"2025-10-13T10:45:00Z", resolved_at:null, assigned_to:"Demo Administrator", ai_suggested_priority:"high", ai_suggested_type:"address_change", caller_name:"Maria Garcia", caller_phone:"516-555-0234", student_registration_id:"demo-reg-law-8", student_name:"Mason Davis", student_school:"Number Two School", student_grade:"2", student_dob:"2018-08-20" },
  { id:"demo-req-law-4", request_type:"general_inquiry", subject:"Inquiry about after-school late bus schedule", description:"Parent wants to know if late bus service is available on Tuesdays and Thursdays for after-school tutoring.", current_value:null, requested_value:null, priority:"low", status:"open", created_at:"2025-10-12T11:20:00Z", resolved_at:null, assigned_to:null, ai_suggested_priority:"low", ai_suggested_type:"general_inquiry", caller_name:"Lisa Thomas", caller_phone:"516-555-0321", student_registration_id:"demo-reg-law-12", student_name:"Lucas Garcia", student_school:"Lawrence Middle School", student_grade:"7", student_dob:"2013-07-10" },
  { id:"demo-req-law-5", request_type:"bus_pass", subject:"Replacement bus pass needed — lost original", description:"Student lost bus pass. Parent requesting replacement. This is the second request this semester.", current_value:"BP-2025-00012", requested_value:"New pass", priority:"low", status:"open", created_at:"2025-10-11T08:55:00Z", resolved_at:null, assigned_to:null, ai_suggested_priority:null, ai_suggested_type:null, caller_name:"Robert Brown", caller_phone:null, student_registration_id:"demo-reg-law-15", student_name:"Aiden Williams", student_school:"Number Five School", student_grade:"4", student_dob:"2016-04-25" },
  { id:"demo-req-law-6", request_type:"stop_change", subject:"Safety concern at Mott Ave stop", description:"Parent reports no sidewalk and poor visibility at current stop. Requests relocation to intersection with traffic light.", current_value:"Mott Ave near #340", requested_value:"Mott Ave & Central Ave (intersection)", priority:"high", status:"open", created_at:"2025-10-10T13:40:00Z", resolved_at:null, assigned_to:"Demo Administrator", ai_suggested_priority:"high", ai_suggested_type:"stop_change", caller_name:"Jennifer Wilson", caller_phone:"516-555-0456", student_registration_id:"demo-reg-law-18", student_name:"Sophia Anderson", student_school:"Number Three School", student_grade:"1", student_dob:"2019-11-12" },
  { id:"demo-req-law-7", request_type:"school_change", subject:"Transfer to Lawrence Middle School", description:"Student transferring from Number Five School to Lawrence Middle School effective November 1.", current_value:"Number Five School", requested_value:"Lawrence Middle School", priority:"medium", status:"in_progress", created_at:"2025-10-09T09:30:00Z", resolved_at:null, assigned_to:"Demo Administrator", ai_suggested_priority:"medium", ai_suggested_type:"school_change", caller_name:"David Lee", caller_phone:"516-555-0567", student_registration_id:"demo-reg-law-20", student_name:"Logan Robinson", student_school:"Number Five School", student_grade:"5", student_dob:"2015-03-18" },
  { id:"demo-req-law-8", request_type:"address_change", subject:"Temporary address change — staying with grandparents", description:"Student staying with grandparents at 55 Nassau Blvd for 6 weeks while parents travel. Need temporary route change.", current_value:"178 Broadway", requested_value:"55 Nassau Blvd, Lawrence NY 11559", priority:"medium", status:"open", created_at:"2025-10-08T15:15:00Z", resolved_at:null, assigned_to:null, ai_suggested_priority:"medium", ai_suggested_type:"address_change", caller_name:"Patricia Johnson", caller_phone:"516-555-0678", student_registration_id:"demo-reg-law-22", student_name:"Alexander Thompson", student_school:"Lawrence High School", student_grade:"10", student_dob:"2010-06-08" },
  { id:"demo-req-law-9", request_type:"driver_issue", subject:"Driver not waiting for student at stop", description:"Driver leaves before scheduled time. Student arrived at 7:12 AM for 7:15 pickup but bus already gone.", current_value:null, requested_value:null, priority:"high", status:"open", created_at:"2025-10-07T07:45:00Z", resolved_at:null, assigned_to:"Demo Administrator", ai_suggested_priority:null, ai_suggested_type:null, caller_name:"Karen Clark", caller_phone:"516-555-0789", student_registration_id:"demo-reg-law-25", student_name:"Ella Martin", student_school:"Number Four School", student_grade:"2", student_dob:"2018-02-14" },
  { id:"demo-req-law-10", request_type:"general_inquiry", subject:"Snow day transportation policy question", description:"Parent asking about the notification process for delayed starts and cancellations during winter weather.", current_value:null, requested_value:null, priority:"low", status:"open", created_at:"2025-10-06T10:00:00Z", resolved_at:null, assigned_to:null, ai_suggested_priority:"low", ai_suggested_type:null, caller_name:"Michael Harris", caller_phone:null, student_registration_id:null },
  { id:"demo-req-law-11", request_type:"stop_change", subject:"New stop request for Sealy Dr development", description:"New housing development completed on Sealy Dr. Three families requesting bus stop in the new area.", current_value:null, requested_value:"Sealy Dr & Prospect Ave", priority:"medium", status:"open", created_at:"2025-10-05T14:20:00Z", resolved_at:null, assigned_to:null, ai_suggested_priority:"medium", ai_suggested_type:"stop_change", caller_name:"Susan Walker", caller_phone:"516-555-0890", student_registration_id:"demo-reg-law-30", student_name:"Chloe Young", student_school:"Number Two School", student_grade:"3", student_dob:"2017-09-22" },
  { id:"demo-req-law-12", request_type:"bus_pass", subject:"Bus pass not scanning at reader", description:"Student's bus pass produces error when scanned. Works intermittently. May need replacement card.", current_value:"BP-2025-00034", requested_value:"Repair or replace", priority:"medium", status:"in_progress", created_at:"2025-10-04T11:30:00Z", resolved_at:null, assigned_to:"Demo Administrator", ai_suggested_priority:null, ai_suggested_type:null, caller_name:"Nancy Lewis", caller_phone:"516-555-0901", student_registration_id:"demo-reg-law-33", student_name:"Daniel Allen", student_school:"Lawrence Middle School", student_grade:"8", student_dob:"2012-12-01" },
  { id:"demo-req-law-13", request_type:"stop_change", subject:"Request earlier pickup for before-school program", description:"Student enrolled in 7 AM before-school program but current bus arrives at 7:20. Needs earlier route.", current_value:"7:20 AM pickup", requested_value:"6:50 AM pickup", priority:"medium", status:"open", created_at:"2025-10-03T08:10:00Z", resolved_at:null, assigned_to:null, ai_suggested_priority:null, ai_suggested_type:null, caller_name:"Thomas Taylor", caller_phone:"516-555-1012", student_registration_id:"demo-reg-law-36", student_name:"Zoey King", student_school:"Number Three School", student_grade:"4", student_dob:"2016-10-30" },
  { id:"demo-req-law-14", request_type:"general_inquiry", subject:"Kindergarten bus safety orientation schedule", description:"New kindergarten parent asking about the bus safety orientation and when it will be held.", current_value:null, requested_value:null, priority:"low", status:"open", created_at:"2025-10-02T16:45:00Z", resolved_at:null, assigned_to:null, ai_suggested_priority:"low", ai_suggested_type:"general_inquiry", caller_name:"Ashley Lopez", caller_phone:"516-555-1123", student_registration_id:"demo-reg-law-2", student_name:"Liam Johnson", student_school:"Lawrence Early Childhood Center", student_grade:"K", student_dob:"2020-02-15" },
  // 6 resolved/closed
  { id:"demo-req-law-15", request_type:"stop_change", subject:"Stop relocated from Franklin Ave to Burnside Ave", description:"Successfully moved stop per parent request. New stop has better visibility and sidewalk access.", current_value:"Franklin Ave", requested_value:"Burnside Ave & Main St", priority:"medium", status:"resolved", created_at:"2025-09-20T10:00:00Z", resolved_at:"2025-09-25T14:30:00Z", assigned_to:"Demo Administrator", ai_suggested_priority:"medium", ai_suggested_type:"stop_change", caller_name:"George Campbell", caller_phone:"516-555-1234", student_registration_id:"demo-reg-law-40", student_name:"Layla Scott", student_school:"Number Five School", student_grade:"3", student_dob:"2017-07-04" },
  { id:"demo-req-law-16", request_type:"address_change", subject:"Address updated to 310 Washington Ave", description:"Route reassigned after family moved. Student now on Route L-012.", current_value:"88 Empire Ave", requested_value:"310 Washington Ave", priority:"high", status:"resolved", created_at:"2025-09-15T09:00:00Z", resolved_at:"2025-09-18T11:00:00Z", assigned_to:"Demo Administrator", ai_suggested_priority:"high", ai_suggested_type:"address_change", caller_name:"Edward Evans", caller_phone:"516-555-1345", student_registration_id:"demo-reg-law-42", student_name:"Noah Brown", student_school:"Lawrence High School", student_grade:"11", student_dob:"2009-05-20" },
  { id:"demo-req-law-17", request_type:"driver_issue", subject:"Driver behavior complaint — resolved after review", description:"Investigated complaint about driver's attitude. Spoke with driver and monitor. Issue resolved.", current_value:null, requested_value:null, priority:"high", status:"closed", created_at:"2025-09-10T13:00:00Z", resolved_at:"2025-09-14T16:00:00Z", assigned_to:"Demo Administrator", ai_suggested_priority:null, ai_suggested_type:null, caller_name:"Rebecca Stewart", caller_phone:"516-555-1456", student_registration_id:"demo-reg-law-45", student_name:"Owen Baker", student_school:"Number Four School", student_grade:"5", student_dob:"2015-11-08" },
  { id:"demo-req-law-18", request_type:"bus_pass", subject:"Replacement pass issued", description:"New pass issued. Old pass deactivated.", current_value:"BP-2025-00008", requested_value:"BP-2025-00051", priority:"low", status:"resolved", created_at:"2025-09-05T10:30:00Z", resolved_at:"2025-09-06T09:00:00Z", assigned_to:"Demo Administrator", ai_suggested_priority:null, ai_suggested_type:null, caller_name:"Timothy Sanchez", caller_phone:null, student_registration_id:"demo-reg-law-48", student_name:"Harper Martinez", student_school:"Lawrence Middle School", student_grade:"6", student_dob:"2014-03-27" },
  { id:"demo-req-law-19", request_type:"school_change", subject:"Transfer complete — student moved to Number Two School", description:"Route updated for student transferring schools within district.", current_value:"Number Three School", requested_value:"Number Two School", priority:"medium", status:"resolved", created_at:"2025-09-01T08:00:00Z", resolved_at:"2025-09-04T15:00:00Z", assigned_to:"Demo Administrator", ai_suggested_priority:"medium", ai_suggested_type:"school_change", caller_name:"Carol Roberts", caller_phone:"516-555-1567", student_registration_id:"demo-reg-law-50", student_name:"Amelia Anderson", student_school:"Number Two School", student_grade:"2", student_dob:"2018-01-15" },
  { id:"demo-req-law-20", request_type:"general_inquiry", subject:"Field trip bus availability confirmed", description:"Confirmed bus availability for 5th grade field trip to Jones Beach on Oct 15.", current_value:null, requested_value:null, priority:"low", status:"closed", created_at:"2025-08-28T11:00:00Z", resolved_at:"2025-08-30T09:00:00Z", assigned_to:"Demo Administrator", ai_suggested_priority:null, ai_suggested_type:null, caller_name:"Donna Nelson", caller_phone:null, student_registration_id:null },
];

const OCEANSIDE_REQUESTS: DemoServiceRequest[] = [
  // 8 open (1 urgent)
  { id:"demo-req-oce-1", request_type:"stop_change", subject:"Unsafe stop at Long Beach Rd — no crosswalk", description:"Parent reports students must cross Long Beach Rd without crosswalk or crossing guard. Requesting relocation.", current_value:"Long Beach Rd & Atlantic Ave", requested_value:"Foxhurst Rd (safer residential street)", priority:"urgent", status:"open", created_at:"2025-10-14T08:30:00Z", resolved_at:null, assigned_to:"Demo Administrator", ai_suggested_priority:"urgent", ai_suggested_type:"stop_change", caller_name:"Amanda Phillips", caller_phone:"516-555-2001", student_registration_id:"demo-reg-oce-1", student_name:"Stella Clark", student_school:"Oceanside High School", student_grade:"9", student_dob:"2011-01-05" },
  { id:"demo-req-oce-2", request_type:"address_change", subject:"Family moved to 180 Waukena Ave", description:"New address within district boundaries. Requesting route reassignment.", current_value:"45 Merle Ave", requested_value:"180 Waukena Ave, Oceanside NY 11572", priority:"medium", status:"open", created_at:"2025-10-13T10:15:00Z", resolved_at:null, assigned_to:null, ai_suggested_priority:"medium", ai_suggested_type:"address_change", caller_name:"Cooper Mitchell", caller_phone:"516-555-2002", student_registration_id:"demo-reg-oce-4", student_name:"Violet Thompson", student_school:"School #4", student_grade:"2", student_dob:"2018-04-10" },
  { id:"demo-req-oce-3", request_type:"driver_issue", subject:"Bus B-208 consistently 10 min late", description:"Route O-008 bus has been arriving late every day this week. Parents report 10-12 minute delays.", current_value:null, requested_value:null, priority:"high", status:"in_progress", created_at:"2025-10-12T07:50:00Z", resolved_at:null, assigned_to:"Demo Administrator", ai_suggested_priority:"high", ai_suggested_type:"driver_issue", caller_name:"Deborah Parker", caller_phone:"516-555-2003", student_registration_id:"demo-reg-oce-8", student_name:"Aurora Martin", student_school:"Oceanside Middle School", student_grade:"7", student_dob:"2013-08-15" },
  { id:"demo-req-oce-4", request_type:"general_inquiry", subject:"Bus route map request for School #3", description:"New family requesting route map and stop locations for School #3 area.", current_value:null, requested_value:null, priority:"low", status:"open", created_at:"2025-10-11T14:00:00Z", resolved_at:null, assigned_to:null, ai_suggested_priority:"low", ai_suggested_type:null, caller_name:"Stephanie Edwards", caller_phone:null, student_registration_id:"demo-reg-oce-11", student_name:"Savannah Lewis", student_school:"School #3", student_grade:"4", student_dob:"2016-06-20" },
  { id:"demo-req-oce-5", request_type:"bus_pass", subject:"New student needs bus pass", description:"Transfer student from Valley Stream needs bus pass issued. Registration already approved.", current_value:null, requested_value:"New pass", priority:"medium", status:"open", created_at:"2025-10-10T09:20:00Z", resolved_at:null, assigned_to:null, ai_suggested_priority:null, ai_suggested_type:null, caller_name:"Ronald Collins", caller_phone:"516-555-2005", student_registration_id:"demo-reg-oce-15", student_name:"Brooklyn Robinson", student_school:"School #5", student_grade:"3", student_dob:"2017-02-28" },
  { id:"demo-req-oce-6", request_type:"stop_change", subject:"Add afternoon stop at Hampton Rd", description:"Three students attending after-school program at community center on Hampton Rd. Need PM stop added.", current_value:null, requested_value:"Hampton Rd & Perkins Ave", priority:"medium", status:"open", created_at:"2025-10-09T11:30:00Z", resolved_at:null, assigned_to:"Demo Administrator", ai_suggested_priority:"medium", ai_suggested_type:"stop_change", caller_name:"Michelle Mitchell", caller_phone:"516-555-2006", student_registration_id:"demo-reg-oce-18", student_name:"Bella Adams", student_school:"School #6", student_grade:"5", student_dob:"2015-09-12" },
  { id:"demo-req-oce-7", request_type:"school_change", subject:"Transfer from School #5 to School #2", description:"Student moving to School #2 for gifted program. Effective date November 15.", current_value:"School #5", requested_value:"School #2", priority:"medium", status:"open", created_at:"2025-10-08T13:45:00Z", resolved_at:null, assigned_to:null, ai_suggested_priority:"medium", ai_suggested_type:"school_change", caller_name:"Kevin Perez", caller_phone:"516-555-2007", student_registration_id:"demo-reg-oce-21", student_name:"Claire Walker", student_school:"School #5", student_grade:"4", student_dob:"2016-12-05" },
  { id:"demo-req-oce-8", request_type:"address_change", subject:"Temporary address — 90 Marion St for 4 weeks", description:"Home renovation. Family temporarily at 90 Marion St. Will return to original address in November.", current_value:"215 Oceanside Rd", requested_value:"90 Marion St, Oceanside NY 11572", priority:"medium", status:"open", created_at:"2025-10-07T16:00:00Z", resolved_at:null, assigned_to:null, ai_suggested_priority:null, ai_suggested_type:null, caller_name:"Brian Turner", caller_phone:"516-555-2008", student_registration_id:"demo-reg-oce-25", student_name:"Skylar Hall", student_school:"Oceanside High School", student_grade:"11", student_dob:"2009-07-18" },
  // 6 resolved/closed
  { id:"demo-req-oce-9", request_type:"stop_change", subject:"Stop moved to Lawson Ave — completed", description:"Stop relocated per request. All families notified.", current_value:"Windsor Pkwy", requested_value:"Lawson Ave & Atlantic Ave", priority:"medium", status:"resolved", created_at:"2025-09-25T09:00:00Z", resolved_at:"2025-09-28T14:00:00Z", assigned_to:"Demo Administrator", ai_suggested_priority:null, ai_suggested_type:null, caller_name:"Carol Roberts", caller_phone:"516-555-2009", student_registration_id:"demo-reg-oce-28", student_name:"Lucy Green", student_school:"School #4", student_grade:"1", student_dob:"2019-04-22" },
  { id:"demo-req-oce-10", request_type:"driver_issue", subject:"Driver tardiness resolved — schedule adjusted", description:"Route timing was unrealistic. Added 5 minutes buffer. On-time performance improved.", current_value:null, requested_value:null, priority:"high", status:"resolved", created_at:"2025-09-20T11:00:00Z", resolved_at:"2025-09-24T10:00:00Z", assigned_to:"Demo Administrator", ai_suggested_priority:"high", ai_suggested_type:null, caller_name:"George Campbell", caller_phone:"516-555-2010", student_registration_id:null },
  { id:"demo-req-oce-11", request_type:"bus_pass", subject:"Duplicate pass deactivated", description:"Student had two active passes. Older one deactivated.", current_value:"BP-2025-00103", requested_value:"Deactivate duplicate", priority:"low", status:"closed", created_at:"2025-09-18T14:30:00Z", resolved_at:"2025-09-19T09:00:00Z", assigned_to:"Demo Administrator", ai_suggested_priority:null, ai_suggested_type:null, caller_name:null, caller_phone:null, student_registration_id:"demo-reg-oce-30", student_name:"Anna King", student_school:"School #6", student_grade:"3", student_dob:"2017-11-10" },
  { id:"demo-req-oce-12", request_type:"general_inquiry", subject:"Holiday schedule confirmation", description:"Confirmed no bus service on Columbus Day. Information posted on website.", current_value:null, requested_value:null, priority:"low", status:"closed", created_at:"2025-09-15T10:00:00Z", resolved_at:"2025-09-15T11:30:00Z", assigned_to:"Demo Administrator", ai_suggested_priority:null, ai_suggested_type:null, caller_name:"Sandra King", caller_phone:null, student_registration_id:null },
  { id:"demo-req-oce-13", request_type:"address_change", subject:"Address update processed — 155 Davison Ave", description:"Route updated. Student assigned to Route O-015.", current_value:"78 Nassau Ave", requested_value:"155 Davison Ave", priority:"medium", status:"resolved", created_at:"2025-09-10T08:30:00Z", resolved_at:"2025-09-13T15:00:00Z", assigned_to:"Demo Administrator", ai_suggested_priority:"medium", ai_suggested_type:"address_change", caller_name:"Timothy Sanchez", caller_phone:"516-555-2013", student_registration_id:"demo-reg-oce-33", student_name:"Caroline Scott", student_school:"Oceanside Middle School", student_grade:"8", student_dob:"2012-06-30" },
  { id:"demo-req-oce-14", request_type:"school_change", subject:"Transfer to Oceanside High School complete", description:"Student promoted mid-year. Route and pass updated.", current_value:"Oceanside Middle School", requested_value:"Oceanside High School", priority:"medium", status:"resolved", created_at:"2025-09-05T09:00:00Z", resolved_at:"2025-09-09T12:00:00Z", assigned_to:"Demo Administrator", ai_suggested_priority:null, ai_suggested_type:null, caller_name:"Emily Adams", caller_phone:"516-555-2014", student_registration_id:"demo-reg-oce-36", student_name:"Genesis Torres", student_school:"Oceanside High School", student_grade:"9", student_dob:"2011-10-15" },
];

const DEMO_REQUESTS: Record<DemoDistrictId, DemoServiceRequest[]> = {
  lawrence: LAWRENCE_REQUESTS,
  oceanside: OCEANSIDE_REQUESTS,
};

export function getDemoRequests(districtId: DemoDistrictId): DemoServiceRequest[] {
  return DEMO_REQUESTS[districtId];
}

// ═══════════════════════════════════════════════════════════════
// DRIVERS — Demo data for Drivers page
// ═══════════════════════════════════════════════════════════════

export interface DemoDriver {
  id: string;
  name: string;
  phone: string;
  email: string;
  bus_number: string;
  contractor: string;
  status: "active" | "inactive" | "on_leave";
  hire_date: string;
  cdl_expiry: string;
  cdl_status: "valid" | "expiring_soon" | "expired";
  medical_expiry: string;
  medical_status: "valid" | "expiring_soon" | "expired";
  cert_19a_expiry: string;
  cert_19a_status: "valid" | "expiring_soon" | "expired";
  routes_assigned: number;
  on_time_pct: number;
  safety_incidents: number;
}

const LAWRENCE_DRIVERS: DemoDriver[] = [
  { id: "ld-01", name: "Michael Rodriguez", phone: "(516) 555-0101", email: "mrodriguez@acmetrans.com", bus_number: "B-101", contractor: "Acme Transport", status: "active", hire_date: "2019-08-15", cdl_expiry: "2027-03-15", cdl_status: "valid", medical_expiry: "2026-09-30", medical_status: "valid", cert_19a_expiry: "2026-06-15", cert_19a_status: "valid", routes_assigned: 2, on_time_pct: 96, safety_incidents: 0 },
  { id: "ld-02", name: "Patricia Chen", phone: "(516) 555-0102", email: "pchen@acmetrans.com", bus_number: "B-102", contractor: "Acme Transport", status: "active", hire_date: "2020-01-10", cdl_expiry: "2026-07-20", cdl_status: "valid", medical_expiry: "2026-04-15", medical_status: "expiring_soon", cert_19a_expiry: "2026-08-20", cert_19a_status: "valid", routes_assigned: 2, on_time_pct: 98, safety_incidents: 0 },
  { id: "ld-03", name: "James Wilson", phone: "(516) 555-0103", email: "jwilson@acmetrans.com", bus_number: "B-103", contractor: "Acme Transport", status: "active", hire_date: "2018-03-20", cdl_expiry: "2026-11-10", cdl_status: "valid", medical_expiry: "2026-05-30", medical_status: "valid", cert_19a_expiry: "2026-04-01", cert_19a_status: "expiring_soon", routes_assigned: 3, on_time_pct: 94, safety_incidents: 1 },
  { id: "ld-04", name: "Maria Santos", phone: "(516) 555-0104", email: "msantos@acmetrans.com", bus_number: "B-104", contractor: "Acme Transport", status: "active", hire_date: "2021-09-01", cdl_expiry: "2027-01-15", cdl_status: "valid", medical_expiry: "2026-12-01", medical_status: "valid", cert_19a_expiry: "2026-09-15", cert_19a_status: "valid", routes_assigned: 2, on_time_pct: 97, safety_incidents: 0 },
  { id: "ld-05", name: "Robert Thompson", phone: "(516) 555-0105", email: "rthompson@acmetrans.com", bus_number: "B-105", contractor: "Acme Transport", status: "active", hire_date: "2017-06-12", cdl_expiry: "2026-08-20", cdl_status: "valid", medical_expiry: "2026-03-15", medical_status: "expiring_soon", cert_19a_expiry: "2026-05-10", cert_19a_status: "valid", routes_assigned: 2, on_time_pct: 91, safety_incidents: 2 },
  { id: "ld-06", name: "Linda Park", phone: "(516) 555-0106", email: "lpark@acmetrans.com", bus_number: "B-106", contractor: "Acme Transport", status: "active", hire_date: "2022-01-15", cdl_expiry: "2027-06-10", cdl_status: "valid", medical_expiry: "2026-11-20", medical_status: "valid", cert_19a_expiry: "2026-07-15", cert_19a_status: "valid", routes_assigned: 1, on_time_pct: 99, safety_incidents: 0 },
  { id: "ld-07", name: "David Kim", phone: "(516) 555-0107", email: "dkim@acmetrans.com", bus_number: "B-107", contractor: "Acme Transport", status: "on_leave", hire_date: "2019-11-03", cdl_expiry: "2026-09-15", cdl_status: "valid", medical_expiry: "2026-06-30", medical_status: "valid", cert_19a_expiry: "2026-08-01", cert_19a_status: "valid", routes_assigned: 0, on_time_pct: 95, safety_incidents: 0 },
  { id: "ld-08", name: "Jennifer Adams", phone: "(516) 555-0108", email: "jadams@acmetrans.com", bus_number: "B-108", contractor: "Acme Transport", status: "active", hire_date: "2020-08-20", cdl_expiry: "2026-04-05", cdl_status: "expiring_soon", medical_expiry: "2026-10-15", medical_status: "valid", cert_19a_expiry: "2026-11-30", cert_19a_status: "valid", routes_assigned: 2, on_time_pct: 93, safety_incidents: 1 },
  { id: "ld-09", name: "Charles Brown", phone: "(516) 555-0109", email: "cbrown@saferoute.com", bus_number: "B-109", contractor: "SafeRoute LLC", status: "active", hire_date: "2018-05-10", cdl_expiry: "2026-12-01", cdl_status: "valid", medical_expiry: "2026-08-15", medical_status: "valid", cert_19a_expiry: "2026-03-20", cert_19a_status: "expiring_soon", routes_assigned: 2, on_time_pct: 96, safety_incidents: 0 },
  { id: "ld-10", name: "Susan Martinez", phone: "(516) 555-0110", email: "smartinez@saferoute.com", bus_number: "B-110", contractor: "SafeRoute LLC", status: "active", hire_date: "2021-02-14", cdl_expiry: "2027-02-28", cdl_status: "valid", medical_expiry: "2026-07-10", medical_status: "valid", cert_19a_expiry: "2026-10-20", cert_19a_status: "valid", routes_assigned: 2, on_time_pct: 97, safety_incidents: 0 },
  { id: "ld-11", name: "Thomas Garcia", phone: "(516) 555-0111", email: "tgarcia@saferoute.com", bus_number: "B-111", contractor: "SafeRoute LLC", status: "active", hire_date: "2019-07-22", cdl_expiry: "2026-06-15", cdl_status: "valid", medical_expiry: "2026-04-20", medical_status: "expiring_soon", cert_19a_expiry: "2026-12-10", cert_19a_status: "valid", routes_assigned: 3, on_time_pct: 92, safety_incidents: 1 },
  { id: "ld-12", name: "Nancy Lee", phone: "(516) 555-0112", email: "nlee@saferoute.com", bus_number: "B-112", contractor: "SafeRoute LLC", status: "active", hire_date: "2022-03-01", cdl_expiry: "2027-05-15", cdl_status: "valid", medical_expiry: "2026-09-01", medical_status: "valid", cert_19a_expiry: "2026-06-25", cert_19a_status: "valid", routes_assigned: 1, on_time_pct: 98, safety_incidents: 0 },
  { id: "ld-13", name: "Mark Johnson", phone: "(516) 555-0113", email: "mjohnson@saferoute.com", bus_number: "B-113", contractor: "SafeRoute LLC", status: "active", hire_date: "2020-10-15", cdl_expiry: "2026-10-30", cdl_status: "valid", medical_expiry: "2026-06-05", medical_status: "valid", cert_19a_expiry: "2026-09-30", cert_19a_status: "valid", routes_assigned: 2, on_time_pct: 95, safety_incidents: 0 },
  { id: "ld-14", name: "Karen White", phone: "(516) 555-0114", email: "kwhite@saferoute.com", bus_number: "B-114", contractor: "SafeRoute LLC", status: "active", hire_date: "2017-12-01", cdl_expiry: "2026-03-10", cdl_status: "expiring_soon", medical_expiry: "2026-02-28", medical_status: "expired", cert_19a_expiry: "2026-05-15", cert_19a_status: "valid", routes_assigned: 2, on_time_pct: 90, safety_incidents: 2 },
  { id: "ld-15", name: "Steven Davis", phone: "(516) 555-0115", email: "sdavis@saferoute.com", bus_number: "B-115", contractor: "SafeRoute LLC", status: "active", hire_date: "2021-06-20", cdl_expiry: "2027-04-10", cdl_status: "valid", medical_expiry: "2026-11-15", medical_status: "valid", cert_19a_expiry: "2026-08-05", cert_19a_status: "valid", routes_assigned: 1, on_time_pct: 97, safety_incidents: 0 },
  { id: "ld-16", name: "Dorothy Clark", phone: "(516) 555-0116", email: "dclark@saferoute.com", bus_number: "B-116", contractor: "SafeRoute LLC", status: "active", hire_date: "2019-04-08", cdl_expiry: "2026-07-25", cdl_status: "valid", medical_expiry: "2026-05-20", medical_status: "valid", cert_19a_expiry: "2026-04-15", cert_19a_status: "expiring_soon", routes_assigned: 2, on_time_pct: 94, safety_incidents: 0 },
  { id: "ld-17", name: "Paul Robinson", phone: "(516) 555-0117", email: "probinson@islandbus.com", bus_number: "B-117", contractor: "Island Bus Co", status: "active", hire_date: "2018-09-15", cdl_expiry: "2026-11-20", cdl_status: "valid", medical_expiry: "2026-08-30", medical_status: "valid", cert_19a_expiry: "2026-07-10", cert_19a_status: "valid", routes_assigned: 2, on_time_pct: 96, safety_incidents: 0 },
  { id: "ld-18", name: "Lisa Anderson", phone: "(516) 555-0118", email: "landerson@islandbus.com", bus_number: "B-118", contractor: "Island Bus Co", status: "active", hire_date: "2020-05-12", cdl_expiry: "2027-01-20", cdl_status: "valid", medical_expiry: "2026-10-10", medical_status: "valid", cert_19a_expiry: "2026-11-15", cert_19a_status: "valid", routes_assigned: 2, on_time_pct: 98, safety_incidents: 0 },
  { id: "ld-19", name: "Richard Taylor", phone: "(516) 555-0119", email: "rtaylor@islandbus.com", bus_number: "B-119", contractor: "Island Bus Co", status: "active", hire_date: "2022-02-01", cdl_expiry: "2027-08-15", cdl_status: "valid", medical_expiry: "2026-12-20", medical_status: "valid", cert_19a_expiry: "2026-10-01", cert_19a_status: "valid", routes_assigned: 1, on_time_pct: 95, safety_incidents: 0 },
  { id: "ld-20", name: "Barbara Moore", phone: "(516) 555-0120", email: "bmoore@islandbus.com", bus_number: "B-120", contractor: "Island Bus Co", status: "active", hire_date: "2019-01-20", cdl_expiry: "2026-05-10", cdl_status: "valid", medical_expiry: "2026-03-25", medical_status: "expiring_soon", cert_19a_expiry: "2026-06-30", cert_19a_status: "valid", routes_assigned: 2, on_time_pct: 93, safety_incidents: 1 },
  { id: "ld-21", name: "Daniel Harris", phone: "(516) 555-0121", email: "dharris@islandbus.com", bus_number: "B-121", contractor: "Island Bus Co", status: "active", hire_date: "2020-11-10", cdl_expiry: "2026-09-05", cdl_status: "valid", medical_expiry: "2026-07-15", medical_status: "valid", cert_19a_expiry: "2026-05-20", cert_19a_status: "valid", routes_assigned: 2, on_time_pct: 96, safety_incidents: 0 },
  { id: "ld-22", name: "Sarah Miller", phone: "(516) 555-0122", email: "smiller@islandbus.com", bus_number: "B-122", contractor: "Island Bus Co", status: "active", hire_date: "2021-08-15", cdl_expiry: "2027-03-01", cdl_status: "valid", medical_expiry: "2026-11-05", medical_status: "valid", cert_19a_expiry: "2026-09-10", cert_19a_status: "valid", routes_assigned: 1, on_time_pct: 99, safety_incidents: 0 },
  { id: "ld-23", name: "Joseph Wright", phone: "(516) 555-0123", email: "jwright@islandbus.com", bus_number: "B-123", contractor: "Island Bus Co", status: "active", hire_date: "2018-07-01", cdl_expiry: "2026-06-20", cdl_status: "valid", medical_expiry: "2026-04-30", medical_status: "expiring_soon", cert_19a_expiry: "2026-03-15", cert_19a_status: "expiring_soon", routes_assigned: 2, on_time_pct: 91, safety_incidents: 1 },
  { id: "ld-24", name: "Margaret Scott", phone: "(516) 555-0124", email: "mscott@islandbus.com", bus_number: "B-124", contractor: "Island Bus Co", status: "active", hire_date: "2020-03-10", cdl_expiry: "2026-12-15", cdl_status: "valid", medical_expiry: "2026-09-20", medical_status: "valid", cert_19a_expiry: "2026-08-10", cert_19a_status: "valid", routes_assigned: 2, on_time_pct: 95, safety_incidents: 0 },
  { id: "ld-25", name: "George Nelson", phone: "(516) 555-0125", email: "gnelson@islandbus.com", bus_number: "B-125", contractor: "Island Bus Co", status: "active", hire_date: "2019-10-20", cdl_expiry: "2026-08-05", cdl_status: "valid", medical_expiry: "2026-06-10", medical_status: "valid", cert_19a_expiry: "2026-11-25", cert_19a_status: "valid", routes_assigned: 1, on_time_pct: 97, safety_incidents: 0 },
  { id: "ld-26", name: "Betty Campbell", phone: "(516) 555-0126", email: "bcampbell@islandbus.com", bus_number: "B-126", contractor: "Island Bus Co", status: "active", hire_date: "2021-04-05", cdl_expiry: "2027-02-10", cdl_status: "valid", medical_expiry: "2026-10-25", medical_status: "valid", cert_19a_expiry: "2026-07-20", cert_19a_status: "valid", routes_assigned: 2, on_time_pct: 96, safety_incidents: 0 },
  { id: "ld-27", name: "Edward Mitchell", phone: "(516) 555-0127", email: "emitchell@islandbus.com", bus_number: "B-127", contractor: "Island Bus Co", status: "active", hire_date: "2017-11-15", cdl_expiry: "2026-04-20", cdl_status: "expiring_soon", medical_expiry: "2026-05-10", medical_status: "valid", cert_19a_expiry: "2026-06-05", cert_19a_status: "valid", routes_assigned: 2, on_time_pct: 92, safety_incidents: 1 },
  { id: "ld-28", name: "Helen Cooper", phone: "(516) 555-0128", email: "hcooper@islandbus.com", bus_number: "B-128", contractor: "Island Bus Co", status: "active", hire_date: "2022-06-01", cdl_expiry: "2027-07-20", cdl_status: "valid", medical_expiry: "2026-12-15", medical_status: "valid", cert_19a_expiry: "2026-10-30", cert_19a_status: "valid", routes_assigned: 1, on_time_pct: 98, safety_incidents: 0 },
  { id: "ld-29", name: "Frank Perez", phone: "(516) 555-0129", email: "fperez@islandbus.com", bus_number: "B-129", contractor: "Island Bus Co", status: "active", hire_date: "2019-06-15", cdl_expiry: "2026-10-10", cdl_status: "valid", medical_expiry: "2026-07-25", medical_status: "valid", cert_19a_expiry: "2026-12-05", cert_19a_status: "valid", routes_assigned: 2, on_time_pct: 94, safety_incidents: 0 },
  { id: "ld-30", name: "Ruth Howard", phone: "(516) 555-0130", email: "rhoward@islandbus.com", bus_number: "B-130", contractor: "Island Bus Co", status: "active", hire_date: "2020-07-20", cdl_expiry: "2026-11-30", cdl_status: "valid", medical_expiry: "2026-08-05", medical_status: "valid", cert_19a_expiry: "2026-05-25", cert_19a_status: "valid", routes_assigned: 2, on_time_pct: 97, safety_incidents: 0 },
  { id: "ld-31", name: "Walter Green", phone: "(516) 555-0131", email: "wgreen@islandbus.com", bus_number: "B-131", contractor: "Island Bus Co", status: "active", hire_date: "2021-01-10", cdl_expiry: "2027-01-05", cdl_status: "valid", medical_expiry: "2026-09-15", medical_status: "valid", cert_19a_expiry: "2026-08-15", cert_19a_status: "valid", routes_assigned: 1, on_time_pct: 96, safety_incidents: 0 },
  { id: "ld-32", name: "Carol Evans", phone: "(516) 555-0132", email: "cevans@islandbus.com", bus_number: "B-132", contractor: "Island Bus Co", status: "active", hire_date: "2019-09-01", cdl_expiry: "2026-07-15", cdl_status: "valid", medical_expiry: "2026-05-25", medical_status: "valid", cert_19a_expiry: "2026-04-10", cert_19a_status: "expiring_soon", routes_assigned: 2, on_time_pct: 93, safety_incidents: 0 },
  { id: "ld-33", name: "Raymond Hill", phone: "(516) 555-0133", email: "rhill@acmetrans.com", bus_number: "B-133", contractor: "Acme Transport", status: "active", hire_date: "2018-12-10", cdl_expiry: "2026-09-25", cdl_status: "valid", medical_expiry: "2026-06-20", medical_status: "valid", cert_19a_expiry: "2026-07-30", cert_19a_status: "valid", routes_assigned: 2, on_time_pct: 95, safety_incidents: 0 },
  { id: "ld-34", name: "Virginia Young", phone: "(516) 555-0134", email: "vyoung@acmetrans.com", bus_number: "B-134", contractor: "Acme Transport", status: "active", hire_date: "2020-04-15", cdl_expiry: "2026-12-20", cdl_status: "valid", medical_expiry: "2026-10-01", medical_status: "valid", cert_19a_expiry: "2026-11-10", cert_19a_status: "valid", routes_assigned: 1, on_time_pct: 98, safety_incidents: 0 },
  { id: "ld-35", name: "Eugene King", phone: "(516) 555-0135", email: "eking@saferoute.com", bus_number: "B-135", contractor: "SafeRoute LLC", status: "active", hire_date: "2021-07-01", cdl_expiry: "2027-04-25", cdl_status: "valid", medical_expiry: "2026-11-30", medical_status: "valid", cert_19a_expiry: "2026-09-05", cert_19a_status: "valid", routes_assigned: 2, on_time_pct: 96, safety_incidents: 0 },
  { id: "ld-36", name: "Gloria Baker", phone: "(516) 555-0136", email: "gbaker@saferoute.com", bus_number: "B-136", contractor: "SafeRoute LLC", status: "active", hire_date: "2019-03-15", cdl_expiry: "2026-06-10", cdl_status: "valid", medical_expiry: "2026-04-05", medical_status: "expiring_soon", cert_19a_expiry: "2026-06-20", cert_19a_status: "valid", routes_assigned: 2, on_time_pct: 94, safety_incidents: 0 },
  { id: "ld-37", name: "Roy Gonzalez", phone: "(516) 555-0137", email: "rgonzalez@saferoute.com", bus_number: "B-137", contractor: "SafeRoute LLC", status: "inactive", hire_date: "2017-08-20", cdl_expiry: "2025-12-15", cdl_status: "expired", medical_expiry: "2025-11-01", medical_status: "expired", cert_19a_expiry: "2025-10-30", cert_19a_status: "expired", routes_assigned: 0, on_time_pct: 88, safety_incidents: 3 },
  { id: "ld-38", name: "Judith Rivera", phone: "(516) 555-0138", email: "jrivera@acmetrans.com", bus_number: "B-138", contractor: "Acme Transport", status: "active", hire_date: "2022-08-01", cdl_expiry: "2027-06-30", cdl_status: "valid", medical_expiry: "2026-12-10", medical_status: "valid", cert_19a_expiry: "2026-10-15", cert_19a_status: "valid", routes_assigned: 1, on_time_pct: 97, safety_incidents: 0 },
  { id: "ld-39", name: "Alan Murphy", phone: "(516) 555-0139", email: "amurphy@acmetrans.com", bus_number: "B-139", contractor: "Acme Transport", status: "active", hire_date: "2020-09-10", cdl_expiry: "2026-08-15", cdl_status: "valid", medical_expiry: "2026-07-01", medical_status: "valid", cert_19a_expiry: "2026-05-15", cert_19a_status: "valid", routes_assigned: 2, on_time_pct: 95, safety_incidents: 0 },
  { id: "ld-40", name: "Diana Foster", phone: "(516) 555-0140", email: "dfoster@saferoute.com", bus_number: "B-140", contractor: "SafeRoute LLC", status: "on_leave", hire_date: "2018-11-05", cdl_expiry: "2026-10-20", cdl_status: "valid", medical_expiry: "2026-08-10", medical_status: "valid", cert_19a_expiry: "2026-07-05", cert_19a_status: "valid", routes_assigned: 0, on_time_pct: 96, safety_incidents: 0 },
  { id: "ld-41", name: "Peter Brooks", phone: "(516) 555-0141", email: "pbrooks@islandbus.com", bus_number: "B-141", contractor: "Island Bus Co", status: "active", hire_date: "2021-11-20", cdl_expiry: "2027-05-10", cdl_status: "valid", medical_expiry: "2026-11-25", medical_status: "valid", cert_19a_expiry: "2026-08-30", cert_19a_status: "valid", routes_assigned: 1, on_time_pct: 98, safety_incidents: 0 },
  { id: "ld-42", name: "Shirley Reed", phone: "(516) 555-0142", email: "sreed@islandbus.com", bus_number: "B-142", contractor: "Island Bus Co", status: "inactive", hire_date: "2016-05-01", cdl_expiry: "2026-01-15", cdl_status: "expired", medical_expiry: "2025-09-30", medical_status: "expired", cert_19a_expiry: "2025-08-20", cert_19a_status: "expired", routes_assigned: 0, on_time_pct: 85, safety_incidents: 4 },
];

const OCEANSIDE_DRIVERS: DemoDriver[] = [
  { id: "od-01", name: "Anthony Rossi", phone: "(516) 555-0201", email: "arossi@coastaltrans.com", bus_number: "O-201", contractor: "Coastal Transport", status: "active", hire_date: "2019-06-10", cdl_expiry: "2027-02-15", cdl_status: "valid", medical_expiry: "2026-08-20", medical_status: "valid", cert_19a_expiry: "2026-06-10", cert_19a_status: "valid", routes_assigned: 2, on_time_pct: 97, safety_incidents: 0 },
  { id: "od-02", name: "Catherine Walsh", phone: "(516) 555-0202", email: "cwalsh@coastaltrans.com", bus_number: "O-202", contractor: "Coastal Transport", status: "active", hire_date: "2020-03-15", cdl_expiry: "2026-09-10", cdl_status: "valid", medical_expiry: "2026-05-15", medical_status: "valid", cert_19a_expiry: "2026-08-25", cert_19a_status: "valid", routes_assigned: 2, on_time_pct: 98, safety_incidents: 0 },
  { id: "od-03", name: "William Brennan", phone: "(516) 555-0203", email: "wbrennan@coastaltrans.com", bus_number: "O-203", contractor: "Coastal Transport", status: "active", hire_date: "2018-08-20", cdl_expiry: "2026-07-05", cdl_status: "valid", medical_expiry: "2026-04-10", medical_status: "expiring_soon", cert_19a_expiry: "2026-09-15", cert_19a_status: "valid", routes_assigned: 2, on_time_pct: 95, safety_incidents: 1 },
  { id: "od-04", name: "Elizabeth Duffy", phone: "(516) 555-0204", email: "eduffy@coastaltrans.com", bus_number: "O-204", contractor: "Coastal Transport", status: "active", hire_date: "2021-01-10", cdl_expiry: "2027-03-20", cdl_status: "valid", medical_expiry: "2026-11-01", medical_status: "valid", cert_19a_expiry: "2026-07-30", cert_19a_status: "valid", routes_assigned: 2, on_time_pct: 97, safety_incidents: 0 },
  { id: "od-05", name: "Christopher Quinn", phone: "(516) 555-0205", email: "cquinn@coastaltrans.com", bus_number: "O-205", contractor: "Coastal Transport", status: "active", hire_date: "2019-10-05", cdl_expiry: "2026-11-15", cdl_status: "valid", medical_expiry: "2026-06-25", medical_status: "valid", cert_19a_expiry: "2026-05-10", cert_19a_status: "valid", routes_assigned: 2, on_time_pct: 96, safety_incidents: 0 },
  { id: "od-06", name: "Amanda O'Brien", phone: "(516) 555-0206", email: "aobrien@coastaltrans.com", bus_number: "O-206", contractor: "Coastal Transport", status: "active", hire_date: "2020-07-20", cdl_expiry: "2026-12-30", cdl_status: "valid", medical_expiry: "2026-09-15", medical_status: "valid", cert_19a_expiry: "2026-10-20", cert_19a_status: "valid", routes_assigned: 1, on_time_pct: 99, safety_incidents: 0 },
  { id: "od-07", name: "Kevin McCarthy", phone: "(516) 555-0207", email: "kmccarthy@coastaltrans.com", bus_number: "O-207", contractor: "Coastal Transport", status: "active", hire_date: "2022-04-01", cdl_expiry: "2027-06-15", cdl_status: "valid", medical_expiry: "2026-12-05", medical_status: "valid", cert_19a_expiry: "2026-11-10", cert_19a_status: "valid", routes_assigned: 1, on_time_pct: 97, safety_incidents: 0 },
  { id: "od-08", name: "Michelle Sullivan", phone: "(516) 555-0208", email: "msullivan@coastaltrans.com", bus_number: "O-208", contractor: "Coastal Transport", status: "active", hire_date: "2018-12-15", cdl_expiry: "2026-05-20", cdl_status: "valid", medical_expiry: "2026-03-30", medical_status: "expiring_soon", cert_19a_expiry: "2026-04-05", cert_19a_status: "expiring_soon", routes_assigned: 2, on_time_pct: 93, safety_incidents: 1 },
  { id: "od-09", name: "Brian Kelly", phone: "(516) 555-0209", email: "bkelly@shorelinebus.com", bus_number: "O-209", contractor: "Shoreline Bus", status: "active", hire_date: "2019-05-10", cdl_expiry: "2026-08-25", cdl_status: "valid", medical_expiry: "2026-07-10", medical_status: "valid", cert_19a_expiry: "2026-06-15", cert_19a_status: "valid", routes_assigned: 2, on_time_pct: 96, safety_incidents: 0 },
  { id: "od-10", name: "Laura Fitzgerald", phone: "(516) 555-0210", email: "lfitzgerald@shorelinebus.com", bus_number: "O-210", contractor: "Shoreline Bus", status: "active", hire_date: "2020-11-15", cdl_expiry: "2027-01-10", cdl_status: "valid", medical_expiry: "2026-10-20", medical_status: "valid", cert_19a_expiry: "2026-09-25", cert_19a_status: "valid", routes_assigned: 2, on_time_pct: 98, safety_incidents: 0 },
  { id: "od-11", name: "Patrick Doyle", phone: "(516) 555-0211", email: "pdoyle@shorelinebus.com", bus_number: "O-211", contractor: "Shoreline Bus", status: "active", hire_date: "2021-09-01", cdl_expiry: "2027-04-05", cdl_status: "valid", medical_expiry: "2026-11-15", medical_status: "valid", cert_19a_expiry: "2026-08-10", cert_19a_status: "valid", routes_assigned: 1, on_time_pct: 97, safety_incidents: 0 },
  { id: "od-12", name: "Sharon Murray", phone: "(516) 555-0212", email: "smurray@shorelinebus.com", bus_number: "O-212", contractor: "Shoreline Bus", status: "active", hire_date: "2019-02-20", cdl_expiry: "2026-06-30", cdl_status: "valid", medical_expiry: "2026-04-15", medical_status: "expiring_soon", cert_19a_expiry: "2026-05-20", cert_19a_status: "valid", routes_assigned: 2, on_time_pct: 94, safety_incidents: 0 },
  { id: "od-13", name: "Timothy Ryan", phone: "(516) 555-0213", email: "tryan@shorelinebus.com", bus_number: "O-213", contractor: "Shoreline Bus", status: "active", hire_date: "2020-06-10", cdl_expiry: "2026-10-15", cdl_status: "valid", medical_expiry: "2026-08-05", medical_status: "valid", cert_19a_expiry: "2026-07-25", cert_19a_status: "valid", routes_assigned: 2, on_time_pct: 95, safety_incidents: 0 },
  { id: "od-14", name: "Angela Burns", phone: "(516) 555-0214", email: "aburns@shorelinebus.com", bus_number: "O-214", contractor: "Shoreline Bus", status: "active", hire_date: "2022-01-15", cdl_expiry: "2027-05-20", cdl_status: "valid", medical_expiry: "2026-12-25", medical_status: "valid", cert_19a_expiry: "2026-10-10", cert_19a_status: "valid", routes_assigned: 1, on_time_pct: 98, safety_incidents: 0 },
  { id: "od-15", name: "Sean Gallagher", phone: "(516) 555-0215", email: "sgallagher@shorelinebus.com", bus_number: "O-215", contractor: "Shoreline Bus", status: "on_leave", hire_date: "2018-10-01", cdl_expiry: "2026-09-05", cdl_status: "valid", medical_expiry: "2026-06-30", medical_status: "valid", cert_19a_expiry: "2026-08-15", cert_19a_status: "valid", routes_assigned: 0, on_time_pct: 96, safety_incidents: 0 },
  { id: "od-16", name: "Colleen Byrne", phone: "(516) 555-0216", email: "cbyrne@shorelinebus.com", bus_number: "O-216", contractor: "Shoreline Bus", status: "active", hire_date: "2021-03-20", cdl_expiry: "2027-02-25", cdl_status: "valid", medical_expiry: "2026-10-30", medical_status: "valid", cert_19a_expiry: "2026-09-05", cert_19a_status: "valid", routes_assigned: 2, on_time_pct: 97, safety_incidents: 0 },
  { id: "od-17", name: "Dennis Flynn", phone: "(516) 555-0217", email: "dflynn@coastaltrans.com", bus_number: "O-217", contractor: "Coastal Transport", status: "active", hire_date: "2019-07-15", cdl_expiry: "2026-04-10", cdl_status: "expiring_soon", medical_expiry: "2026-05-01", medical_status: "valid", cert_19a_expiry: "2026-06-20", cert_19a_status: "valid", routes_assigned: 2, on_time_pct: 94, safety_incidents: 0 },
  { id: "od-18", name: "Maureen Casey", phone: "(516) 555-0218", email: "mcasey@coastaltrans.com", bus_number: "O-218", contractor: "Coastal Transport", status: "inactive", hire_date: "2017-04-10", cdl_expiry: "2025-11-20", cdl_status: "expired", medical_expiry: "2025-08-15", medical_status: "expired", cert_19a_expiry: "2025-07-10", cert_19a_status: "expired", routes_assigned: 0, on_time_pct: 87, safety_incidents: 3 },
  { id: "od-19", name: "Gregory Nolan", phone: "(516) 555-0219", email: "gnolan@coastaltrans.com", bus_number: "O-219", contractor: "Coastal Transport", status: "active", hire_date: "2020-09-05", cdl_expiry: "2026-11-25", cdl_status: "valid", medical_expiry: "2026-08-15", medical_status: "valid", cert_19a_expiry: "2026-07-10", cert_19a_status: "valid", routes_assigned: 1, on_time_pct: 96, safety_incidents: 0 },
  { id: "od-20", name: "Eileen Flanagan", phone: "(516) 555-0220", email: "eflanagan@coastaltrans.com", bus_number: "O-220", contractor: "Coastal Transport", status: "active", hire_date: "2021-05-15", cdl_expiry: "2027-03-10", cdl_status: "valid", medical_expiry: "2026-12-01", medical_status: "valid", cert_19a_expiry: "2026-10-25", cert_19a_status: "valid", routes_assigned: 2, on_time_pct: 97, safety_incidents: 0 },
  { id: "od-21", name: "Raymond Connolly", phone: "(516) 555-0221", email: "rconnolly@shorelinebus.com", bus_number: "O-221", contractor: "Shoreline Bus", status: "active", hire_date: "2019-12-10", cdl_expiry: "2026-08-10", cdl_status: "valid", medical_expiry: "2026-05-25", medical_status: "valid", cert_19a_expiry: "2026-04-20", cert_19a_status: "expiring_soon", routes_assigned: 2, on_time_pct: 95, safety_incidents: 0 },
  { id: "od-22", name: "Theresa Maguire", phone: "(516) 555-0222", email: "tmaguire@shorelinebus.com", bus_number: "O-222", contractor: "Shoreline Bus", status: "active", hire_date: "2022-07-01", cdl_expiry: "2027-07-15", cdl_status: "valid", medical_expiry: "2026-12-20", medical_status: "valid", cert_19a_expiry: "2026-11-05", cert_19a_status: "valid", routes_assigned: 1, on_time_pct: 99, safety_incidents: 0 },
  { id: "od-23", name: "Francis Doherty", phone: "(516) 555-0223", email: "fdoherty@shorelinebus.com", bus_number: "O-223", contractor: "Shoreline Bus", status: "active", hire_date: "2018-06-20", cdl_expiry: "2026-03-25", cdl_status: "expiring_soon", medical_expiry: "2026-03-10", medical_status: "expiring_soon", cert_19a_expiry: "2026-05-05", cert_19a_status: "valid", routes_assigned: 2, on_time_pct: 92, safety_incidents: 1 },
  { id: "od-24", name: "Bridget Hogan", phone: "(516) 555-0224", email: "bhogan@coastaltrans.com", bus_number: "O-224", contractor: "Coastal Transport", status: "active", hire_date: "2020-12-01", cdl_expiry: "2026-12-05", cdl_status: "valid", medical_expiry: "2026-09-10", medical_status: "valid", cert_19a_expiry: "2026-08-20", cert_19a_status: "valid", routes_assigned: 1, on_time_pct: 97, safety_incidents: 0 },
  { id: "od-25", name: "Martin Sheridan", phone: "(516) 555-0225", email: "msheridan@coastaltrans.com", bus_number: "O-225", contractor: "Coastal Transport", status: "active", hire_date: "2021-08-10", cdl_expiry: "2027-04-20", cdl_status: "valid", medical_expiry: "2026-11-10", medical_status: "valid", cert_19a_expiry: "2026-09-15", cert_19a_status: "valid", routes_assigned: 2, on_time_pct: 96, safety_incidents: 0 },
  { id: "od-26", name: "Siobhan Hennessy", phone: "(516) 555-0226", email: "shennessy@coastaltrans.com", bus_number: "O-226", contractor: "Coastal Transport", status: "active", hire_date: "2019-04-15", cdl_expiry: "2026-07-20", cdl_status: "valid", medical_expiry: "2026-05-05", medical_status: "valid", cert_19a_expiry: "2026-06-25", cert_19a_status: "valid", routes_assigned: 2, on_time_pct: 95, safety_incidents: 0 },
  { id: "od-27", name: "Declan Foley", phone: "(516) 555-0227", email: "dfoley@shorelinebus.com", bus_number: "O-227", contractor: "Shoreline Bus", status: "active", hire_date: "2020-02-10", cdl_expiry: "2026-10-25", cdl_status: "valid", medical_expiry: "2026-07-20", medical_status: "valid", cert_19a_expiry: "2026-06-05", cert_19a_status: "valid", routes_assigned: 1, on_time_pct: 98, safety_incidents: 0 },
  { id: "od-28", name: "Niamh Kavanagh", phone: "(516) 555-0228", email: "nkavanagh@shorelinebus.com", bus_number: "O-228", contractor: "Shoreline Bus", status: "active", hire_date: "2022-09-01", cdl_expiry: "2027-08-10", cdl_status: "valid", medical_expiry: "2026-12-30", medical_status: "valid", cert_19a_expiry: "2026-11-20", cert_19a_status: "valid", routes_assigned: 1, on_time_pct: 97, safety_incidents: 0 },
];

const DEMO_DRIVERS: Record<DemoDistrictId, DemoDriver[]> = {
  lawrence: LAWRENCE_DRIVERS,
  oceanside: OCEANSIDE_DRIVERS,
};

export function getDemoDrivers(districtId: DemoDistrictId): DemoDriver[] {
  return DEMO_DRIVERS[districtId];
}

// ═══════════════════════════════════════════════════════════════
// BUS PASSES — Demo data for Bus Passes page
// ═══════════════════════════════════════════════════════════════

export interface DemoBusPass {
  id: string;
  pass_number: string;
  student_name: string;
  grade: string;
  school: string;
  route_number: string;
  status: "active" | "suspended" | "revoked" | "expired";
  issued_at: string;
  expires_at: string;
  school_year: string;
}

function generateBusPasses(districtId: DemoDistrictId): DemoBusPass[] {
  const students = getDemoStudents(districtId);
  const routes = getDemoRoutes(districtId);
  const prefix = districtId === "lawrence" ? "BP-L" : "BP-O";

  return students.map((s, i) => {
    const route = routes[i % routes.length];
    const num = String(i + 1).padStart(4, "0");
    const statusPool: DemoBusPass["status"][] = ["active", "active", "active", "active", "active", "active", "active", "active", "suspended", "active"];
    return {
      id: `${districtId}-bp-${i}`,
      pass_number: `${prefix}-2025-${num}`,
      student_name: s.student_name,
      grade: s.grade,
      school: s.school,
      route_number: route.route_number,
      status: statusPool[i % statusPool.length],
      issued_at: "2025-08-25",
      expires_at: "2026-06-30",
      school_year: "2025-2026",
    };
  });
}

const DEMO_BUS_PASSES: Record<DemoDistrictId, DemoBusPass[]> = {
  lawrence: generateBusPasses("lawrence"),
  oceanside: generateBusPasses("oceanside"),
};

export function getDemoBusPasses(districtId: DemoDistrictId): DemoBusPass[] {
  return DEMO_BUS_PASSES[districtId];
}
