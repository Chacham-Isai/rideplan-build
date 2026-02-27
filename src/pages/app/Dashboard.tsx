import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDemoMode } from "@/contexts/DemoModeContext";
import { getDemoDashboardData } from "@/lib/demoData";
import { supabase } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Users,
  Bus,
  MapPin,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Activity,
  Shield,
  Ticket,
  UserCheck,
} from "lucide-react";

const COLORS = ["#3b82f6", "#6366f1", "#8b5cf6"];

interface DashboardStats {
  totalStudents: number;
  totalRoutes: number;
  activeRoutes: number;
  avgOnTime: number;
  totalMiles: number;
  pendingRegistrations: number;
  avgRideTime: number;
  avgCostPerStudent: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { isDemoMode, demoDistrictId } = useDemoMode();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [schoolData, setSchoolData] = useState<
    { school: string; students: number; routes: number }[]
  >([]);
  const [tierData, setTierData] = useState<{ name: string; value: number }[]>([]);
  const [openRequests, setOpenRequests] = useState(0);
  const [urgentRequests, setUrgentRequests] = useState(0);
  const [expiringCerts, setExpiringCerts] = useState(0);
  const [expiredCerts, setExpiredCerts] = useState(0);
  const [busPassesIssued, setBusPassesIssued] = useState(0);
  const [activeDrivers, setActiveDrivers] = useState(0);
  const [totalDrivers, setTotalDrivers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDemoMode && demoDistrictId) {
      const data = getDemoDashboardData(demoDistrictId);
      setStats(data.stats);
      setSchoolData(data.schoolData);
      setTierData(data.tierData);
      setOpenRequests(data.openRequests);
      setUrgentRequests(data.urgentRequests);
      setExpiringCerts(data.expiringCerts);
      setExpiredCerts(data.expiredCerts);
      setBusPassesIssued(data.busPassesIssued);
      setActiveDrivers(data.activeDrivers);
      setTotalDrivers(data.totalDrivers);
      setLoading(false);
      return;
    }

    // Real data path — only runs when not in demo mode
    async function fetchDashboardData() {
      if (!user) return;
      setLoading(true);
      try {
        // --- Students ---
        const { count: studentCount } = await supabase
          .from("students")
          .select("*", { count: "exact", head: true });

        // --- Routes ---
        const { data: routeData } = await supabase
          .from("routes")
          .select("id, status, tier, school");

        const totalRoutes = routeData?.length ?? 0;
        const activeRoutes =
          routeData?.filter((r) => r.status === "active").length ?? 0;

        // Build school breakdown
        const schoolMap: Record<string, { students: number; routes: number }> = {};
        routeData?.forEach((r) => {
          if (!r.school) return;
          if (!schoolMap[r.school]) schoolMap[r.school] = { students: 0, routes: 0 };
          schoolMap[r.school].routes += 1;
        });

        // Build tier breakdown
        const tierMap: Record<string, number> = {};
        routeData?.forEach((r) => {
          if (!r.tier) return;
          tierMap[r.tier] = (tierMap[r.tier] ?? 0) + 1;
        });
        const tierArr = Object.entries(tierMap).map(([name, value]) => ({ name, value }));

        // --- Open requests ---
        const { count: openReqCount } = await supabase
          .from("transportation_requests")
          .select("*", { count: "exact", head: true })
          .eq("status", "open");

        const { count: urgentReqCount } = await supabase
          .from("transportation_requests")
          .select("*", { count: "exact", head: true })
          .eq("status", "open")
          .eq("priority", "urgent");

        // --- Driver certs ---
        const today = new Date().toISOString().split("T")[0];
        const in30 = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];

        const { count: expiredCount } = await supabase
          .from("driver_certifications")
          .select("*", { count: "exact", head: true })
          .lt("expiry_date", today);

        const { count: expiringCount } = await supabase
          .from("driver_certifications")
          .select("*", { count: "exact", head: true })
          .gte("expiry_date", today)
          .lte("expiry_date", in30);

        // --- Bus passes ---
        const { count: passCount } = await supabase
          .from("bus_passes")
          .select("*", { count: "exact", head: true })
          .eq("status", "active");

        // --- Drivers ---
        const { count: activeDriverCount } = await supabase
          .from("drivers")
          .select("*", { count: "exact", head: true })
          .eq("status", "active");

        const { count: totalDriverCount } = await supabase
          .from("drivers")
          .select("*", { count: "exact", head: true });

        setStats({
          totalStudents: studentCount ?? 0,
          totalRoutes,
          activeRoutes,
          avgOnTime: 94.5, // TODO: calculate from GPS logs
          totalMiles: 0,
          pendingRegistrations: 0,
          avgRideTime: 0,
          avgCostPerStudent: 0,
        });
        setSchoolData(
          Object.entries(schoolMap).map(([school, v]) => ({
            school,
            students: v.students,
            routes: v.routes,
          }))
        );
        setTierData(tierArr);
        setOpenRequests(openReqCount ?? 0);
        setUrgentRequests(urgentReqCount ?? 0);
        setExpiringCerts(expiringCount ?? 0);
        setExpiredCerts(expiredCount ?? 0);
        setBusPassesIssued(passCount ?? 0);
        setActiveDrivers(activeDriverCount ?? 0);
        setTotalDrivers(totalDriverCount ?? 0);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [user, isDemoMode, demoDistrictId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-16 text-slate-400">
        Unable to load dashboard data.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
              <Users className="h-4 w-4" /> Students
            </div>
            <p className="text-2xl font-bold text-white">
              {stats.totalStudents.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
              <Bus className="h-4 w-4" /> Active Routes
            </div>
            <p className="text-2xl font-bold text-white">
              {stats.activeRoutes}
              <span className="text-slate-400 text-base font-normal"> / {stats.totalRoutes}</span>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
              <Clock className="h-4 w-4" /> On-Time %
            </div>
            <p className="text-2xl font-bold text-white">{stats.avgOnTime}%</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
              <Ticket className="h-4 w-4" /> Bus Passes
            </div>
            <p className="text-2xl font-bold text-white">
              {busPassesIssued.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Schools bar chart */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-sm">Students by School</CardTitle>
            <CardDescription className="text-slate-400">Route distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={schoolData} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="school" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
                  labelStyle={{ color: "#f8fafc" }}
                />
                <Bar dataKey="students" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tier pie */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-sm">Routes by Tier</CardTitle>
            <CardDescription className="text-slate-400">Bell-time distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={tierData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {tierData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
                />
                <Legend
                  formatter={(value) => <span style={{ color: "#94a3b8", fontSize: 12 }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Requests */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-400" /> Transportation Requests
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Open</span>
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">{openRequests}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Urgent</span>
              <Badge className="bg-red-500/20 text-red-300 border-red-500/30">{urgentRequests}</Badge>
            </div>
            <Button variant="outline" size="sm" className="w-full mt-2 border-slate-600 text-slate-300 hover:text-white">
              View Requests
            </Button>
          </CardContent>
        </Card>

        {/* Cert status */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Shield className="h-4 w-4 text-purple-400" /> Driver Certifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Expiring soon</span>
              <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">{expiringCerts}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Expired</span>
              <Badge className="bg-red-500/20 text-red-300 border-red-500/30">{expiredCerts}</Badge>
            </div>
            <Button variant="outline" size="sm" className="w-full mt-2 border-slate-600 text-slate-300 hover:text-white">
              View Drivers
            </Button>
          </CardContent>
        </Card>

        {/* Fleet health */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-green-400" /> Driver Availability
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Active</span>
              <span className="text-white font-semibold">{activeDrivers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Total roster</span>
              <span className="text-white font-semibold">{totalDrivers}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 mt-3">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{
                  width: totalDrivers > 0 ? `${Math.round((activeDrivers / totalDrivers) * 100)}%` : "0%",
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {(urgentRequests > 0 || expiredCerts > 0) && (
        <Card className="bg-red-950/30 border-red-500/30">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-red-300 font-medium text-sm">Action Required</p>
                <ul className="text-red-400/80 text-sm mt-1 space-y-0.5">
                  {urgentRequests > 0 && (
                    <li>{urgentRequests} urgent transportation request{urgentRequests > 1 ? "s" : ""} need attention</li>
                  )}
                  {expiredCerts > 0 && (
                    <li>{expiredCerts} driver certification{expiredCerts > 1 ? "s" : ""} have expired</li>
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All clear */}
      {urgentRequests === 0 && expiredCerts === 0 && (
        <Card className="bg-green-950/20 border-green-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
              <p className="text-green-300 text-sm">All systems operational — no urgent issues</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
