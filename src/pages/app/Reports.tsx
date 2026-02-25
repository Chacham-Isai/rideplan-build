import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useDistrict } from "@/contexts/DistrictContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  AlertTriangle, FileText, TrendingUp, Bell,
  Plus, Eye, Search, Loader2, CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

const COLORS = ["#F59E0B", "#3B82F6", "#10B981", "#8B5CF6", "#EC4899", "#06B6D4", "#EF4444"];

const priorityStyle = (p: string) => {
  if (p === "critical") return "bg-red-100 text-red-700 border-red-200";
  if (p === "high") return "bg-amber-100 text-amber-700 border-amber-200";
  if (p === "medium") return "bg-blue-100 text-blue-700 border-blue-200";
  return "bg-gray-100 text-gray-600 border-gray-200";
};

const statusStyle = (s: string) => {
  if (s === "resolved") return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (s === "reviewing") return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-blue-100 text-blue-700 border-blue-200";
};

const Reports = () => {
  const { district } = useDistrict();
  const { user } = useAuth();
  const [safetyReports, setSafetyReports] = useState<any[]>([]);
  const [driverReports, setDriverReports] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Detail dialog
  const [selectedSafety, setSelectedSafety] = useState<any>(null);
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [sRes, dRes, aRes] = await Promise.all([
      supabase.from("safety_reports").select("*").order("created_at", { ascending: false }),
      supabase.from("driver_reports").select("*").order("created_at", { ascending: false }),
      supabase.from("report_alerts").select("*").order("created_at", { ascending: false }),
    ]);
    setSafetyReports(sRes.data ?? []);
    setDriverReports(dRes.data ?? []);
    setAlerts(aRes.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  // Filtered safety reports
  let filteredSafety = safetyReports;
  if (search) filteredSafety = filteredSafety.filter(r => r.reporter_name?.toLowerCase().includes(search.toLowerCase()) || r.school_name?.toLowerCase().includes(search.toLowerCase()) || r.description?.toLowerCase().includes(search.toLowerCase()));
  if (priorityFilter !== "all") filteredSafety = filteredSafety.filter(r => r.ai_priority === priorityFilter);
  if (statusFilter !== "all") filteredSafety = filteredSafety.filter(r => r.status === statusFilter);

  // Filtered driver reports
  let filteredDriver = driverReports;
  if (search) filteredDriver = filteredDriver.filter(r => r.driver_name?.toLowerCase().includes(search.toLowerCase()) || r.description?.toLowerCase().includes(search.toLowerCase()));
  if (statusFilter !== "all") filteredDriver = filteredDriver.filter(r => r.status === statusFilter);

  // Stats
  const openSafety = safetyReports.filter(r => r.status === "new").length;
  const criticalSafety = safetyReports.filter(r => r.ai_priority === "critical").length;
  const resolvedThisMonth = safetyReports.filter(r => {
    const d = new Date(r.created_at);
    const now = new Date();
    return r.status === "resolved" && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const updateSafetyStatus = async (id: string, newStatus: string) => {
    setUpdatingStatus(true);
    const { error } = await supabase.from("safety_reports").update({ status: newStatus as any }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success(`Status updated to ${newStatus}`); fetchAll(); if (selectedSafety?.id === id) setSelectedSafety({ ...selectedSafety, status: newStatus }); }
    setUpdatingStatus(false);
  };

  const updateDriverStatus = async (id: string, newStatus: string) => {
    setUpdatingStatus(true);
    const { error } = await supabase.from("driver_reports").update({ status: newStatus as any }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success(`Status updated to ${newStatus}`); fetchAll(); if (selectedDriver?.id === id) setSelectedDriver({ ...selectedDriver, status: newStatus }); }
    setUpdatingStatus(false);
  };

  const dismissAlert = async (id: string) => {
    const { error } = await supabase.from("report_alerts").update({ acknowledged: true }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Alert dismissed"); fetchAll(); }
  };

  // Analytics data
  const monthlyTrend = (() => {
    const months = new Map<string, { low: number; medium: number; high: number; critical: number }>();
    safetyReports.forEach(r => {
      const key = new Date(r.created_at).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      const e = months.get(key) ?? { low: 0, medium: 0, high: 0, critical: 0 };
      e[r.ai_priority as keyof typeof e]++;
      months.set(key, e);
    });
    return Array.from(months.entries()).map(([month, d]) => ({ month, ...d })).reverse().slice(-12);
  })();

  const typeBreakdown = (() => {
    const types = new Map<string, number>();
    safetyReports.forEach(r => {
      const t = r.report_type ?? "other";
      types.set(t, (types.get(t) ?? 0) + 1);
    });
    return Array.from(types.entries()).map(([name, value]) => ({ name: name.replace("_", " "), value }));
  })();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reports</h1>
        <p className="text-sm text-muted-foreground">Safety reports, driver reports, alerts & analytics</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="border-0 shadow-sm"><CardContent className="p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Reports</p>
          <p className="mt-1 text-2xl font-bold">{safetyReports.length}</p>
        </CardContent></Card>
        <Card className="border-0 shadow-sm"><CardContent className="p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Open / Pending</p>
          <p className="mt-1 text-2xl font-bold">{openSafety}</p>
        </CardContent></Card>
        <Card className="border-0 shadow-sm"><CardContent className="p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Critical</p>
          <p className={`mt-1 text-2xl font-bold ${criticalSafety > 0 ? "text-red-600" : ""}`}>{criticalSafety}</p>
        </CardContent></Card>
        <Card className="border-0 shadow-sm"><CardContent className="p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Resolved This Month</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">{resolvedThisMonth}</p>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="safety">
        <TabsList>
          <TabsTrigger value="safety"><AlertTriangle className="mr-1.5 h-4 w-4" />Safety</TabsTrigger>
          <TabsTrigger value="driver"><FileText className="mr-1.5 h-4 w-4" />Driver</TabsTrigger>
          <TabsTrigger value="alerts"><Bell className="mr-1.5 h-4 w-4" />Alerts ({alerts.filter(a => !a.acknowledged).length})</TabsTrigger>
          <TabsTrigger value="analytics"><TrendingUp className="mr-1.5 h-4 w-4" />Analytics</TabsTrigger>
        </TabsList>

        {/* Safety Reports */}
        <TabsContent value="safety" className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search reports..." value={searchInput} onChange={e => setSearchInput(e.target.value)} className="pl-9" />
            </div>
            <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="all">All Statuses</option>
              <option value="new">New</option><option value="reviewing">Reviewing</option><option value="resolved">Resolved</option>
            </select>
          </div>

          <Card className="border-0 shadow-sm"><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>School</TableHead>
                <TableHead>Bus</TableHead><TableHead>Priority</TableHead><TableHead>Status</TableHead>
                <TableHead>Reporter</TableHead><TableHead></TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {filteredSafety.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="h-32 text-center text-muted-foreground">No safety reports found</TableCell></TableRow>
                ) : filteredSafety.map(r => (
                  <TableRow key={r.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedSafety(r)}>
                    <TableCell className="text-xs">{new Date(r.incident_date).toLocaleDateString()}</TableCell>
                    <TableCell className="capitalize text-xs">{r.report_type?.replace("_", " ")}</TableCell>
                    <TableCell>{r.school_name}</TableCell>
                    <TableCell>{r.bus_number}</TableCell>
                    <TableCell><Badge variant="outline" className={priorityStyle(r.ai_priority)}>{r.ai_priority}</Badge></TableCell>
                    <TableCell><Badge variant="outline" className={statusStyle(r.status)}>{r.status}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.reporter_name}</TableCell>
                    <TableCell><Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>

        {/* Driver Reports */}
        <TabsContent value="driver" className="mt-4 space-y-4">
          <Card className="border-0 shadow-sm"><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Driver</TableHead>
                <TableHead>Bus</TableHead><TableHead>Route</TableHead><TableHead>Status</TableHead><TableHead></TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {filteredDriver.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="h-32 text-center text-muted-foreground">No driver reports found</TableCell></TableRow>
                ) : filteredDriver.map(r => (
                  <TableRow key={r.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedDriver(r)}>
                    <TableCell className="text-xs">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="capitalize text-xs">{r.report_type}</TableCell>
                    <TableCell className="font-medium">{r.driver_name}</TableCell>
                    <TableCell>{r.bus_number}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.route_info}</TableCell>
                    <TableCell><Badge variant="outline" className={statusStyle(r.status)}>{r.status}</Badge></TableCell>
                    <TableCell><Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>

        {/* Alerts */}
        <TabsContent value="alerts" className="mt-4 space-y-3">
          {alerts.filter(a => !a.acknowledged).length === 0 ? (
            <Card className="border-0 shadow-sm"><CardContent className="py-12 text-center text-muted-foreground">No active alerts</CardContent></Card>
          ) : alerts.filter(a => !a.acknowledged).map(a => (
            <Card key={a.id} className="border-0 shadow-sm">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{a.alert_type} — Bus {a.bus_number}</p>
                  <p className="text-xs text-muted-foreground">{a.details}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(a.created_at).toLocaleDateString()}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => dismissAlert(a.id)}>Dismiss</Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="mt-4 space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Monthly trend */}
            {monthlyTrend.length > 0 && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2"><CardTitle className="text-base">Reports by Month</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyTrend}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", fontSize: 12 }} />
                        <Line type="monotone" dataKey="critical" stroke="#EF4444" strokeWidth={2} />
                        <Line type="monotone" dataKey="high" stroke="#F59E0B" strokeWidth={2} />
                        <Line type="monotone" dataKey="medium" stroke="#3B82F6" strokeWidth={2} />
                        <Line type="monotone" dataKey="low" stroke="#9CA3AF" strokeWidth={1} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Type breakdown */}
            {typeBreakdown.length > 0 && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2"><CardTitle className="text-base">Report Type Breakdown</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={typeBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                          {typeBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Safety Detail Dialog */}
      <Dialog open={!!selectedSafety} onOpenChange={() => setSelectedSafety(null)}>
        <DialogContent className="max-w-lg">
          {selectedSafety && (
            <>
              <DialogHeader><DialogTitle>Safety Report</DialogTitle></DialogHeader>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-muted-foreground">Date:</span> {new Date(selectedSafety.incident_date).toLocaleDateString()}</div>
                  <div><span className="text-muted-foreground">Type:</span> <span className="capitalize">{selectedSafety.report_type?.replace("_", " ")}</span></div>
                  <div><span className="text-muted-foreground">School:</span> {selectedSafety.school_name}</div>
                  <div><span className="text-muted-foreground">Bus:</span> {selectedSafety.bus_number}</div>
                  <div><span className="text-muted-foreground">Reporter:</span> {selectedSafety.reporter_name}</div>
                  <div><span className="text-muted-foreground">Email:</span> {selectedSafety.reporter_email}</div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className={priorityStyle(selectedSafety.ai_priority)}>{selectedSafety.ai_priority}</Badge>
                  <Badge variant="outline" className={statusStyle(selectedSafety.status)}>{selectedSafety.status}</Badge>
                </div>
                <div><span className="text-muted-foreground">Description:</span><p className="mt-1">{selectedSafety.description}</p></div>
                <div className="flex gap-2 pt-2">
                  {selectedSafety.status !== "reviewing" && <Button size="sm" variant="outline" onClick={() => updateSafetyStatus(selectedSafety.id, "reviewing")} disabled={updatingStatus}>Mark Reviewing</Button>}
                  {selectedSafety.status !== "resolved" && <Button size="sm" onClick={() => updateSafetyStatus(selectedSafety.id, "resolved")} disabled={updatingStatus} className="bg-emerald-600 hover:bg-emerald-700 text-white">Resolve</Button>}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Driver Detail Dialog */}
      <Dialog open={!!selectedDriver} onOpenChange={() => setSelectedDriver(null)}>
        <DialogContent className="max-w-lg">
          {selectedDriver && (
            <>
              <DialogHeader><DialogTitle>Driver Report</DialogTitle></DialogHeader>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-muted-foreground">Driver:</span> {selectedDriver.driver_name}</div>
                  <div><span className="text-muted-foreground">Bus:</span> {selectedDriver.bus_number}</div>
                  <div><span className="text-muted-foreground">Type:</span> <span className="capitalize">{selectedDriver.report_type}</span></div>
                  <div><span className="text-muted-foreground">Route:</span> {selectedDriver.route_info ?? "—"}</div>
                </div>
                <Badge variant="outline" className={statusStyle(selectedDriver.status)}>{selectedDriver.status}</Badge>
                <div><span className="text-muted-foreground">Description:</span><p className="mt-1">{selectedDriver.description}</p></div>
                <div className="flex gap-2 pt-2">
                  {selectedDriver.status !== "reviewing" && <Button size="sm" variant="outline" onClick={() => updateDriverStatus(selectedDriver.id, "reviewing")} disabled={updatingStatus}>Mark Reviewing</Button>}
                  {selectedDriver.status !== "resolved" && <Button size="sm" onClick={() => updateDriverStatus(selectedDriver.id, "resolved")} disabled={updatingStatus} className="bg-emerald-600 hover:bg-emerald-700 text-white">Resolve</Button>}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Reports;
