import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useDistrict } from "@/contexts/DistrictContext";
import {
  Users, MapPin, Bus, TrendingUp, Clock, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Plus, Baby, GraduationCap, FileEdit,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

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

const COLORS = ["#F59E0B", "#3B82F6", "#10B981", "#8B5CF6", "#EC4899", "#06B6D4", "#EF4444"];

const Dashboard = () => {
  const { district } = useDistrict();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [schoolData, setSchoolData] = useState<{ school: string; students: number; routes: number }[]>([]);
  const [tierData, setTierData] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);

      const [routesRes, studentsRes, pendingRes] = await Promise.all([
        supabase.from("routes").select("school, status, total_students, total_miles, on_time_pct, avg_ride_time_min, cost_per_student, tier"),
        supabase.from("student_registrations").select("id", { count: "exact", head: true }).eq("status", "approved"),
        supabase.from("student_registrations").select("id", { count: "exact", head: true }).eq("status", "pending"),
      ]);

      const routes = routesRes.data ?? [];
      const activeRoutes = routes.filter((r) => r.status === "active");

      const totalMiles = routes.reduce((s, r) => s + (r.total_miles ?? 0), 0);
      const avgOnTime = activeRoutes.length
        ? activeRoutes.reduce((s, r) => s + (r.on_time_pct ?? 0), 0) / activeRoutes.length
        : 0;
      const avgRideTime = activeRoutes.length
        ? activeRoutes.reduce((s, r) => s + (r.avg_ride_time_min ?? 0), 0) / activeRoutes.length
        : 0;
      const avgCost = activeRoutes.length
        ? activeRoutes.reduce((s, r) => s + (r.cost_per_student ?? 0), 0) / activeRoutes.length
        : 0;

      setStats({
        totalStudents: studentsRes.count ?? 0,
        totalRoutes: routes.length,
        activeRoutes: activeRoutes.length,
        avgOnTime: Math.round(avgOnTime * 10) / 10,
        totalMiles: Math.round(totalMiles),
        pendingRegistrations: pendingRes.count ?? 0,
        avgRideTime: Math.round(avgRideTime),
        avgCostPerStudent: Math.round(avgCost),
      });

      // School breakdown
      const schoolMap = new Map<string, { students: number; routes: number }>();
      routes.forEach((r) => {
        const entry = schoolMap.get(r.school) ?? { students: 0, routes: 0 };
        entry.students += r.total_students ?? 0;
        entry.routes += 1;
        schoolMap.set(r.school, entry);
      });
      setSchoolData(
        Array.from(schoolMap.entries())
          .map(([school, d]) => ({ school: school.replace("Number ", "#").replace(" School", ""), ...d }))
          .sort((a, b) => b.students - a.students)
      );

      // Tier breakdown
      const tierCount = [0, 0, 0];
      routes.forEach((r) => { if (r.tier >= 1 && r.tier <= 3) tierCount[r.tier - 1]++; });
      setTierData([
        { name: "Tier 1", value: tierCount[0] },
        { name: "Tier 2", value: tierCount[1] },
        { name: "Tier 3", value: tierCount[2] },
      ]);

      setLoading(false);
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const statCards = [
    { label: "Total Students", value: stats?.totalStudents?.toLocaleString() ?? "0", icon: Users, color: "text-blue-600", bg: "bg-blue-50", trend: "+3.2%", up: true, href: "/app/students" },
    { label: "Active Routes", value: `${stats?.activeRoutes ?? 0} / ${stats?.totalRoutes ?? 0}`, icon: MapPin, color: "text-emerald-600", bg: "bg-emerald-50", trend: "99%", up: true, href: "/app/routes" },
    { label: "On-Time Rate", value: `${stats?.avgOnTime ?? 0}%`, icon: Clock, color: "text-amber-600", bg: "bg-amber-50", trend: "+1.4%", up: true, href: "/app/routes" },
    { label: "Pending Registrations", value: stats?.pendingRegistrations?.toLocaleString() ?? "0", icon: AlertTriangle, color: "text-rose-600", bg: "bg-rose-50", trend: "Action needed", up: false, href: "/app/admin/residency" },
  ];

  const quickActions = [
    { label: "Add Student", icon: Plus, href: "/app/students?action=add", color: "text-blue-600" },
    { label: "Childcare Requests", icon: Baby, href: "/app/students?filter=childcare", color: "text-purple-600" },
    { label: "Special Ed Pickups", icon: GraduationCap, href: "/app/students?filter=special_ed", color: "text-amber-600" },
    { label: "Edit Requests", icon: FileEdit, href: "/app/students?filter=special_requests", color: "text-emerald-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {district?.name ?? "District"} — {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
      </div>

      {/* Stat cards — now clickable */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card
            key={card.label}
            className="border-0 shadow-sm cursor-pointer transition-shadow hover:shadow-md hover:ring-1 hover:ring-primary/20"
            onClick={() => navigate(card.href)}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{card.label}</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">{card.value}</p>
                  <div className={`mt-1 flex items-center gap-1 text-xs font-medium ${card.up ? "text-emerald-600" : "text-rose-600"}`}>
                    {card.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {card.trend}
                  </div>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.bg}`}>
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant="outline"
                className="h-auto flex-col gap-2 py-4 hover:bg-muted/50"
                onClick={() => navigate(action.href)}
              >
                <action.icon className={`h-5 w-5 ${action.color}`} />
                <span className="text-xs font-medium">{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Students by school */}
        <Card className="border-0 shadow-sm lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Students by School</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={schoolData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="school" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", fontSize: 12 }}
                  />
                  <Bar dataKey="students" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Route tiers */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Route Tiers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={tierData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {tierData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 space-y-2">
              {tierData.map((t, i) => (
                <div key={t.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-muted-foreground">{t.name}</span>
                  </div>
                  <span className="font-medium">{t.value} routes</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
                <Bus className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Daily Miles</p>
                <p className="text-xl font-bold">{stats?.totalMiles?.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-50">
                <Clock className="h-5 w-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Avg Ride Time</p>
                <p className="text-xl font-bold">{stats?.avgRideTime} min</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Avg Cost / Student</p>
                <p className="text-xl font-bold">${stats?.avgCostPerStudent?.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
