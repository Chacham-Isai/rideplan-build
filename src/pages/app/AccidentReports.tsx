import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useDistrict } from "@/contexts/DistrictContext";
import { useAuth } from "@/contexts/AuthContext";
import { differenceInYears, parseISO, format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertTriangle, Plus, Eye, Search, Loader2, Bus, Users, FileUp,
  Send, Phone, Mail, Download, Upload, Trash2, FileText, Camera,
  Shield, Clock, MapPin, CloudRain,
} from "lucide-react";
import { toast } from "sonner";

/* ─── Types ─── */
type AccidentReport = {
  id: string;
  district_id: string;
  bus_number: string;
  incident_date: string;
  incident_time: string | null;
  location: string | null;
  description: string;
  severity: string;
  injuries_reported: boolean;
  police_report_number: string | null;
  driver_name: string | null;
  weather_conditions: string | null;
  road_conditions: string | null;
  status: string;
  students_on_bus: number | null;
  created_by: string | null;
  created_at: string;
};

type BusStudent = {
  id: string;
  student_name: string;
  school: string;
  grade: string;
  dob: string;
  parent_user_id: string;
  parent_name?: string;
  parent_email?: string;
  parent_phone?: string;
};

type AccidentDoc = {
  id: string;
  file_name: string;
  file_url: string;
  document_type: string;
  uploaded_at: string;
};

type NotificationLog = {
  id: string;
  sent_at: string;
  message: string;
  recipient_count: number;
  channel: string;
};

const SEVERITY_STYLE: Record<string, string> = {
  minor: "bg-amber-100 text-amber-700",
  moderate: "bg-orange-100 text-orange-700",
  major: "bg-red-100 text-red-700",
};

const STATUS_STYLE: Record<string, string> = {
  open: "bg-amber-100 text-amber-700",
  investigating: "bg-blue-100 text-blue-700",
  closed: "bg-emerald-100 text-emerald-700",
};

const DOC_TYPES = [
  { value: "photo", label: "Photo / Video" },
  { value: "police_report", label: "Police Report" },
  { value: "insurance_claim", label: "Insurance Claim" },
  { value: "medical", label: "Medical Record" },
  { value: "witness_statement", label: "Witness Statement" },
  { value: "other", label: "Other" },
];

/* ─── Component ─── */
const AccidentReports = () => {
  const { district } = useDistrict();
  const { user } = useAuth();

  const [reports, setReports] = useState<AccidentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Detail
  const [selected, setSelected] = useState<AccidentReport | null>(null);
  const [busStudents, setBusStudents] = useState<BusStudent[]>([]);
  const [docs, setDocs] = useState<AccidentDoc[]>([]);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);

  // Create
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    bus_number: "", incident_date: format(new Date(), "yyyy-MM-dd"),
    incident_time: "", location: "", description: "", severity: "minor",
    injuries_reported: false, police_report_number: "", driver_name: "",
    weather_conditions: "", road_conditions: "",
  });
  const [saving, setSaving] = useState(false);

  // Mass notification
  const [showNotify, setShowNotify] = useState(false);
  const [notifyMessage, setNotifyMessage] = useState("");
  const [notifySending, setNotifySending] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());

  // Doc upload
  const [uploading, setUploading] = useState(false);
  const [uploadDocType, setUploadDocType] = useState("photo");

  // Bus numbers for autocomplete
  const [busNumbers, setBusNumbers] = useState<string[]>([]);

  useEffect(() => {
    if (!district) return;
    supabase.from("routes").select("bus_number").eq("district_id", district.id).not("bus_number", "is", null)
      .then(({ data }) => {
        const nums = [...new Set((data ?? []).map(r => r.bus_number).filter(Boolean))] as string[];
        setBusNumbers(nums.sort());
      });
  }, [district]);

  /* ─── Fetch reports ─── */
  const fetchReports = useCallback(async () => {
    setLoading(true);
    let query = supabase.from("accident_reports").select("*").order("incident_date", { ascending: false });
    if (statusFilter !== "all") query = query.eq("status", statusFilter);
    if (search) query = query.or(`bus_number.ilike.%${search}%,driver_name.ilike.%${search}%,location.ilike.%${search}%`);
    const { data } = await query;
    setReports((data as AccidentReport[]) ?? []);
    setLoading(false);
  }, [search, statusFilter]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  /* ─── Look up students on a bus ─── */
  const fetchBusStudents = async (busNumber: string) => {
    setStudentsLoading(true);
    // Find schools served by routes with this bus
    const { data: routes } = await supabase.from("routes").select("school")
      .eq("bus_number", busNumber).eq("status", "active");
    const schools = [...new Set((routes ?? []).map(r => r.school))];

    if (schools.length === 0) {
      setBusStudents([]);
      setStudentsLoading(false);
      return;
    }

    // Get approved students at those schools
    const { data: students } = await supabase.from("student_registrations")
      .select("id, student_name, school, grade, dob, parent_user_id")
      .eq("status", "approved")
      .in("school", schools)
      .order("student_name");

    if (!students || students.length === 0) {
      setBusStudents([]);
      setStudentsLoading(false);
      return;
    }

    // Get parent profiles for contact info
    const parentIds = [...new Set(students.map(s => s.parent_user_id))];
    const { data: profiles } = await supabase.from("profiles")
      .select("id, full_name, email, phone")
      .in("id", parentIds);

    const profileMap = new Map((profiles ?? []).map(p => [p.id, p]));

    const enriched: BusStudent[] = students.map(s => {
      const parent = profileMap.get(s.parent_user_id);
      return {
        ...s,
        parent_name: parent?.full_name ?? "—",
        parent_email: parent?.email ?? "—",
        parent_phone: parent?.phone ?? "—",
      };
    });

    setBusStudents(enriched);
    setSelectedStudentIds(new Set(enriched.map(s => s.id)));
    setStudentsLoading(false);
  };

  /* ─── Open detail ─── */
  const openDetail = async (report: AccidentReport) => {
    setSelected(report);
    setBusStudents([]);
    setDocs([]);
    setNotifications([]);

    // Parallel fetch
    const [studentsP, docsP, notifsP] = await Promise.all([
      fetchBusStudents(report.bus_number),
      supabase.from("accident_report_documents").select("*").eq("accident_report_id", report.id).order("uploaded_at", { ascending: false }),
      supabase.from("accident_notifications").select("*").eq("accident_report_id", report.id).order("sent_at", { ascending: false }),
    ]);

    setDocs((docsP.data as AccidentDoc[]) ?? []);
    setNotifications((notifsP.data as NotificationLog[]) ?? []);
  };

  /* ─── Create report ─── */
  const handleCreate = async () => {
    if (!createForm.bus_number || !createForm.description || !district) {
      toast.error("Bus number and description are required");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("accident_reports").insert({
      district_id: district.id,
      bus_number: createForm.bus_number,
      incident_date: createForm.incident_date,
      incident_time: createForm.incident_time || null,
      location: createForm.location || null,
      description: createForm.description,
      severity: createForm.severity,
      injuries_reported: createForm.injuries_reported,
      police_report_number: createForm.police_report_number || null,
      driver_name: createForm.driver_name || null,
      weather_conditions: createForm.weather_conditions || null,
      road_conditions: createForm.road_conditions || null,
      created_by: user?.id ?? null,
    } as any);
    if (error) toast.error(error.message);
    else {
      toast.success("Accident report created");
      setShowCreate(false);
      setCreateForm({
        bus_number: "", incident_date: format(new Date(), "yyyy-MM-dd"),
        incident_time: "", location: "", description: "", severity: "minor",
        injuries_reported: false, police_report_number: "", driver_name: "",
        weather_conditions: "", road_conditions: "",
      });
      fetchReports();
    }
    setSaving(false);
  };

  /* ─── Update status ─── */
  const updateStatus = async (newStatus: string) => {
    if (!selected) return;
    const { error } = await supabase.from("accident_reports").update({ status: newStatus, updated_at: new Date().toISOString() } as any).eq("id", selected.id);
    if (error) toast.error(error.message);
    else {
      toast.success(`Status updated to ${newStatus}`);
      setSelected({ ...selected, status: newStatus });
      fetchReports();
    }
  };

  /* ─── Upload document ─── */
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length || !selected || !district) return;
    setUploading(true);
    const file = e.target.files[0];
    const path = `${district.id}/${selected.id}/${Date.now()}-${file.name}`;

    const { error: uploadErr } = await supabase.storage.from("accident-documents").upload(path, file);
    if (uploadErr) { toast.error(uploadErr.message); setUploading(false); return; }

    const { error: insertErr } = await supabase.from("accident_report_documents").insert({
      accident_report_id: selected.id,
      district_id: district.id,
      file_name: file.name,
      file_url: path,
      document_type: uploadDocType,
      uploaded_by: user?.id ?? null,
    } as any);

    if (insertErr) toast.error(insertErr.message);
    else {
      toast.success("Document uploaded");
      const { data } = await supabase.from("accident_report_documents").select("*").eq("accident_report_id", selected.id).order("uploaded_at", { ascending: false });
      setDocs((data as AccidentDoc[]) ?? []);
    }
    setUploading(false);
    e.target.value = "";
  };

  /* ─── Mass notification ─── */
  const sendNotification = async () => {
    if (!notifyMessage.trim() || !selected || !district) return;
    setNotifySending(true);

    const selectedParents = busStudents
      .filter(s => selectedStudentIds.has(s.id))
      .map(s => ({ name: s.parent_name, email: s.parent_email, phone: s.parent_phone, student: s.student_name }));

    // Log the notification (actual SMS/email integration would be separate)
    const { error } = await supabase.from("accident_notifications").insert({
      accident_report_id: selected.id,
      district_id: district.id,
      sent_by: user?.id ?? null,
      message: notifyMessage,
      recipient_count: selectedParents.length,
      channel: "sms",
    } as any);

    if (error) toast.error(error.message);
    else {
      toast.success(`Notification logged for ${selectedParents.length} families`, {
        description: "SMS/email delivery requires messaging service integration",
      });
      setShowNotify(false);
      setNotifyMessage("");
      const { data } = await supabase.from("accident_notifications").select("*").eq("accident_report_id", selected.id).order("sent_at", { ascending: false });
      setNotifications((data as NotificationLog[]) ?? []);
    }
    setNotifySending(false);
  };

  const toggleStudent = (id: string) => {
    const next = new Set(selectedStudentIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedStudentIds(next);
  };

  const toggleAll = () => {
    if (selectedStudentIds.size === busStudents.length) setSelectedStudentIds(new Set());
    else setSelectedStudentIds(new Set(busStudents.map(s => s.id)));
  };

  /* ─── Stats ─── */
  const openCount = reports.filter(r => r.status === "open").length;
  const investigatingCount = reports.filter(r => r.status === "investigating").length;
  const injuryCount = reports.filter(r => r.injuries_reported).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Accident Reports</h1>
          <p className="text-sm text-muted-foreground">Document incidents, notify families, and manage aftermath</p>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-1" /> New Report
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-0 shadow-sm"><CardContent className="p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50"><AlertTriangle className="h-5 w-5 text-amber-600" /></div>
          <div><p className="text-xs text-muted-foreground uppercase">Open</p><p className="text-xl font-bold">{openCount}</p></div>
        </CardContent></Card>
        <Card className="border-0 shadow-sm"><CardContent className="p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50"><Search className="h-5 w-5 text-blue-600" /></div>
          <div><p className="text-xs text-muted-foreground uppercase">Investigating</p><p className="text-xl font-bold">{investigatingCount}</p></div>
        </CardContent></Card>
        <Card className="border-0 shadow-sm"><CardContent className="p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50"><Shield className="h-5 w-5 text-red-600" /></div>
          <div><p className="text-xs text-muted-foreground uppercase">With Injuries</p><p className="text-xl font-bold text-destructive">{injuryCount}</p></div>
        </CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search bus, driver, location..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="investigating">Investigating</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Bus</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Injuries</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>{Array.from({ length: 8 }).map((_, j) => (
                    <TableCell key={j}><div className="h-4 w-full animate-pulse rounded bg-muted" /></TableCell>
                  ))}</TableRow>
                ))
              ) : reports.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="h-32 text-center text-muted-foreground">No accident reports found</TableCell></TableRow>
              ) : reports.map(r => (
                <TableRow key={r.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openDetail(r)}>
                  <TableCell className="text-sm font-medium">{format(parseISO(r.incident_date), "MMM d, yyyy")}</TableCell>
                  <TableCell><Badge variant="outline" className="font-mono">{r.bus_number}</Badge></TableCell>
                  <TableCell className="text-sm">{r.driver_name || "—"}</TableCell>
                  <TableCell className="text-sm max-w-[200px] truncate">{r.location || "—"}</TableCell>
                  <TableCell><Badge className={SEVERITY_STYLE[r.severity] ?? ""}>{r.severity}</Badge></TableCell>
                  <TableCell>{r.injuries_reported ? <Badge className="bg-red-100 text-red-700">Yes</Badge> : <span className="text-muted-foreground text-sm">No</span>}</TableCell>
                  <TableCell><Badge className={STATUS_STYLE[r.status] ?? ""}>{r.status}</Badge></TableCell>
                  <TableCell><Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ═══ CREATE DIALOG ═══ */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>New Accident Report</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Bus Number *</Label>
                <Input list="bus-numbers" value={createForm.bus_number} onChange={e => setCreateForm(f => ({ ...f, bus_number: e.target.value }))} placeholder="e.g. Bus 42" />
                <datalist id="bus-numbers">{busNumbers.map(b => <option key={b} value={b} />)}</datalist>
              </div>
              <div className="space-y-2">
                <Label>Driver Name</Label>
                <Input value={createForm.driver_name} onChange={e => setCreateForm(f => ({ ...f, driver_name: e.target.value }))} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Incident Date *</Label>
                <Input type="date" value={createForm.incident_date} onChange={e => setCreateForm(f => ({ ...f, incident_date: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <Input type="time" value={createForm.incident_time} onChange={e => setCreateForm(f => ({ ...f, incident_time: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Severity</Label>
                <select value={createForm.severity} onChange={e => setCreateForm(f => ({ ...f, severity: e.target.value }))} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                  <option value="minor">Minor</option>
                  <option value="moderate">Moderate</option>
                  <option value="major">Major</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Location</Label>
              <Input value={createForm.location} onChange={e => setCreateForm(f => ({ ...f, location: e.target.value }))} placeholder="Intersection or address" />
            </div>

            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea value={createForm.description} onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))} rows={4} placeholder="Describe what happened..." />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Weather Conditions</Label>
                <Input value={createForm.weather_conditions} onChange={e => setCreateForm(f => ({ ...f, weather_conditions: e.target.value }))} placeholder="e.g. Rain, Clear" />
              </div>
              <div className="space-y-2">
                <Label>Road Conditions</Label>
                <Input value={createForm.road_conditions} onChange={e => setCreateForm(f => ({ ...f, road_conditions: e.target.value }))} placeholder="e.g. Wet, Icy" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Police Report #</Label>
                <Input value={createForm.police_report_number} onChange={e => setCreateForm(f => ({ ...f, police_report_number: e.target.value }))} />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Checkbox checked={createForm.injuries_reported} onCheckedChange={v => setCreateForm(f => ({ ...f, injuries_reported: !!v }))} />
                <Label>Injuries Reported</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
              Create Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══ DETAIL DIALOG ═══ */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Accident Report — {selected.bus_number}
                </DialogTitle>
              </DialogHeader>

              {/* Summary */}
              <div className="grid gap-3 sm:grid-cols-4 text-sm">
                <div><span className="text-muted-foreground">Date:</span> <span className="font-medium">{format(parseISO(selected.incident_date), "MMM d, yyyy")}</span></div>
                <div><span className="text-muted-foreground">Time:</span> <span className="font-medium">{selected.incident_time || "—"}</span></div>
                <div><span className="text-muted-foreground">Severity:</span> <Badge className={SEVERITY_STYLE[selected.severity]}>{selected.severity}</Badge></div>
                <div><span className="text-muted-foreground">Status:</span> <Badge className={STATUS_STYLE[selected.status]}>{selected.status}</Badge></div>
                <div className="sm:col-span-2"><span className="text-muted-foreground">Location:</span> <span className="font-medium">{selected.location || "—"}</span></div>
                <div><span className="text-muted-foreground">Driver:</span> <span className="font-medium">{selected.driver_name || "—"}</span></div>
                <div><span className="text-muted-foreground">Police #:</span> <span className="font-mono text-xs">{selected.police_report_number || "—"}</span></div>
                {selected.weather_conditions && <div><span className="text-muted-foreground">Weather:</span> {selected.weather_conditions}</div>}
                {selected.road_conditions && <div><span className="text-muted-foreground">Road:</span> {selected.road_conditions}</div>}
                {selected.injuries_reported && <div className="sm:col-span-2"><Badge className="bg-red-100 text-red-700">⚠ Injuries Reported</Badge></div>}
              </div>

              <div className="rounded-md bg-muted p-3 text-sm">{selected.description}</div>

              {/* Status actions */}
              <div className="flex gap-2">
                {selected.status !== "investigating" && <Button size="sm" variant="outline" onClick={() => updateStatus("investigating")}>Mark Investigating</Button>}
                {selected.status !== "closed" && <Button size="sm" variant="outline" onClick={() => updateStatus("closed")}>Close Report</Button>}
                {selected.status === "closed" && <Button size="sm" variant="outline" onClick={() => updateStatus("open")}>Reopen</Button>}
              </div>

              <Tabs defaultValue="students" className="mt-2">
                <TabsList>
                  <TabsTrigger value="students"><Users className="h-4 w-4 mr-1" /> Students on Bus ({busStudents.length})</TabsTrigger>
                  <TabsTrigger value="documents"><FileText className="h-4 w-4 mr-1" /> Documents ({docs.length})</TabsTrigger>
                  <TabsTrigger value="notifications"><Send className="h-4 w-4 mr-1" /> Notifications ({notifications.length})</TabsTrigger>
                </TabsList>

                {/* ─── Students Tab ─── */}
                <TabsContent value="students" className="space-y-3">
                  {studentsLoading ? (
                    <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                  ) : busStudents.length === 0 ? (
                    <Alert><AlertDescription>No approved students found on routes served by {selected.bus_number}.</AlertDescription></Alert>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">{busStudents.length} student(s) on routes served by this bus</p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={toggleAll}>
                            {selectedStudentIds.size === busStudents.length ? "Deselect All" : "Select All"}
                          </Button>
                          <Button size="sm" onClick={() => { setNotifyMessage(`URGENT: Your child's school bus (${selected.bus_number}) was involved in an incident on ${format(parseISO(selected.incident_date), "MMM d, yyyy")}. All students are safe. Please contact the transportation office for details.`); setShowNotify(true); }}>
                            <Send className="h-4 w-4 mr-1" /> Notify Selected ({selectedStudentIds.size})
                          </Button>
                        </div>
                      </div>
                      <div className="rounded-md border max-h-[300px] overflow-y-auto">
                        <Table>
                          <TableHeader><TableRow>
                            <TableHead className="w-8"></TableHead>
                            <TableHead>Student</TableHead>
                            <TableHead>School</TableHead>
                            <TableHead>Grade</TableHead>
                            <TableHead>Age</TableHead>
                            <TableHead>Parent/Guardian</TableHead>
                            <TableHead>Contact</TableHead>
                          </TableRow></TableHeader>
                          <TableBody>
                            {busStudents.map(s => {
                              const age = differenceInYears(new Date(), parseISO(s.dob));
                              return (
                                <TableRow key={s.id}>
                                  <TableCell>
                                    <Checkbox checked={selectedStudentIds.has(s.id)} onCheckedChange={() => toggleStudent(s.id)} />
                                  </TableCell>
                                  <TableCell className="font-medium text-sm">{s.student_name}</TableCell>
                                  <TableCell className="text-sm">{s.school}</TableCell>
                                  <TableCell className="text-sm">{s.grade}</TableCell>
                                  <TableCell className="text-sm">{age}</TableCell>
                                  <TableCell className="text-sm">{s.parent_name}</TableCell>
                                  <TableCell>
                                    <div className="space-y-0.5">
                                      {s.parent_phone && s.parent_phone !== "—" && (
                                        <a href={`tel:${s.parent_phone}`} className="flex items-center gap-1 text-xs text-primary hover:underline">
                                          <Phone className="h-3 w-3" />{s.parent_phone}
                                        </a>
                                      )}
                                      {s.parent_email && s.parent_email !== "—" && (
                                        <a href={`mailto:${s.parent_email}`} className="flex items-center gap-1 text-xs text-primary hover:underline">
                                          <Mail className="h-3 w-3" />{s.parent_email}
                                        </a>
                                      )}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </>
                  )}
                </TabsContent>

                {/* ─── Documents Tab ─── */}
                <TabsContent value="documents" className="space-y-3">
                  <div className="flex items-center gap-3">
                    <select value={uploadDocType} onChange={e => setUploadDocType(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                      {DOC_TYPES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                    </select>
                    <Button size="sm" variant="outline" disabled={uploading} asChild>
                      <label className="cursor-pointer">
                        {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Upload className="h-4 w-4 mr-1" />}
                        Upload File
                        <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,.pdf,.doc,.docx,.txt" />
                      </label>
                    </Button>
                  </div>
                  {docs.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">No documents uploaded yet</p>
                  ) : (
                    <div className="space-y-2">
                      {docs.map(d => (
                        <div key={d.id} className="flex items-center justify-between rounded-md border p-3">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{d.file_name}</p>
                              <p className="text-xs text-muted-foreground">{d.document_type.replace("_", " ")} · {format(parseISO(d.uploaded_at), "MMM d, yyyy h:mm a")}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" onClick={async () => {
                            const { data } = await supabase.storage.from("accident-documents").createSignedUrl(d.file_url, 300);
                            if (data?.signedUrl) window.open(data.signedUrl, "_blank");
                            else toast.error("Could not generate download link");
                          }}>
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* ─── Notifications Tab ─── */}
                <TabsContent value="notifications" className="space-y-3">
                  <Button size="sm" onClick={() => { setNotifyMessage(""); setShowNotify(true); }}>
                    <Send className="h-4 w-4 mr-1" /> Send New Notification
                  </Button>
                  {notifications.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">No notifications sent yet</p>
                  ) : (
                    <div className="space-y-2">
                      {notifications.map(n => (
                        <div key={n.id} className="rounded-md border p-3">
                          <div className="flex items-center justify-between mb-1">
                            <Badge variant="outline">{n.channel.toUpperCase()}</Badge>
                            <span className="text-xs text-muted-foreground">{format(parseISO(n.sent_at), "MMM d, yyyy h:mm a")}</span>
                          </div>
                          <p className="text-sm">{n.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">Sent to {n.recipient_count} families</p>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ═══ MASS NOTIFY DIALOG ═══ */}
      <Dialog open={showNotify} onOpenChange={setShowNotify}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Send Mass Notification</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Alert><AlertDescription>
              This will log a notification to {selectedStudentIds.size} families. SMS/email delivery requires a messaging service integration.
            </AlertDescription></Alert>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea value={notifyMessage} onChange={e => setNotifyMessage(e.target.value)} rows={4} placeholder="Enter notification message..." />
            </div>
            <p className="text-xs text-muted-foreground">{selectedStudentIds.size} families selected</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotify(false)}>Cancel</Button>
            <Button onClick={sendNotification} disabled={notifySending || !notifyMessage.trim()}>
              {notifySending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Send className="h-4 w-4 mr-1" />}
              Send Notification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccidentReports;
