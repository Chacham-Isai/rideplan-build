import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Search, CheckCircle, XCircle, Eye, FileText, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 25;

type Registration = {
  id: string;
  student_name: string;
  grade: string;
  school: string;
  dob: string;
  address_line: string;
  city: string;
  state: string;
  zip: string;
  status: string;
  school_year: string;
  created_at: string;
  parent_user_id: string;
  iep_flag: boolean;
  section_504_flag: boolean;
  mckinney_vento_flag: boolean;
  foster_care_flag: boolean;
};

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  denied: "bg-red-100 text-red-700 border-red-200",
  under_review: "bg-blue-100 text-blue-700 border-blue-200",
};

const AppResidencyAdmin = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [selected, setSelected] = useState<Registration | null>(null);
  const [docs, setDocs] = useState<any[]>([]);
  const [attestation, setAttestation] = useState<any>(null);
  const [actionNotes, setActionNotes] = useState("");
  const [acting, setActing] = useState(false);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from("student_registrations")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (statusFilter !== "all") query = query.eq("status", statusFilter as "pending" | "approved" | "denied" | "under_review");
    if (search) query = query.ilike("student_name", `%${search}%`);

    const { data, count } = await query;
    setRegistrations((data as Registration[]) ?? []);
    setTotalCount(count ?? 0);
    setLoading(false);
  }, [page, statusFilter, search]);

  useEffect(() => { fetchRegistrations(); }, [fetchRegistrations]);

  // Reset to first page when filters change
  useEffect(() => { setPage(0); }, [statusFilter, search]);

  const openDetail = async (reg: Registration) => {
    setSelected(reg);
    setActionNotes("");

    const [{ data: docData }, { data: attData }] = await Promise.all([
      supabase.from("residency_documents").select("*").eq("registration_id", reg.id),
      supabase.from("residency_attestations").select("*").eq("registration_id", reg.id).maybeSingle(),
    ]);
    setDocs(docData ?? []);
    setAttestation(attData);
  };

  const handleAction = async (action: "approved" | "denied") => {
    if (!selected || !user) return;
    setActing(true);
    try {
      const { error: updateErr } = await supabase
        .from("student_registrations")
        .update({ status: action })
        .eq("id", selected.id);
      if (updateErr) throw updateErr;

      await supabase.from("residency_audit_log").insert({
        registration_id: selected.id,
        admin_user_id: user.id,
        action,
        notes: actionNotes || null,
      });

      toast.success(`Registration ${action}`);
      setSelected(null);
      fetchRegistrations();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActing(false);
    }
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Residency Review</h1>
        <p className="text-sm text-muted-foreground">
          {totalCount} registration{totalCount !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by student name..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="under_review">Under Review</option>
          <option value="approved">Approved</option>
          <option value="denied">Denied</option>
        </select>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>School</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} className="h-32 text-center"><Loader2 className="h-6 w-6 mx-auto animate-spin text-primary" /></TableCell></TableRow>
              ) : registrations.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="h-32 text-center text-muted-foreground">No registrations found</TableCell></TableRow>
              ) : registrations.map(reg => (
                <TableRow key={reg.id}>
                  <TableCell className="font-medium">{reg.student_name}</TableCell>
                  <TableCell>{reg.grade}</TableCell>
                  <TableCell className="max-w-[140px] truncate">{reg.school}</TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[180px] truncate">{reg.address_line}, {reg.city}</TableCell>
                  <TableCell className="text-xs">{reg.school_year}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[reg.status] ?? ""}>{reg.status}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(reg.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => openDetail(reg)}><Eye className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalCount)} of {totalCount}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <span className="text-sm text-muted-foreground">Page {page + 1} of {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Detail / Review dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>Review: {selected.student_name}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-muted-foreground">Grade:</span> {selected.grade}</div>
                  <div><span className="text-muted-foreground">School:</span> {selected.school}</div>
                  <div><span className="text-muted-foreground">DOB:</span> {selected.dob}</div>
                  <div><span className="text-muted-foreground">Year:</span> {selected.school_year}</div>
                </div>

                <div>
                  <span className="text-muted-foreground">Address:</span> {selected.address_line}, {selected.city}, {selected.state} {selected.zip}
                </div>

                <div className="flex gap-2 flex-wrap">
                  {selected.iep_flag && <Badge variant="secondary">IEP</Badge>}
                  {selected.section_504_flag && <Badge variant="secondary">Section 504</Badge>}
                  {selected.mckinney_vento_flag && <Badge variant="secondary">McKinney-Vento</Badge>}
                  {selected.foster_care_flag && <Badge variant="secondary">Foster Care</Badge>}
                </div>

                <div>
                  <h3 className="font-semibold mb-1 flex items-center gap-1"><FileText className="h-4 w-4" /> Documents ({docs.length})</h3>
                  {docs.length === 0 ? (
                    <p className="text-muted-foreground">No documents uploaded</p>
                  ) : (
                    <ul className="space-y-1">
                      {docs.map(d => (
                        <li key={d.id} className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{d.document_type}</Badge>
                          <a href={d.file_url} target="_blank" rel="noopener" className="text-accent underline text-xs truncate">View</a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {attestation && (
                  <div className="p-3 bg-secondary rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Signed: {new Date(attestation.signed_at).toLocaleString()}</p>
                    <p className="font-display italic">{attestation.signature_text}</p>
                  </div>
                )}

                {(selected.status === "pending" || selected.status === "under_review") && (
                  <>
                    <div>
                      <span className="text-sm font-medium">Notes (optional)</span>
                      <Textarea value={actionNotes} onChange={e => setActionNotes(e.target.value)} placeholder="Reason for decision..." rows={2} />
                    </div>

                    <DialogFooter className="gap-2">
                      <Button variant="destructive" onClick={() => handleAction("denied")} disabled={acting}>
                        <XCircle className="h-4 w-4 mr-1" /> Deny
                      </Button>
                      <Button onClick={() => handleAction("approved")} disabled={acting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        <CheckCircle className="h-4 w-4 mr-1" /> Approve
                      </Button>
                    </DialogFooter>
                  </>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppResidencyAdmin;
