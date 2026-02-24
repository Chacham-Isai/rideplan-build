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
import { DollarSign, AlertTriangle, CheckCircle, Plus, FileWarning } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-accent/20 text-accent-foreground",
  approved: "bg-success/20 text-green-700",
  disputed: "bg-destructive/20 text-destructive",
};

const InvoicesAdmin = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    contract_id: "", invoice_number: "", invoice_date: "",
    invoiced_amount: "", verified_amount: "", discrepancy_notes: "",
    gps_verified: false,
  });

  const fetchData = async () => {
    setLoading(true);
    const [inv, con] = await Promise.all([
      supabase.from("contract_invoices").select("*").order("invoice_date", { ascending: false }),
      supabase.from("contracts").select("id, contractor_name"),
    ]);
    setInvoices(inv.data || []);
    setContracts(con.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const contractName = (id: string) => contracts.find(c => c.id === id)?.contractor_name || "Unknown";

  const stats = useMemo(() => {
    const totalInvoiced = invoices.reduce((s, i) => s + Number(i.invoiced_amount), 0);
    const totalVerified = invoices.reduce((s, i) => s + Number(i.verified_amount || i.invoiced_amount), 0);
    const totalDisc = invoices.reduce((s, i) => s + Math.abs(Number(i.discrepancy_amount || 0)), 0);
    const pending = invoices.filter(i => i.status === "pending").length;
    return { totalInvoiced, totalVerified, totalDisc, pending };
  }, [invoices]);

  const handleAdd = async () => {
    const invoiced = Number(form.invoiced_amount) || 0;
    const verified = Number(form.verified_amount) || invoiced;
    const disc = invoiced - verified;

    const { error } = await supabase.from("contract_invoices").insert({
      district_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      contract_id: form.contract_id,
      invoice_number: form.invoice_number,
      invoice_date: form.invoice_date,
      invoiced_amount: invoiced,
      verified_amount: verified,
      discrepancy_amount: disc,
      discrepancy_notes: form.discrepancy_notes || null,
      gps_verified: form.gps_verified,
    });
    if (error) toast.error(error.message);
    else { toast.success("Invoice added"); setShowAdd(false); fetchData(); }
  };

  const updateStatus = async (id: string, status: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    const { error } = await supabase.from("contract_invoices").update({
      status: status as any,
      reviewed_by: session?.user?.id,
      reviewed_at: new Date().toISOString(),
    }).eq("id", id);
    if (error) toast.error(error.message);
    else fetchData();
  };

  const statCards = [
    { label: "Total Invoiced", value: `$${(stats.totalInvoiced / 1000).toFixed(0)}K`, icon: DollarSign, color: "text-primary" },
    { label: "Verified", value: `$${(stats.totalVerified / 1000).toFixed(0)}K`, icon: CheckCircle, color: "text-green-600" },
    { label: "Discrepancies", value: `$${(stats.totalDisc / 1000).toFixed(1)}K`, icon: AlertTriangle, color: "text-orange-500" },
    { label: "Pending Review", value: stats.pending, icon: FileWarning, color: "text-accent" },
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
          <Plus className="w-4 h-4 mr-1" /> Add Invoice
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Contractor</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Invoiced</TableHead>
              <TableHead>Verified</TableHead>
              <TableHead>Discrepancy</TableHead>
              <TableHead>GPS</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : invoices.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No invoices</TableCell></TableRow>
            ) : invoices.map(inv => {
              const disc = Number(inv.discrepancy_amount || 0);
              return (
                <TableRow key={inv.id}>
                  <TableCell className="font-mono text-sm">{inv.invoice_number}</TableCell>
                  <TableCell className="text-sm">{contractName(inv.contract_id)}</TableCell>
                  <TableCell className="text-sm">{new Date(inv.invoice_date).toLocaleDateString()}</TableCell>
                  <TableCell>${Number(inv.invoiced_amount).toLocaleString()}</TableCell>
                  <TableCell>${Number(inv.verified_amount || 0).toLocaleString()}</TableCell>
                  <TableCell className={disc > 0 ? "text-destructive font-semibold" : "text-green-600"}>
                    {disc > 0 ? `-$${disc.toLocaleString()}` : "$0"}
                  </TableCell>
                  <TableCell>{inv.gps_verified ? <Badge className="bg-success/20 text-green-700">Yes</Badge> : <Badge variant="outline">No</Badge>}</TableCell>
                  <TableCell><Badge className={statusColors[inv.status] || ""}>{inv.status}</Badge></TableCell>
                  <TableCell>
                    <Select value={inv.status} onValueChange={v => updateStatus(inv.id, v)}>
                      <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="disputed">Disputed</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Add Invoice Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="font-display">Add Invoice</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Contractor</Label>
              <Select value={form.contract_id} onValueChange={v => setForm(f => ({ ...f, contract_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select contractor" /></SelectTrigger>
                <SelectContent>
                  {contracts.map(c => <SelectItem key={c.id} value={c.id}>{c.contractor_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Invoice #</Label><Input value={form.invoice_number} onChange={e => setForm(f => ({ ...f, invoice_number: e.target.value }))} /></div>
              <div><Label>Date</Label><Input type="date" value={form.invoice_date} onChange={e => setForm(f => ({ ...f, invoice_date: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Invoiced Amount ($)</Label><Input type="number" value={form.invoiced_amount} onChange={e => setForm(f => ({ ...f, invoiced_amount: e.target.value }))} /></div>
              <div><Label>Verified Amount ($)</Label><Input type="number" value={form.verified_amount} onChange={e => setForm(f => ({ ...f, verified_amount: e.target.value }))} /></div>
            </div>
            <div><Label>Discrepancy Notes</Label><Textarea value={form.discrepancy_notes} onChange={e => setForm(f => ({ ...f, discrepancy_notes: e.target.value }))} rows={2} /></div>
            <Button onClick={handleAdd} className="w-full bg-accent text-accent-foreground">Save Invoice</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvoicesAdmin;
