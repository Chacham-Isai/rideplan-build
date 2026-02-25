import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useDistrict } from "@/contexts/DistrictContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
import { FileText, GraduationCap, Shield, Users, Plus, AlertTriangle, Loader2, CheckCircle } from "lucide-react";
import { NysedAdvisorWidget } from "@/components/app/NysedAdvisorWidget";
import { toast } from "sonner";

const statusStyle = (s: string) => {
  if (["filed", "completed", "compliant", "active"].includes(s)) return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (["pending", "upcoming", "in_progress"].includes(s)) return "bg-amber-100 text-amber-700 border-amber-200";
  if (["overdue", "non_compliant"].includes(s)) return "bg-red-100 text-red-700 border-red-200";
  return "bg-gray-100 text-gray-600 border-gray-200";
};

const Compliance = () => {
  const { district, profile } = useDistrict();
  const { user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [training, setTraining] = useState<any[]>([]);
  const [mvStudents, setMvStudents] = useState<any[]>([]);
  const [edLaw, setEdLaw] = useState<any[]>([]);
  const [breaches, setBreaches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Add MV dialog
  const [showAddMV, setShowAddMV] = useState(false);
  const [mvForm, setMvForm] = useState({ student_name: "", grade: "", school: "", living_situation: "doubled_up", school_of_origin: "" });

  // Add training
  const [showAddTraining, setShowAddTraining] = useState(false);
  const [trainingForm, setTrainingForm] = useState({ title: "", training_type: "data_privacy", required_for: "all_staff", due_date: "", total_required: "" });

  // Add breach
  const [showAddBreach, setShowAddBreach] = useState(false);
  const [breachForm, setBreachForm] = useState({ incident_date: "", discovered_date: "", description: "", severity: "low", students_affected: "" });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [rRes, tRes, mvRes, elRes, bRes] = await Promise.all([
      supabase.from("compliance_reports").select("*").order("created_at", { ascending: false }),
      supabase.from("compliance_training").select("*").order("due_date", { ascending: true }),
      supabase.from("mckinney_vento_students").select("*").order("created_at", { ascending: false }),
      supabase.from("ed_law_2d_contractors").select("*").order("created_at", { ascending: false }),
      supabase.from("breach_incidents").select("*").order("incident_date", { ascending: false }),
    ]);
    setReports(rRes.data ?? []);
    setTraining(tRes.data ?? []);
    setMvStudents(mvRes.data ?? []);
    setEdLaw(elRes.data ?? []);
    setBreaches(bRes.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  const generateReport = async (type: string) => {
    if (!district || !user) return;
    setGenerating(true);
    const now = new Date();
    const year = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
    const schoolYear = `${year}-${year + 1}`;

    const { error } = await supabase.from("compliance_reports").insert({
      district_id: district.id,
      created_by: user.id,
      report_type: type,
      title: `${type.toUpperCase()} Report — ${schoolYear}`,
      school_year: schoolYear,
      status: "pending",
      filing_deadline: type === "beds" ? `${year + 1}-02-01` : `${year + 1}-06-30`,
    });
    if (error) toast.error(error.message);
    else { toast.success(`${type.toUpperCase()} report generated`); fetchAll(); }
    setGenerating(false);
  };

  const toggleMVTransport = async (id: string, current: boolean) => {
    const { error } = await supabase.from("mckinney_vento_students").update({ transportation_provided: !current }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Updated"); fetchAll(); }
  };

  const addMVStudent = async () => {
    if (!mvForm.student_name || !mvForm.grade || !mvForm.school || !district) { toast.error("Fill required fields"); return; }
    const { error } = await supabase.from("mckinney_vento_students").insert({
      district_id: district.id,
      student_name: mvForm.student_name,
      grade: mvForm.grade,
      school: mvForm.school,
      living_situation: mvForm.living_situation,
      school_of_origin: mvForm.school_of_origin || null,
    });
    if (error) toast.error(error.message);
    else { toast.success("Student added"); setShowAddMV(false); fetchAll(); }
  };

  const addTraining = async () => {
    if (!trainingForm.title || !district) { toast.error("Title required"); return; }
    const { error } = await supabase.from("compliance_training").insert({
      district_id: district.id,
      title: trainingForm.title,
      training_type: trainingForm.training_type,
      required_for: trainingForm.required_for,
      due_date: trainingForm.due_date || null,
      total_required: parseInt(trainingForm.total_required) || 0,
    });
    if (error) toast.error(error.message);
    else { toast.success("Training added"); setShowAddTraining(false); fetchAll(); }
  };

  const addBreach = async () => {
    if (!breachForm.description || !breachForm.incident_date || !breachForm.discovered_date) { toast.error("Fill required fields"); return; }
    const { error } = await supabase.from("breach_incidents").insert({
      incident_date: breachForm.incident_date,
      discovered_date: breachForm.discovered_date,
      description: breachForm.description,
      severity: breachForm.severity,
      students_affected: parseInt(breachForm.students_affected) || 0,
    });
    if (error) toast.error(error.message);
    else { toast.success("Breach logged"); setShowAddBreach(false); fetchAll(); }
  };

  // Audit readiness
  const bedsScore = reports.some(r => r.report_type === "beds") ? 100 : 0;
  const stacScore = reports.some(r => r.report_type === "stac") ? 100 : 0;
  const mvScore = mvStudents.length ? Math.round(mvStudents.filter(s => s.transportation_provided).length / mvStudents.length * 100) : 100;
  const edLawScore = edLaw.length ? Math.round(edLaw.filter(e => e.agreement_signed).length / edLaw.length * 100) : 100;
  const trainingScore = training.length ? Math.round(training.filter(t => t.status === "completed").length / training.length * 100) : 100;
  const overallScore = Math.round((bedsScore + stacScore + mvScore + edLawScore + trainingScore) / 5);

  const mvWithoutTransport = mvStudents.filter(s => !s.transportation_provided).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Compliance</h1>
        <p className="text-sm text-muted-foreground">State reporting, training, Ed Law 2-d & McKinney-Vento</p>
      </div>

      {/* NYSED Law Advisor */}
      <NysedAdvisorWidget />

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="border-0 shadow-sm"><CardContent className="p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">State Reports</p>
          <p className="mt-1 text-2xl font-bold">{reports.length}</p>
          <p className="text-xs text-muted-foreground">{reports.filter(r => r.status === "pending").length} pending</p>
        </CardContent></Card>
        <Card className="border-0 shadow-sm"><CardContent className="p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Training Programs</p>
          <p className="mt-1 text-2xl font-bold">{training.length}</p>
          <p className="text-xs text-muted-foreground">{training.filter(t => t.status === "completed").length} completed</p>
        </CardContent></Card>
        <Card className="border-0 shadow-sm"><CardContent className="p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">McKinney-Vento</p>
          <p className="mt-1 text-2xl font-bold">{mvStudents.length}</p>
          <p className="text-xs text-muted-foreground">{mvStudents.filter(s => s.transportation_provided).length} with transport</p>
        </CardContent></Card>
        <Card className="border-0 shadow-sm"><CardContent className="p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Audit Score</p>
          <p className={`mt-1 text-2xl font-bold ${overallScore >= 80 ? "text-emerald-600" : overallScore >= 50 ? "text-amber-600" : "text-red-600"}`}>{overallScore}%</p>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="reports">
        <TabsList>
          <TabsTrigger value="reports"><FileText className="mr-1.5 h-4 w-4" />BEDS/STAC</TabsTrigger>
          <TabsTrigger value="mckinney"><Users className="mr-1.5 h-4 w-4" />McKinney-Vento</TabsTrigger>
          <TabsTrigger value="edlaw"><Shield className="mr-1.5 h-4 w-4" />Ed Law 2-d</TabsTrigger>
          <TabsTrigger value="audit"><CheckCircle className="mr-1.5 h-4 w-4" />Audit Readiness</TabsTrigger>
        </TabsList>

        {/* BEDS/STAC */}
        <TabsContent value="reports" className="mt-4 space-y-4">
          <div className="flex gap-2">
            <Button onClick={() => generateReport("beds")} disabled={generating} size="sm">
              <FileText className="h-4 w-4 mr-1" /> Generate BEDS Report
            </Button>
            <Button onClick={() => generateReport("stac")} disabled={generating} size="sm" variant="outline">
              <FileText className="h-4 w-4 mr-1" /> Generate STAC Report
            </Button>
          </div>

          <Card className="border-0 shadow-sm"><CardContent className="p-0">
            {reports.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">No compliance reports yet</div>
            ) : (
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Title</TableHead><TableHead>Type</TableHead><TableHead>Year</TableHead>
                  <TableHead>Deadline</TableHead><TableHead>Status</TableHead>
                </TableRow></TableHeader>
                <TableBody>{reports.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.title}</TableCell>
                    <TableCell className="text-xs uppercase">{r.report_type}</TableCell>
                    <TableCell>{r.school_year}</TableCell>
                    <TableCell className="text-xs">{r.filing_deadline ? new Date(r.filing_deadline).toLocaleDateString() : "—"}</TableCell>
                    <TableCell><Badge variant="outline" className={statusStyle(r.status)}>{r.status}</Badge></TableCell>
                  </TableRow>
                ))}</TableBody>
              </Table>
            )}
          </CardContent></Card>
        </TabsContent>

        {/* McKinney-Vento */}
        <TabsContent value="mckinney" className="mt-4 space-y-4">
          {mvWithoutTransport > 0 && (
            <Card className="border-0 shadow-sm bg-red-50 dark:bg-red-950/20">
              <CardContent className="p-4 flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium text-red-700">{mvWithoutTransport} student{mvWithoutTransport > 1 ? "s" : ""} without compliant transportation</span>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end">
            <Button size="sm" onClick={() => setShowAddMV(true)}><Plus className="h-4 w-4 mr-1" /> Add Student</Button>
          </div>

          <Card className="border-0 shadow-sm"><CardContent className="p-0">
            {mvStudents.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">No McKinney-Vento students tracked</div>
            ) : (
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Student</TableHead><TableHead>Grade</TableHead><TableHead>School</TableHead>
                  <TableHead>Living Situation</TableHead><TableHead>Transport</TableHead><TableHead>Status</TableHead>
                </TableRow></TableHeader>
                <TableBody>{mvStudents.map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.student_name}</TableCell>
                    <TableCell>{s.grade}</TableCell>
                    <TableCell>{s.school}</TableCell>
                    <TableCell className="capitalize text-xs">{s.living_situation?.replace("_", " ")}</TableCell>
                    <TableCell>
                      <Switch checked={!!s.transportation_provided} onCheckedChange={() => toggleMVTransport(s.id, !!s.transportation_provided)} />
                    </TableCell>
                    <TableCell><Badge variant="outline" className={statusStyle(s.status)}>{s.status}</Badge></TableCell>
                  </TableRow>
                ))}</TableBody>
              </Table>
            )}
          </CardContent></Card>
        </TabsContent>

        {/* Ed Law 2-d */}
        <TabsContent value="edlaw" className="mt-4 space-y-4">
          <Card className="border-0 shadow-sm"><CardContent className="p-0">
            {edLaw.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">No Ed Law 2-d vendors tracked</div>
            ) : (
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Contractor</TableHead><TableHead>Agreement</TableHead><TableHead>Encryption</TableHead>
                  <TableHead>Breach Plan</TableHead><TableHead>Parents Notified</TableHead><TableHead>Status</TableHead>
                </TableRow></TableHeader>
                <TableBody>{edLaw.map(e => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.contractor_name}</TableCell>
                    <TableCell>{e.agreement_signed ? <span className="text-emerald-600 text-xs font-medium">✓ Signed</span> : <span className="text-red-600 text-xs">✗ Missing</span>}</TableCell>
                    <TableCell>{e.encryption_verified ? <span className="text-emerald-600 text-xs">✓</span> : <span className="text-red-600 text-xs">✗</span>}</TableCell>
                    <TableCell>{e.breach_plan_filed ? <span className="text-emerald-600 text-xs">✓</span> : <span className="text-red-600 text-xs">✗</span>}</TableCell>
                    <TableCell>{e.parents_notified ? <span className="text-emerald-600 text-xs">Yes</span> : <span className="text-amber-600 text-xs">Pending</span>}</TableCell>
                    <TableCell><Badge variant="outline" className={statusStyle(e.status)}>{e.status}</Badge></TableCell>
                  </TableRow>
                ))}</TableBody>
              </Table>
            )}
          </CardContent></Card>

          {/* Training */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Training Tracker</h3>
            <Button size="sm" variant="outline" onClick={() => setShowAddTraining(true)}><Plus className="h-4 w-4 mr-1" /> Add Training</Button>
          </div>
          <Card className="border-0 shadow-sm"><CardContent className="p-0">
            {training.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">No training records</div>
            ) : (
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Title</TableHead><TableHead>Type</TableHead><TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Progress</TableHead><TableHead>Status</TableHead>
                </TableRow></TableHeader>
                <TableBody>{training.map(t => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.title}</TableCell>
                    <TableCell className="capitalize text-xs">{t.training_type}</TableCell>
                    <TableCell className="text-xs">{t.due_date ? new Date(t.due_date).toLocaleDateString() : "—"}</TableCell>
                    <TableCell className="text-right">{t.completed_count ?? 0} / {t.total_required ?? 0}</TableCell>
                    <TableCell><Badge variant="outline" className={statusStyle(t.status)}>{t.status}</Badge></TableCell>
                  </TableRow>
                ))}</TableBody>
              </Table>
            )}
          </CardContent></Card>

          {/* Breach Log */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Breach Incidents</h3>
            <Button size="sm" variant="outline" onClick={() => setShowAddBreach(true)}><Plus className="h-4 w-4 mr-1" /> Log Breach</Button>
          </div>
          <Card className="border-0 shadow-sm"><CardContent className="p-0">
            {breaches.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">No breach incidents logged</div>
            ) : (
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Date</TableHead><TableHead>Description</TableHead><TableHead>Severity</TableHead>
                  <TableHead>Affected</TableHead><TableHead>Notified</TableHead><TableHead>Status</TableHead>
                </TableRow></TableHeader>
                <TableBody>{breaches.map(b => (
                  <TableRow key={b.id}>
                    <TableCell className="text-xs">{new Date(b.incident_date).toLocaleDateString()}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{b.description}</TableCell>
                    <TableCell><Badge variant="outline" className={b.severity === "high" || b.severity === "critical" ? "bg-red-100 text-red-700 border-red-200" : "bg-amber-100 text-amber-700 border-amber-200"}>{b.severity}</Badge></TableCell>
                    <TableCell>{b.students_affected}</TableCell>
                    <TableCell>{b.notification_sent ? <span className="text-emerald-600 text-xs">✓</span> : <span className="text-red-600 text-xs">✗</span>}</TableCell>
                    <TableCell><Badge variant="outline" className={statusStyle(b.status)}>{b.status}</Badge></TableCell>
                  </TableRow>
                ))}</TableBody>
              </Table>
            )}
          </CardContent></Card>
        </TabsContent>

        {/* Audit Readiness */}
        <TabsContent value="audit" className="mt-4 space-y-6">
          <div className="grid gap-4 sm:grid-cols-5">
            {[
              { label: "BEDS", score: bedsScore },
              { label: "STAC", score: stacScore },
              { label: "McKinney-Vento", score: mvScore },
              { label: "Ed Law 2-d", score: edLawScore },
              { label: "Training", score: trainingScore },
            ].map(item => (
              <Card key={item.label} className="border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <div className="h-24 w-24 mx-auto relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" data={[{ value: item.score, fill: item.score >= 80 ? "#10B981" : item.score >= 50 ? "#F59E0B" : "#EF4444" }]} startAngle={90} endAngle={-270}>
                        <RadialBar background dataKey="value" />
                      </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold">{item.score}%</span>
                    </div>
                  </div>
                  <p className="mt-2 text-xs font-medium text-muted-foreground">{item.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Overall */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <p className="text-sm font-medium text-muted-foreground mb-2">Overall Audit Readiness</p>
              <p className={`text-5xl font-bold ${overallScore >= 80 ? "text-emerald-600" : overallScore >= 50 ? "text-amber-600" : "text-red-600"}`}>{overallScore}%</p>
            </CardContent>
          </Card>

          {/* Items needing attention */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-base">Items Needing Attention</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {bedsScore === 0 && <li className="flex items-center gap-2 text-red-600"><AlertTriangle className="h-4 w-4" /> BEDS report not filed this year</li>}
                {stacScore === 0 && <li className="flex items-center gap-2 text-red-600"><AlertTriangle className="h-4 w-4" /> STAC report not filed this year</li>}
                {mvWithoutTransport > 0 && <li className="flex items-center gap-2 text-amber-600"><AlertTriangle className="h-4 w-4" /> {mvWithoutTransport} MV students without transport</li>}
                {edLaw.filter(e => !e.agreement_signed).length > 0 && <li className="flex items-center gap-2 text-red-600"><AlertTriangle className="h-4 w-4" /> {edLaw.filter(e => !e.agreement_signed).length} contractors without signed agreements</li>}
                {training.filter(t => t.status !== "completed" && t.due_date && new Date(t.due_date) < new Date()).length > 0 && (
                  <li className="flex items-center gap-2 text-red-600"><AlertTriangle className="h-4 w-4" /> {training.filter(t => t.status !== "completed" && t.due_date && new Date(t.due_date) < new Date()).length} overdue training programs</li>
                )}
                {overallScore === 100 && <li className="flex items-center gap-2 text-emerald-600"><CheckCircle className="h-4 w-4" /> All compliance requirements met!</li>}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add MV Student Dialog */}
      <Dialog open={showAddMV} onOpenChange={setShowAddMV}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add McKinney-Vento Student</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Student Name</Label><Input value={mvForm.student_name} onChange={e => setMvForm({ ...mvForm, student_name: e.target.value })} className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Grade</Label><Input value={mvForm.grade} onChange={e => setMvForm({ ...mvForm, grade: e.target.value })} className="mt-1" /></div>
              <div><Label>School</Label><Input value={mvForm.school} onChange={e => setMvForm({ ...mvForm, school: e.target.value })} className="mt-1" /></div>
            </div>
            <div><Label>Living Situation</Label>
              <select value={mvForm.living_situation} onChange={e => setMvForm({ ...mvForm, living_situation: e.target.value })} className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="doubled_up">Doubled Up</option><option value="shelter">Shelter</option><option value="unsheltered">Unsheltered</option><option value="hotel_motel">Hotel/Motel</option>
              </select>
            </div>
            <div><Label>School of Origin</Label><Input value={mvForm.school_of_origin} onChange={e => setMvForm({ ...mvForm, school_of_origin: e.target.value })} className="mt-1" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowAddMV(false)}>Cancel</Button><Button onClick={addMVStudent}>Add Student</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Training Dialog */}
      <Dialog open={showAddTraining} onOpenChange={setShowAddTraining}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Training Record</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={trainingForm.title} onChange={e => setTrainingForm({ ...trainingForm, title: e.target.value })} className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Type</Label><Input value={trainingForm.training_type} onChange={e => setTrainingForm({ ...trainingForm, training_type: e.target.value })} className="mt-1" /></div>
              <div><Label>Due Date</Label><Input type="date" value={trainingForm.due_date} onChange={e => setTrainingForm({ ...trainingForm, due_date: e.target.value })} className="mt-1" /></div>
            </div>
            <div><Label>Total Required</Label><Input type="number" value={trainingForm.total_required} onChange={e => setTrainingForm({ ...trainingForm, total_required: e.target.value })} className="mt-1" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowAddTraining(false)}>Cancel</Button><Button onClick={addTraining}>Add Training</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Breach Dialog */}
      <Dialog open={showAddBreach} onOpenChange={setShowAddBreach}>
        <DialogContent>
          <DialogHeader><DialogTitle>Log Breach Incident</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Incident Date</Label><Input type="date" value={breachForm.incident_date} onChange={e => setBreachForm({ ...breachForm, incident_date: e.target.value })} className="mt-1" /></div>
              <div><Label>Discovered Date</Label><Input type="date" value={breachForm.discovered_date} onChange={e => setBreachForm({ ...breachForm, discovered_date: e.target.value })} className="mt-1" /></div>
            </div>
            <div><Label>Description</Label><Textarea value={breachForm.description} onChange={e => setBreachForm({ ...breachForm, description: e.target.value })} className="mt-1" rows={3} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Severity</Label>
                <select value={breachForm.severity} onChange={e => setBreachForm({ ...breachForm, severity: e.target.value })} className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                  <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
                </select>
              </div>
              <div><Label>Students Affected</Label><Input type="number" value={breachForm.students_affected} onChange={e => setBreachForm({ ...breachForm, students_affected: e.target.value })} className="mt-1" /></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowAddBreach(false)}>Cancel</Button><Button onClick={addBreach}>Log Breach</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Compliance;
