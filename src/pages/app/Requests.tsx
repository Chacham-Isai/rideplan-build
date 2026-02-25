import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useDistrict } from "@/contexts/DistrictContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Search, Loader2, Eye, Plus, MessageSquare, Clock, CheckCircle,
  AlertTriangle, MapPin, Home, School, Bus, HelpCircle, Send, Download,
} from "lucide-react";
import { exportToCsv } from "@/lib/csvExport";
import { toast } from "sonner";

const TYPE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  stop_change: { label: "Stop Change", icon: MapPin, color: "text-blue-600 bg-blue-50" },
  address_change: { label: "Address Change", icon: Home, color: "text-purple-600 bg-purple-50" },
  school_change: { label: "School Change", icon: School, color: "text-amber-600 bg-amber-50" },
  driver_issue: { label: "Driver Issue", icon: AlertTriangle, color: "text-red-600 bg-red-50" },
  general_inquiry: { label: "General Inquiry", icon: HelpCircle, color: "text-gray-600 bg-gray-50" },
  bus_pass: { label: "Bus Pass", icon: Bus, color: "text-emerald-600 bg-emerald-50" },
};

const STATUS_STYLE: Record<string, string> = {
  open: "bg-amber-100 text-amber-700 border-amber-200",
  in_progress: "bg-blue-100 text-blue-700 border-blue-200",
  resolved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  closed: "bg-gray-100 text-gray-600 border-gray-200",
};

const PRIORITY_STYLE: Record<string, string> = {
  low: "bg-gray-100 text-gray-600",
  medium: "bg-blue-100 text-blue-600",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

type ServiceRequest = {
  id: string;
  request_type: string;
  subject: string;
  description: string;
  current_value: string | null;
  requested_value: string | null;
  priority: string;
  status: string;
  created_at: string;
  resolved_at: string | null;
  assigned_to: string | null;
};

type Note = {
  id: string;
  note: string;
  user_id: string;
  created_at: string;
};

const Requests = () => {
  const { district } = useDistrict();
  const { user } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Detail
  const [selected, setSelected] = useState<ServiceRequest | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);

  // Add request
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({
    request_type: "general_inquiry", subject: "", description: "",
    current_value: "", requested_value: "", priority: "medium",
  });
  const [addSaving, setAddSaving] = useState(false);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    let query = supabase.from("service_requests").select("*").order("created_at", { ascending: false });
    if (typeFilter !== "all") query = query.eq("request_type", typeFilter as any);
    if (statusFilter !== "all") query = query.eq("status", statusFilter as any);
    if (priorityFilter !== "all") query = query.eq("priority", priorityFilter as any);
    if (search) query = query.ilike("subject", `%${search}%`);
    const { data } = await query;
    setRequests((data as ServiceRequest[]) ?? []);
    setLoading(false);
  }, [search, typeFilter, statusFilter, priorityFilter]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const openDetail = async (req: ServiceRequest) => {
    setSelected(req);
    const { data } = await supabase
      .from("service_request_notes")
      .select("*")
      .eq("request_id", req.id)
      .order("created_at", { ascending: true });
    setNotes((data as Note[]) ?? []);
  };

  const addNote = async () => {
    if (!newNote.trim() || !selected || !user) return;
    setNoteSaving(true);
    const { error } = await supabase.from("service_request_notes").insert({
      request_id: selected.id, user_id: user.id, note: newNote,
    });
    if (error) toast.error(error.message);
    else {
      setNewNote("");
      const { data } = await supabase
        .from("service_request_notes").select("*")
        .eq("request_id", selected.id).order("created_at", { ascending: true });
      setNotes((data as Note[]) ?? []);
    }
    setNoteSaving(false);
  };

  const updateStatus = async (newStatus: string) => {
    if (!selected) return;
    const updates: any = { status: newStatus };
    if (newStatus === "resolved") updates.resolved_at = new Date().toISOString();
    const { error } = await supabase.from("service_requests").update(updates).eq("id", selected.id);
    if (error) toast.error(error.message);
    else {
      toast.success(`Status updated to ${newStatus}`);
      setSelected({ ...selected, ...updates });
      fetchRequests();
    }
  };

  const handleAdd = async () => {
    if (!addForm.subject || !district) { toast.error("Subject is required"); return; }
    setAddSaving(true);
    const { error } = await supabase.from("service_requests").insert({
      district_id: district.id,
      request_type: addForm.request_type as any,
      subject: addForm.subject,
      description: addForm.description,
      current_value: addForm.current_value || null,
      requested_value: addForm.requested_value || null,
      priority: addForm.priority as any,
      status: "open" as any,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Request created");
      setShowAdd(false);
      setAddForm({ request_type: "general_inquiry", subject: "", description: "", current_value: "", requested_value: "", priority: "medium" });
      fetchRequests();
    }
    setAddSaving(false);
  };

  // Stats
  const openCount = requests.filter(r => r.status === "open").length;
  const inProgressCount = requests.filter(r => r.status === "in_progress").length;
  const resolvedCount = requests.filter(r => r.status === "resolved" || r.status === "closed").length;
  const urgentCount = requests.filter(r => r.priority === "urgent" && r.status !== "resolved" && r.status !== "closed").length;

  const typeCounts = Object.entries(TYPE_CONFIG).map(([type, cfg]) => ({
    type, label: cfg.label, count: requests.filter(r => r.request_type === type).length,
  })).filter(t => t.count > 0).sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Service Requests</h1>
          <p className="text-sm text-muted-foreground">Central inbox for stop changes, address changes, driver issues & more</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportToCsv("requests", requests, [
            { key: "request_type", label: "Type" }, { key: "subject", label: "Subject" },
            { key: "priority", label: "Priority" }, { key: "status", label: "Status" },
            { key: "created_at", label: "Created" }, { key: "description", label: "Description" },
          ])}>
            <Download className="h-4 w-4 mr-1" /> Export CSV
          </Button>
          <Button size="sm" onClick={() => setShowAdd(true)}>
            <Plus className="h-4 w-4 mr-1" /> New Request
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="border-0 shadow-sm"><CardContent className="p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
            <MessageSquare className="h-5 w-5 text-amber-600" />
          </div>
          <div><p className="text-xs text-muted-foreground uppercase">Open</p><p className="text-xl font-bold">{openCount}</p></div>
        </CardContent></Card>
        <Card className="border-0 shadow-sm"><CardContent className="p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
            <Clock className="h-5 w-5 text-blue-600" />
          </div>
          <div><p className="text-xs text-muted-foreground uppercase">In Progress</p><p className="text-xl font-bold">{inProgressCount}</p></div>
        </CardContent></Card>
        <Card className="border-0 shadow-sm"><CardContent className="p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
          </div>
          <div><p className="text-xs text-muted-foreground uppercase">Resolved</p><p className="text-xl font-bold">{resolvedCount}</p></div>
        </CardContent></Card>
        <Card className="border-0 shadow-sm"><CardContent className="p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div><p className="text-xs text-muted-foreground uppercase">Urgent</p><p className="text-xl font-bold text-red-600">{urgentCount}</p></div>
        </CardContent></Card>
      </div>

      {/* By type breakdown */}
      {typeCounts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {typeCounts.map(t => {
            const cfg = TYPE_CONFIG[t.type];
            return (
              <button
                key={t.type}
                onClick={() => setTypeFilter(typeFilter === t.type ? "all" : t.type)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                  typeFilter === t.type ? "ring-2 ring-primary" : "hover:shadow-sm"
                } ${cfg.color}`}
              >
                <cfg.icon className="h-3.5 w-3.5" />
                {t.label}: {t.count}
              </button>
            );
          })}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search requests..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
          <option value="all">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead></TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="h-32 text-center"><Loader2 className="h-6 w-6 mx-auto animate-spin text-primary" /></TableCell></TableRow>
              ) : requests.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="h-32 text-center text-muted-foreground">No requests found</TableCell></TableRow>
              ) : requests.map(r => {
                const cfg = TYPE_CONFIG[r.request_type] ?? TYPE_CONFIG.general_inquiry;
                return (
                  <TableRow key={r.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openDetail(r)}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`flex h-7 w-7 items-center justify-center rounded ${cfg.color}`}>
                          <cfg.icon className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-xs font-medium">{cfg.label}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium max-w-[300px] truncate">{r.subject}</TableCell>
                    <TableCell>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${PRIORITY_STYLE[r.priority] ?? ""}`}>
                        {r.priority}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLE[r.status] ?? ""}`}>
                        {r.status.replace("_", " ")}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); openDetail(r); }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {selected && (() => {
            const cfg = TYPE_CONFIG[selected.request_type] ?? TYPE_CONFIG.general_inquiry;
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <div className={`flex h-8 w-8 items-center justify-center rounded ${cfg.color}`}>
                      <cfg.icon className="h-4 w-4" />
                    </div>
                    {selected.subject}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 text-sm">
                  <div className="flex gap-2">
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[selected.status]}`}>
                      {selected.status.replace("_", " ")}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_STYLE[selected.priority]}`}>
                      {selected.priority}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(selected.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-muted-foreground">{selected.description}</p>

                  {(selected.current_value || selected.requested_value) && (
                    <div className="rounded-lg bg-muted/50 p-3 space-y-1">
                      {selected.current_value && <p><span className="font-medium">Current:</span> {selected.current_value}</p>}
                      {selected.requested_value && <p><span className="font-medium">Requested:</span> {selected.requested_value}</p>}
                    </div>
                  )}

                  {/* Status actions */}
                  <div className="flex gap-2 flex-wrap">
                    {selected.status === "open" && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus("in_progress")}>
                        <Clock className="h-3 w-3 mr-1" /> Start Working
                      </Button>
                    )}
                    {(selected.status === "open" || selected.status === "in_progress") && (
                      <Button size="sm" variant="outline" className="text-emerald-600" onClick={() => updateStatus("resolved")}>
                        <CheckCircle className="h-3 w-3 mr-1" /> Resolve
                      </Button>
                    )}
                    {selected.status === "resolved" && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus("closed")}>Close</Button>
                    )}
                  </div>

                  {/* Notes timeline */}
                  <div className="border-t pt-4 space-y-3">
                    <h4 className="font-semibold text-foreground">Notes</h4>
                    {notes.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No notes yet</p>
                    ) : notes.map(n => (
                      <div key={n.id} className="rounded-lg bg-muted/50 p-3">
                        <p className="text-sm">{n.note}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {new Date(n.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Add a note..."
                        value={newNote}
                        onChange={e => setNewNote(e.target.value)}
                        className="min-h-[60px]"
                      />
                    </div>
                    <Button size="sm" onClick={addNote} disabled={noteSaving || !newNote.trim()}>
                      <Send className="h-3 w-3 mr-1" /> {noteSaving ? "Sending..." : "Add Note"}
                    </Button>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Add Request Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>New Service Request</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Type</label>
              <select value={addForm.request_type} onChange={e => setAddForm({ ...addForm, request_type: e.target.value })} className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                {Object.entries(TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Subject *</label>
              <Input value={addForm.subject} onChange={e => setAddForm({ ...addForm, subject: e.target.value })} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea value={addForm.description} onChange={e => setAddForm({ ...addForm, description: e.target.value })} className="mt-1" />
            </div>
            {(addForm.request_type === "stop_change" || addForm.request_type === "address_change" || addForm.request_type === "school_change") && (
              <>
                <div>
                  <label className="text-sm font-medium">Current Value</label>
                  <Input value={addForm.current_value} onChange={e => setAddForm({ ...addForm, current_value: e.target.value })} className="mt-1" placeholder="Current stop/address/school" />
                </div>
                <div>
                  <label className="text-sm font-medium">Requested Value</label>
                  <Input value={addForm.requested_value} onChange={e => setAddForm({ ...addForm, requested_value: e.target.value })} className="mt-1" placeholder="New stop/address/school" />
                </div>
              </>
            )}
            <div>
              <label className="text-sm font-medium">Priority</label>
              <select value={addForm.priority} onChange={e => setAddForm({ ...addForm, priority: e.target.value })} className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={addSaving}>{addSaving ? "Creating..." : "Create Request"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Requests;
