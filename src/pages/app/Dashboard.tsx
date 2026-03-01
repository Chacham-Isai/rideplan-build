import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDemoMode } from "@/contexts/DemoModeContext";
import { getDemoDashboardData } from "@/lib/demoData";
import type { DemoDistrictId } from "@/contexts/DemoModeContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Clock,
  AlertCircle,
  CheckCircle2,
  Activity,
  Shield,
  Ticket,
  UserCheck,
  ChevronRight,
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
  const navigate = useNavigate();

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
      const data = getDemoDashboardData(demoDistrictId as DemoDistrictId);
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

    if (!user) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchLiveData() {
      setLoading(true);
      try {
        // Parallel queries for all dashboard data
        const [
          studentsRes,
          routesRes,
          requestsRes,
          certsRes,
          passesRes,
        ] = await Promise.all([
          supabase.from("student_registrations").select("school", { count: "exact", head: false }),
          supabase.from("routes").select("status, tier, on_time_pct, total_miles, total_students, school"),
          supabase.from("service_requests").select("status, priority"),
          supabase.from("driver_certifications").select("status, expiration_date"),
          supabase.from("bus_passes").select("id", { count: "exact", head: true }),
        ]);

        if (cancelled) return;

        // Students
        const students = studentsRes.data ?? [];
        const totalStudents = students.length;

        // Routes
        const routes = routesRes.data ?? [];
        const totalRoutes = routes.length;
        const activeRoutes = routes.filter((r: any) => r.status === "active").length;
        const onTimePcts = routes.filter((r: any) => r.on_time_pct != null).map((r: any) => Number(r.on_time_pct));
        const avgOnTime = onTimePcts.length > 0 ? Math.round(onTimePcts.reduce((a: number, b: number) => a + b, 0) / onTimePcts.length) : 0;
        const totalMiles = routes.reduce((sum: number, r: any) => sum + (Number(r.total_miles) || 0), 0);

        // School breakdown for bar chart
        const schoolMap = new Map<string, { students: number; routes: number }>();
        for (const s of students) {
          const school = (s as any).school ?? "Unknown";
          const entry = schoolMap.get(school) ?? { students: 0, routes: 0 };
          entry.students++;
          schoolMap.set(school, entry);
        }
        for (const r of routes) {
          const school = (r as any).school ?? "Unknown";
          const entry = schoolMap.get(school) ?? { students: 0, routes: 0 };
          entry.routes++;
          schoolMap.set(school, entry);
        }
        const schoolArr = Array.from(schoolMap.entries())
          .map(([school, d]) => ({ school, ...d }))
          .sort((a, b) => b.students - a.students)
          .slice(0, 8);

        // Tier breakdown for pie chart
        const tierMap = new Map<string, number>();
        for (const r of routes) {
          const tier = (r as any).tier ?? "Unassigned";
          tierMap.set(tier, (tierMap.get(tier) ?? 0) + 1);
        }
        const tierArr = Array.from(tierMap.entries()).map(([name, value]) => ({ name, value }));

        // Requests
        const requests = requestsRes.data ?? [];
        const open = requests.filter((r: any) => r.status === "open" || r.status === "pending").length;
        const urgent = requests.filter((r: any) => r.priority === "urgent" || r.priority === "emergency").length;

        // Certifications
        const certs = certsRes.data ?? [];
        const now = new Date();
        const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const expired = certs.filter((c: any) => c.status === "expired" || new Date(c.expiration_date) < now).length;
        const expiring = certs.filter((c: any) => {
          const exp = new Date(c.expiration_date);
          return exp >= now && exp <= in30 && c.status !== "expired";
        }).length;

        // Drivers (unique names from certs)
        const allDriverNames = new Set(certs.map((c: any) => c.driver_name));
        const activeDriverNames = new Set(
          certs.filter((c: any) => c.status === "valid" || new Date(c.expiration_date) >= now)
            .map((c: any) => c.driver_name)
        );

        // Bus passes
        const passCount = passesRes.count ?? 0;

        if (cancelled) return;

        setStats({
          totalStudents,
          totalRoutes,
          activeRoutes,
          avgOnTime,
          totalMiles,
          pendingRegistrations: 0,
          avgRideTime: 0,
          avgCostPerStudent: 0,
        });
        setSchoolData(schoolArr);
        setTierData(tierArr);
        setOpenRequests(open);
        setUrgentRequests(urgent);
        setExpiringCerts(expiring);
        setExpiredCerts(expired);
        setBusPassesIssued(passCount);
        setActiveDrivers(activeDriverNames.size);
        setTotalDrivers(allDriverNames.size);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        // Fallback to zeros
        setStats({
          totalStudents: 0, totalRoutes: 0, activeRoutes: 0, avgOnTime: 0,
          totalMiles: 0, pendingRegistrations: 0, avgRideTime: 0, avgCostPerStudent: 0,
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchLiveData();
    return () => { cancelled = true; };
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
        <Card
          className="bg-slate-800 border-slate-700 cursor-pointer hover:border-blue-500/50 hover:bg-slate-750 transition-all group"
          onClick={() => navigate("/app/students")}
        >
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                  <Users className="h-4 w-4" /> Students
                </div>
                <p className="text-2xl font-bold text-white">
                  {stats.totalStudents.toLocaleString()}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-blue-400 transition-colors" />
            </div>
          </CardContent>
        </Card>

        <Card
          className="bg-slate-800 border-slate-700 cursor-pointer hover:border-blue-500/50 hover:bg-slate-750 transition-all group"
          onClick={() => navigate("/app/routes")}
        >
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                  <Bus className="h-4 w-4" /> Active Routes
                </div>
                <p className="text-2xl font-bold text-white">
                  {stats.activeRoutes}
                  <span className="text-slate-400 text-base font-normal"> / {stats.totalRoutes}</span>
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-blue-400 transition-colors" />
            </div>
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

        <Card
          className="bg-slate-800 border-slate-700 cursor-pointer hover:border-blue-500/50 hover:bg-slate-750 transition-all group"
          onClick={() => navigate("/app/bus-passes")}
        >
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                  <Ticket className="h-4 w-4" /> Bus Passes
                </div>
                <p className="text-2xl font-bold text-white">
                  {busPassesIssued.toLocaleString()}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-blue-400 transition-colors" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
        <Card
          className="bg-slate-800 border-slate-700 cursor-pointer hover:border-blue-500/50 hover:bg-slate-750 transition-all group"
          onClick={() => navigate("/app/requests")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-400" /> Transportation Requests
              <ChevronRight className="h-4 w-4 ml-auto text-slate-600 group-hover:text-blue-400 transition-colors" />
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
          </CardContent>
        </Card>

        <Card
          className="bg-slate-800 border-slate-700 cursor-pointer hover:border-purple-500/50 hover:bg-slate-750 transition-all group"
          onClick={() => navigate("/app/drivers?filter=expiring")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Shield className="h-4 w-4 text-purple-400" /> Driver Certifications
              <ChevronRight className="h-4 w-4 ml-auto text-slate-600 group-hover:text-purple-400 transition-colors" />
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
          </CardContent>
        </Card>

        <Card
          className="bg-slate-800 border-slate-700 cursor-pointer hover:border-green-500/50 hover:bg-slate-750 transition-all group"
          onClick={() => navigate("/app/drivers")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-green-400" /> Driver Availability
              <ChevronRight className="h-4 w-4 ml-auto text-slate-600 group-hover:text-green-400 transition-colors" />
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
                    <li
                      className="cursor-pointer hover:text-red-300 transition-colors"
                      onClick={() => navigate("/app/requests")}
                    >
                      → {urgentRequests} urgent transportation request{urgentRequests > 1 ? "s" : ""} need attention
                    </li>
                  )}
                  {expiredCerts > 0 && (
                    <li
                      className="cursor-pointer hover:text-red-300 transition-colors"
                      onClick={() => navigate("/app/drivers?filter=expired")}
                    >
                      → {expiredCerts} driver certification{expiredCerts > 1 ? "s" : ""} have expired
                    </li>
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
