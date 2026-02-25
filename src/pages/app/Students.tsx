import { useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useDistrict } from "@/contexts/DistrictContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Search, ChevronLeft, ChevronRight, Plus, Eye, Baby, GraduationCap, Loader2, Save, Pencil, Trash2, X, Download } from "lucide-react";
import { toast } from "sonner";
import { exportToCsv } from "@/lib/csvExport";

type Registration = {
  id: string;
  student_name: string;
  grade: string;
  school: string;
  address_line: string;
  city: string;
  zip: string;
  state: string;
  status: string;
  dob: string;
  created_at: string;
  iep_flag: boolean;
  mckinney_vento_flag: boolean;
  foster_care_flag: boolean;
  section_504_flag: boolean;
  district_id: string;
  parent_user_id: string;
};

type ChildcareRequest = {
  id: string;
  registration_id: string;
  provider_name: string;
  provider_address: string;
  transport_type: string;
  days_needed: string[];
  within_district: boolean | null;
  status: string;
  school_year: string;
};

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  approved: { label: "Approved", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  pending: { label: "Pending", className: "bg-amber-100 text-amber-700 border-amber-200" },
  denied: { label: "Denied", className: "bg-red-100 text-red-700 border-red-200" },
  under_review: { label: "Under Review", className: "bg-blue-100 text-blue-700 border-blue-200" },
};

const SCHOOLS = [
  "Lawrence High School", "Lawrence Middle School",
  "Number Two School", "Number Three School", "Number Four School",
  "Number Five School", "Lawrence Early Childhood Center",
];

const GRADES = ["Pre-K", "K", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

const PAGE_SIZE = 50;

const Students = () => {
  const [searchParams] = useSearchParams();
  const { district } = useDistrict();
  const { user } = useAuth();
  const [students, setStudents] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [schoolFilter, setSchoolFilter] = useState("all");
  const [specialFilter, setSpecialFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Detail dialog state
  const [selected, setSelected] = useState<Registration | null>(null);
  const [childcare, setChildcare] = useState<ChildcareRequest[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editFlags, setEditFlags] = useState({ iep_flag: false, section_504_flag: false, mckinney_vento_flag: false, foster_care_flag: false });
  const [saving, setSaving] = useState(false);

  // Add student dialog
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addForm, setAddForm] = useState({
    student_name: "", grade: "K", school: SCHOOLS[0], dob: "",
    address_line: "", city: "", zip: "", state: "NY",
    iep_flag: false, section_504_flag: false, mckinney_vento_flag: false, foster_care_flag: false,
    school_year: "2025-2026",
  });
  const [addSaving, setAddSaving] = useState(false);

  // Add childcare dialog
  const [showAddChildcare, setShowAddChildcare] = useState(false);
  const [childcareForm, setChildcareForm] = useState({
    provider_name: "", provider_address: "", transport_type: "both" as string,
    days_needed: [] as string[], within_district: true, school_year: "2025-2026",
  });
  const [childcareSaving, setChildcareSaving] = useState(false);

  // Read URL params on mount
  useEffect(() => {
    const filter = searchParams.get("filter");
    if (filter === "childcare") setSpecialFilter("childcare");
    else if (filter === "special_ed") setSpecialFilter("special_ed");
    else if (filter === "special_requests") setSpecialFilter("any_flag");
    if (searchParams.get("action") === "add") setShowAddDialog(true);
  }, []);

  // Fetch childcare registration IDs first when that filter is active
  const [childcareRegIds, setChildcareRegIds] = useState<string[] | null>(null);
  useEffect(() => {
    if (specialFilter !== "childcare") { setChildcareRegIds(null); return; }
    supabase.from("childcare_requests").select("registration_id").then(({ data }) => {
      const ids = [...new Set((data ?? []).map(d => d.registration_id))];
      setChildcareRegIds(ids);
    });
  }, [specialFilter]);

  const fetchStudents = useCallback(async () => {
    // If childcare filter is active but IDs haven't loaded yet, wait
    if (specialFilter === "childcare" && childcareRegIds === null) return;

    setLoading(true);
    let query = supabase
      .from("student_registrations")
      .select("id, student_name, grade, school, address_line, city, zip, state, status, dob, created_at, iep_flag, mckinney_vento_flag, foster_care_flag, section_504_flag, district_id, parent_user_id", { count: "exact" });

    if (statusFilter !== "all") query = query.eq("status", statusFilter as any);
    if (schoolFilter !== "all") query = query.eq("school", schoolFilter);
    if (search) query = query.ilike("student_name", `%${search}%`);
    if (specialFilter === "special_ed") query = query.or("iep_flag.eq.true,section_504_flag.eq.true");
    if (specialFilter === "any_flag") query = query.or("iep_flag.eq.true,section_504_flag.eq.true,mckinney_vento_flag.eq.true,foster_care_flag.eq.true");
    if (specialFilter === "childcare" && childcareRegIds) {
      if (childcareRegIds.length === 0) {
        setStudents([]);
        setTotalCount(0);
        setLoading(false);
        return;
      }
      query = query.in("id", childcareRegIds);
    }

    const { data, count } = await query
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    setStudents((data as Registration[]) ?? []);
    setTotalCount(count ?? 0);
    setLoading(false);
  }, [search, statusFilter, schoolFilter, specialFilter, page, childcareRegIds]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const filteredStudents = students;

  const openDetail = async (reg: Registration) => {
    setSelected(reg);
    setEditing(false);
    setEditFlags({ iep_flag: reg.iep_flag, section_504_flag: reg.section_504_flag, mckinney_vento_flag: reg.mckinney_vento_flag, foster_care_flag: reg.foster_care_flag });
    setDetailLoading(true);
    const { data } = await supabase.from("childcare_requests").select("*").eq("registration_id", reg.id);
    setChildcare((data as ChildcareRequest[]) ?? []);
    setDetailLoading(false);
  };

  // Save edited flags
  const saveFlags = async () => {
    if (!selected) return;
    setSaving(true);
    const { error } = await supabase.from("student_registrations").update(editFlags).eq("id", selected.id);
    if (error) { toast.error("Failed to save: " + error.message); }
    else {
      toast.success("Student flags updated");
      setSelected({ ...selected, ...editFlags });
      setEditing(false);
      fetchStudents();
    }
    setSaving(false);
  };

  // Add student
  const handleAddStudent = async () => {
    if (!addForm.student_name || !addForm.dob || !addForm.address_line || !addForm.city || !addForm.zip) {
      toast.error("Please fill in all required fields"); return;
    }
    if (!district?.id || !user?.id) { toast.error("Missing district or user context"); return; }
    setAddSaving(true);
    const { error } = await supabase.from("student_registrations").insert({
      student_name: addForm.student_name,
      grade: addForm.grade,
      school: addForm.school,
      dob: addForm.dob,
      address_line: addForm.address_line,
      city: addForm.city,
      zip: addForm.zip,
      state: addForm.state,
      school_year: addForm.school_year,
      iep_flag: addForm.iep_flag,
      section_504_flag: addForm.section_504_flag,
      mckinney_vento_flag: addForm.mckinney_vento_flag,
      foster_care_flag: addForm.foster_care_flag,
      district_id: district.id,
      parent_user_id: user.id,
      status: "pending",
    });
    if (error) { toast.error("Failed to add student: " + error.message); }
    else {
      toast.success("Student registration created");
      setShowAddDialog(false);
      setAddForm({ student_name: "", grade: "K", school: SCHOOLS[0], dob: "", address_line: "", city: "", zip: "", state: "NY", iep_flag: false, section_504_flag: false, mckinney_vento_flag: false, foster_care_flag: false, school_year: "2025-2026" });
      fetchStudents();
    }
    setAddSaving(false);
  };

  // Add childcare request
  const handleAddChildcare = async () => {
    if (!selected || !childcareForm.provider_name || !childcareForm.provider_address) {
      toast.error("Please fill in provider name and address"); return;
    }
    setChildcareSaving(true);
    const { error } = await supabase.from("childcare_requests").insert({
      registration_id: selected.id,
      provider_name: childcareForm.provider_name,
      provider_address: childcareForm.provider_address,
      transport_type: childcareForm.transport_type as any,
      days_needed: childcareForm.days_needed,
      within_district: childcareForm.within_district,
      school_year: childcareForm.school_year,
      status: "pending",
    });
    if (error) { toast.error("Failed to add childcare request: " + error.message); }
    else {
      toast.success("Childcare request added");
      setShowAddChildcare(false);
      setChildcareForm({ provider_name: "", provider_address: "", transport_type: "both", days_needed: [], within_district: true, school_year: "2025-2026" });
      // Refresh childcare
      const { data } = await supabase.from("childcare_requests").select("*").eq("registration_id", selected.id);
      setChildcare((data as ChildcareRequest[]) ?? []);
    }
    setChildcareSaving(false);
  };

  // Delete childcare request
  const deleteChildcare = async (id: string) => {
    // Note: RLS may not allow delete - will show error if so
    const { error } = await supabase.from("childcare_requests").delete().eq("id", id);
    if (error) toast.error("Cannot delete: " + error.message);
    else {
      toast.success("Childcare request removed");
      setChildcare(childcare.filter(c => c.id !== id));
    }
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Students</h1>
          <p className="text-sm text-muted-foreground">{totalCount.toLocaleString()} total registrations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportToCsv("students", students, [
            { key: "student_name", label: "Name" }, { key: "grade", label: "Grade" }, { key: "school", label: "School" },
            { key: "address_line", label: "Address" }, { key: "city", label: "City" }, { key: "zip", label: "ZIP" },
            { key: "status", label: "Status" }, { key: "dob", label: "DOB" },
          ])}>
            <Download className="h-4 w-4 mr-1" /> Export CSV
          </Button>
          <Button onClick={() => setShowAddDialog(true)} size="sm">
            <Plus className="h-4 w-4 mr-1" /> Add Student
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search students..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} className="pl-9" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
          <option value="all">All Statuses</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="denied">Denied</option>
          <option value="under_review">Under Review</option>
        </select>
        <select value={schoolFilter} onChange={(e) => { setSchoolFilter(e.target.value); setPage(0); }} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
          <option value="all">All Schools</option>
          {SCHOOLS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={specialFilter} onChange={(e) => { setSpecialFilter(e.target.value); setPage(0); }} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
          <option value="all">All Types</option>
          <option value="special_ed">Special Ed (IEP / 504)</option>
          <option value="childcare">Childcare Requests</option>
          <option value="any_flag">Any Special Flag</option>
        </select>
      </div>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>School</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Flags</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <TableCell key={j}><div className="h-4 w-full animate-pulse rounded bg-muted" style={{ opacity: 1 - i * 0.08 }} /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filteredStudents.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="h-32 text-center text-muted-foreground">No students found</TableCell></TableRow>
                ) : (
                  filteredStudents.map((s) => {
                    const st = STATUS_STYLES[s.status] ?? STATUS_STYLES.pending;
                    const flags = [s.iep_flag && "IEP", s.section_504_flag && "504", s.mckinney_vento_flag && "MV", s.foster_care_flag && "FC"].filter(Boolean);
                    return (
                      <TableRow key={s.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openDetail(s)}>
                        <TableCell className="font-medium">{s.student_name}</TableCell>
                        <TableCell>{s.grade}</TableCell>
                        <TableCell className="max-w-[160px] truncate">{s.school}</TableCell>
                        <TableCell className="max-w-[200px] truncate text-muted-foreground text-xs">{s.address_line}, {s.city} {s.zip}</TableCell>
                        <TableCell><span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${st.className}`}>{st.label}</span></TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {flags.map((f) => (<span key={f as string} className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">{f}</span>))}
                          </div>
                        </TableCell>
                        <TableCell><Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openDetail(s); }}><Eye className="h-4 w-4" /></Button></TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3">
              <p className="text-sm text-muted-foreground">Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalCount)} of {totalCount.toLocaleString()}</p>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="flex h-8 w-8 items-center justify-center rounded border hover:bg-muted disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
                <span className="text-sm font-medium">{page + 1} / {totalPages}</span>
                <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="flex h-8 w-8 items-center justify-center rounded border hover:bg-muted disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ===== Student Detail Dialog ===== */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  {selected.student_name}
                  {!editing && (
                    <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
                      <Pencil className="h-4 w-4 mr-1" /> Edit
                    </Button>
                  )}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-muted-foreground">Grade:</span> {selected.grade}</div>
                  <div><span className="text-muted-foreground">School:</span> {selected.school}</div>
                  <div><span className="text-muted-foreground">DOB:</span> {selected.dob}</div>
                  <div><span className="text-muted-foreground">Status:</span> <Badge variant="outline" className={STATUS_STYLES[selected.status]?.className}>{STATUS_STYLES[selected.status]?.label}</Badge></div>
                </div>
                <div><span className="text-muted-foreground">Address:</span> {selected.address_line}, {selected.city} {selected.zip}</div>

                {/* Special Ed Flags - editable */}
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-1">
                    <GraduationCap className="h-4 w-4" /> Special Education & Flags
                  </h3>
                  {editing ? (
                    <div className="space-y-3">
                      {([
                        { key: "iep_flag" as const, label: "IEP (Individualized Education Program)" },
                        { key: "section_504_flag" as const, label: "Section 504 Plan" },
                        { key: "mckinney_vento_flag" as const, label: "McKinney-Vento (Homeless)" },
                        { key: "foster_care_flag" as const, label: "Foster Care" },
                      ]).map(f => (
                        <div key={f.key} className="flex items-center justify-between">
                          <Label htmlFor={f.key} className="text-sm">{f.label}</Label>
                          <Switch id={f.key} checked={editFlags[f.key]} onCheckedChange={(v) => setEditFlags(prev => ({ ...prev, [f.key]: v }))} />
                        </div>
                      ))}
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" onClick={saveFlags} disabled={saving}>
                          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />} Save Flags
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => { setEditing(false); setEditFlags({ iep_flag: selected.iep_flag, section_504_flag: selected.section_504_flag, mckinney_vento_flag: selected.mckinney_vento_flag, foster_care_flag: selected.foster_care_flag }); }}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2 flex-wrap">
                      {selected.iep_flag ? <Badge className="bg-blue-100 text-blue-700 border-blue-200">IEP</Badge> : <Badge variant="outline" className="text-muted-foreground">No IEP</Badge>}
                      {selected.section_504_flag ? <Badge className="bg-purple-100 text-purple-700 border-purple-200">Section 504</Badge> : <Badge variant="outline" className="text-muted-foreground">No 504</Badge>}
                      {selected.mckinney_vento_flag ? <Badge className="bg-amber-100 text-amber-700 border-amber-200">McKinney-Vento</Badge> : <Badge variant="outline" className="text-muted-foreground">No MV</Badge>}
                      {selected.foster_care_flag ? <Badge className="bg-rose-100 text-rose-700 border-rose-200">Foster Care</Badge> : <Badge variant="outline" className="text-muted-foreground">No FC</Badge>}
                    </div>
                  )}
                </div>

                {/* Childcare requests */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold flex items-center gap-1"><Baby className="h-4 w-4" /> Childcare Pickup Requests</h3>
                    <Button variant="outline" size="sm" onClick={() => setShowAddChildcare(true)}><Plus className="h-3 w-3 mr-1" /> Add</Button>
                  </div>
                  {detailLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : childcare.length === 0 ? (
                    <p className="text-muted-foreground text-xs">No childcare pickup requests on file</p>
                  ) : (
                    <div className="space-y-2">
                      {childcare.map(c => (
                        <div key={c.id} className="p-3 rounded-lg bg-secondary space-y-1 relative group">
                          <button onClick={() => deleteChildcare(c.id)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10">
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </button>
                          <div className="flex items-center justify-between pr-6">
                            <span className="font-medium">{c.provider_name}</span>
                            <Badge variant="outline" className={STATUS_STYLES[c.status]?.className ?? ""}>{c.status}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{c.provider_address}</p>
                          <div className="flex gap-4 text-xs">
                            <span><span className="text-muted-foreground">Transport:</span> <span className="font-medium">{c.transport_type === "both" ? "AM & PM" : c.transport_type.toUpperCase()}</span></span>
                            <span><span className="text-muted-foreground">Days:</span> <span className="font-medium">{c.days_needed?.join(", ") || "All"}</span></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">Registered: {new Date(selected.created_at).toLocaleDateString()}</p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ===== Add Student Dialog ===== */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Add Student Registration</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>Student Name *</Label>
                <Input value={addForm.student_name} onChange={e => setAddForm(p => ({ ...p, student_name: e.target.value }))} placeholder="First Last" />
              </div>
              <div>
                <Label>Date of Birth *</Label>
                <Input type="date" value={addForm.dob} onChange={e => setAddForm(p => ({ ...p, dob: e.target.value }))} />
              </div>
              <div>
                <Label>Grade</Label>
                <select value={addForm.grade} onChange={e => setAddForm(p => ({ ...p, grade: e.target.value }))} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <Label>School</Label>
                <select value={addForm.school} onChange={e => setAddForm(p => ({ ...p, school: e.target.value }))} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  {SCHOOLS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <Label>Address *</Label>
                <Input value={addForm.address_line} onChange={e => setAddForm(p => ({ ...p, address_line: e.target.value }))} placeholder="123 Main St" />
              </div>
              <div>
                <Label>City *</Label>
                <Input value={addForm.city} onChange={e => setAddForm(p => ({ ...p, city: e.target.value }))} placeholder="Lawrence" />
              </div>
              <div>
                <Label>ZIP *</Label>
                <Input value={addForm.zip} onChange={e => setAddForm(p => ({ ...p, zip: e.target.value }))} placeholder="11559" />
              </div>
              <div>
                <Label>School Year</Label>
                <Input value={addForm.school_year} onChange={e => setAddForm(p => ({ ...p, school_year: e.target.value }))} />
              </div>
            </div>

            <div className="border-t pt-3">
              <h4 className="text-sm font-semibold mb-2">Special Flags</h4>
              <div className="space-y-2">
                {([
                  { key: "iep_flag" as const, label: "IEP" },
                  { key: "section_504_flag" as const, label: "Section 504" },
                  { key: "mckinney_vento_flag" as const, label: "McKinney-Vento" },
                  { key: "foster_care_flag" as const, label: "Foster Care" },
                ]).map(f => (
                  <div key={f.key} className="flex items-center justify-between">
                    <Label className="text-sm">{f.label}</Label>
                    <Switch checked={addForm[f.key]} onCheckedChange={v => setAddForm(p => ({ ...p, [f.key]: v }))} />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddStudent} disabled={addSaving}>
              {addSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Plus className="h-4 w-4 mr-1" />} Create Registration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== Add Childcare Request Dialog ===== */}
      <Dialog open={showAddChildcare} onOpenChange={setShowAddChildcare}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Childcare Pickup Request</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Provider Name *</Label>
              <Input value={childcareForm.provider_name} onChange={e => setChildcareForm(p => ({ ...p, provider_name: e.target.value }))} placeholder="ABC Daycare" />
            </div>
            <div>
              <Label>Provider Address *</Label>
              <Input value={childcareForm.provider_address} onChange={e => setChildcareForm(p => ({ ...p, provider_address: e.target.value }))} placeholder="456 Oak St" />
            </div>
            <div>
              <Label>Transport Type</Label>
              <select value={childcareForm.transport_type} onChange={e => setChildcareForm(p => ({ ...p, transport_type: e.target.value }))} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value="both">AM & PM</option>
                <option value="am">AM Only</option>
                <option value="pm">PM Only</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <Label>Within District</Label>
              <Switch checked={childcareForm.within_district} onCheckedChange={v => setChildcareForm(p => ({ ...p, within_district: v }))} />
            </div>
            <div>
              <Label>Days Needed</Label>
              <div className="flex gap-2 mt-1">
                {["Mon", "Tue", "Wed", "Thu", "Fri"].map(day => (
                  <button
                    key={day}
                    onClick={() => setChildcareForm(p => ({
                      ...p,
                      days_needed: p.days_needed.includes(day) ? p.days_needed.filter(d => d !== day) : [...p.days_needed, day]
                    }))}
                    className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${childcareForm.days_needed.includes(day) ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted"}`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddChildcare(false)}>Cancel</Button>
            <Button onClick={handleAddChildcare} disabled={childcareSaving}>
              {childcareSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Plus className="h-4 w-4 mr-1" />} Add Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Students;
