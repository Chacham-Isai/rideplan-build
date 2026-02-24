import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, GraduationCap, Shield, Users } from "lucide-react";

const Compliance = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [training, setTraining] = useState<any[]>([]);
  const [mvStudents, setMvStudents] = useState<any[]>([]);
  const [edLaw, setEdLaw] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const [rRes, tRes, mvRes, elRes] = await Promise.all([
        supabase.from("compliance_reports").select("*").order("filing_deadline", { ascending: true }),
        supabase.from("compliance_training").select("*").order("due_date", { ascending: true }),
        supabase.from("mckinney_vento_students").select("*").order("created_at", { ascending: false }),
        supabase.from("ed_law_2d_contractors").select("*").order("created_at", { ascending: false }),
      ]);
      setReports(rRes.data ?? []);
      setTraining(tRes.data ?? []);
      setMvStudents(mvRes.data ?? []);
      setEdLaw(elRes.data ?? []);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  const statusStyle = (s: string) => {
    if (["filed", "completed", "compliant", "active"].includes(s)) return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (["pending", "upcoming", "in_progress"].includes(s)) return "bg-amber-100 text-amber-700 border-amber-200";
    if (["overdue", "non_compliant"].includes(s)) return "bg-red-100 text-red-700 border-red-200";
    return "bg-gray-100 text-gray-600 border-gray-200";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Compliance</h1>
        <p className="text-sm text-muted-foreground">State reporting, training, Ed Law 2-d & McKinney-Vento</p>
      </div>

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
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Ed Law 2-d Vendors</p>
          <p className="mt-1 text-2xl font-bold">{edLaw.length}</p>
          <p className="text-xs text-muted-foreground">{edLaw.filter(e => e.agreement_signed).length} compliant</p>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="reports">
        <TabsList>
          <TabsTrigger value="reports"><FileText className="mr-1.5 h-4 w-4" />State Reports</TabsTrigger>
          <TabsTrigger value="training"><GraduationCap className="mr-1.5 h-4 w-4" />Training</TabsTrigger>
          <TabsTrigger value="mckinney"><Users className="mr-1.5 h-4 w-4" />McKinney-Vento</TabsTrigger>
          <TabsTrigger value="edlaw"><Shield className="mr-1.5 h-4 w-4" />Ed Law 2-d</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="mt-4">
          <Card className="border-0 shadow-sm"><CardContent className="p-0">
            {reports.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">No compliance reports yet. Data will appear once reports are filed.</div>
            ) : (
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Title</TableHead><TableHead>Type</TableHead><TableHead>Year</TableHead>
                  <TableHead>Deadline</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Expenditure</TableHead>
                </TableRow></TableHeader>
                <TableBody>{reports.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.title}</TableCell>
                    <TableCell className="text-xs uppercase">{r.report_type}</TableCell>
                    <TableCell>{r.school_year}</TableCell>
                    <TableCell className="text-xs">{r.filing_deadline ? new Date(r.filing_deadline).toLocaleDateString() : "—"}</TableCell>
                    <TableCell><span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${statusStyle(r.status)}`}>{r.status}</span></TableCell>
                    <TableCell className="text-right">{r.total_expenditure ? `$${r.total_expenditure.toLocaleString()}` : "—"}</TableCell>
                  </TableRow>
                ))}</TableBody>
              </Table>
            )}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="training" className="mt-4">
          <Card className="border-0 shadow-sm"><CardContent className="p-0">
            {training.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">No training programs configured yet.</div>
            ) : (
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Title</TableHead><TableHead>Type</TableHead><TableHead>Required For</TableHead>
                  <TableHead>Due Date</TableHead><TableHead className="text-right">Progress</TableHead><TableHead>Status</TableHead>
                </TableRow></TableHeader>
                <TableBody>{training.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.title}</TableCell>
                    <TableCell className="capitalize text-xs">{t.training_type}</TableCell>
                    <TableCell className="capitalize text-xs">{t.required_for?.replace("_", " ")}</TableCell>
                    <TableCell className="text-xs">{t.due_date ? new Date(t.due_date).toLocaleDateString() : "—"}</TableCell>
                    <TableCell className="text-right">{t.completed_count ?? 0} / {t.total_required ?? 0}</TableCell>
                    <TableCell><span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${statusStyle(t.status)}`}>{t.status}</span></TableCell>
                  </TableRow>
                ))}</TableBody>
              </Table>
            )}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="mckinney" className="mt-4">
          <Card className="border-0 shadow-sm"><CardContent className="p-0">
            {mvStudents.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">No McKinney-Vento students tracked.</div>
            ) : (
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Student</TableHead><TableHead>Grade</TableHead><TableHead>School</TableHead>
                  <TableHead>Living Situation</TableHead><TableHead>Transport</TableHead><TableHead>Status</TableHead>
                </TableRow></TableHeader>
                <TableBody>{mvStudents.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.student_name}</TableCell>
                    <TableCell>{s.grade}</TableCell>
                    <TableCell>{s.school}</TableCell>
                    <TableCell className="capitalize text-xs">{s.living_situation?.replace("_", " ")}</TableCell>
                    <TableCell>{s.transportation_provided ? <span className="text-emerald-600 text-xs font-medium">Yes</span> : <span className="text-red-600 text-xs">No</span>}</TableCell>
                    <TableCell><span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${statusStyle(s.status)}`}>{s.status}</span></TableCell>
                  </TableRow>
                ))}</TableBody>
              </Table>
            )}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="edlaw" className="mt-4">
          <Card className="border-0 shadow-sm"><CardContent className="p-0">
            {edLaw.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">No Ed Law 2-d vendors tracked.</div>
            ) : (
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Contractor</TableHead><TableHead>Data Access</TableHead><TableHead>Agreement</TableHead>
                  <TableHead>Encryption</TableHead><TableHead>Breach Plan</TableHead><TableHead>Parents Notified</TableHead><TableHead>Status</TableHead>
                </TableRow></TableHeader>
                <TableBody>{edLaw.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.contractor_name}</TableCell>
                    <TableCell className="capitalize text-xs">{e.data_access_level}</TableCell>
                    <TableCell>{e.agreement_signed ? <span className="text-emerald-600 text-xs font-medium">✓ Signed</span> : <span className="text-red-600 text-xs">✗ Missing</span>}</TableCell>
                    <TableCell>{e.encryption_verified ? <span className="text-emerald-600 text-xs font-medium">✓</span> : <span className="text-red-600 text-xs">✗</span>}</TableCell>
                    <TableCell>{e.breach_plan_filed ? <span className="text-emerald-600 text-xs font-medium">✓</span> : <span className="text-red-600 text-xs">✗</span>}</TableCell>
                    <TableCell>{e.parents_notified ? <span className="text-emerald-600 text-xs font-medium">Yes</span> : <span className="text-amber-600 text-xs">Pending</span>}</TableCell>
                    <TableCell><span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${statusStyle(e.status)}`}>{e.status}</span></TableCell>
                  </TableRow>
                ))}</TableBody>
              </Table>
            )}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Compliance;
