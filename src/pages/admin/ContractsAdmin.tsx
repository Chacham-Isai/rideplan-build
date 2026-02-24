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
import { toast } from "sonner";
import { FileText, Plus, DollarSign, Route, AlertTriangle, Shield, TrendingUp } from "lucide-react";

const statusColors: Record<string, string> = {
  active: "bg-success/20 text-green-700",
  expired: "bg-destructive/20 text-destructive",
  pending: "bg-accent/20 text-accent-foreground",
};

const insuranceStatusColors: Record<string, string> = {
  active: "bg-success/20 text-green-700",
  expiring: "bg-accent/20 text-accent-foreground",
  expired: "bg-destructive/20 text-destructive",
};

const ContractsAdmin = () => {
  const [contracts, setContracts] = useState<any[]>([]);
  const [insurance, setInsurance] = useState<any[]>([]);
  const [performance, setPerformance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    contractor_name: "", contact_email: "", contact_phone: "",
    contract_start: "", contract_end: "", annual_value: "",
    routes_count: "", rate_per_route: "", rate_per_mile: "",
    status: "pending" as string, renewal_terms: "", notes: "",
  });

  const fetch = async () => {
    setLoading(true);
    const [c, ins, perf] = await Promise.all([
      supabase.from("contracts").select("*").order("created_at", { ascending: false }),
      supabase.from("contractor_insurance").select("*"),
      supabase.from("contractor_performance").select("*").order("period_month", { ascending: false }),
    ]);
    setContracts(c.data || []);
    setInsurance(ins.data || []);
    setPerformance(perf.data || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const stats = useMemo(() => {
    const active = contracts.filter(c => c.status === "active");
    const totalValue = active.reduce((s, c) => s + Number(c.annual_value), 0);
    const expiring90 = contracts.filter(c => {
      const end = new Date(c.contract_end);
      const diff = (end.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return diff > 0 && diff <= 90;
    });
    const avgRate = active.length > 0
      ? active.reduce((s, c) => s + (Number(c.rate_per_route) || 0), 0) / active.length
      : 0;
    return { active: active.length, totalValue, expiring90: expiring90.length, avgRate };
  }, [contracts]);

  const handleAdd = async () => {
    const { error } = await supabase.from("contracts").insert({
      contractor_name: form.contractor_name,
      contact_email: form.contact_email || null,
      contact_phone: form.contact_phone || null,
      contract_start: form.contract_start,
      contract_end: form.contract_end,
      annual_value: Number(form.annual_value) || 0,
      routes_count: Number(form.routes_count) || 0,
      rate_per_route: Number(form.rate_per_route) || null,
      rate_per_mile: Number(form.rate_per_mile) || null,
      status: form.status as any,
      renewal_terms: form.renewal_terms || null,
      notes: form.notes || null,
    });
    if (error) toast.error(error.message);
    else { toast.success("Contract added"); setShowAdd(false); fetch(); }
  };

  const openDetail = (c: any) => setSelected(c);
  const contractInsurance = selected ? insurance.filter(i => i.contract_id === selected.id) : [];
  const contractPerf = selected ? performance.filter(p => p.contract_id === selected.id) : [];

  const statCards = [
    { label: "Active Contracts", value: stats.active, icon: FileText, color: "text-primary" },
    { label: "Total Annual Value", value: `$${(stats.totalValue / 1000).toFixed(0)}K`, icon: DollarSign, color: "text-green-600" },
    { label: "Expiring in 90 Days", value: stats.expiring90, icon: AlertTriangle, color: "text-orange-500" },
    { label: "Avg Rate/Route", value: `$${stats.avgRate.toFixed(0)}`, icon: Route, color: "text-accent" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map(s => (
          <Card key={s.label} className="p-4 flex items-center gap-3">
            <s.icon className={`w-8 h-8 ${s.color}`} />
            <div>
              <p className="text-2xl font-bold text-primary">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={() => setShowAdd(true)} className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Plus className="w-4 h-4 mr-1" /> Add Contract
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contractor</TableHead>
              <TableHead>Routes</TableHead>
              <TableHead>Annual Value</TableHead>
              <TableHead>Rate/Route</TableHead>
              <TableHead>Insurance</TableHead>
              <TableHead>Expiration</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : contracts.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No contracts</TableCell></TableRow>
            ) : contracts.map(c => {
              const ins = insurance.filter(i => i.contract_id === c.id);
              const insStatus = ins.length > 0 ? ins[0].status : "none";
              return (
                <TableRow key={c.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openDetail(c)}>
                  <TableCell className="font-medium">{c.contractor_name}</TableCell>
                  <TableCell>{c.routes_count}</TableCell>
                  <TableCell>${Number(c.annual_value).toLocaleString()}</TableCell>
                  <TableCell>${Number(c.rate_per_route || 0).toLocaleString()}</TableCell>
                  <TableCell>
                    {ins.length > 0 ? (
                      <Badge className={insuranceStatusColors[insStatus] || ""}>{insStatus}</Badge>
                    ) : (
                      <Badge variant="outline" className="text-destructive border-destructive">None</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{new Date(c.contract_end).toLocaleDateString()}</TableCell>
                  <TableCell><Badge className={statusColors[c.status] || ""}>{c.status}</Badge></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Add Contract Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="font-display">Add Contract</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Contractor Name</Label><Input value={form.contractor_name} onChange={e => setForm(f => ({ ...f, contractor_name: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Email</Label><Input value={form.contact_email} onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))} /></div>
              <div><Label>Phone</Label><Input value={form.contact_phone} onChange={e => setForm(f => ({ ...f, contact_phone: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Start Date</Label><Input type="date" value={form.contract_start} onChange={e => setForm(f => ({ ...f, contract_start: e.target.value }))} /></div>
              <div><Label>End Date</Label><Input type="date" value={form.contract_end} onChange={e => setForm(f => ({ ...f, contract_end: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Annual Value ($)</Label><Input type="number" value={form.annual_value} onChange={e => setForm(f => ({ ...f, annual_value: e.target.value }))} /></div>
              <div><Label>Routes</Label><Input type="number" value={form.routes_count} onChange={e => setForm(f => ({ ...f, routes_count: e.target.value }))} /></div>
              <div><Label>Rate/Route ($)</Label><Input type="number" value={form.rate_per_route} onChange={e => setForm(f => ({ ...f, rate_per_route: e.target.value }))} /></div>
            </div>
            <div><Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
            <Button onClick={handleAdd} className="w-full bg-accent text-accent-foreground">Save Contract</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={open => { if (!open) setSelected(null); }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader><DialogTitle className="font-display">{selected.contractor_name}</DialogTitle></DialogHeader>
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div><span className="text-muted-foreground">Contract:</span> {new Date(selected.contract_start).toLocaleDateString()} — {new Date(selected.contract_end).toLocaleDateString()}</div>
                  <div><span className="text-muted-foreground">Annual Value:</span> ${Number(selected.annual_value).toLocaleString()}</div>
                  <div><span className="text-muted-foreground">Routes:</span> {selected.routes_count}</div>
                  <div><span className="text-muted-foreground">Rate/Route:</span> ${Number(selected.rate_per_route || 0).toLocaleString()}</div>
                  <div><span className="text-muted-foreground">Rate/Mile:</span> ${Number(selected.rate_per_mile || 0).toFixed(2)}</div>
                  <div><span className="text-muted-foreground">Contact:</span> {selected.contact_email}</div>
                </div>

                {selected.renewal_terms && (
                  <div><span className="text-muted-foreground">Renewal Terms:</span> {selected.renewal_terms}</div>
                )}

                {/* Insurance */}
                <div>
                  <h3 className="font-semibold text-primary mb-2 flex items-center gap-2"><Shield className="w-4 h-4" /> Insurance</h3>
                  {contractInsurance.length === 0 ? (
                    <p className="text-muted-foreground">No insurance records</p>
                  ) : contractInsurance.map((ins: any) => (
                    <div key={ins.id} className="p-3 bg-secondary rounded-lg mb-2">
                      <div className="flex justify-between">
                        <span>Policy: {ins.policy_number} — {ins.provider}</span>
                        <Badge className={insuranceStatusColors[ins.status] || ""}>{ins.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Coverage: ${Number(ins.coverage_amount).toLocaleString()} · Expires: {new Date(ins.expiration_date).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>

                {/* Performance */}
                <div>
                  <h3 className="font-semibold text-primary mb-2 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Performance</h3>
                  {contractPerf.length === 0 ? (
                    <p className="text-muted-foreground">No performance data</p>
                  ) : (
                    <div className="space-y-2">
                      {contractPerf.slice(0, 3).map((p: any) => (
                        <div key={p.id} className="p-3 bg-secondary rounded-lg grid grid-cols-4 gap-2 text-xs">
                          <div><span className="text-muted-foreground">Period:</span> {new Date(p.period_month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>
                          <div><span className="text-muted-foreground">On-time:</span> {p.on_time_pct}%</div>
                          <div><span className="text-muted-foreground">Complaints:</span> {p.complaints_count}</div>
                          <div><span className="text-muted-foreground">Routes:</span> {p.routes_completed}/{p.routes_completed + p.routes_missed}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Rate Comparison */}
                <div className="p-3 bg-primary/5 rounded-lg">
                  <h3 className="font-semibold text-primary mb-1">Rate Comparison</h3>
                  <p className="text-xs">Your rate: <strong>${Number(selected.rate_per_route || 0).toLocaleString()}/route</strong> | Regional average: <strong>$85,000/route</strong></p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContractsAdmin;
