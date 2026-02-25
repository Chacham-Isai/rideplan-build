import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useDistrict } from "@/contexts/DistrictContext";
import {
  Users, MapPin, Bus, TrendingUp, Clock, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Plus, Baby, GraduationCap, FileEdit,
  MessageSquare, Phone, Shield, FileText, CreditCard, UserCheck,
  AlertCircle, CheckCircle, XCircle, Ticket,
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
const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const Dashboard = () => {
  const { district } = useDistrict();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [schoolData, setSchoolData] = useState<{ school: string; students: number; routes: number }[]>([]);
  const [tierData, setTierData] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  // New phase data
  const [openRequests, setOpenRequests] = useState(0);
  const [urgentRequests, setUrgentRequests] = useState(0);
  const [expiringCerts, setExpiringCerts] = useState(0);
  const [expiredCerts, setExpiredCerts] = useState(0);
  const [busPassesIssued, setBusPassesIssued] = useState(0);
  const [activeAides, setActiveAides] = useState(0);
  const [recentComms, setRecentComms] = useState(0);
  const [pendingInvoices, setPendingInvoices] = useState(0);
  const [expiringContracts, setExpiringContracts] = useState(0);
  const [actionItems, setActionItems] = useState<{ label: string; count: number; icon: React.ElementType; color: string; href: string }[]>([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);

      const [routesRes, studentsRes, pendingRes, requestsRes, certsRes, passesRes, aidesRes, commsRes, invoicesRes, contractsRes] = await Promise.all([
        supabase.from("routes").select("school, status, total_students, total_miles, on_time_pct, avg_ride_time_min, cost_per_student, tier"),
        supabase.from("student_registrations").select("id", { count: "exact", head: true }).eq("status", "approved"),
        supabase.from("student_registrations").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("service_requests").select("status, priority"),
        supabase.from("driver_certifications").select("status"),
        supabase.from("bus_passes").select("id", { count: "exact", head: true }).eq("status", "active" as any),
        supabase.from("route_aides").select("id", { count: "exact", head: true }).eq("status", "active" as any),
        supabase.from("communication_log").select("id", { count: "exact", head: true }),
        supabase.from("contract_invoices").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("contracts").select("contract_end, status").eq("status", "active"),
      ]);

      const routes = routesRes.data ?? [];
      const activeRoutes = routes.filter((r) => r.status === "active");

      const totalMiles = routes.reduce((s, r) => s + (r.total_miles ?? 0), 0);
      const avgOnTime = activeRoutes.length
        ? activeRoutes.reduce((s, r) => s + (r.on_time_pct ?? 0), 0) / activeRoutes.length : 0;
      const avgRideTime = activeRoutes.length
        ? activeRoutes.reduce((s, r) => s + (r.avg_ride_time_min ?? 0), 0) / activeRoutes.length : 0;
      const avgCost = activeRoutes.length
        ? activeRoutes.reduce((s, r) => s + (r.cost_per_student ?? 0), 0) / activeRoutes.length : 0;

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

      // Service requests
      const reqs = requestsRes.data ?? [];
      const openReqs = reqs.filter(r => r.status === "open" || r.status === "in_progress").length;
      const urgentReqs = reqs.filter(r => r.priority === "urgent" && (r.status === "open" || r.status === "in_progress")).length;
      setOpenRequests(openReqs);
      setUrgentRequests(urgentReqs);

      // Certs
      const certs = certsRes.data ?? [];
      setExpiringCerts(certs.filter(c => c.status === "expiring").length);
      setExpiredCerts(certs.filter(c => c.status === "expired").length);

      setBusPassesIssued(passesRes.count ?? 0);
      setActiveAides(aidesRes.count ?? 0);
      setRecentComms(commsRes.count ?? 0);
      setPendingInvoices(invoicesRes.count ?? 0);

      // Expiring contracts (next 90 days)
      const now = new Date();
      const in90 = new Date(now.getTime() + 90 * 86400000);
      const expContracts = (contractsRes.data ?? []).filter(c => new Date(c.contract_end) <= in90 && new Date(c.contract_end) > now).length;
      setExpiringContracts(expContracts);

      // Build action items
      const items: typeof actionItems = [];
      if (urgentReqs > 0) items.push({ label: "Urgent Requests", count: urgentReqs, icon: AlertCircle, color: "text-red-600 bg-red-50", href: "/app/requests" });
      if (certs.filter(c => c.status === "expired").length > 0) items.push({ label: "Expired Certifications", count: certs.filter(c => c.status === "expired").length, icon: XCircle, color: "text-red-600 bg-red-50", href: "/app/contracts" });
      if (certs.filter(c => c.status === "expiring").length > 0) items.push({ label: "Expiring Certifications", count: certs.filter(c => c.status === "expiring").length, icon: AlertTriangle, color: "text-amber-600 bg-amber-50", href: "/app/contracts" });
      if (expContracts > 0) items.push({ label: "Contracts Expiring Soon", count: expContracts, icon: FileText, color: "text-amber-600 bg-amber-50", href: "/app/contracts" });
      if ((pendingRes.count ?? 0) > 0) items.push({ label: "Pending Registrations", count: pendingRes.count ?? 0, icon: UserCheck, color: "text-blue-600 bg-blue-50", href: "/app/admin/residency" });
      if ((invoicesRes.count ?? 0) > 0) items.push({ label: "Pending Invoices", count: invoicesRes.count ?? 0, icon: CreditCard, color: "text-purple-600 bg-purple-50", href: "/app/contracts" });
      setActionItems(items);

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
    { label: "Open Requests", value: openRequests.toString(), icon: MessageSquare, color: "text-purple-600", bg: "bg-purple-50", trend: urgentRequests > 0 ? `${urgentRequests} urgent` : "All clear", up: urgentRequests === 0, href: "/app/requests" },
  ];

  const quickActions = [
    { label: "Add Student", icon: Plus, href: "/app/students?action=add", color: "text-blue-600" },
    { label: "New Request", icon: MessageSquare, href: "/app/requests", color: "text-purple-600" },
    { label: "Log Communication", icon: Phone, href: "/app/communications", color: "text-emerald-600" },
    { label: "View Registrations", icon: UserCheck, href: "/app/admin/residency", color: "text-amber-600" },
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

      {/* Action Items Banner */}
      {actionItems.length > 0 && (
        <Card className="border-0 shadow-sm border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" /> Action Items Requiring Attention
            </h3>
            <div className="flex flex-wrap gap-2">
              {actionItems.map((item, i) => (
                <button
                  key={i}
                  onClick={() => navigate(item.href)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:shadow-md ${item.color}`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}: <span className="font-bold">{item.count}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stat cards */}
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

      {/* Workflow Sections Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Secretarial */}
        <Card className="border-0 shadow-sm cursor-pointer hover:shadow-md" onClick={() => navigate("/app/requests")}>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50">
                <MessageSquare className="h-4 w-4 text-purple-600" />
              </div>
              <h3 className="text-sm font-semibold">Secretarial</h3>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Open Requests</span><span className="font-bold">{openRequests}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Urgent</span><span className={`font-bold ${urgentRequests > 0 ? "text-red-600" : ""}`}>{urgentRequests}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Pending Registrations</span><span className="font-bold">{stats?.pendingRegistrations}</span></div>
            </div>
          </CardContent>
        </Card>

        {/* Transportation */}
        <Card className="border-0 shadow-sm cursor-pointer hover:shadow-md" onClick={() => navigate("/app/routes")}>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                <Bus className="h-4 w-4 text-emerald-600" />
              </div>
              <h3 className="text-sm font-semibold">Transportation</h3>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Active Routes</span><span className="font-bold">{stats?.activeRoutes}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Daily Miles</span><span className="font-bold">{stats?.totalMiles?.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Aides Assigned</span><span className="font-bold">{activeAides}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Bus Passes</span><span className="font-bold">{busPassesIssued}</span></div>
            </div>
          </CardContent>
        </Card>

        {/* Business */}
        <Card className="border-0 shadow-sm cursor-pointer hover:shadow-md" onClick={() => navigate("/app/contracts")}>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <h3 className="text-sm font-semibold">Business</h3>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Pending Invoices</span><span className="font-bold">{pendingInvoices}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Expiring Contracts</span><span className={`font-bold ${expiringContracts > 0 ? "text-amber-600" : ""}`}>{expiringContracts}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Expiring 19A Certs</span><span className={`font-bold ${expiringCerts > 0 ? "text-amber-600" : ""}`}>{expiringCerts}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Expired 19A Certs</span><span className={`font-bold ${expiredCerts > 0 ? "text-red-600" : ""}`}>{expiredCerts}</span></div>
            </div>
          </CardContent>
        </Card>

        {/* Compliance */}
        <Card className="border-0 shadow-sm cursor-pointer hover:shadow-md" onClick={() => navigate("/app/compliance")}>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50">
                <Shield className="h-4 w-4 text-amber-600" />
              </div>
              <h3 className="text-sm font-semibold">Compliance</h3>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Avg Cost/Student</span><span className="font-bold">${stats?.avgCostPerStudent}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Avg Ride Time</span><span className="font-bold">{stats?.avgRideTime} min</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Communications</span><span className="font-bold">{recentComms}</span></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-3">
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
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", fontSize: 12 }} />
                  <Bar dataKey="students" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

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
      <div className="grid gap-4 sm:grid-cols-4">
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
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                <Ticket className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Bus Passes Issued</p>
                <p className="text-xl font-bold">{busPassesIssued}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
