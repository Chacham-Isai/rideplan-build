import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { AlertTriangle, FileText, TrendingUp } from "lucide-react";

const COLORS = ["#F59E0B", "#3B82F6", "#10B981", "#8B5CF6", "#EC4899", "#06B6D4", "#EF4444"];

const Reports = () => {
  const [routeStats, setRouteStats] = useState<any[]>([]);
  const [schoolStats, setSchoolStats] = useState<any[]>([]);
  const [safetyReports, setSafetyReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const [routesRes, safetyRes] = await Promise.all([
        supabase.from("routes").select("school, total_students, total_miles, on_time_pct, cost_per_student, tier, status"),
        supabase.from("safety_reports").select("*").order("created_at", { ascending: false }).limit(20),
      ]);

      const routes = routesRes.data ?? [];

      // School aggregation
      const schoolMap = new Map<string, { students: number; routes: number; miles: number; onTime: number[]; cost: number[] }>();
      routes.forEach((r: any) => {
        const e = schoolMap.get(r.school) ?? { students: 0, routes: 0, miles: 0, onTime: [], cost: [] };
        e.students += r.total_students ?? 0;
        e.routes += 1;
        e.miles += r.total_miles ?? 0;
        if (r.on_time_pct) e.onTime.push(r.on_time_pct);
        if (r.cost_per_student) e.cost.push(r.cost_per_student);
        schoolMap.set(r.school, e);
      });

      setSchoolStats(
        Array.from(schoolMap.entries()).map(([school, d]) => ({
          school: school.replace("Number ", "#").replace(" School", ""),
          students: d.students,
          routes: d.routes,
          miles: Math.round(d.miles),
          onTime: d.onTime.length ? Math.round(d.onTime.reduce((a, b) => a + b) / d.onTime.length * 10) / 10 : 0,
          cost: d.cost.length ? Math.round(d.cost.reduce((a, b) => a + b) / d.cost.length) : 0,
        })).sort((a, b) => b.students - a.students)
      );

      // Tier stats
      const tierMap = new Map<number, { count: number; students: number; miles: number }>();
      routes.forEach((r: any) => {
        const e = tierMap.get(r.tier) ?? { count: 0, students: 0, miles: 0 };
        e.count++; e.students += r.total_students ?? 0; e.miles += r.total_miles ?? 0;
        tierMap.set(r.tier, e);
      });
      setRouteStats(Array.from(tierMap.entries()).map(([tier, d]) => ({
        name: `Tier ${tier}`, routes: d.count, students: d.students, miles: Math.round(d.miles),
      })));

      setSafetyReports(safetyRes.data ?? []);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reports</h1>
        <p className="text-sm text-muted-foreground">District analytics and operational reports</p>
      </div>

      <Tabs defaultValue="operations">
        <TabsList>
          <TabsTrigger value="operations"><TrendingUp className="mr-1.5 h-4 w-4" />Operations</TabsTrigger>
          <TabsTrigger value="safety"><AlertTriangle className="mr-1.5 h-4 w-4" />Safety</TabsTrigger>
        </TabsList>

        <TabsContent value="operations" className="space-y-6 mt-4">
          {/* On-Time by School */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-base">On-Time Performance by School</CardTitle></CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={schoolStats} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="school" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[80, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", fontSize: 12 }} />
                    <Bar dataKey="onTime" name="On-Time %" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* School Summary Table */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-base">School Summary</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>School</TableHead>
                    <TableHead className="text-right">Routes</TableHead>
                    <TableHead className="text-right">Students</TableHead>
                    <TableHead className="text-right">Miles</TableHead>
                    <TableHead className="text-right">On-Time %</TableHead>
                    <TableHead className="text-right">Avg Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schoolStats.map((s) => (
                    <TableRow key={s.school}>
                      <TableCell className="font-medium">{s.school}</TableCell>
                      <TableCell className="text-right">{s.routes}</TableCell>
                      <TableCell className="text-right">{s.students.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{s.miles.toLocaleString()}</TableCell>
                      <TableCell className={`text-right font-medium ${s.onTime >= 95 ? "text-emerald-600" : s.onTime >= 90 ? "text-amber-600" : "text-red-600"}`}>{s.onTime}%</TableCell>
                      <TableCell className="text-right">${s.cost.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Tier breakdown */}
          <div className="grid gap-4 sm:grid-cols-3">
            {routeStats.map((t, i) => (
              <Card key={t.name} className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-sm font-semibold">{t.name}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div><p className="text-lg font-bold">{t.routes}</p><p className="text-[10px] text-muted-foreground uppercase">Routes</p></div>
                    <div><p className="text-lg font-bold">{t.students.toLocaleString()}</p><p className="text-[10px] text-muted-foreground uppercase">Students</p></div>
                    <div><p className="text-lg font-bold">{t.miles.toLocaleString()}</p><p className="text-[10px] text-muted-foreground uppercase">Miles</p></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="safety" className="space-y-6 mt-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-base">Recent Safety Reports</CardTitle></CardHeader>
            <CardContent className="p-0">
              {safetyReports.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">No safety reports filed</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>School</TableHead>
                      <TableHead>Bus</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {safetyReports.map((r: any) => (
                      <TableRow key={r.id}>
                        <TableCell className="text-xs">{new Date(r.incident_date).toLocaleDateString()}</TableCell>
                        <TableCell className="capitalize">{r.report_type?.replace("_", " ")}</TableCell>
                        <TableCell>{r.school_name}</TableCell>
                        <TableCell>{r.bus_number}</TableCell>
                        <TableCell>
                          <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${
                            r.ai_priority === "critical" ? "bg-red-100 text-red-700" :
                            r.ai_priority === "high" ? "bg-amber-100 text-amber-700" :
                            r.ai_priority === "medium" ? "bg-blue-100 text-blue-700" :
                            "bg-gray-100 text-gray-600"
                          }`}>{r.ai_priority}</span>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${
                            r.status === "resolved" ? "bg-emerald-100 text-emerald-700" :
                            r.status === "reviewing" ? "bg-amber-100 text-amber-700" :
                            "bg-blue-100 text-blue-700"
                          }`}>{r.status}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
