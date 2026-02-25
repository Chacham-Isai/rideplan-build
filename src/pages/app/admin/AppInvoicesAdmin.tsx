import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useDistrict } from "@/contexts/DistrictContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, CheckCircle, Loader2, ChevronLeft, ChevronRight, DollarSign, AlertTriangle, FileCheck } from "lucide-react";
import { toast } from "sonner";

const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  disputed: "bg-red-100 text-red-700 border-red-200",
};

const PAGE_SIZE = 50;

const AppInvoicesAdmin = () => {
  const { district, profile } = useDistrict();
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [approving, setApproving] = useState(false);

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(0); }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("contract_invoices")
      .select("*, contracts(contractor_name)", { count: "exact" })
      .order("invoice_date", { ascending: false });

    if (statusFilter !== "all") query = query.eq("status", statusFilter as any);
    if (search) query = query.ilike("invoice_number", `%${search}%`);

    const { data, count } = await query.range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
    setInvoices(data ?? []);
    setTotalCount(count ?? 0);
    setLoading(false);
  }, [search, statusFilter, page]);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  // Stats
  const totalInvoiced = invoices.reduce((s, i) => s + (i.invoiced_amount ?? 0), 0);
  const totalVerified = invoices.reduce((s, i) => s + (i.verified_amount ?? 0), 0);
  const totalDiscrepancies = invoices.reduce((s, i) => s + (i.discrepancy_amount ?? 0), 0);
  const pendingCount = invoices.filter(i => i.status === "pending").length;

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const toggleAll = () => {
    if (selected.size === invoices.filter(i => i.status === "pending").length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(invoices.filter(i => i.status === "pending").map(i => i.id)));
    }
  };

  const bulkApprove = async () => {
    if (selected.size === 0) return;
    setApproving(true);
    const { error } = await supabase
      .from("contract_invoices")
      .update({ status: "approved", reviewed_by: user?.id, reviewed_at: new Date().toISOString() })
      .in("id", Array.from(selected));
    if (error) toast.error(error.message);
    else { toast.success(`${selected.size} invoices approved`); setSelected(new Set()); fetchInvoices(); }
    setApproving(false);
  };

  const exportCSV = () => {
    const headers = ["Invoice #", "Contractor", "Date", "Invoiced", "Verified", "Discrepancy", "GPS Verified", "Status"];
    const rows = invoices.map(i => [
      i.invoice_number,
      (i.contracts as any)?.contractor_name ?? "",
      i.invoice_date,
      i.invoiced_amount,
      i.verified_amount ?? "",
      i.discrepancy_amount ?? "",
      i.gps_verified ? "Yes" : "No",
      i.status,
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoices-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Invoice Verification</h1>
          <p className="text-sm text-muted-foreground">{totalCount} invoices</p>
        </div>
        <div className="flex gap-2">
          {selected.size > 0 && (
            <Button size="sm" onClick={bulkApprove} disabled={approving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <CheckCircle className="h-4 w-4 mr-1" /> Approve {selected.size}
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-1" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="border-0 shadow-sm"><CardContent className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50"><DollarSign className="h-5 w-5 text-blue-600" /></div>
            <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Total Invoiced</p><p className="text-xl font-bold">{fmt.format(totalInvoiced)}</p></div>
          </div>
        </CardContent></Card>
        <Card className="border-0 shadow-sm"><CardContent className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50"><FileCheck className="h-5 w-5 text-emerald-600" /></div>
            <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Total Verified</p><p className="text-xl font-bold">{fmt.format(totalVerified)}</p></div>
          </div>
        </CardContent></Card>
        <Card className="border-0 shadow-sm"><CardContent className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50"><AlertTriangle className="h-5 w-5 text-red-600" /></div>
            <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Discrepancies</p><p className="text-xl font-bold">{fmt.format(totalDiscrepancies)}</p></div>
          </div>
        </CardContent></Card>
        <Card className="border-0 shadow-sm"><CardContent className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50"><DollarSign className="h-5 w-5 text-amber-600" /></div>
            <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Pending</p><p className="text-xl font-bold">{pendingCount}</p></div>
          </div>
        </CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search invoice #..." value={searchInput} onChange={e => setSearchInput(e.target.value)} className="pl-9" />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0); }} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="disputed">Disputed</option>
        </select>
      </div>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox checked={selected.size > 0 && selected.size === invoices.filter(i => i.status === "pending").length} onCheckedChange={toggleAll} />
                </TableHead>
                <TableHead>Invoice #</TableHead>
                <TableHead>Contractor</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Invoiced</TableHead>
                <TableHead className="text-right">Verified</TableHead>
                <TableHead className="text-right">Discrepancy</TableHead>
                <TableHead>GPS</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={9} className="h-32 text-center"><Loader2 className="h-6 w-6 mx-auto animate-spin text-primary" /></TableCell></TableRow>
              ) : invoices.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="h-32 text-center text-muted-foreground">No invoices found</TableCell></TableRow>
              ) : invoices.map(inv => (
                <TableRow key={inv.id}>
                  <TableCell>
                    {inv.status === "pending" && (
                      <Checkbox checked={selected.has(inv.id)} onCheckedChange={() => toggleSelect(inv.id)} />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{inv.invoice_number}</TableCell>
                  <TableCell>{(inv.contracts as any)?.contractor_name}</TableCell>
                  <TableCell className="text-xs">{new Date(inv.invoice_date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">{fmt.format(inv.invoiced_amount)}</TableCell>
                  <TableCell className="text-right">{inv.verified_amount ? fmt.format(inv.verified_amount) : "—"}</TableCell>
                  <TableCell className={`text-right ${inv.discrepancy_amount > 0 ? "text-red-600 font-medium" : "text-muted-foreground"}`}>
                    {inv.discrepancy_amount ? fmt.format(inv.discrepancy_amount) : "—"}
                  </TableCell>
                  <TableCell>{inv.gps_verified ? <span className="text-emerald-600 text-xs font-medium">✓</span> : <span className="text-muted-foreground text-xs">—</span>}</TableCell>
                  <TableCell><Badge variant="outline" className={STATUS_STYLES[inv.status] ?? ""}>{inv.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
    </div>
  );
};

export default AppInvoicesAdmin;
