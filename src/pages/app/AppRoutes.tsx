import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useDistrict } from "@/contexts/DistrictContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Search, ChevronLeft, ChevronRight, ChevronUp, ChevronDown,
  Ghost, Clock, Fuel, AlertTriangle, Loader2, Eye, Merge, Save, Download,
} from "lucide-react";
import { toast } from "sonner";
import { exportToCsv } from "@/lib/csvExport";

type Route = {
  id: string; route_number: string; school: string; tier: number;
  bus_number: string | null; driver_name: string | null;
  total_students: number | null; capacity: number | null;
  total_miles: number | null; on_time_pct: number | null;
  avg_ride_time_min: number | null; cost_per_student: number | null;
  am_start: string | null; pm_start: string | null; status: string;
  contractor_id: string | null;
};

const PAGE_SIZE = 50;

const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const effGrade = (students: number | null, capacity: number | null) => {
  const pct = capacity && capacity > 0 ? ((students ?? 0) / capacity) * 100 : 0;
  if (pct >= 80) return { letter: "A", color: "text-emerald-600", pct };
  if (pct >= 60) return { letter: "B", color: "text-blue-600", pct };
  if (pct >= 50) return { letter: "C", color: "text-amber-600", pct };
  if (pct >= 30) return { letter: "D", color: "text-orange-600", pct };
  return { letter: "F", color: "text-red-600", pct };
};

const AppRoutes = () => {
  const { district, profile } = useDistrict();
  const { user } = useAuth();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [allRoutes, setAllRoutes] = useState<Route[]>([]); // unfiltered for stats
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [schoolFilter, setSchoolFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [utilizationFilter, setUtilizationFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [sortCol, setSortCol] = useState<string>("route_number");
  const [sortAsc, setSortAsc] = useState(true);

  // Detail
  const [selected, setSelected] = useState<Route | null>(null);

  // Consolidation
  const [mergeIds, setMergeIds] = useState<Set<string>>(new Set());
  const [mergeResult, setMergeResult] = useState<any>(null);
  const [savingScenario, setSavingScenario] = useState(false);

  // Inefficiency filter
  const [ineffFilter, setIneffFilter] = useState<string | null>(null);

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(0); }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Fetch all routes for stats (once)
  useEffect(() => {
    supabase.from("routes").select("*").then(({ data }) => setAllRoutes((data as Route[]) ?? []));
  }, []);

  const fetchRoutes = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("routes")
      .select("*", { count: "exact" });

    if (schoolFilter !== "all") query = query.eq("school", schoolFilter);
    if (statusFilter !== "all") query = query.eq("status", statusFilter);
    if (search) query = query.or(`route_number.ilike.%${search}%,driver_name.ilike.%${search}%,bus_number.ilike.%${search}%,school.ilike.%${search}%`);

    const { data, count } = await query
      .order(sortCol, { ascending: sortAsc })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    let filtered = (data as Route[]) ?? [];

    // Client-side utilization filter
    if (utilizationFilter !== "all") {
      filtered = filtered.filter(r => {
        const pct = r.capacity && r.capacity > 0 ? ((r.total_students ?? 0) / r.capacity) * 100 : 0;
        if (utilizationFilter === "high") return pct >= 80;
        if (utilizationFilter === "mid") return pct >= 50 && pct < 80;
        if (utilizationFilter === "low") return pct < 50;
        return true;
      });
    }

    // Client-side inefficiency filter
    if (ineffFilter === "ghost") filtered = filtered.filter(r => effGrade(r.total_students, r.capacity).pct < 50);
    else if (ineffFilter === "long") filtered = filtered.filter(r => (r.avg_ride_time_min ?? 0) > 60);
    else if (ineffFilter === "low_eff") filtered = filtered.filter(r => ["D", "F"].includes(effGrade(r.total_students, r.capacity).letter));

    setRoutes(filtered);
    setTotalCount(ineffFilter || utilizationFilter !== "all" ? filtered.length : (count ?? 0));
    setLoading(false);
  }, [search, schoolFilter, statusFilter, utilizationFilter, page, sortCol, sortAsc, ineffFilter]);

  useEffect(() => { fetchRoutes(); }, [fetchRoutes]);

  const schools = [...new Set(allRoutes.map(r => r.school))].sort();
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // Stats
  const activeRoutes = allRoutes.filter(r => r.status === "active");
  const avgUtil = activeRoutes.length
    ? Math.round(activeRoutes.reduce((s, r) => s + (r.capacity && r.capacity > 0 ? ((r.total_students ?? 0) / r.capacity) * 100 : 0), 0) / activeRoutes.length)
    : 0;
  const totalMiles = Math.round(allRoutes.reduce((s, r) => s + (r.total_miles ?? 0), 0));
  const avgDuration = activeRoutes.length
    ? Math.round(activeRoutes.reduce((s, r) => s + (r.avg_ride_time_min ?? 0), 0) / activeRoutes.length)
    : 0;

  // Inefficiency counts
  const ghostCount = allRoutes.filter(r => effGrade(r.total_students, r.capacity).pct < 50).length;
  const longCount = allRoutes.filter(r => (r.avg_ride_time_min ?? 0) > 60).length;
  const lowEffCount = allRoutes.filter(r => ["D", "F"].includes(effGrade(r.total_students, r.capacity).letter)).length;

  const handleSort = (col: string) => {
    if (sortCol === col) setSortAsc(!sortAsc);
    else { setSortCol(col); setSortAsc(true); }
    setPage(0);
  };

  const SortIcon = ({ col }: { col: string }) => {
    if (sortCol !== col) return null;
    return sortAsc ? <ChevronUp className="inline h-3 w-3" /> : <ChevronDown className="inline h-3 w-3" />;
  };

  const toggleMerge = (id: string) => {
    const next = new Set(mergeIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setMergeIds(next);
    setMergeResult(null);
  };

  const simulateMerge = () => {
    const selected = routes.filter(r => mergeIds.has(r.id));
    const totalStudents = selected.reduce((s, r) => s + (r.total_students ?? 0), 0);
    const totalCapacity = selected.reduce((s, r) => s + (r.capacity ?? 72), 0);
    const maxCapacity = Math.max(...selected.map(r => r.capacity ?? 72));
    const util = maxCapacity > 0 ? Math.round((totalStudents / maxCapacity) * 100) : 0;
    const eliminated = selected.length - 1;
    const savings = eliminated * 85000;
    setMergeResult({
      routes: selected.map(r => r.route_number),
      totalStudents,
      capacity: maxCapacity,
      utilization: util,
      eliminated,
      savings,
    });
  };

  const saveScenario = async () => {
    if (!mergeResult || !district || !user) return;
    setSavingScenario(true);
    const { error } = await supabase.from("route_scenarios").insert({
      district_id: district.id,
      created_by: user.id,
      name: `Merge ${mergeResult.routes.join(" + ")}`,
      scenario_type: "consolidation",
      description: `Merge routes ${mergeResult.routes.join(", ")} into single route`,
      routes_affected: mergeResult.routes.length,
      students_affected: mergeResult.totalStudents,
      estimated_savings: mergeResult.savings,
      parameters: { merged_routes: mergeResult.routes },
      results: mergeResult,
      status: "draft",
    });
    if (error) toast.error(error.message);
    else { toast.success("Scenario saved"); setMergeIds(new Set()); setMergeResult(null); }
    setSavingScenario(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Routes</h1>
          <p className="text-sm text-muted-foreground">{allRoutes.length} routes across {schools.length} schools</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => exportToCsv("routes", allRoutes, [
          { key: "route_number", label: "Route" }, { key: "school", label: "School" },
          { key: "bus_number", label: "Bus" }, { key: "driver_name", label: "Driver" },
          { key: "total_students", label: "Students" }, { key: "capacity", label: "Capacity" },
          { key: "total_miles", label: "Miles" }, { key: "on_time_pct", label: "On-Time %" },
          { key: "avg_ride_time_min", label: "Duration (min)" }, { key: "status", label: "Status" },
        ])}>
          <Download className="h-4 w-4 mr-1" /> Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-5">
        {[
          { label: "Total Routes", value: allRoutes.length },
          { label: "Active", value: activeRoutes.length },
          { label: "Avg Utilization", value: `${avgUtil}%` },
          { label: "Daily Miles", value: totalMiles.toLocaleString() },
          { label: "Avg Duration", value: `${avgDuration} min` },
        ].map(s => (
          <Card key={s.label} className="border-0 shadow-sm"><CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{s.label}</p>
            <p className="mt-1 text-xl font-bold">{s.value}</p>
          </CardContent></Card>
        ))}
      </div>

      {/* Inefficiency cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card
          className={`border-0 shadow-sm cursor-pointer transition-all ${ineffFilter === "ghost" ? "ring-2 ring-red-400" : "hover:shadow-md"}`}
          onClick={() => { setIneffFilter(ineffFilter === "ghost" ? null : "ghost"); setPage(0); }}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50"><Ghost className="h-5 w-5 text-red-600" /></div>
            <div>
              <p className="text-sm font-semibold text-red-600">{ghostCount} Ghost Routes</p>
              <p className="text-xs text-muted-foreground">&lt;50% utilization · {fmt.format(ghostCount * 85000)} wasted</p>
            </div>
          </CardContent>
        </Card>
        <Card
          className={`border-0 shadow-sm cursor-pointer transition-all ${ineffFilter === "long" ? "ring-2 ring-amber-400" : "hover:shadow-md"}`}
          onClick={() => { setIneffFilter(ineffFilter === "long" ? null : "long"); setPage(0); }}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50"><Clock className="h-5 w-5 text-amber-600" /></div>
            <div>
              <p className="text-sm font-semibold text-amber-600">{longCount} Long Rides</p>
              <p className="text-xs text-muted-foreground">&gt;60 min duration</p>
            </div>
          </CardContent>
        </Card>
        <Card
          className={`border-0 shadow-sm cursor-pointer transition-all ${ineffFilter === "low_eff" ? "ring-2 ring-orange-400" : "hover:shadow-md"}`}
          onClick={() => { setIneffFilter(ineffFilter === "low_eff" ? null : "low_eff"); setPage(0); }}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50"><AlertTriangle className="h-5 w-5 text-orange-600" /></div>
            <div>
              <p className="text-sm font-semibold text-orange-600">{lowEffCount} Low Efficiency</p>
              <p className="text-xs text-muted-foreground">Grade D or F</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search routes, drivers, buses..." value={searchInput} onChange={e => setSearchInput(e.target.value)} className="pl-9" />
        </div>
        <select value={schoolFilter} onChange={e => { setSchoolFilter(e.target.value); setPage(0); }} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
          <option value="all">All Schools</option>
          {schools.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0); }} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select value={utilizationFilter} onChange={e => { setUtilizationFilter(e.target.value); setPage(0); }} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
          <option value="all">All Utilization</option>
          <option value="high">≥80%</option>
          <option value="mid">50-80%</option>
          <option value="low">&lt;50%</option>
        </select>
        {ineffFilter && (
          <Button variant="outline" size="sm" onClick={() => setIneffFilter(null)}>Clear Filter</Button>
        )}
      </div>

      {/* Merge bar */}
      {mergeIds.size >= 2 && (
        <Card className="border-0 shadow-sm bg-primary/5">
          <CardContent className="p-4 flex items-center justify-between">
            <span className="text-sm font-medium">{mergeIds.size} routes selected for consolidation</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => { setMergeIds(new Set()); setMergeResult(null); }}>Clear</Button>
              <Button size="sm" onClick={simulateMerge}><Merge className="h-4 w-4 mr-1" /> Simulate Merge</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Merge result */}
      {mergeResult && (
        <Card className="border-0 shadow-sm border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <h3 className="font-semibold text-foreground mb-2">Consolidation Result</h3>
            <p className="text-sm text-muted-foreground">
              Merging Routes <span className="font-medium text-foreground">{mergeResult.routes.join(" + ")}</span> would serve{" "}
              <span className="font-bold">{mergeResult.totalStudents}</span> students at{" "}
              <span className="font-bold">{mergeResult.utilization}%</span> utilization.
            </p>
            <p className="text-sm mt-1">
              Estimated annual savings: <span className="font-bold text-emerald-600">{fmt.format(mergeResult.savings)}</span>{" "}
              ({mergeResult.eliminated} route{mergeResult.eliminated > 1 ? "s" : ""} eliminated)
            </p>
            <Button size="sm" className="mt-3" onClick={saveScenario} disabled={savingScenario}>
              <Save className="h-4 w-4 mr-1" /> {savingScenario ? "Saving..." : "Save Scenario"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("route_number")}>Route <SortIcon col="route_number" /></TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("school")}>School <SortIcon col="school" /></TableHead>
                  <TableHead>Bus</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("driver_name")}>Driver <SortIcon col="driver_name" /></TableHead>
                  <TableHead className="text-right">Utilization</TableHead>
                  <TableHead className="text-right cursor-pointer" onClick={() => handleSort("avg_ride_time_min")}>Duration <SortIcon col="avg_ride_time_min" /></TableHead>
                  <TableHead className="text-right cursor-pointer" onClick={() => handleSort("total_miles")}>Miles <SortIcon col="total_miles" /></TableHead>
                  <TableHead className="text-right cursor-pointer" onClick={() => handleSort("on_time_pct")}>On-Time <SortIcon col="on_time_pct" /></TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={11} className="h-32 text-center"><Loader2 className="h-6 w-6 mx-auto animate-spin text-primary" /></TableCell></TableRow>
                ) : routes.length === 0 ? (
                  <TableRow><TableCell colSpan={11} className="h-32 text-center text-muted-foreground">No routes found</TableCell></TableRow>
                ) : routes.map(r => {
                  const grade = effGrade(r.total_students, r.capacity);
                  return (
                    <TableRow key={r.id} className="hover:bg-muted/50">
                      <TableCell>
                        <Checkbox checked={mergeIds.has(r.id)} onCheckedChange={() => toggleMerge(r.id)} />
                      </TableCell>
                      <TableCell className="font-medium">{r.route_number}</TableCell>
                      <TableCell className="max-w-[140px] truncate">{r.school}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{r.bus_number}</TableCell>
                      <TableCell>{r.driver_name}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Progress value={grade.pct} className="w-16 h-2" />
                          <span className="text-xs w-10 text-right">{Math.round(grade.pct)}%</span>
                        </div>
                      </TableCell>
                      <TableCell className={`text-right ${(r.avg_ride_time_min ?? 0) > 60 ? "text-amber-600 font-medium" : ""}`}>{r.avg_ride_time_min ?? 0} min</TableCell>
                      <TableCell className="text-right">{r.total_miles}</TableCell>
                      <TableCell className={`text-right font-medium ${(r.on_time_pct ?? 0) >= 95 ? "text-emerald-600" : (r.on_time_pct ?? 0) >= 90 ? "text-amber-600" : "text-red-600"}`}>{r.on_time_pct}%</TableCell>
                      <TableCell><span className={`font-bold ${grade.color}`}>{grade.letter}</span></TableCell>
                      <TableCell><Button variant="ghost" size="sm" onClick={() => setSelected(r)}><Eye className="h-4 w-4" /></Button></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3">
              <p className="text-sm text-muted-foreground">Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalCount)} of {totalCount}</p>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="flex h-8 w-8 items-center justify-center rounded border hover:bg-muted disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
                <span className="text-sm font-medium">{page + 1} / {totalPages}</span>
                <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="flex h-8 w-8 items-center justify-center rounded border hover:bg-muted disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Route Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          {selected && (() => {
            const grade = effGrade(selected.total_students, selected.capacity);
            const distAvgDuration = activeRoutes.length ? Math.round(activeRoutes.reduce((s, r) => s + (r.avg_ride_time_min ?? 0), 0) / activeRoutes.length) : 0;
            return (
              <>
                <DialogHeader><DialogTitle>Route {selected.route_number}</DialogTitle></DialogHeader>
                <div className="space-y-4 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div><span className="text-muted-foreground">School:</span> {selected.school}</div>
                    <div><span className="text-muted-foreground">Bus:</span> {selected.bus_number ?? "—"}</div>
                    <div><span className="text-muted-foreground">Driver:</span> {selected.driver_name ?? "—"}</div>
                    <div><span className="text-muted-foreground">Tier:</span> {selected.tier}</div>
                    <div><span className="text-muted-foreground">AM:</span> {selected.am_start ?? "—"}</div>
                    <div><span className="text-muted-foreground">PM:</span> {selected.pm_start ?? "—"}</div>
                  </div>

                  {/* Capacity chart */}
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[{ name: "Capacity", assigned: selected.total_students ?? 0, total: selected.capacity ?? 72 }]}>
                        <XAxis dataKey="name" hide />
                        <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip />
                        <Bar dataKey="assigned" name="Assigned" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="total" name="Capacity" fill="hsl(var(--border))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Card className="border-0 bg-muted/50"><CardContent className="p-3 text-center">
                      <p className="text-lg font-bold">{Math.round(grade.pct)}%</p>
                      <p className="text-[10px] text-muted-foreground uppercase">Utilization</p>
                    </CardContent></Card>
                    <Card className="border-0 bg-muted/50"><CardContent className="p-3 text-center">
                      <p className={`text-lg font-bold ${grade.color}`}>{grade.letter}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">Efficiency</p>
                    </CardContent></Card>
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Duration: <span className="font-medium text-foreground">{selected.avg_ride_time_min ?? 0} min</span> | District avg: {distAvgDuration} min</p>
                    <p>Daily Miles: <span className="font-medium text-foreground">{selected.total_miles}</span> | Cost/Student: {selected.cost_per_student ? fmt.format(selected.cost_per_student) : "—"}</p>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppRoutes;
