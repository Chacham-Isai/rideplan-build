import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useDistrict } from "@/contexts/DistrictContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  UserPlus, RefreshCw, Bus, Bell, GraduationCap, MapPin, Loader2,
  MessageSquare, Send, Eye, Clock, CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  approved: { label: "Approved", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  pending: { label: "Pending", className: "bg-amber-100 text-amber-700 border-amber-200" },
  denied: { label: "Denied", className: "bg-red-100 text-red-700 border-red-200" },
  under_review: { label: "Under Review", className: "bg-blue-100 text-blue-700 border-blue-200" },
};

const REQUEST_STATUS: Record<string, string> = {
  open: "bg-amber-100 text-amber-700 border-amber-200",
  in_progress: "bg-blue-100 text-blue-700 border-blue-200",
  resolved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  closed: "bg-gray-100 text-gray-600 border-gray-200",
};

const ParentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { district, profile } = useDistrict();
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Requests
  const [requests, setRequests] = useState<any[]>([]);
  const [showSubmit, setShowSubmit] = useState(false);
  const [submitForm, setSubmitForm] = useState({
    request_type: "general_inquiry", subject: "", description: "", student_id: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Request detail
  const [selectedReq, setSelectedReq] = useState<any>(null);
  const [reqNotes, setReqNotes] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("student_registrations").select("*").eq("parent_user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("service_requests").select("*").eq("parent_user_id", user.id).order("created_at", { ascending: false }),
    ]).then(([childRes, reqRes]) => {
      setChildren(childRes.data ?? []);
      setRequests(reqRes.data ?? []);
      setLoading(false);
    });
  }, [user]);

  const handleSubmitRequest = async () => {
    if (!submitForm.subject || !district || !user) { toast.error("Subject is required"); return; }
    setSubmitting(true);
    const { error } = await supabase.from("service_requests").insert({
      district_id: district.id,
      parent_user_id: user.id,
      request_type: submitForm.request_type as any,
      subject: submitForm.subject,
      description: submitForm.description,
      student_registration_id: submitForm.student_id || null,
      priority: "normal" as any,
      status: "open" as any,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Request submitted");
      setShowSubmit(false);
      setSubmitForm({ request_type: "general_inquiry", subject: "", description: "", student_id: "" });
      const { data } = await supabase.from("service_requests").select("*").eq("parent_user_id", user.id).order("created_at", { ascending: false });
      setRequests(data ?? []);
    }
    setSubmitting(false);
  };

  const openRequestDetail = async (req: any) => {
    setSelectedReq(req);
    const { data } = await supabase.from("service_request_notes").select("*").eq("request_id", req.id).order("created_at", { ascending: true });
    setReqNotes(data ?? []);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {profile?.full_name?.split(" ")[0] ?? "Parent"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your children's transportation registrations
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Button variant="outline" className="h-auto flex-col gap-2 py-4 hover:bg-muted/50" onClick={() => navigate("/app/parent/register")}>
          <UserPlus className="h-5 w-5 text-blue-600" />
          <span className="text-xs font-medium">Register Child</span>
        </Button>
        <Button variant="outline" className="h-auto flex-col gap-2 py-4 hover:bg-muted/50" onClick={() => navigate("/app/parent/reapply")}>
          <RefreshCw className="h-5 w-5 text-emerald-600" />
          <span className="text-xs font-medium">Reapply Next Year</span>
        </Button>
        <Button variant="outline" className="h-auto flex-col gap-2 py-4 hover:bg-muted/50" onClick={() => navigate("/app/parent/tracking")}>
          <Bus className="h-5 w-5 text-amber-600" />
          <span className="text-xs font-medium">Track Bus</span>
        </Button>
        <Button variant="outline" className="h-auto flex-col gap-2 py-4 hover:bg-muted/50" onClick={() => setShowSubmit(true)}>
          <MessageSquare className="h-5 w-5 text-purple-600" />
          <span className="text-xs font-medium">Submit Request</span>
        </Button>
        <Button variant="outline" className="h-auto flex-col gap-2 py-4 hover:bg-muted/50" disabled>
          <Bell className="h-5 w-5 text-purple-600" />
          <span className="text-xs font-medium">Notifications</span>
        </Button>
      </div>

      {/* My Children */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">My Children</h2>
        {children.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-12 text-center">
              <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground mb-4">No children registered yet</p>
              <Button onClick={() => navigate("/app/parent/register")}>
                <UserPlus className="h-4 w-4 mr-2" /> Register Your Child
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {children.map((child) => {
              const st = STATUS_STYLES[child.status] ?? STATUS_STYLES.pending;
              return (
                <Card key={child.id} className="border-0 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-foreground">{child.student_name}</h3>
                        <p className="text-sm text-muted-foreground">Grade {child.grade} · {child.school}</p>
                      </div>
                      <Badge variant="outline" className={st.className}>{st.label}</Badge>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3" />
                        {child.address_line}, {child.city} {child.zip}
                      </div>
                      <p>School Year: {child.school_year}</p>
                      {child.status === "approved" && (
                        <p className="text-emerald-600 font-medium mt-1">✓ Transportation approved</p>
                      )}
                      {child.status === "pending" && (
                        <p className="text-amber-600 font-medium mt-1">⏳ Processing (5-10 business days)</p>
                      )}
                      {child.status === "denied" && (
                        <p className="text-red-600 font-medium mt-1">✗ Registration denied</p>
                      )}
                    </div>
                    <div className="flex gap-1 mt-2">
                      {child.iep_flag && <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">IEP</span>}
                      {child.section_504_flag && <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">504</span>}
                      {child.mckinney_vento_flag && <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">MV</span>}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* My Requests */}
      {requests.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">My Requests</h2>
          <div className="space-y-2">
            {requests.map((req) => (
              <Card
                key={req.id}
                className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => openRequestDetail(req)}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{req.subject}</p>
                      <p className="text-xs text-muted-foreground">
                        {req.request_type.replace("_", " ")} · {new Date(req.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className={REQUEST_STATUS[req.status] ?? ""}>
                    {req.status.replace("_", " ")}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {children.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet</p>
          ) : (
            <div className="space-y-3">
              {children.slice(0, 5).map((child) => (
                <div key={child.id} className="flex items-center gap-3 text-sm">
                  <div className={`h-2 w-2 rounded-full ${child.status === "approved" ? "bg-emerald-500" : child.status === "denied" ? "bg-red-500" : "bg-amber-500"}`} />
                  <span className="text-muted-foreground">
                    {child.student_name} — Registration {child.status}
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {new Date(child.updated_at || child.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Track Bus Preview */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/app/parent/tracking")}>
        <CardContent className="p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/40">
            <Bus className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">Track My Child's Bus</h3>
            <p className="text-xs text-muted-foreground">Real-time GPS tracking — Coming Soon</p>
          </div>
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">Preview</span>
        </CardContent>
      </Card>

      {/* Submit Request Dialog */}
      <Dialog open={showSubmit} onOpenChange={setShowSubmit}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Submit a Request</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Type</label>
              <select
                value={submitForm.request_type}
                onChange={e => setSubmitForm({ ...submitForm, request_type: e.target.value })}
                className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="stop_change">Stop Change</option>
                <option value="address_change">Address Change</option>
                <option value="bus_pass">Bus Pass Request</option>
                <option value="general_inquiry">General Inquiry</option>
              </select>
            </div>
            {children.length > 0 && (
              <div>
                <label className="text-sm font-medium">Student (optional)</label>
                <select
                  value={submitForm.student_id}
                  onChange={e => setSubmitForm({ ...submitForm, student_id: e.target.value })}
                  className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Select student...</option>
                  {children.map(c => <option key={c.id} value={c.id}>{c.student_name}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="text-sm font-medium">Subject *</label>
              <Input
                value={submitForm.subject}
                onChange={e => setSubmitForm({ ...submitForm, subject: e.target.value })}
                className="mt-1"
                placeholder="Brief description of your request"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Details</label>
              <Textarea
                value={submitForm.description}
                onChange={e => setSubmitForm({ ...submitForm, description: e.target.value })}
                className="mt-1"
                placeholder="Provide additional details..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmit(false)}>Cancel</Button>
            <Button onClick={handleSubmitRequest} disabled={submitting}>
              <Send className="h-4 w-4 mr-1" /> {submitting ? "Submitting..." : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Detail Dialog */}
      <Dialog open={!!selectedReq} onOpenChange={() => setSelectedReq(null)}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          {selectedReq && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedReq.subject}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <div className="flex gap-2">
                  <Badge variant="outline" className={REQUEST_STATUS[selectedReq.status] ?? ""}>
                    {selectedReq.status.replace("_", " ")}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {selectedReq.request_type.replace("_", " ")} · {new Date(selectedReq.created_at).toLocaleDateString()}
                  </span>
                </div>
                {selectedReq.description && (
                  <p className="text-muted-foreground">{selectedReq.description}</p>
                )}
                <div className="border-t pt-3 space-y-2">
                  <h4 className="font-semibold">Staff Notes</h4>
                  {reqNotes.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No notes yet — staff will respond soon</p>
                  ) : reqNotes.map(n => (
                    <div key={n.id} className="rounded-lg bg-muted/50 p-3">
                      <p className="text-sm">{n.note}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {new Date(n.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ParentDashboard;
