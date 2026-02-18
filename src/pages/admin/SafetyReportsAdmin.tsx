import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type SafetyReport = Tables<"safety_reports">;

const priorityColors: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-accent/20 text-accent-foreground",
  high: "bg-destructive/20 text-destructive",
  critical: "bg-destructive text-destructive-foreground",
};

const statusColors: Record<string, string> = {
  new: "bg-primary/10 text-primary",
  reviewing: "bg-accent/20 text-accent-foreground",
  resolved: "bg-success/20 text-success-foreground",
};

const SafetyReportsAdmin = () => {
  const [reports, setReports] = useState<SafetyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const { toast } = useToast();

  const fetchReports = async () => {
    setLoading(true);
    let query = supabase.from("safety_reports").select("*").order("created_at", { ascending: false });
    if (statusFilter !== "all") query = query.eq("status", statusFilter as any);
    if (typeFilter !== "all") query = query.eq("report_type", typeFilter as any);
    if (search) query = query.or(`bus_number.ilike.%${search}%,school_name.ilike.%${search}%,reporter_name.ilike.%${search}%`);
    const { data, error } = await query;
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else setReports(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchReports(); }, [statusFilter, typeFilter, search]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("safety_reports").update({ status: status as any }).eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else fetchReports();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Input placeholder="Search bus, school, reporter..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" />
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
            <SelectItem value="bullying">Bullying</SelectItem>
            <SelectItem value="driver_safety">Driver Safety</SelectItem>
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
              <TableHead>School</TableHead>
              <TableHead>Bus</TableHead>
              <TableHead>Reporter</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : reports.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No reports found</TableCell></TableRow>
            ) : reports.map(r => (
              <TableRow key={r.id}>
                <TableCell className="text-sm">{new Date(r.incident_date).toLocaleDateString()}</TableCell>
                <TableCell><Badge variant="outline" className="capitalize">{r.report_type.replace("_", " ")}</Badge></TableCell>
                <TableCell className="text-sm">{r.school_name}</TableCell>
                <TableCell className="text-sm font-mono">{r.bus_number}</TableCell>
                <TableCell className="text-sm">{r.reporter_name}<br/><span className="text-muted-foreground text-xs">{r.reporter_email}</span></TableCell>
                <TableCell><Badge className={priorityColors[r.ai_priority] || ""}>{r.ai_priority}</Badge></TableCell>
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

export default SafetyReportsAdmin;
