import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Users, Clock, CheckCircle, AlertTriangle, XCircle, Download,
  Eye, Flag, ThumbsUp, ThumbsDown, MessageSquare, FileText
} from "lucide-react";

type Registration = {
  id: string;
  parent_user_id: string;
  student_name: string;
  dob: string;
  grade: string;
  school: string;
  address_line: string;
  city: string;
  state: string;
  zip: string;
  district_boundary_check: boolean;
  iep_flag: boolean;
  mckinney_vento_flag: boolean;
  section_504_flag: boolean;
  foster_care_flag: boolean;
  status: string;
  school_year: string;
  created_at: string;
};

type AuditLog = {
  id: string;
  action: string;
  notes: string | null;
  created_at: string;
};

const statusColors: Record<string, string> = {
  pending: "bg-accent/20 text-accent-foreground",
  approved: "bg-success/20 text-green-700",
  denied: "bg-destructive/20 text-destructive",
  under_review: "bg-primary/10 text-primary",
};

const statusIcons: Record<string, any> = {
  pending: Clock,
  approved: CheckCircle,
  denied: XCircle,
  under_review: Eye,
};

// Auto-flag logic
const getFlags = (reg: Registration, allRegs: Registration[]) => {
  const flags: string[] = [];
  if (!reg.district_boundary_check) flags.push("GIS Mismatch");
  // Multi-registration: 4+ students at same address
  const sameAddr = allRegs.filter(
    r => r.address_line === reg.address_line && r.city === reg.city && r.zip === reg.zip
  );
  if (sameAddr.length >= 4) flags.push("Multi-Registration");
  return flags;
};

const ResidencyAdmin = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [schoolFilter, setSchoolFilter] = useState("all");
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [attestations, setAttestation] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [actionNotes, setActionNotes] = useState("");
  const [acting, setActing] = useState(false);

  const fetchRegistrations = async () => {
    setLoading(true);
    let query = supabase.from("student_registrations").select("*").order("created_at", { ascending: false });
    if (statusFilter !== "all") query = query.eq("status", statusFilter as any);
    if (search) query = query.or(`student_name.ilike.%${search}%,address_line.ilike.%${search}%`);
    const { data, error } = await query;
    if (error) toast.error(error.message);
    else setRegistrations((data as Registration[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchRegistrations(); }, [statusFilter, search]);

  const openDetail = async (reg: Registration) => {
    setSelectedReg(reg);
    setActionNotes("");
    // Fetch related data in parallel
    const [docsRes, attestRes, logsRes] = await Promise.all([
      supabase.from("residency_documents").select("*").eq("registration_id", reg.id),
      supabase.from("residency_attestations").select("*").eq("registration_id", reg.id),
      supabase.from("residency_audit_log").select("*").eq("registration_id", reg.id).order("created_at", { ascending: false }),
    ]);
    setDocuments(docsRes.data || []);
    setAttestation(attestRes.data || []);
    setAuditLogs((logsRes.data as AuditLog[]) || []);
  };

  const performAction = async (action: string) => {
    if (!selectedReg) return;
    setActing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      // Map action to status
      const statusMap: Record<string, string> = {
        approved: "approved",
        denied: "denied",
        flagged: "under_review",
        requested_info: "under_review",
      };
      const newStatus = statusMap[action];
      if (newStatus) {
        await supabase
          .from("student_registrations")
          .update({ status: newStatus as any })
          .eq("id", selectedReg.id);
      }

      await supabase.from("residency_audit_log").insert({
        registration_id: selectedReg.id,
        admin_user_id: session.user.id,
        action: action as any,
        notes: actionNotes || null,
      });

      toast.success(`Registration ${action}`);
      setSelectedReg(null);
      fetchRegistrations();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActing(false);
    }
  };

  // Stats
  const stats = useMemo(() => ({
    total: registrations.length,
    pending: registrations.filter(r => r.status === "pending").length,
    approved: registrations.filter(r => r.status === "approved").length,
    denied: registrations.filter(r => r.status === "denied").length,
    flagged: registrations.filter(r => getFlags(r, registrations).length > 0).length,
  }), [registrations]);

  const schools = useMemo(() => [...new Set(registrations.map(r => r.school))], [registrations]);

  const filtered = useMemo(() => {
    let result = registrations;
    if (schoolFilter !== "all") result = result.filter(r => r.school === schoolFilter);
    return result;
  }, [registrations, schoolFilter]);

  const exportCSV = (flaggedOnly: boolean) => {
    const rows = flaggedOnly ? filtered.filter(r => getFlags(r, registrations).length > 0) : filtered;
    const headers = ["Student Name", "Grade", "School", "Address", "City", "State", "ZIP", "Status", "Flags", "Submitted"];
    const csv = [
      headers.join(","),
      ...rows.map(r => [
        `"${r.student_name}"`, r.grade, `"${r.school}"`, `"${r.address_line}"`,
        `"${r.city}"`, r.state, r.zip, r.status,
        `"${getFlags(r, registrations).join("; ")}"`,
        new Date(r.created_at).toLocaleDateString(),
      ].join(","))
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = flaggedOnly ? "flagged-registrations.csv" : "all-registrations.csv";
    a.click();
  };

  const statCards = [
    { label: "Total", value: stats.total, icon: Users, color: "text-primary" },
    { label: "Pending", value: stats.pending, icon: Clock, color: "text-accent" },
    { label: "Approved", value: stats.approved, icon: CheckCircle, color: "text-green-600" },
    { label: "Flagged", value: stats.flagged, icon: AlertTriangle, color: "text-orange-500" },
    { label: "Denied", value: stats.denied, icon: XCircle, color: "text-destructive" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
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

      {/* Filters & Export */}
      <div className="flex flex-wrap gap-3 items-center">
        <Input placeholder="Search student or address..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="denied">Denied</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
          </SelectContent>
        </Select>
        <Select value={schoolFilter} onValueChange={setSchoolFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="School" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Schools</SelectItem>
            {schools.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportCSV(true)}>
            <Download className="w-4 h-4 mr-1" /> Flagged
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportCSV(false)}>
            <Download className="w-4 h-4 mr-1" /> All
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>School</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Flags</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No registrations found</TableCell></TableRow>
            ) : filtered.map(r => {
              const flags = getFlags(r, registrations);
              return (
                <TableRow key={r.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openDetail(r)}>
                  <TableCell className="font-medium">{r.student_name}</TableCell>
                  <TableCell className="text-sm">{r.address_line}, {r.city}</TableCell>
                  <TableCell className="text-sm">{r.school}</TableCell>
                  <TableCell className="text-sm">{r.grade}</TableCell>
                  <TableCell><Badge className={statusColors[r.status] || ""}>{r.status}</Badge></TableCell>
                  <TableCell>
                    {flags.map(f => (
                      <Badge key={f} variant="outline" className="mr-1 text-orange-600 border-orange-300 text-xs">{f}</Badge>
                    ))}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); openDetail(r); }}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">{filtered.length} registration(s)</p>

      {/* Detail Dialog */}
      <Dialog open={!!selectedReg} onOpenChange={open => { if (!open) setSelectedReg(null); }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedReg && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display">Registration Detail — {selectedReg.student_name}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 text-sm">
                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div><span className="text-muted-foreground">Grade:</span> {selectedReg.grade}</div>
                  <div><span className="text-muted-foreground">School:</span> {selectedReg.school}</div>
                  <div><span className="text-muted-foreground">DOB:</span> {new Date(selectedReg.dob).toLocaleDateString()}</div>
                  <div><span className="text-muted-foreground">School Year:</span> {selectedReg.school_year}</div>
                  <div className="col-span-2"><span className="text-muted-foreground">Address:</span> {selectedReg.address_line}, {selectedReg.city}, {selectedReg.state} {selectedReg.zip}</div>
                </div>

                {/* Flags */}
                <div className="flex flex-wrap gap-2">
                  {selectedReg.iep_flag && <Badge variant="secondary">IEP</Badge>}
                  {selectedReg.section_504_flag && <Badge variant="secondary">Section 504</Badge>}
                  {selectedReg.mckinney_vento_flag && <Badge variant="secondary">McKinney-Vento</Badge>}
                  {selectedReg.foster_care_flag && <Badge variant="secondary">Foster Care</Badge>}
                  {getFlags(selectedReg, registrations).map(f => (
                    <Badge key={f} variant="outline" className="text-orange-600 border-orange-300">{f}</Badge>
                  ))}
                </div>

                {/* Documents */}
                <div>
                  <h3 className="font-semibold text-primary mb-2 flex items-center gap-2"><FileText className="w-4 h-4" /> Documents ({documents.length})</h3>
                  {documents.length === 0 ? (
                    <Badge variant="outline" className="text-orange-600 border-orange-300">Missing Documents</Badge>
                  ) : (
                    <div className="space-y-2">
                      {documents.map((doc: any) => (
                        <div key={doc.id} className="flex items-center justify-between p-2 bg-secondary rounded">
                          <span>{doc.document_type}</span>
                          <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-accent underline text-xs">View</a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Attestation */}
                {attestations.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-primary mb-2">Attestation</h3>
                    {attestations.map((att: any) => (
                      <div key={att.id} className="p-3 bg-secondary rounded text-xs space-y-1">
                        <p>Signed: <span className="font-display italic">{att.signature_text}</span></p>
                        <p className="text-muted-foreground">At: {new Date(att.signed_at).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Audit History */}
                {auditLogs.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-primary mb-2">Action History</h3>
                    <div className="space-y-1">
                      {auditLogs.map(log => (
                        <div key={log.id} className="text-xs p-2 bg-muted rounded flex justify-between">
                          <span className="capitalize font-medium">{log.action.replace("_", " ")}</span>
                          <span className="text-muted-foreground">{new Date(log.created_at).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Admin Actions */}
                <div className="border-t pt-4 space-y-3">
                  <Textarea
                    placeholder="Admin notes (optional)..."
                    value={actionNotes}
                    onChange={e => setActionNotes(e.target.value)}
                    rows={2}
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => performAction("approved")} disabled={acting} className="bg-green-600 hover:bg-green-700 text-white">
                      <ThumbsUp className="w-4 h-4 mr-1" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => performAction("requested_info")} disabled={acting}>
                      <MessageSquare className="w-4 h-4 mr-1" /> Request Info
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => performAction("flagged")} disabled={acting} className="border-orange-300 text-orange-600 hover:bg-orange-50">
                      <Flag className="w-4 h-4 mr-1" /> Flag
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => performAction("denied")} disabled={acting}>
                      <ThumbsDown className="w-4 h-4 mr-1" /> Deny
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResidencyAdmin;
