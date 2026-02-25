import { useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Search, ChevronLeft, ChevronRight, Plus, Eye, Baby, GraduationCap, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Registration = {
  id: string;
  student_name: string;
  grade: string;
  school: string;
  address_line: string;
  city: string;
  zip: string;
  status: string;
  dob: string;
  created_at: string;
  iep_flag: boolean;
  mckinney_vento_flag: boolean;
  foster_care_flag: boolean;
  section_504_flag: boolean;
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

const PAGE_SIZE = 50;

const Students = () => {
  const [searchParams, setSearchParams] = useSearchParams();
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

  // Add student dialog
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Read URL params on mount
  useEffect(() => {
    const filter = searchParams.get("filter");
    if (filter === "childcare") setSpecialFilter("childcare");
    else if (filter === "special_ed") setSpecialFilter("special_ed");
    else if (filter === "special_requests") setSpecialFilter("any_flag");

    if (searchParams.get("action") === "add") setShowAddDialog(true);
  }, []);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("student_registrations")
      .select("id, student_name, grade, school, address_line, city, zip, status, dob, created_at, iep_flag, mckinney_vento_flag, foster_care_flag, section_504_flag", { count: "exact" });

    if (statusFilter !== "all") query = query.eq("status", statusFilter as "approved" | "pending" | "denied" | "under_review");
    if (schoolFilter !== "all") query = query.eq("school", schoolFilter);
    if (search) query = query.ilike("student_name", `%${search}%`);

    // Special filters
    if (specialFilter === "special_ed") query = query.or("iep_flag.eq.true,section_504_flag.eq.true");
    if (specialFilter === "any_flag") query = query.or("iep_flag.eq.true,section_504_flag.eq.true,mckinney_vento_flag.eq.true,foster_care_flag.eq.true");

    const { data, count } = await query
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    setStudents((data as Registration[]) ?? []);
    setTotalCount(count ?? 0);
    setLoading(false);
  }, [search, statusFilter, schoolFilter, specialFilter, page]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  // For childcare filter, we do a second pass (join not possible via client)
  const [childcareIds, setChildcareIds] = useState<Set<string> | null>(null);
  useEffect(() => {
    if (specialFilter !== "childcare") { setChildcareIds(null); return; }
    supabase.from("childcare_requests").select("registration_id").then(({ data }) => {
      setChildcareIds(new Set((data ?? []).map(d => d.registration_id)));
    });
  }, [specialFilter]);

  const filteredStudents = useMemo(() => {
    if (specialFilter === "childcare" && childcareIds) {
      return students.filter(s => childcareIds.has(s.id));
    }
    return students;
  }, [students, specialFilter, childcareIds]);

  const openDetail = async (reg: Registration) => {
    setSelected(reg);
    setDetailLoading(true);
    const { data } = await supabase
      .from("childcare_requests")
      .select("*")
      .eq("registration_id", reg.id);
    setChildcare((data as ChildcareRequest[]) ?? []);
    setDetailLoading(false);
  };

  const schools = [
    "Lawrence High School", "Lawrence Middle School",
    "Number Two School", "Number Three School", "Number Four School",
    "Number Five School", "Lawrence Early Childhood Center",
  ];

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Students</h1>
          <p className="text-sm text-muted-foreground">{totalCount.toLocaleString()} total registrations</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Add Student
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="pl-9"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="all">All Statuses</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="denied">Denied</option>
          <option value="under_review">Under Review</option>
        </select>

        <select
          value={schoolFilter}
          onChange={(e) => { setSchoolFilter(e.target.value); setPage(0); }}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="all">All Schools</option>
          {schools.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        <select
          value={specialFilter}
          onChange={(e) => { setSpecialFilter(e.target.value); setPage(0); }}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
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
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center">
                      <Loader2 className="h-6 w-6 mx-auto animate-spin text-primary" />
                    </TableCell>
                  </TableRow>
                ) : filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      No students found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((s) => {
                    const st = STATUS_STYLES[s.status] ?? STATUS_STYLES.pending;
                    const flags = [
                      s.iep_flag && "IEP",
                      s.section_504_flag && "504",
                      s.mckinney_vento_flag && "MV",
                      s.foster_care_flag && "FC",
                    ].filter(Boolean);

                    return (
                      <TableRow
                        key={s.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => openDetail(s)}
                      >
                        <TableCell className="font-medium">{s.student_name}</TableCell>
                        <TableCell>{s.grade}</TableCell>
                        <TableCell className="max-w-[160px] truncate">{s.school}</TableCell>
                        <TableCell className="max-w-[200px] truncate text-muted-foreground text-xs">
                          {s.address_line}, {s.city} {s.zip}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${st.className}`}>
                            {st.label}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {flags.map((f) => (
                              <span key={f} className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                                {f}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openDetail(s); }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3">
              <p className="text-sm text-muted-foreground">
                Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalCount)} of {totalCount.toLocaleString()}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="flex h-8 w-8 items-center justify-center rounded border hover:bg-muted disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm font-medium">
                  {page + 1} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  className="flex h-8 w-8 items-center justify-center rounded border hover:bg-muted disabled:opacity-30"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.student_name}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-muted-foreground">Grade:</span> {selected.grade}</div>
                  <div><span className="text-muted-foreground">School:</span> {selected.school}</div>
                  <div><span className="text-muted-foreground">DOB:</span> {selected.dob}</div>
                  <div><span className="text-muted-foreground">Status:</span> <Badge variant="outline" className={STATUS_STYLES[selected.status]?.className}>{STATUS_STYLES[selected.status]?.label}</Badge></div>
                </div>

                <div>
                  <span className="text-muted-foreground">Address:</span> {selected.address_line}, {selected.city} {selected.zip}
                </div>

                {/* Special flags */}
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-1">
                    <GraduationCap className="h-4 w-4" /> Special Education & Flags
                  </h3>
                  <div className="flex gap-2 flex-wrap">
                    {selected.iep_flag ? <Badge className="bg-blue-100 text-blue-700 border-blue-200">IEP</Badge> : <Badge variant="outline" className="text-muted-foreground">No IEP</Badge>}
                    {selected.section_504_flag ? <Badge className="bg-purple-100 text-purple-700 border-purple-200">Section 504</Badge> : <Badge variant="outline" className="text-muted-foreground">No 504</Badge>}
                    {selected.mckinney_vento_flag ? <Badge className="bg-amber-100 text-amber-700 border-amber-200">McKinney-Vento</Badge> : <Badge variant="outline" className="text-muted-foreground">No MV</Badge>}
                    {selected.foster_care_flag ? <Badge className="bg-rose-100 text-rose-700 border-rose-200">Foster Care</Badge> : <Badge variant="outline" className="text-muted-foreground">No FC</Badge>}
                  </div>
                </div>

                {/* Childcare requests */}
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-1">
                    <Baby className="h-4 w-4" /> Childcare Pickup Requests
                  </h3>
                  {detailLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : childcare.length === 0 ? (
                    <p className="text-muted-foreground text-xs">No childcare pickup requests on file</p>
                  ) : (
                    <div className="space-y-2">
                      {childcare.map(c => (
                        <div key={c.id} className="p-3 rounded-lg bg-secondary space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{c.provider_name}</span>
                            <Badge variant="outline" className={STATUS_STYLES[c.status]?.className ?? ""}>{c.status}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{c.provider_address}</p>
                          <div className="flex gap-2 text-xs">
                            <span className="text-muted-foreground">Transport:</span>
                            <span className="font-medium">{c.transport_type === "both" ? "AM & PM" : c.transport_type.toUpperCase()}</span>
                          </div>
                          <div className="flex gap-2 text-xs">
                            <span className="text-muted-foreground">Days:</span>
                            <span className="font-medium">{c.days_needed?.join(", ") || "All"}</span>
                          </div>
                          {c.within_district !== null && (
                            <div className="flex gap-2 text-xs">
                              <span className="text-muted-foreground">Within district:</span>
                              <span className="font-medium">{c.within_district ? "Yes" : "No"}</span>
                            </div>
                          )}
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

      {/* Add Student placeholder dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Student Registration</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            To register a new student, parents should use the registration portal. Admins can direct parents to the registration page or create a registration on their behalf from the Residency Review section.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Students;
