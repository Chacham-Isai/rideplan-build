import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { FileText, Plus, ShieldCheck, Users, AlertTriangle, BookOpen, Lock, CheckCircle, XCircle, Clock } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-accent/20 text-accent-foreground",
  filed: "bg-success/20 text-green-700",
  overdue: "bg-destructive/20 text-destructive",
  active: "bg-success/20 text-green-700",
  inactive: "bg-muted text-muted-foreground",
  compliant: "bg-success/20 text-green-700",
  "non-compliant": "bg-destructive/20 text-destructive",
  investigating: "bg-accent/20 text-accent-foreground",
  resolved: "bg-success/20 text-green-700",
  upcoming: "bg-primary/10 text-primary",
  "in-progress": "bg-accent/20 text-accent-foreground",
  completed: "bg-success/20 text-green-700",
};

const ComplianceAdmin = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [mvStudents, setMvStudents] = useState<any[]>([]);
  const [edLaw, setEdLaw] = useState<any[]>([]);
  const [training, setTraining] = useState<any[]>([]);
  const [breaches, setBreaches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [showAddReport, setShowAddReport] = useState(false);
  const [showAddMV, setShowAddMV] = useState(false);
  const [showAddEdLaw, setShowAddEdLaw] = useState(false);
  const [showAddBreach, setShowAddBreach] = useState(false);

  // Forms
  const [reportForm, setReportForm] = useState({
    report_type: "BEDS", title: "", school_year: "2025-2026",
    filing_deadline: "", student_count: "", route_count: "",
    total_expenditure: "", state_aid_claimed: "", notes: "",
  });
  const [mvForm, setMvForm] = useState({
    student_name: "", school: "", grade: "", living_situation: "doubled_up",
    school_of_origin: "", current_address: "", transportation_provided: false,
    liaison_contact: "", enrollment_date: "", notes: "",
  });
  const [edLawForm, setEdLawForm] = useState({
    contractor_name: "", data_access_level: "student_pii",
    agreement_signed: false, agreement_date: "", annual_review_date: "",
    parents_notified: false, encryption_verified: false, breach_plan_filed: false, notes: "",
  });
  const [breachForm, setBreachForm] = useState({
    incident_date: "", discovered_date: "", description: "",
    data_types_affected: "", students_affected: "", severity: "low",
    remediation_steps: "",
  });

  const fetchData = async () => {
    setLoading(true);
    const [r, mv, ed, tr, br] = await Promise.all([
      supabase.from("compliance_reports").select("*").order("created_at", { ascending: false }),
      supabase.from("mckinney_vento_students").select("*").order("created_at", { ascending: false }),
      supabase.from("ed_law_2d_contractors").select("*").order("created_at", { ascending: false }),
      supabase.from("compliance_training").select("*").order("due_date"),
      supabase.from("breach_incidents").select("*").order("incident_date", { ascending: false }),
    ]);
    setReports(r.data || []);
    setMvStudents(mv.data || []);
    setEdLaw(ed.data || []);
    setTraining(tr.data || []);
    setBreaches(br.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // === AUDIT READINESS SCORE ===
  const auditScore = useMemo(() => {
    let total = 0, earned = 0;

    // BEDS/STAC filed on time
    const filingItems = reports.length || 1;
    total += 25;
    earned += reports.filter(r => r.status === "filed").length / filingItems * 25;

    // McKinney-Vento: all have transport
    total += 25;
    const mvWithTransport = mvStudents.filter(s => s.transportation_provided).length;
    earned += mvStudents.length > 0 ? (mvWithTransport / mvStudents.length) * 25 : 25;

    // Ed Law 2-d: all compliant
    total += 25;
    const edCompliant = edLaw.filter(e => e.agreement_signed && e.encryption_verified && e.breach_plan_filed).length;
    earned += edLaw.length > 0 ? (edCompliant / edLaw.length) * 25 : 25;

    // Training: all completed
    total += 25;
    const trainingDone = training.filter(t => t.status === "completed").length;
    earned += training.length > 0 ? (trainingDone / training.length) * 25 : 25;

    return Math.round(earned);
  }, [reports, mvStudents, edLaw, training]);

  // === HANDLERS ===
  const addReport = async () => {
    const { error } = await supabase.from("compliance_reports").insert({
      district_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      report_type: reportForm.report_type, title: reportForm.title,
      school_year: reportForm.school_year,
      filing_deadline: reportForm.filing_deadline || null,
      student_count: Number(reportForm.student_count) || 0,
      route_count: Number(reportForm.route_count) || 0,
      total_expenditure: Number(reportForm.total_expenditure) || 0,
      state_aid_claimed: Number(reportForm.state_aid_claimed) || 0,
      notes: reportForm.notes || null,
    });
    if (error) toast.error(error.message);
    else { toast.success("Report added"); setShowAddReport(false); fetchData(); }
  };

  const addMVStudent = async () => {
    const { error } = await supabase.from("mckinney_vento_students").insert({
      district_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      student_name: mvForm.student_name, school: mvForm.school, grade: mvForm.grade,
      living_situation: mvForm.living_situation,
      school_of_origin: mvForm.school_of_origin || null,
      current_address: mvForm.current_address || null,
      transportation_provided: mvForm.transportation_provided,
      liaison_contact: mvForm.liaison_contact || null,
      enrollment_date: mvForm.enrollment_date || null,
      notes: mvForm.notes || null,
    });
    if (error) toast.error(error.message);
    else { toast.success("Student added"); setShowAddMV(false); fetchData(); }
  };

  const addEdLawContractor = async () => {
    const { error } = await supabase.from("ed_law_2d_contractors").insert({
      district_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      contractor_name: edLawForm.contractor_name,
      data_access_level: edLawForm.data_access_level,
      agreement_signed: edLawForm.agreement_signed,
      agreement_date: edLawForm.agreement_date || null,
      annual_review_date: edLawForm.annual_review_date || null,
      parents_notified: edLawForm.parents_notified,
      encryption_verified: edLawForm.encryption_verified,
      breach_plan_filed: edLawForm.breach_plan_filed,
      status: edLawForm.agreement_signed && edLawForm.encryption_verified && edLawForm.breach_plan_filed ? "compliant" : "non-compliant",
      notes: edLawForm.notes || null,
    });
    if (error) toast.error(error.message);
    else { toast.success("Contractor added"); setShowAddEdLaw(false); fetchData(); }
  };

  const addBreach = async () => {
    // Note: old admin panel lacks district context; use RLS to scope
    const { error } = await supabase.from("breach_incidents").insert({
      district_id: "00000000-0000-0000-0000-000000000000", // Will be rejected by RLS if not matching user's district
      incident_date: breachForm.incident_date,
      discovered_date: breachForm.discovered_date,
      description: breachForm.description,
      data_types_affected: breachForm.data_types_affected || null,
      students_affected: Number(breachForm.students_affected) || 0,
      severity: breachForm.severity,
      remediation_steps: breachForm.remediation_steps || null,
    });
    if (error) toast.error(error.message);
    else { toast.success("Incident logged"); setShowAddBreach(false); fetchData(); }
  };

  const scoreColor = auditScore >= 80 ? "text-green-600" : auditScore >= 60 ? "text-orange-500" : "text-destructive";
  const scoreLabel = auditScore >= 80 ? "Audit Ready" : auditScore >= 60 ? "Needs Attention" : "At Risk";

  return (
    <div className="space-y-6">
      {/* Audit Readiness Score */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="p-4 col-span-2 md:col-span-1 flex flex-col items-center justify-center">
          <p className={`text-4xl font-bold ${scoreColor}`}>{auditScore}%</p>
          <p className="text-xs text-muted-foreground">Audit Readiness</p>
          <Badge className={`mt-1 ${auditScore >= 80 ? "bg-success/20 text-green-700" : auditScore >= 60 ? "bg-orange-100 text-orange-700" : "bg-destructive/20 text-destructive"}`}>{scoreLabel}</Badge>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <FileText className="w-7 h-7 text-primary" />
          <div><p className="text-xl font-bold text-primary">{reports.length}</p><p className="text-xs text-muted-foreground">BEDS/STAC Reports</p></div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <Users className="w-7 h-7 text-accent" />
          <div><p className="text-xl font-bold text-primary">{mvStudents.length}</p><p className="text-xs text-muted-foreground">MV Students</p></div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <Lock className="w-7 h-7 text-primary" />
          <div><p className="text-xl font-bold text-primary">{edLaw.length}</p><p className="text-xs text-muted-foreground">Ed Law 2-d Contractors</p></div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <AlertTriangle className="w-7 h-7 text-destructive" />
          <div><p className="text-xl font-bold text-primary">{breaches.filter(b => b.status === "investigating").length}</p><p className="text-xs text-muted-foreground">Open Incidents</p></div>
        </Card>
      </div>

      <Tabs defaultValue="beds" className="space-y-4">
        <TabsList>
          <TabsTrigger value="beds">BEDS/STAC</TabsTrigger>
          <TabsTrigger value="mv">McKinney-Vento</TabsTrigger>
          <TabsTrigger value="edlaw">Ed Law 2-d</TabsTrigger>
          <TabsTrigger value="readiness">Audit Readiness</TabsTrigger>
        </TabsList>

        {/* BEDS/STAC TAB */}
        <TabsContent value="beds" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowAddReport(true)} className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="w-4 h-4 mr-1" /> Add Report
            </Button>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>School Year</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Expenditure</TableHead>
                  <TableHead>State Aid</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
                ) : reports.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No reports</TableCell></TableRow>
                ) : reports.map(r => (
                  <TableRow key={r.id}>
                    <TableCell><Badge variant="outline">{r.report_type}</Badge></TableCell>
                    <TableCell className="font-medium">{r.title}</TableCell>
                    <TableCell className="text-sm">{r.school_year}</TableCell>
                    <TableCell className="text-sm">{r.filing_deadline ? new Date(r.filing_deadline).toLocaleDateString() : "—"}</TableCell>
                    <TableCell>{r.student_count}</TableCell>
                    <TableCell>${Number(r.total_expenditure).toLocaleString()}</TableCell>
                    <TableCell>${Number(r.state_aid_claimed).toLocaleString()}</TableCell>
                    <TableCell><Badge className={statusColors[r.status] || ""}>{r.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* MCKINNEY-VENTO TAB */}
        <TabsContent value="mv" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-sm">
                Transport Coverage: {mvStudents.length > 0 ? `${Math.round(mvStudents.filter(s => s.transportation_provided).length / mvStudents.length * 100)}%` : "N/A"}
              </Badge>
            </div>
            <Button onClick={() => setShowAddMV(true)} className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="w-4 h-4 mr-1" /> Add Student
            </Button>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>School</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Living Situation</TableHead>
                  <TableHead>Transport</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
                ) : mvStudents.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No students</TableCell></TableRow>
                ) : mvStudents.map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.student_name}</TableCell>
                    <TableCell className="text-sm">{s.school}</TableCell>
                    <TableCell>{s.grade}</TableCell>
                    <TableCell className="text-sm capitalize">{s.living_situation.replace(/_/g, " ")}</TableCell>
                    <TableCell>
                      {s.transportation_provided
                        ? <CheckCircle className="w-4 h-4 text-green-600" />
                        : <XCircle className="w-4 h-4 text-destructive" />}
                    </TableCell>
                    <TableCell><Badge className={statusColors[s.status] || ""}>{s.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ED LAW 2-D TAB */}
        <TabsContent value="edlaw" className="space-y-4">
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowAddBreach(true)}>
              <AlertTriangle className="w-4 h-4 mr-1" /> Log Breach
            </Button>
            <Button onClick={() => setShowAddEdLaw(true)} className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="w-4 h-4 mr-1" /> Add Contractor
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contractor</TableHead>
                  <TableHead>Data Access</TableHead>
                  <TableHead>Agreement</TableHead>
                  <TableHead>Encryption</TableHead>
                  <TableHead>Breach Plan</TableHead>
                  <TableHead>Parents Notified</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
                ) : edLaw.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No contractors</TableCell></TableRow>
                ) : edLaw.map(e => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.contractor_name}</TableCell>
                    <TableCell className="text-sm capitalize">{e.data_access_level.replace(/_/g, " ")}</TableCell>
                    <TableCell>{e.agreement_signed ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-destructive" />}</TableCell>
                    <TableCell>{e.encryption_verified ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-destructive" />}</TableCell>
                    <TableCell>{e.breach_plan_filed ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-destructive" />}</TableCell>
                    <TableCell>{e.parents_notified ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-destructive" />}</TableCell>
                    <TableCell><Badge className={statusColors[e.status] || ""}>{e.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {breaches.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-primary flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Breach Incidents</h3>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>Notified</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {breaches.map(b => (
                      <TableRow key={b.id}>
                        <TableCell className="text-sm">{new Date(b.incident_date).toLocaleDateString()}</TableCell>
                        <TableCell className="text-sm max-w-xs truncate">{b.description}</TableCell>
                        <TableCell><Badge className={b.severity === "high" ? "bg-destructive/20 text-destructive" : b.severity === "medium" ? "bg-orange-100 text-orange-700" : "bg-muted text-muted-foreground"}>{b.severity}</Badge></TableCell>
                        <TableCell>{b.students_affected}</TableCell>
                        <TableCell>{b.notification_sent ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-destructive" />}</TableCell>
                        <TableCell><Badge className={statusColors[b.status] || ""}>{b.status}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </TabsContent>

        {/* AUDIT READINESS TAB */}
        <TabsContent value="readiness" className="space-y-4">
          <Card className="p-6 text-center">
            <p className={`text-6xl font-bold ${scoreColor}`}>{auditScore}%</p>
            <p className="text-lg text-muted-foreground mt-1">Overall Audit Readiness Score</p>
            <Progress value={auditScore} className="w-64 mx-auto mt-3 h-3" />
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                title: "BEDS/STAC Filings",
                icon: FileText,
                score: reports.length > 0 ? Math.round(reports.filter(r => r.status === "filed").length / reports.length * 100) : 100,
                detail: `${reports.filter(r => r.status === "filed").length}/${reports.length} filed`,
              },
              {
                title: "McKinney-Vento Compliance",
                icon: Users,
                score: mvStudents.length > 0 ? Math.round(mvStudents.filter(s => s.transportation_provided).length / mvStudents.length * 100) : 100,
                detail: `${mvStudents.filter(s => s.transportation_provided).length}/${mvStudents.length} with transport`,
              },
              {
                title: "Ed Law 2-d Compliance",
                icon: Lock,
                score: edLaw.length > 0 ? Math.round(edLaw.filter(e => e.agreement_signed && e.encryption_verified && e.breach_plan_filed).length / edLaw.length * 100) : 100,
                detail: `${edLaw.filter(e => e.agreement_signed && e.encryption_verified && e.breach_plan_filed).length}/${edLaw.length} fully compliant`,
              },
              {
                title: "Training Completion",
                icon: BookOpen,
                score: training.length > 0 ? Math.round(training.filter(t => t.status === "completed").length / training.length * 100) : 100,
                detail: `${training.filter(t => t.status === "completed").length}/${training.length} completed`,
              },
            ].map(item => (
              <Card key={item.title} className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <item.icon className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">{item.title}</h3>
                  <Badge className={`ml-auto ${item.score >= 80 ? "bg-success/20 text-green-700" : item.score >= 50 ? "bg-orange-100 text-orange-700" : "bg-destructive/20 text-destructive"}`}>{item.score}%</Badge>
                </div>
                <Progress value={item.score} className="h-2 mb-2" />
                <p className="text-xs text-muted-foreground">{item.detail}</p>
              </Card>
            ))}
          </div>

          {breaches.filter(b => b.status === "investigating").length > 0 && (
            <Card className="p-4 border-l-4 border-l-destructive">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <span className="font-semibold text-destructive">{breaches.filter(b => b.status === "investigating").length} Open Breach Investigation(s)</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Active breach incidents require immediate attention for audit readiness.</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Report Dialog */}
      <Dialog open={showAddReport} onOpenChange={setShowAddReport}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="font-display">Add BEDS/STAC Report</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Type</Label>
                <Select value={reportForm.report_type} onValueChange={v => setReportForm(f => ({ ...f, report_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BEDS">BEDS</SelectItem>
                    <SelectItem value="STAC">STAC</SelectItem>
                    <SelectItem value="AIDABLE">Aidable Pupil</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>School Year</Label><Input value={reportForm.school_year} onChange={e => setReportForm(f => ({ ...f, school_year: e.target.value }))} /></div>
            </div>
            <div><Label>Title</Label><Input value={reportForm.title} onChange={e => setReportForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div><Label>Filing Deadline</Label><Input type="date" value={reportForm.filing_deadline} onChange={e => setReportForm(f => ({ ...f, filing_deadline: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Students</Label><Input type="number" value={reportForm.student_count} onChange={e => setReportForm(f => ({ ...f, student_count: e.target.value }))} /></div>
              <div><Label>Routes</Label><Input type="number" value={reportForm.route_count} onChange={e => setReportForm(f => ({ ...f, route_count: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Total Expenditure ($)</Label><Input type="number" value={reportForm.total_expenditure} onChange={e => setReportForm(f => ({ ...f, total_expenditure: e.target.value }))} /></div>
              <div><Label>State Aid Claimed ($)</Label><Input type="number" value={reportForm.state_aid_claimed} onChange={e => setReportForm(f => ({ ...f, state_aid_claimed: e.target.value }))} /></div>
            </div>
            <div><Label>Notes</Label><Textarea value={reportForm.notes} onChange={e => setReportForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
            <Button onClick={addReport} className="w-full bg-accent text-accent-foreground">Save Report</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add MV Student Dialog */}
      <Dialog open={showAddMV} onOpenChange={setShowAddMV}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="font-display">Add McKinney-Vento Student</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Student Name</Label><Input value={mvForm.student_name} onChange={e => setMvForm(f => ({ ...f, student_name: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>School</Label><Input value={mvForm.school} onChange={e => setMvForm(f => ({ ...f, school: e.target.value }))} /></div>
              <div><Label>Grade</Label><Input value={mvForm.grade} onChange={e => setMvForm(f => ({ ...f, grade: e.target.value }))} /></div>
            </div>
            <div><Label>Living Situation</Label>
              <Select value={mvForm.living_situation} onValueChange={v => setMvForm(f => ({ ...f, living_situation: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="doubled_up">Doubled Up</SelectItem>
                  <SelectItem value="shelter">Shelter</SelectItem>
                  <SelectItem value="unsheltered">Unsheltered</SelectItem>
                  <SelectItem value="hotel_motel">Hotel/Motel</SelectItem>
                  <SelectItem value="unaccompanied_youth">Unaccompanied Youth</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>School of Origin</Label><Input value={mvForm.school_of_origin} onChange={e => setMvForm(f => ({ ...f, school_of_origin: e.target.value }))} /></div>
            <div><Label>Current Address</Label><Input value={mvForm.current_address} onChange={e => setMvForm(f => ({ ...f, current_address: e.target.value }))} /></div>
            <div className="flex items-center gap-2">
              <Switch checked={mvForm.transportation_provided} onCheckedChange={v => setMvForm(f => ({ ...f, transportation_provided: v }))} />
              <Label>Transportation Provided</Label>
            </div>
            <div><Label>Liaison Contact</Label><Input value={mvForm.liaison_contact} onChange={e => setMvForm(f => ({ ...f, liaison_contact: e.target.value }))} /></div>
            <Button onClick={addMVStudent} className="w-full bg-accent text-accent-foreground">Save Student</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Ed Law 2-d Contractor Dialog */}
      <Dialog open={showAddEdLaw} onOpenChange={setShowAddEdLaw}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="font-display">Add Ed Law 2-d Contractor</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Contractor Name</Label><Input value={edLawForm.contractor_name} onChange={e => setEdLawForm(f => ({ ...f, contractor_name: e.target.value }))} /></div>
            <div><Label>Data Access Level</Label>
              <Select value={edLawForm.data_access_level} onValueChange={v => setEdLawForm(f => ({ ...f, data_access_level: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="student_pii">Student PII</SelectItem>
                  <SelectItem value="academic_records">Academic Records</SelectItem>
                  <SelectItem value="transportation_data">Transportation Data</SelectItem>
                  <SelectItem value="full_access">Full Access</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2"><Switch checked={edLawForm.agreement_signed} onCheckedChange={v => setEdLawForm(f => ({ ...f, agreement_signed: v }))} /><Label>Data Privacy Agreement Signed</Label></div>
              <div className="flex items-center gap-2"><Switch checked={edLawForm.encryption_verified} onCheckedChange={v => setEdLawForm(f => ({ ...f, encryption_verified: v }))} /><Label>Encryption Verified</Label></div>
              <div className="flex items-center gap-2"><Switch checked={edLawForm.breach_plan_filed} onCheckedChange={v => setEdLawForm(f => ({ ...f, breach_plan_filed: v }))} /><Label>Breach Notification Plan Filed</Label></div>
              <div className="flex items-center gap-2"><Switch checked={edLawForm.parents_notified} onCheckedChange={v => setEdLawForm(f => ({ ...f, parents_notified: v }))} /><Label>Parents/Guardians Notified</Label></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Agreement Date</Label><Input type="date" value={edLawForm.agreement_date} onChange={e => setEdLawForm(f => ({ ...f, agreement_date: e.target.value }))} /></div>
              <div><Label>Annual Review Date</Label><Input type="date" value={edLawForm.annual_review_date} onChange={e => setEdLawForm(f => ({ ...f, annual_review_date: e.target.value }))} /></div>
            </div>
            <div><Label>Notes</Label><Textarea value={edLawForm.notes} onChange={e => setEdLawForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
            <Button onClick={addEdLawContractor} className="w-full bg-accent text-accent-foreground">Save Contractor</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Breach Incident Dialog */}
      <Dialog open={showAddBreach} onOpenChange={setShowAddBreach}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="font-display">Log Breach Incident</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Incident Date</Label><Input type="date" value={breachForm.incident_date} onChange={e => setBreachForm(f => ({ ...f, incident_date: e.target.value }))} /></div>
              <div><Label>Discovered Date</Label><Input type="date" value={breachForm.discovered_date} onChange={e => setBreachForm(f => ({ ...f, discovered_date: e.target.value }))} /></div>
            </div>
            <div><Label>Description</Label><Textarea value={breachForm.description} onChange={e => setBreachForm(f => ({ ...f, description: e.target.value }))} rows={3} /></div>
            <div><Label>Data Types Affected</Label><Input value={breachForm.data_types_affected} onChange={e => setBreachForm(f => ({ ...f, data_types_affected: e.target.value }))} placeholder="e.g. names, addresses, IEP status" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Students Affected</Label><Input type="number" value={breachForm.students_affected} onChange={e => setBreachForm(f => ({ ...f, students_affected: e.target.value }))} /></div>
              <div><Label>Severity</Label>
                <Select value={breachForm.severity} onValueChange={v => setBreachForm(f => ({ ...f, severity: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Remediation Steps</Label><Textarea value={breachForm.remediation_steps} onChange={e => setBreachForm(f => ({ ...f, remediation_steps: e.target.value }))} rows={2} /></div>
            <Button onClick={addBreach} className="w-full bg-accent text-accent-foreground">Log Incident</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ComplianceAdmin;
