import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useDistrict } from "@/contexts/DistrictContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from "recharts";
import {
  FileText, Receipt, BarChart3, Plus, Eye, Search, Loader2,
  AlertTriangle, CheckCircle, XCircle, Shield,
} from "lucide-react";
import { toast } from "sonner";

const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const statusStyle = (s: string) => {
  if (s === "active" || s === "approved") return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (s === "pending") return "bg-amber-100 text-amber-700 border-amber-200";
  if (s === "expired") return "bg-gray-100 text-gray-600 border-gray-200";
  if (s === "disputed") return "bg-red-100 text-red-700 border-red-200";
  if (s === "expiring") return "bg-orange-100 text-orange-700 border-orange-200";
  return "bg-gray-100 text-gray-600 border-gray-200";
};

const gradeFromPct = (pct: number) => {
  if (pct >= 95) return { letter: "A", color: "text-emerald-600" };
  if (pct >= 90) return { letter: "B", color: "text-blue-600" };
  if (pct >= 85) return { letter: "C", color: "text-amber-600" };
  if (pct >= 80) return { letter: "D", color: "text-orange-600" };
  return { letter: "F", color: "text-red-600" };
};

const Contracts = () => {
  const { district, profile } = useDistrict();
  const { user } = useAuth();
  const [contracts, setContracts] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [insurance, setInsurance] = useState<any[]>([]);
  const [performance, setPerformance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [benchmarks, setBenchmarks] = useState<any>(null);

  // Detail dialog
  const [selected, setSelected] = useState<any>(null);
  const [selectedInsurance, setSelectedInsurance] = useState<any[]>([]);
  const [selectedPerf, setSelectedPerf] = useState<any[]>([]);

  // Add contract dialog
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({
    contractor_name: "", contact_email: "", contact_phone: "",
    contract_start: "", contract_end: "", annual_value: "",
    routes_count: "", rate_per_route: "", rate_per_mile: "",
    renewal_terms: "", notes: "",
  });
  const [saving, setSaving] = useState(false);

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [cRes, iRes, insRes, pRes] = await Promise.all([
      supabase.from("contracts").select("*").order("annual_value", { ascending: false }),
      supabase.from("contract_invoices").select("*, contracts(contractor_name)").order("invoice_date", { ascending: false }),
      supabase.from("contractor_insurance").select("*, contracts(contractor_name)").order("expiration_date", { ascending: true }),
      supabase.from("contractor_performance").select("*, contracts(contractor_name)").order("period_month", { ascending: false }),
    ]);
    setContracts(cRes.data ?? []);
    setInvoices(iRes.data ?? []);
    setInsurance(insRes.data ?? []);
    setPerformance(pRes.data ?? []);
    setLoading(false);
    // Fetch benchmarks
    supabase.rpc("get_regional_benchmarks").then(({ data }) => setBenchmarks(data));
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  const totalValue = contracts.reduce((s, c) => s + (c.annual_value ?? 0), 0);
  const activeContracts = contracts.filter(c => c.status === "active");
  const now = new Date();
  const in90 = new Date(now.getTime() + 90 * 86400000);
  const expiringIn90 = contracts.filter(c => new Date(c.contract_end) <= in90 && new Date(c.contract_end) > now).length;
  const avgRate = activeContracts.length ? activeContracts.reduce((s, c) => s + (c.rate_per_route ?? 0), 0) / activeContracts.length : 0;

  const filteredContracts = search
    ? contracts.filter(c => c.contractor_name.toLowerCase().includes(search.toLowerCase()))
    : contracts;

  const getInsuranceForContract = (contractId: string) => insurance.find(i => i.contract_id === contractId);
  const getPerfForContract = (contractId: string) => {
    const perfs = performance.filter(p => p.contract_id === contractId);
    if (perfs.length === 0) return null;
    const latest = perfs[0];
    return latest;
  };

  const openDetail = (c: any) => {
    setSelected(c);
    setSelectedInsurance(insurance.filter(i => i.contract_id === c.id));
    setSelectedPerf(performance.filter(p => p.contract_id === c.id));
  };

  const handleAdd = async () => {
    if (!addForm.contractor_name || !addForm.contract_start || !addForm.contract_end || !district) {
      toast.error("Fill required fields"); return;
    }
    setSaving(true);
    const { error } = await supabase.from("contracts").insert({
      contractor_name: addForm.contractor_name,
      contact_email: addForm.contact_email || null,
      contact_phone: addForm.contact_phone || null,
      contract_start: addForm.contract_start,
      contract_end: addForm.contract_end,
      annual_value: parseFloat(addForm.annual_value) || 0,
      routes_count: parseInt(addForm.routes_count) || 0,
      rate_per_route: parseFloat(addForm.rate_per_route) || null,
      rate_per_mile: parseFloat(addForm.rate_per_mile) || null,
      renewal_terms: addForm.renewal_terms || null,
      notes: addForm.notes || null,
      district_id: district.id,
      status: "pending",
    });
    if (error) toast.error(error.message);
    else { toast.success("Contract created"); setShowAdd(false); fetchAll(); }
    setSaving(false);
  };

  const handleInvoiceAction = async (invoiceId: string, action: "approved" | "disputed") => {
    const { error } = await supabase.from("contract_invoices")
      .update({ status: action, reviewed_by: user?.id, reviewed_at: new Date().toISOString() })
      .eq("id", invoiceId);
    if (error) toast.error(error.message);
    else { toast.success(`Invoice ${action}`); fetchAll(); }
  };

  // Invoice monthly chart data
  const invoiceChartData = (() => {
    const months = new Map<string, { invoiced: number; verified: number }>();
    invoices.forEach(inv => {
      const key = new Date(inv.invoice_date).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      const e = months.get(key) ?? { invoiced: 0, verified: 0 };
      e.invoiced += inv.invoiced_amount ?? 0;
      e.verified += inv.verified_amount ?? 0;
      months.set(key, e);
    });
    return Array.from(months.entries()).map(([month, d]) => ({ month, ...d })).reverse().slice(-6);
  })();

  // Performance leaderboard
  const leaderboard = (() => {
    const byContractor = new Map<string, { name: string; onTime: number[]; complaints: number; safety: number; completed: number; missed: number }>();
    performance.forEach(p => {
      const name = (p.contracts as any)?.contractor_name ?? "Unknown";
      const e = byContractor.get(name) ?? { name, onTime: [], complaints: 0, safety: 0, completed: 0, missed: 0 };
      e.onTime.push(p.on_time_pct ?? 0);
      e.complaints += p.complaints_count ?? 0;
      e.safety += p.safety_incidents ?? 0;
      e.completed += p.routes_completed ?? 0;
      e.missed += p.routes_missed ?? 0;
      byContractor.set(name, e);
    });
    return Array.from(byContractor.values()).map(c => ({
      ...c,
      avgOnTime: c.onTime.length ? Math.round(c.onTime.reduce((a, b) => a + b) / c.onTime.length * 10) / 10 : 0,
    })).sort((a, b) => b.avgOnTime - a.avgOnTime);
  })();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contracts</h1>
          <p className="text-sm text-muted-foreground">Contractor management, invoicing & performance</p>
        </div>
        <Button size="sm" onClick={() => setShowAdd(true)}><Plus className="h-4 w-4 mr-1" /> Add Contract</Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="border-0 shadow-sm"><CardContent className="p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Active Contracts</p>
          <p className="mt-1 text-2xl font-bold">{activeContracts.length}</p>
        </CardContent></Card>
        <Card className="border-0 shadow-sm"><CardContent className="p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Annual Value</p>
          <p className="mt-1 text-2xl font-bold">{fmt.format(totalValue)}</p>
        </CardContent></Card>
        <Card className="border-0 shadow-sm"><CardContent className="p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Expiring in 90 Days</p>
          <p className={`mt-1 text-2xl font-bold ${expiringIn90 > 0 ? "text-amber-600" : ""}`}>{expiringIn90}</p>
        </CardContent></Card>
        <Card className="border-0 shadow-sm"><CardContent className="p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Avg Rate/Route</p>
          <p className="mt-1 text-2xl font-bold">{fmt.format(avgRate)}</p>
        </CardContent></Card>
      </div>

      {/* Regional Benchmark */}
      {benchmarks && (
        <Card className="border-0 shadow-sm border-l-4 border-l-blue-500">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-600" /> Regional Benchmark
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Rate/Route", yours: avgRate, regional: benchmarks.avg_rate_per_route, format: (v: number) => fmt.format(v), lower: true },
                { label: "On-Time %", yours: activeContracts.length && performance.length ? Math.round(performance.reduce((s: number, p: any) => s + (p.on_time_pct ?? 0), 0) / performance.length * 10) / 10 : 0, regional: benchmarks.avg_on_time_pct, format: (v: number) => `${v}%`, lower: false },
                { label: "Utilization", yours: 0, regional: benchmarks.avg_utilization, format: (v: number) => `${v}%`, lower: false },
              ].map(b => {
                const diff = b.yours && b.regional ? ((b.yours - b.regional) / b.regional * 100) : 0;
                const isGood = b.lower ? diff <= 0 : diff >= 0;
                return (
                  <div key={b.label} className="text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">{b.label}</p>
                    <p className="text-lg font-bold mt-1">{b.yours ? b.format(b.yours) : "—"}</p>
                    <p className="text-xs text-muted-foreground">Regional: {b.regional ? b.format(b.regional) : "—"}</p>
                    {b.yours > 0 && b.regional > 0 && (
                      <p className={`text-xs font-medium mt-0.5 ${isGood ? "text-emerald-600" : "text-red-600"}`}>
                        {diff > 0 ? "+" : ""}{diff.toFixed(1)}%
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-muted-foreground mt-3">
              Based on {benchmarks.district_count} district{benchmarks.district_count !== 1 ? "s" : ""} and {benchmarks.route_count} routes
            </p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="contracts">
        <TabsList>
          <TabsTrigger value="contracts"><FileText className="mr-1.5 h-4 w-4" />Contracts</TabsTrigger>
          <TabsTrigger value="invoices"><Receipt className="mr-1.5 h-4 w-4" />Invoices</TabsTrigger>
          <TabsTrigger value="performance"><BarChart3 className="mr-1.5 h-4 w-4" />Performance</TabsTrigger>
        </TabsList>

        {/* === CONTRACTS TAB === */}
        <TabsContent value="contracts" className="mt-4 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search contractors..." value={searchInput} onChange={e => setSearchInput(e.target.value)} className="pl-9" />
          </div>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Contractor</TableHead>
                  <TableHead className="text-right">Routes</TableHead>
                  <TableHead className="text-right">Annual Value</TableHead>
                  <TableHead className="text-right">Rate/Route</TableHead>
                  <TableHead>Insurance</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Ends</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {filteredContracts.map(c => {
                    const ins = getInsuranceForContract(c.id);
                    const perf = getPerfForContract(c.id);
                    const perfGrade = perf ? gradeFromPct(perf.on_time_pct ?? 0) : null;
                    const endDate = new Date(c.contract_end);
                    const in30 = new Date(now.getTime() + 30 * 86400000);
                    const expiringContract = endDate <= in90 && endDate > now;
                    return (
                      <TableRow key={c.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openDetail(c)}>
                        <TableCell className="font-medium">{c.contractor_name}</TableCell>
                        <TableCell className="text-right">{c.routes_count}</TableCell>
                        <TableCell className="text-right font-medium">{fmt.format(c.annual_value)}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{c.rate_per_route ? fmt.format(c.rate_per_route) : "—"}</TableCell>
                        <TableCell>
                          {ins ? (
                            <Badge variant="outline" className={statusStyle(ins.status)}>{ins.status}</Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {perfGrade ? (
                            <span className={`font-bold ${perfGrade.color}`}>{perfGrade.letter}</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className={`text-xs ${expiringContract ? "text-amber-600 font-medium" : ""}`}>
                          {endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          {expiringContract && <AlertTriangle className="inline h-3 w-3 ml-1" />}
                        </TableCell>
                        <TableCell><Badge variant="outline" className={statusStyle(c.status)}>{c.status}</Badge></TableCell>
                        <TableCell><Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); openDetail(c); }}><Eye className="h-4 w-4" /></Button></TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* === INVOICES TAB === */}
        <TabsContent value="invoices" className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-4">
            <Card className="border-0 shadow-sm"><CardContent className="p-5">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Invoiced</p>
              <p className="mt-1 text-xl font-bold">{fmt.format(invoices.reduce((s, i) => s + (i.invoiced_amount ?? 0), 0))}</p>
            </CardContent></Card>
            <Card className="border-0 shadow-sm"><CardContent className="p-5">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Verified</p>
              <p className="mt-1 text-xl font-bold">{fmt.format(invoices.reduce((s, i) => s + (i.verified_amount ?? 0), 0))}</p>
            </CardContent></Card>
            <Card className="border-0 shadow-sm"><CardContent className="p-5">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Discrepancies</p>
              <p className="mt-1 text-xl font-bold text-red-600">{fmt.format(invoices.reduce((s, i) => s + (i.discrepancy_amount ?? 0), 0))}</p>
            </CardContent></Card>
            <Card className="border-0 shadow-sm"><CardContent className="p-5">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Pending</p>
              <p className="mt-1 text-xl font-bold">{invoices.filter(i => i.status === "pending").length}</p>
            </CardContent></Card>
          </div>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Contractor</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Invoiced</TableHead>
                  <TableHead className="text-right">Verified</TableHead>
                  <TableHead className="text-right">Discrepancy</TableHead>
                  <TableHead>GPS</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {invoices.map(inv => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-medium">{inv.invoice_number}</TableCell>
                      <TableCell>{(inv.contracts as any)?.contractor_name}</TableCell>
                      <TableCell className="text-xs">{new Date(inv.invoice_date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">{fmt.format(inv.invoiced_amount)}</TableCell>
                      <TableCell className="text-right">{inv.verified_amount ? fmt.format(inv.verified_amount) : "—"}</TableCell>
                      <TableCell className={`text-right ${inv.discrepancy_amount > 0 ? "text-red-600 font-medium" : "text-muted-foreground"}`}>
                        {inv.discrepancy_amount ? fmt.format(inv.discrepancy_amount) : "—"}
                      </TableCell>
                      <TableCell>{inv.gps_verified ? <span className="text-emerald-600 text-xs font-medium">✓</span> : <span className="text-muted-foreground text-xs">—</span>}</TableCell>
                      <TableCell><Badge variant="outline" className={statusStyle(inv.status)}>{inv.status}</Badge></TableCell>
                      <TableCell>
                        {inv.status === "pending" && (
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleInvoiceAction(inv.id, "approved")} className="text-emerald-600"><CheckCircle className="h-3 w-3" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => handleInvoiceAction(inv.id, "disputed")} className="text-red-600"><XCircle className="h-3 w-3" /></Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Monthly chart */}
          {invoiceChartData.length > 0 && (
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2"><CardTitle className="text-base">Monthly Invoice Summary</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={invoiceChartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", fontSize: 12 }} formatter={(v: number) => fmt.format(v)} />
                      <Bar dataKey="invoiced" name="Invoiced" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="verified" name="Verified" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* === PERFORMANCE TAB === */}
        <TabsContent value="performance" className="mt-4 space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-base">Contractor Leaderboard</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Contractor</TableHead>
                  <TableHead className="text-right">On-Time %</TableHead>
                  <TableHead className="text-right">Complaints</TableHead>
                  <TableHead className="text-right">Safety</TableHead>
                  <TableHead className="text-right">Completed</TableHead>
                  <TableHead className="text-right">Missed</TableHead>
                  <TableHead>Grade</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {leaderboard.map((c, i) => {
                    const grade = gradeFromPct(c.avgOnTime);
                    return (
                      <TableRow key={c.name}>
                        <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                        <TableCell className="font-medium">{c.name}</TableCell>
                        <TableCell className={`text-right font-medium ${grade.color}`}>{c.avgOnTime}%</TableCell>
                        <TableCell className="text-right">{c.complaints}</TableCell>
                        <TableCell className={`text-right ${c.safety > 0 ? "text-red-600 font-medium" : ""}`}>{c.safety}</TableCell>
                        <TableCell className="text-right">{c.completed.toLocaleString()}</TableCell>
                        <TableCell className={`text-right ${c.missed > 5 ? "text-red-600" : ""}`}>{c.missed}</TableCell>
                        <TableCell><span className={`font-bold text-lg ${grade.color}`}>{grade.letter}</span></TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* On-time trend chart */}
          {performance.length > 0 && (
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2"><CardTitle className="text-base">On-Time % Trend</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performance.slice(0, 12).reverse().map(p => ({
                      month: new Date(p.period_month).toLocaleDateString("en-US", { month: "short" }),
                      pct: p.on_time_pct,
                      name: (p.contracts as any)?.contractor_name,
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[80, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", fontSize: 12 }} />
                      <Line type="monotone" dataKey="pct" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* === CONTRACT DETAIL DIALOG === */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader><DialogTitle>{selected.contractor_name}</DialogTitle></DialogHeader>
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-muted-foreground">Status:</span> <Badge variant="outline" className={statusStyle(selected.status)}>{selected.status}</Badge></div>
                  <div><span className="text-muted-foreground">Routes:</span> {selected.routes_count}</div>
                  <div><span className="text-muted-foreground">Start:</span> {new Date(selected.contract_start).toLocaleDateString()}</div>
                  <div><span className="text-muted-foreground">End:</span> {new Date(selected.contract_end).toLocaleDateString()}</div>
                  <div><span className="text-muted-foreground">Annual Value:</span> {fmt.format(selected.annual_value)}</div>
                  <div><span className="text-muted-foreground">Rate/Route:</span> {selected.rate_per_route ? fmt.format(selected.rate_per_route) : "—"}</div>
                  <div><span className="text-muted-foreground">Rate/Mile:</span> {selected.rate_per_mile ? `$${selected.rate_per_mile}` : "—"}</div>
                  <div><span className="text-muted-foreground">Contact:</span> {selected.contact_email ?? "—"}</div>
                </div>
                {selected.renewal_terms && <div><span className="text-muted-foreground">Renewal Terms:</span> {selected.renewal_terms}</div>}

                {/* Rate comparison */}
                {avgRate > 0 && selected.rate_per_route && (
                  <Card className="border-0 bg-muted/50">
                    <CardContent className="p-3 text-xs">
                      <p>Your rate: <span className="font-bold">{fmt.format(selected.rate_per_route)}</span>/route</p>
                      <p>District avg: <span className="font-bold">{fmt.format(avgRate)}</span>/route</p>
                      <p className={selected.rate_per_route > avgRate ? "text-red-600" : "text-emerald-600"}>
                        Difference: {((selected.rate_per_route - avgRate) / avgRate * 100).toFixed(1)}%
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Insurance */}
                {selectedInsurance.length > 0 && (
                  <div>
                    <h3 className="font-semibold flex items-center gap-1 mb-2"><Shield className="h-4 w-4" /> Insurance</h3>
                    {selectedInsurance.map(ins => (
                      <div key={ins.id} className="p-2 bg-muted/30 rounded text-xs space-y-1">
                        <p>Policy: {ins.policy_number} · {ins.provider}</p>
                        <p>Coverage: {fmt.format(ins.coverage_amount)} · Expires: {new Date(ins.expiration_date).toLocaleDateString()}</p>
                        <Badge variant="outline" className={statusStyle(ins.status)}>{ins.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}

                {/* Performance */}
                {selectedPerf.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Recent Performance</h3>
                    {selectedPerf.slice(0, 3).map(p => (
                      <div key={p.id} className="flex items-center justify-between py-1 border-b last:border-0 text-xs">
                        <span>{new Date(p.period_month).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
                        <div className="flex items-center gap-3">
                          <span>On-time: <span className={`font-bold ${p.on_time_pct >= 95 ? "text-emerald-600" : p.on_time_pct >= 90 ? "text-amber-600" : "text-red-600"}`}>{p.on_time_pct}%</span></span>
                          <span>Completed: {p.routes_completed}</span>
                          {p.safety_incidents > 0 && <span className="text-red-600">⚠ {p.safety_incidents} safety</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* === ADD CONTRACT DIALOG === */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Add Contract</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Contractor Name *</Label><Input value={addForm.contractor_name} onChange={e => setAddForm({ ...addForm, contractor_name: e.target.value })} className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Email</Label><Input value={addForm.contact_email} onChange={e => setAddForm({ ...addForm, contact_email: e.target.value })} className="mt-1" /></div>
              <div><Label>Phone</Label><Input value={addForm.contact_phone} onChange={e => setAddForm({ ...addForm, contact_phone: e.target.value })} className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Start Date *</Label><Input type="date" value={addForm.contract_start} onChange={e => setAddForm({ ...addForm, contract_start: e.target.value })} className="mt-1" /></div>
              <div><Label>End Date *</Label><Input type="date" value={addForm.contract_end} onChange={e => setAddForm({ ...addForm, contract_end: e.target.value })} className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Annual Value</Label><Input type="number" value={addForm.annual_value} onChange={e => setAddForm({ ...addForm, annual_value: e.target.value })} className="mt-1" /></div>
              <div><Label>Routes</Label><Input type="number" value={addForm.routes_count} onChange={e => setAddForm({ ...addForm, routes_count: e.target.value })} className="mt-1" /></div>
              <div><Label>Rate/Route</Label><Input type="number" value={addForm.rate_per_route} onChange={e => setAddForm({ ...addForm, rate_per_route: e.target.value })} className="mt-1" /></div>
            </div>
            <div><Label>Renewal Terms</Label><Input value={addForm.renewal_terms} onChange={e => setAddForm({ ...addForm, renewal_terms: e.target.value })} className="mt-1" /></div>
            <div><Label>Notes</Label><Input value={addForm.notes} onChange={e => setAddForm({ ...addForm, notes: e.target.value })} className="mt-1" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={saving}>{saving ? "Saving..." : "Add Contract"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Contracts;
