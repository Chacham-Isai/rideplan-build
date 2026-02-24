import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Receipt, Shield, BarChart3 } from "lucide-react";

const Contracts = () => {
  const [contracts, setContracts] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [insurance, setInsurance] = useState<any[]>([]);
  const [performance, setPerformance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
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
    };
    fetch();
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  const totalValue = contracts.reduce((s, c) => s + (c.annual_value ?? 0), 0);
  const totalRoutes = contracts.reduce((s, c) => s + (c.routes_count ?? 0), 0);
  const activeContracts = contracts.filter((c) => c.status === "active").length;

  const statusStyle = (s: string) => {
    if (s === "active" || s === "approved") return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (s === "pending") return "bg-amber-100 text-amber-700 border-amber-200";
    if (s === "expired") return "bg-gray-100 text-gray-600 border-gray-200";
    if (s === "disputed") return "bg-red-100 text-red-700 border-red-200";
    if (s === "expiring") return "bg-orange-100 text-orange-700 border-orange-200";
    return "bg-gray-100 text-gray-600 border-gray-200";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Contracts</h1>
        <p className="text-sm text-muted-foreground">Contractor management, invoicing & compliance</p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="border-0 shadow-sm"><CardContent className="p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Active Contracts</p>
          <p className="mt-1 text-2xl font-bold">{activeContracts}</p>
        </CardContent></Card>
        <Card className="border-0 shadow-sm"><CardContent className="p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Annual Value</p>
          <p className="mt-1 text-2xl font-bold">${(totalValue / 1e6).toFixed(1)}M</p>
        </CardContent></Card>
        <Card className="border-0 shadow-sm"><CardContent className="p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Contracted Routes</p>
          <p className="mt-1 text-2xl font-bold">{totalRoutes}</p>
        </CardContent></Card>
        <Card className="border-0 shadow-sm"><CardContent className="p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Pending Invoices</p>
          <p className="mt-1 text-2xl font-bold">{invoices.filter((i) => i.status === "pending").length}</p>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="contracts">
        <TabsList>
          <TabsTrigger value="contracts"><FileText className="mr-1.5 h-4 w-4" />Contracts</TabsTrigger>
          <TabsTrigger value="invoices"><Receipt className="mr-1.5 h-4 w-4" />Invoices</TabsTrigger>
          <TabsTrigger value="insurance"><Shield className="mr-1.5 h-4 w-4" />Insurance</TabsTrigger>
          <TabsTrigger value="performance"><BarChart3 className="mr-1.5 h-4 w-4" />Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="contracts" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Contractor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>End</TableHead>
                  <TableHead className="text-right">Annual Value</TableHead>
                  <TableHead className="text-right">Routes</TableHead>
                  <TableHead className="text-right">Rate/Route</TableHead>
                  <TableHead>Contact</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {contracts.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.contractor_name}</TableCell>
                      <TableCell><span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${statusStyle(c.status)}`}>{c.status}</span></TableCell>
                      <TableCell className="text-xs">{new Date(c.contract_start).toLocaleDateString()}</TableCell>
                      <TableCell className="text-xs">{new Date(c.contract_end).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right font-medium">${(c.annual_value / 1e6).toFixed(1)}M</TableCell>
                      <TableCell className="text-right">{c.routes_count}</TableCell>
                      <TableCell className="text-right text-muted-foreground">${c.rate_per_route?.toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-muted-foreground truncate max-w-[150px]">{c.contact_email}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="mt-4">
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
                </TableRow></TableHeader>
                <TableBody>
                  {invoices.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-medium">{inv.invoice_number}</TableCell>
                      <TableCell>{(inv.contracts as any)?.contractor_name}</TableCell>
                      <TableCell className="text-xs">{new Date(inv.invoice_date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">${inv.invoiced_amount?.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{inv.verified_amount ? `$${inv.verified_amount.toLocaleString()}` : "—"}</TableCell>
                      <TableCell className={`text-right ${inv.discrepancy_amount > 0 ? "text-red-600 font-medium" : "text-muted-foreground"}`}>
                        {inv.discrepancy_amount ? `$${inv.discrepancy_amount.toLocaleString()}` : "—"}
                      </TableCell>
                      <TableCell>{inv.gps_verified ? <span className="text-emerald-600 text-xs font-medium">✓ Verified</span> : <span className="text-muted-foreground text-xs">Pending</span>}</TableCell>
                      <TableCell><span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${statusStyle(inv.status)}`}>{inv.status}</span></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insurance" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Contractor</TableHead>
                  <TableHead>Policy #</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead className="text-right">Coverage</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Add'l Insured</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {insurance.map((ins) => (
                    <TableRow key={ins.id}>
                      <TableCell className="font-medium">{(ins.contracts as any)?.contractor_name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{ins.policy_number}</TableCell>
                      <TableCell>{ins.provider}</TableCell>
                      <TableCell className="text-right">${(ins.coverage_amount / 1e6).toFixed(0)}M</TableCell>
                      <TableCell className="text-xs">{new Date(ins.expiration_date).toLocaleDateString()}</TableCell>
                      <TableCell>{ins.additional_insured ? <span className="text-emerald-600 text-xs font-medium">Yes</span> : <span className="text-red-600 text-xs">No</span>}</TableCell>
                      <TableCell><span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${statusStyle(ins.status)}`}>{ins.status}</span></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Contractor</TableHead>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">On-Time %</TableHead>
                  <TableHead className="text-right">Completed</TableHead>
                  <TableHead className="text-right">Missed</TableHead>
                  <TableHead className="text-right">Safety</TableHead>
                  <TableHead className="text-right">Complaints</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {performance.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{(p.contracts as any)?.contractor_name}</TableCell>
                      <TableCell className="text-xs">{new Date(p.period_month).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</TableCell>
                      <TableCell className={`text-right font-medium ${p.on_time_pct >= 95 ? "text-emerald-600" : p.on_time_pct >= 90 ? "text-amber-600" : "text-red-600"}`}>{p.on_time_pct}%</TableCell>
                      <TableCell className="text-right">{p.routes_completed?.toLocaleString()}</TableCell>
                      <TableCell className={`text-right ${p.routes_missed > 5 ? "text-red-600 font-medium" : ""}`}>{p.routes_missed}</TableCell>
                      <TableCell className={`text-right ${p.safety_incidents > 0 ? "text-red-600 font-medium" : ""}`}>{p.safety_incidents}</TableCell>
                      <TableCell className="text-right">{p.complaints_count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Contracts;
