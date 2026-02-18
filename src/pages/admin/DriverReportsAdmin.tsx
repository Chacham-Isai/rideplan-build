import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type DriverReport = Tables<"driver_reports">;

const statusColors: Record<string, string> = {
  new: "bg-primary/10 text-primary",
  reviewing: "bg-accent/20 text-accent-foreground",
  resolved: "bg-success/20 text-success-foreground",
};

const DriverReportsAdmin = () => {
  const [reports, setReports] = useState<DriverReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const { toast } = useToast();

  const fetchReports = async () => {
    setLoading(true);
    let query = supabase.from("driver_reports").select("*").order("created_at", { ascending: false });
    if (statusFilter !== "all") query = query.eq("status", statusFilter as any);
    if (typeFilter !== "all") query = query.eq("report_type", typeFilter as any);
    if (search) query = query.or(`bus_number.ilike.%${search}%,driver_name.ilike.%${search}%`);
    const { data, error } = await query;
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else setReports(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchReports(); }, [statusFilter, typeFilter, search]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("driver_reports").update({ status: status as any }).eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else fetchReports();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Input placeholder="Search bus or driver..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="reviewing">Reviewing</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="incident">Incident</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="schedule">Schedule</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Bus</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : reports.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No reports found</TableCell></TableRow>
            ) : reports.map(r => (
              <TableRow key={r.id}>
                <TableCell className="text-sm">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                <TableCell><Badge variant="outline" className="capitalize">{r.report_type}</Badge></TableCell>
                <TableCell className="text-sm">{r.driver_name}</TableCell>
                <TableCell className="text-sm font-mono">{r.bus_number}</TableCell>
                <TableCell className="text-sm max-w-xs truncate">{r.description}</TableCell>
                <TableCell><Badge className={statusColors[r.status] || ""}>{r.status}</Badge></TableCell>
                <TableCell>
                  <Select value={r.status} onValueChange={(v) => updateStatus(r.id, v)}>
                    <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="reviewing">Reviewing</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">{reports.length} report(s)</p>
    </div>
  );
};

export default DriverReportsAdmin;
