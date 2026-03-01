import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { differenceInYears, parseISO } from "date-fns";
import { useDistrict } from "@/contexts/DistrictContext";
import { useAuth } from "@/contexts/AuthContext";
import { useDemoMode } from "@/contexts/DemoModeContext";
import type { DemoDistrictId } from "@/contexts/DemoModeContext";
import { getDemoRequests } from "@/lib/demoData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Search, Loader2, Eye, Plus, MessageSquare, Clock, CheckCircle,
  AlertTriangle, MapPin, Home, School, Bus, HelpCircle, Send, Download,
  Sparkles, Bot, User, Phone,
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
  ai_suggested_priority: string | null;
  ai_suggested_type: string | null;
  caller_name: string | null;
  caller_phone: string | null;
  student_registration_id: string | null;
  // Joined from student_registrations
  student_name?: string;
  student_school?: string;
  student_grade?: string;
  student_dob?: string;
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
  const { isDemoMode, demoDistrictId } = useDemoMode();
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
    caller_name: "", caller_phone: "", student_registration_id: "",
  });
  const [addSaving, setAddSaving] = useState(false);
  const [studentOptions, setStudentOptions] = useState<{ id: string; student_name: string; school: string; grade: string }[]>([]);

  // Fetch students for linking
  useEffect(() => {
    if (isDemoMode) {
      setStudentOptions([]);
      return;
    }
    if (!district) return;
    supabase.from("student_registrations").select("id, student_name, school, grade")
      .eq("status", "approved").order("student_name").limit(500)
      .then(({ data }) => setStudentOptions((data as any[]) ?? []));
  }, [district, isDemoMode]);

  const fetchRequests = useCallback(async () => {
    if (isDemoMode && demoDistrictId) {
      setLoading(true);
      let filtered = getDemoRequests(demoDistrictId as DemoDistrictId);
      if (typeFilter !== "all") filtered = filtered.filter(r => r.request_type === typeFilter);
      if (statusFilter !== "all") filtered = filtered.filter(r => r.status === statusFilter);
      if (priorityFilter !== "all") filtered = filtered.filter(r => r.priority === priorityFilter);
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(r => r.subject.toLowerCase().includes(s));
      }
      setRequests(filtered);
      setLoading(false);
      return;
    }
    setLoading(true);
    let query = supabase.from("service_requests")
      .select("*, student_registrations!service_requests_student_registration_id_fkey(student_name, school, grade, dob)")
      .order("created_at", { ascending: false });
    if (typeFilter !== "all") query = query.eq("request_type", typeFilter as any);
    if (statusFilter !== "all") query = query.eq("status", statusFilter as any);
    if (priorityFilter !== "all") query = query.eq("priority", priorityFilter as any);
    if (search) query = query.ilike("subject", `%${search}%`);
    const { data } = await query;
    const mapped: ServiceRequest[] = ((data as any[]) ?? []).map((r: any) => ({
      ...r,
      student_name: r.student_registrations?.student_name ?? null,
      student_school: r.student_registrations?.school ?? null,
      student_grade: r.student_registrations?.grade ?? null,
      student_dob: r.student_registrations?.dob ?? null,
    }));
    setRequests(mapped);
    setLoading(false);
  }, [search, typeFilter, statusFilter, priorityFilter, isDemoMode, demoDistrictId]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const openDetail = async (req: ServiceRequest) => {
    setSelected(req);
    if (isDemoMode) {
      setNotes([]);
      return;
    }
    const { data } = await supabase
      .from("service_request_notes")
      .select("*")
      .eq("request_id", req.id)
      .order("created_at", { ascending: true });
    setNotes((data as Note[]) ?? []);
  };

  const addNote = async () => {
    if (isDemoMode) { toast.info("Editing is disabled in demo mode"); return; }
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
    if (isDemoMode) { toast.info("Editing is disabled in demo mode"); return; }
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

  // AI triage after creating a request
  const triageRequest = async (requestId: string, subject: string, description: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("triage-request", {
        body: { subject, description },
      });
      if (error) { console.error("AI triage failed:", error); return; }
      if (data?.priority && data?.request_type) {
        await supabase.from("service_requests").update({
          ai_suggested_priority: data.priority,
          ai_suggested_type: data.request_type,
        } as any).eq("id", requestId);
        toast.success("AI triage complete", {
          description: `Suggested: ${data.priority} priority, ${data.request_type.replace("_", " ")}`,
        });
        fetchRequests();
      }
    } catch (e) {
      console.error("AI triage error:", e);
    }
  };

  const handleAdd = async () => {
    if (isDemoMode) { toast.info("Editing is disabled in demo mode"); return; }
    if (!addForm.subject || !district) { toast.error("Subject is required"); return; }
    setAddSaving(true);
    const { data: inserted, error } = await supabase.from("service_requests").insert({
      district_id: district.id,
      request_type: addForm.request_type as any,
      subject: addForm.subject,
      description: addForm.description,
      current_value: addForm.current_value || null,
      requested_value: addForm.requested_value || null,
      priority: addForm.priority as any,
      status: "open" as any,
      caller_name: addForm.caller_name || null,
      caller_phone: addForm.caller_phone || null,
      student_registration_id: addForm.student_registration_id || null,
    } as any).select("id").single();
    if (error) toast.error(error.message);
    else {
      toast.success("Request created");
      setShowAdd(false);
      // Trigger AI triage in background
      if (inserted?.id) {
        triageRequest(inserted.id, addForm.subject, addForm.description);
      }
      setAddForm({ request_type: "general_inquiry", subject: "", description: "", current_value: "", requested_value: "", priority: "medium", caller_name: "", caller_phone: "", student_registration_id: "" });
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
            { key: "caller_name", label: "Caller" }, { key: "caller_phone", label: "Phone" },
            { key: "student_name", label: "Student" }, { key: "student_school", label: "School" },
            { key: "student_grade", label: "Grade" },
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
              <TableHead>Caller / Student</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead></TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}><div className="h-4 w-full animate-pulse rounded bg-muted" style={{ opacity: 1 - i * 0.1 }} /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : requests.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="h-32 text-center text-muted-foreground">No requests found</TableCell></TableRow>
              ) : requests.map(r => {
                const cfg = TYPE_CONFIG[r.request_type] ?? TYPE_CONFIG.general_inquiry;
                const hasAiSuggestion = r.ai_suggested_priority || r.ai_suggested_type;
                const age = r.student_dob ? differenceInYears(new Date(), parseISO(r.student_dob)) : null;
                return (
                  <TableRow key={r.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openDetail(r)}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`flex h-7 w-7 items-center justify-center rounded ${cfg.color}`}>
                          <cfg.icon className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-xs font-medium">{cfg.label}</span>
                        {hasAiSuggestion && <Sparkles className="h-3 w-3 text-violet-500" />}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium max-w-[250px] truncate">{r.subject}</TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        {r.caller_name && (
                          <div className="flex items-center gap-1 text-xs">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span className="font-medium">{r.caller_name}</span>
                          </div>
                        )}
                        {r.student_name && (
                          <div className="text-xs text-muted-foreground">
                            {r.student_name}
                            {r.student_grade && <span> · Gr {r.student_grade}</span>}
                            {age !== null && <span> · Age {age}</span>}
                          </div>
                        )}
                        {r.student_school && (
                          <div className="text-[10px] text-muted-foreground truncate max-w-[180px]">{r.student_school}</div>
                        )}
                        {!r.caller_name && !r.student_name && <span className="text-xs text-muted-foreground">—</span>}
                      </div>
                    </TableCell>
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
            const hasAiDiff = (selected.ai_suggested_priority && selected.ai_suggested_priority !== selected.priority) ||
              (selected.ai_suggested_type && selected.ai_suggested_type !== selected.request_type);
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
                  <div className="flex gap-2 flex-wrap">
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

                  {/* Caller & Student Info */}
                  {(selected.caller_name || selected.student_name) && (
                    <div className="rounded-lg bg-muted/50 p-3 space-y-1.5">
                      {selected.caller_name && (
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-medium">{selected.caller_name}</span>
                          {selected.caller_phone && (
                            <span className="text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" />{selected.caller_phone}</span>
                          )}
                        </div>
                      )}
                      {selected.student_name && (
                        <div className="text-sm space-y-0.5">
                          <p className="font-medium">{selected.student_name}</p>
                          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            {selected.student_school && <span>{selected.student_school}</span>}
                            {selected.student_grade && <span>· Grade {selected.student_grade}</span>}
                            {selected.student_dob && <span>· Age {differenceInYears(new Date(), parseISO(selected.student_dob))}</span>}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* AI Triage Badge */}
                  {(selected.ai_suggested_priority || selected.ai_suggested_type) && (
                    <Alert className="border-violet-200 bg-violet-50">
                      <Bot className="h-4 w-4 text-violet-600" />
                      <AlertDescription className="text-xs">
                        <span className="font-semibold text-violet-700">AI Triage:</span>{" "}
                        Suggested <strong>{selected.ai_suggested_priority}</strong> priority,{" "}
                        <strong>{selected.ai_suggested_type?.replace("_", " ")}</strong> type
                        {hasAiDiff && (
                          <span className="ml-1 text-violet-500">(differs from current)</span>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}

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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Caller Name</label>
                <Input value={addForm.caller_name} onChange={e => setAddForm({ ...addForm, caller_name: e.target.value })} className="mt-1" placeholder="Parent/guardian name" />
              </div>
              <div>
                <label className="text-sm font-medium">Caller Phone</label>
                <Input value={addForm.caller_phone} onChange={e => setAddForm({ ...addForm, caller_phone: e.target.value })} className="mt-1" placeholder="(516) 555-0100" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Student</label>
              <select value={addForm.student_registration_id} onChange={e => setAddForm({ ...addForm, student_registration_id: e.target.value })} className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value="">Select student (optional)</option>
                {studentOptions.map(s => <option key={s.id} value={s.id}>{s.student_name} — {s.school} (Gr {s.grade})</option>)}
              </select>
            </div>
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
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-violet-500" /> AI will auto-triage after submission
            </p>
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