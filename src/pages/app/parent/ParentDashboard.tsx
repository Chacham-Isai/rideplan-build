import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useDistrict } from "@/contexts/DistrictContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus, RefreshCw, Bus, Bell, GraduationCap, MapPin, Loader2 } from "lucide-react";

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  approved: { label: "Approved", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  pending: { label: "Pending", className: "bg-amber-100 text-amber-700 border-amber-200" },
  denied: { label: "Denied", className: "bg-red-100 text-red-700 border-red-200" },
  under_review: { label: "Under Review", className: "bg-blue-100 text-blue-700 border-blue-200" },
};

const ParentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useDistrict();
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("student_registrations")
      .select("*")
      .eq("parent_user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setChildren(data ?? []);
        setLoading(false);
      });
  }, [user]);

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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
    </div>
  );
};

export default ParentDashboard;
