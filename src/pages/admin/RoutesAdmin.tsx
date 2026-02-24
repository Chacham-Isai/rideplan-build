import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Route, Plus, AlertTriangle, TrendingUp, Users, Clock, DollarSign, Bus, Merge, Timer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const CHART_COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "#22c55e", "#f59e0b", "#ef4444"];

const RoutesAdmin = () => {
  const [routes, setRoutes] = useState<any[]>([]);
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showScenario, setShowScenario] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);
  const [form, setForm] = useState({
    route_number: "", school: "", bus_number: "", driver_name: "",
    tier: "1", total_miles: "", total_students: "", capacity: "72",
    avg_ride_time_min: "", on_time_pct: "100", cost_per_student: "",
    am_start: "", am_end: "", pm_start: "", pm_end: "", notes: "",
  });
  const [scenarioForm, setScenarioForm] = useState({
    name: "", scenario_type: "consolidation", description: "",
    bell_shift_min: "15", target_utilization: "75",
  });

  const fetchData = async () => {
    setLoading(true);
    const [r, s] = await Promise.all([
      supabase.from("routes").select("*").order("route_number"),
      supabase.from("route_scenarios").select("*").order("created_at", { ascending: false }),
    ]);
    setRoutes(r.data || []);
    setScenarios(s.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // === STATS ===
  const stats = useMemo(() => {
    const active = routes.filter(r => r.status === "active");
    const totalStudents = active.reduce((s, r) => s + (r.total_students || 0), 0);
    const totalMiles = active.reduce((s, r) => s + Number(r.total_miles || 0), 0);
    const avgUtil = active.length > 0
      ? active.reduce((s, r) => s + ((r.total_students || 0) / (r.capacity || 72)) * 100, 0) / active.length
      : 0;
    const avgOnTime = active.length > 0
      ? active.reduce((s, r) => s + Number(r.on_time_pct || 0), 0) / active.length
      : 0;
    const avgRideTime = active.length > 0
      ? active.reduce((s, r) => s + Number(r.avg_ride_time_min || 0), 0) / active.length
      : 0;
    const avgCost = active.length > 0
      ? active.reduce((s, r) => s + Number(r.cost_per_student || 0), 0) / active.length
      : 0;
    return { active: active.length, totalStudents, totalMiles, avgUtil, avgOnTime, avgRideTime, avgCost };
  }, [routes]);

  // === INEFFICIENCY DETECTION ===
  const inefficiencies = useMemo(() => {
    const issues: { route: any; type: string; severity: string; detail: string }[] = [];
    routes.filter(r => r.status === "active").forEach(r => {
      const util = ((r.total_students || 0) / (r.capacity || 72)) * 100;
      if (util < 50) issues.push({ route: r, type: "Low Utilization", severity: "high", detail: `${util.toFixed(0)}% capacity (${r.total_students}/${r.capacity})` });
      else if (util < 65) issues.push({ route: r, type: "Below Target Utilization", severity: "medium", detail: `${util.toFixed(0)}% capacity` });
      if (Number(r.avg_ride_time_min || 0) > 60) issues.push({ route: r, type: "Excessive Ride Time", severity: "high", detail: `${r.avg_ride_time_min} min avg ride` });
      if (Number(r.on_time_pct || 100) < 85) issues.push({ route: r, type: "Low On-Time Rate", severity: "medium", detail: `${r.on_time_pct}% on-time` });
      if (Number(r.cost_per_student || 0) > 2000) issues.push({ route: r, type: "High Cost Per Student", severity: "medium", detail: `$${Number(r.cost_per_student).toLocaleString()}/student` });
    });
    return issues.sort((a, b) => (a.severity === "high" ? -1 : 1) - (b.severity === "high" ? -1 : 1));
  }, [routes]);

  // === CHART DATA ===
  const utilizationData = useMemo(() => {
    const buckets = [
      { name: "0-25%", count: 0 }, { name: "26-50%", count: 0 },
      { name: "51-75%", count: 0 }, { name: "76-100%", count: 0 },
    ];
    routes.filter(r => r.status === "active").forEach(r => {
      const util = ((r.total_students || 0) / (r.capacity || 72)) * 100;
      if (util <= 25) buckets[0].count++;
      else if (util <= 50) buckets[1].count++;
      else if (util <= 75) buckets[2].count++;
      else buckets[3].count++;
    });
    return buckets;
  }, [routes]);

  const tierData = useMemo(() => {
    const tiers: Record<number, { students: number; routes: number }> = {};
    routes.filter(r => r.status === "active").forEach(r => {
      const t = r.tier || 1;
      if (!tiers[t]) tiers[t] = { students: 0, routes: 0 };
      tiers[t].students += r.total_students || 0;
      tiers[t].routes++;
    });
    return Object.entries(tiers).map(([tier, d]) => ({ name: `Tier ${tier}`, ...d }));
  }, [routes]);

  // === HANDLERS ===
  const handleAddRoute = async () => {
    const { error } = await supabase.from("routes").insert({
      district_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      route_number: form.route_number, school: form.school,
      bus_number: form.bus_number || null, driver_name: form.driver_name || null,
      tier: Number(form.tier) || 1,
      total_miles: Number(form.total_miles) || 0,
      total_students: Number(form.total_students) || 0,
      capacity: Number(form.capacity) || 72,
      avg_ride_time_min: Number(form.avg_ride_time_min) || 0,
      on_time_pct: Number(form.on_time_pct) || 100,
      cost_per_student: Number(form.cost_per_student) || 0,
      am_start: form.am_start || null, am_end: form.am_end || null,
      pm_start: form.pm_start || null, pm_end: form.pm_end || null,
      notes: form.notes || null,
    });
    if (error) toast.error(error.message);
    else { toast.success("Route added"); setShowAdd(false); fetchData(); }
  };

  const runScenario = async () => {
    const activeRoutes = routes.filter(r => r.status === "active");
    let savings = 0, affected = 0, studentsAffected = 0;
    const results: any = {};

    if (scenarioForm.scenario_type === "consolidation") {
      const targetUtil = Number(scenarioForm.target_utilization) / 100;
      const underutilized = activeRoutes.filter(r => ((r.total_students || 0) / (r.capacity || 72)) < targetUtil);
      const potentialMerges = Math.floor(underutilized.length / 2);
      savings = potentialMerges * 85000; // avg cost per route
      affected = underutilized.length;
      studentsAffected = underutilized.reduce((s, r) => s + (r.total_students || 0), 0);
      results.underutilized_routes = underutilized.map(r => r.route_number);
      results.potential_merges = potentialMerges;
    } else {
      // Bell time shift
      const shiftMin = Number(scenarioForm.bell_shift_min) || 15;
      const tieredRoutes = activeRoutes.filter(r => (r.tier || 1) >= 2);
      affected = tieredRoutes.length;
      studentsAffected = tieredRoutes.reduce((s, r) => s + (r.total_students || 0), 0);
      savings = Math.floor(affected * 0.3) * 85000; // 30% could be absorbed
      results.shift_minutes = shiftMin;
      results.routes_retiered = affected;
    }

    const { data: session } = await supabase.auth.getSession();
    const { error } = await supabase.from("route_scenarios").insert({
      district_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      name: scenarioForm.name,
      scenario_type: scenarioForm.scenario_type,
      description: scenarioForm.description || null,
      parameters: scenarioForm.scenario_type === "consolidation"
        ? { target_utilization: Number(scenarioForm.target_utilization) }
        : { bell_shift_min: Number(scenarioForm.bell_shift_min) },
      results,
      estimated_savings: savings,
      routes_affected: affected,
      students_affected: studentsAffected,
      created_by: session.session?.user?.id,
    });
    if (error) toast.error(error.message);
    else { toast.success("Scenario created"); setShowScenario(false); fetchData(); }
  };

  const statCards = [
    { label: "Active Routes", value: stats.active, icon: Route, color: "text-primary" },
    { label: "Total Students", value: stats.totalStudents.toLocaleString(), icon: Users, color: "text-accent" },
    { label: "Avg Utilization", value: `${stats.avgUtil.toFixed(0)}%`, icon: Bus, color: stats.avgUtil < 65 ? "text-destructive" : "text-green-600" },
    { label: "Avg On-Time", value: `${stats.avgOnTime.toFixed(1)}%`, icon: Clock, color: stats.avgOnTime < 90 ? "text-orange-500" : "text-green-600" },
    { label: "Avg Ride Time", value: `${stats.avgRideTime.toFixed(0)} min`, icon: Timer, color: stats.avgRideTime > 45 ? "text-orange-500" : "text-primary" },
    { label: "Avg Cost/Student", value: `$${stats.avgCost.toFixed(0)}`, icon: DollarSign, color: "text-primary" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map(s => (
          <Card key={s.label} className="p-4 flex items-center gap-3">
            <s.icon className={`w-7 h-7 ${s.color}`} />
            <div>
              <p className="text-xl font-bold text-primary">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="routes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="routes">Routes</TabsTrigger>
          <TabsTrigger value="inefficiencies">
            Inefficiencies {inefficiencies.length > 0 && <Badge className="ml-1 bg-destructive/20 text-destructive text-xs">{inefficiencies.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="simulator">Simulator</TabsTrigger>
          <TabsTrigger value="charts">Analytics</TabsTrigger>
        </TabsList>

        {/* ROUTES TAB */}
        <TabsContent value="routes" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowAdd(true)} className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="w-4 h-4 mr-1" /> Add Route
            </Button>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route #</TableHead>
                  <TableHead>School</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Utilization</TableHead>
                  <TableHead>Miles</TableHead>
                  <TableHead>Ride Time</TableHead>
                  <TableHead>On-Time</TableHead>
                  <TableHead>Cost/Student</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
                ) : routes.length === 0 ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No routes</TableCell></TableRow>
                ) : routes.map(r => {
                  const util = ((r.total_students || 0) / (r.capacity || 72)) * 100;
                  return (
                    <TableRow key={r.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelected(r)}>
                      <TableCell className="font-mono font-medium">{r.route_number}</TableCell>
                      <TableCell className="text-sm">{r.school}</TableCell>
                      <TableCell><Badge variant="outline">Tier {r.tier}</Badge></TableCell>
                      <TableCell>{r.total_students}/{r.capacity}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={util} className="w-16 h-2" />
                          <span className={`text-xs font-medium ${util < 50 ? "text-destructive" : util < 65 ? "text-orange-500" : "text-green-600"}`}>{util.toFixed(0)}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{Number(r.total_miles || 0).toFixed(1)}</TableCell>
                      <TableCell className="text-sm">{r.avg_ride_time_min} min</TableCell>
                      <TableCell className={`text-sm font-medium ${Number(r.on_time_pct) < 85 ? "text-destructive" : "text-green-600"}`}>{r.on_time_pct}%</TableCell>
                      <TableCell className="text-sm">${Number(r.cost_per_student || 0).toLocaleString()}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* INEFFICIENCIES TAB */}
        <TabsContent value="inefficiencies" className="space-y-4">
          {inefficiencies.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 text-green-500" />
              <p className="text-lg font-medium">All routes operating efficiently</p>
            </Card>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {inefficiencies.map((issue, i) => (
                <Card key={i} className={`p-4 border-l-4 ${issue.severity === "high" ? "border-l-destructive" : "border-l-orange-400"}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className={`w-4 h-4 ${issue.severity === "high" ? "text-destructive" : "text-orange-500"}`} />
                        <span className="font-semibold text-sm">{issue.type}</span>
                        <Badge className={issue.severity === "high" ? "bg-destructive/20 text-destructive" : "bg-orange-100 text-orange-700"}>{issue.severity}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Route {issue.route.route_number} — {issue.route.school}</p>
                      <p className="text-sm mt-1">{issue.detail}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* SIMULATOR TAB */}
        <TabsContent value="simulator" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowScenario(true)} className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Merge className="w-4 h-4 mr-1" /> New Scenario
            </Button>
          </div>

          {scenarios.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              <Merge className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
              <p>No scenarios yet. Create a consolidation or bell time scenario to see potential savings.</p>
            </Card>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {scenarios.map(s => (
                <Card key={s.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-primary">{s.name}</h3>
                      <Badge variant="outline" className="text-xs mt-1">
                        {s.scenario_type === "consolidation" ? "Route Consolidation" : "Bell Time Shift"}
                      </Badge>
                    </div>
                    <Badge className={s.status === "draft" ? "bg-muted text-muted-foreground" : "bg-success/20 text-green-700"}>{s.status}</Badge>
                  </div>
                  {s.description && <p className="text-xs text-muted-foreground mb-3">{s.description}</p>}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-secondary rounded">
                      <p className="text-lg font-bold text-green-600">${(Number(s.estimated_savings) / 1000).toFixed(0)}K</p>
                      <p className="text-xs text-muted-foreground">Est. Savings</p>
                    </div>
                    <div className="p-2 bg-secondary rounded">
                      <p className="text-lg font-bold text-primary">{s.routes_affected}</p>
                      <p className="text-xs text-muted-foreground">Routes</p>
                    </div>
                    <div className="p-2 bg-secondary rounded">
                      <p className="text-lg font-bold text-accent">{s.students_affected}</p>
                      <p className="text-xs text-muted-foreground">Students</p>
                    </div>
                  </div>
                  {s.results?.underutilized_routes && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Underutilized: {s.results.underutilized_routes.join(", ") || "None"}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* CHARTS TAB */}
        <TabsContent value="charts" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="p-4">
              <h3 className="font-semibold text-primary mb-3">Capacity Utilization Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={utilizationData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card className="p-4">
              <h3 className="font-semibold text-primary mb-3">Students by Tier</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={tierData} dataKey="students" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, students }) => `${name}: ${students}`}>
                    {tierData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Route Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display">Add Route</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Route Number</Label><Input value={form.route_number} onChange={e => setForm(f => ({ ...f, route_number: e.target.value }))} /></div>
              <div><Label>School</Label><Input value={form.school} onChange={e => setForm(f => ({ ...f, school: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Bus #</Label><Input value={form.bus_number} onChange={e => setForm(f => ({ ...f, bus_number: e.target.value }))} /></div>
              <div><Label>Driver</Label><Input value={form.driver_name} onChange={e => setForm(f => ({ ...f, driver_name: e.target.value }))} /></div>
              <div><Label>Tier</Label>
                <Select value={form.tier} onValueChange={v => setForm(f => ({ ...f, tier: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Tier 1</SelectItem>
                    <SelectItem value="2">Tier 2</SelectItem>
                    <SelectItem value="3">Tier 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Students</Label><Input type="number" value={form.total_students} onChange={e => setForm(f => ({ ...f, total_students: e.target.value }))} /></div>
              <div><Label>Capacity</Label><Input type="number" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} /></div>
              <div><Label>Miles</Label><Input type="number" value={form.total_miles} onChange={e => setForm(f => ({ ...f, total_miles: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Avg Ride (min)</Label><Input type="number" value={form.avg_ride_time_min} onChange={e => setForm(f => ({ ...f, avg_ride_time_min: e.target.value }))} /></div>
              <div><Label>On-Time %</Label><Input type="number" value={form.on_time_pct} onChange={e => setForm(f => ({ ...f, on_time_pct: e.target.value }))} /></div>
              <div><Label>Cost/Student ($)</Label><Input type="number" value={form.cost_per_student} onChange={e => setForm(f => ({ ...f, cost_per_student: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>AM Start</Label><Input type="time" value={form.am_start} onChange={e => setForm(f => ({ ...f, am_start: e.target.value }))} /></div>
              <div><Label>AM End</Label><Input type="time" value={form.am_end} onChange={e => setForm(f => ({ ...f, am_end: e.target.value }))} /></div>
              <div><Label>PM Start</Label><Input type="time" value={form.pm_start} onChange={e => setForm(f => ({ ...f, pm_start: e.target.value }))} /></div>
              <div><Label>PM End</Label><Input type="time" value={form.pm_end} onChange={e => setForm(f => ({ ...f, pm_end: e.target.value }))} /></div>
            </div>
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
            <Button onClick={handleAddRoute} className="w-full bg-accent text-accent-foreground">Save Route</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Route Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={open => { if (!open) setSelected(null); }}>
        <DialogContent className="max-w-2xl">
          {selected && (
            <>
              <DialogHeader><DialogTitle className="font-display">Route {selected.route_number}</DialogTitle></DialogHeader>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div><span className="text-muted-foreground">School:</span> {selected.school}</div>
                  <div><span className="text-muted-foreground">Bus:</span> {selected.bus_number || "—"}</div>
                  <div><span className="text-muted-foreground">Driver:</span> {selected.driver_name || "—"}</div>
                  <div><span className="text-muted-foreground">Tier:</span> {selected.tier}</div>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    { label: "Students", value: `${selected.total_students}/${selected.capacity}` },
                    { label: "Utilization", value: `${(((selected.total_students || 0) / (selected.capacity || 72)) * 100).toFixed(0)}%` },
                    { label: "Miles", value: Number(selected.total_miles || 0).toFixed(1) },
                    { label: "On-Time", value: `${selected.on_time_pct}%` },
                  ].map(d => (
                    <div key={d.label} className="p-2 bg-secondary rounded">
                      <p className="text-lg font-bold text-primary">{d.value}</p>
                      <p className="text-xs text-muted-foreground">{d.label}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><span className="text-muted-foreground">AM:</span> {selected.am_start || "—"} → {selected.am_end || "—"}</div>
                  <div><span className="text-muted-foreground">PM:</span> {selected.pm_start || "—"} → {selected.pm_end || "—"}</div>
                  <div><span className="text-muted-foreground">Avg Ride Time:</span> {selected.avg_ride_time_min} min</div>
                  <div><span className="text-muted-foreground">Cost/Student:</span> ${Number(selected.cost_per_student || 0).toLocaleString()}</div>
                </div>
                {selected.notes && <div className="p-3 bg-secondary rounded text-xs">{selected.notes}</div>}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* New Scenario Dialog */}
      <Dialog open={showScenario} onOpenChange={setShowScenario}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="font-display">New Scenario</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={scenarioForm.name} onChange={e => setScenarioForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><Label>Type</Label>
              <Select value={scenarioForm.scenario_type} onValueChange={v => setScenarioForm(f => ({ ...f, scenario_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="consolidation">Route Consolidation</SelectItem>
                  <SelectItem value="bell_time">Bell Time Shift</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Description</Label><Textarea value={scenarioForm.description} onChange={e => setScenarioForm(f => ({ ...f, description: e.target.value }))} rows={2} /></div>
            {scenarioForm.scenario_type === "consolidation" ? (
              <div><Label>Target Utilization (%)</Label><Input type="number" value={scenarioForm.target_utilization} onChange={e => setScenarioForm(f => ({ ...f, target_utilization: e.target.value }))} /></div>
            ) : (
              <div><Label>Bell Time Shift (minutes)</Label><Input type="number" value={scenarioForm.bell_shift_min} onChange={e => setScenarioForm(f => ({ ...f, bell_shift_min: e.target.value }))} /></div>
            )}
            <Button onClick={runScenario} className="w-full bg-accent text-accent-foreground">Run Scenario</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoutesAdmin;
