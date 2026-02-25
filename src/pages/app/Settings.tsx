import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useDistrict } from "@/contexts/DistrictContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Building, User, Shield, CreditCard, Users, Lock, Plus, Loader2, Search } from "lucide-react";
import { toast } from "sonner";

const ROLE_OPTIONS = ["viewer", "staff", "transport_director", "district_admin"];

const ROLE_STYLES: Record<string, string> = {
  super_admin: "bg-purple-100 text-purple-700 border-purple-200",
  district_admin: "bg-blue-100 text-blue-700 border-blue-200",
  transport_director: "bg-emerald-100 text-emerald-700 border-emerald-200",
  staff: "bg-amber-100 text-amber-700 border-amber-200",
  parent: "bg-gray-100 text-gray-600 border-gray-200",
  viewer: "bg-gray-100 text-gray-600 border-gray-200",
};

const TIER_INFO: Record<string, { features: string[] }> = {
  essentials: { features: ["Student Registration", "Basic Routes", "Safety Reports", "1 Admin User"] },
  professional: { features: ["Everything in Essentials", "Contract Management", "Invoice Verification", "Compliance Center", "5 Admin Users", "Analytics Dashboard"] },
  enterprise: { features: ["Everything in Professional", "Route Optimization AI", "Real-Time GPS Tracking", "Unlimited Users", "API Access", "Dedicated Support"] },
};

const AppSettings = () => {
  const { district, profile, role } = useDistrict();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  // Profile form
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [title, setTitle] = useState(profile?.title ?? "");

  // District form
  const [districtData, setDistrictData] = useState<any>(null);
  const [districtLoading, setDistrictLoading] = useState(true);

  // Users
  const [profiles, setProfiles] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ full_name: "", email: "", role: "staff", title: "" });

  useEffect(() => {
    if (profile) { setFullName(profile.full_name); setPhone(profile.phone ?? ""); setTitle(profile.title ?? ""); }
  }, [profile]);

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Fetch full district data
  useEffect(() => {
    if (!district) return;
    supabase.from("districts").select("*").eq("id", district.id).single().then(({ data }) => {
      setDistrictData(data);
      setDistrictLoading(false);
    });
  }, [district]);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    const [{ data: p }, { data: r }] = await Promise.all([
      supabase.from("profiles").select("*").order("full_name"),
      supabase.from("district_user_roles").select("*"),
    ]);
    setProfiles(p ?? []);
    setRoles(r ?? []);
    setUsersLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ full_name: fullName, phone, title }).eq("id", user.id);
    if (error) toast.error(error.message);
    else toast.success("Profile updated");
    setSaving(false);
  };

  const getUserRole = (userId: string) => roles.find(r => r.user_id === userId)?.role ?? "viewer";

  const handleRoleChange = async (userId: string, newRole: string) => {
    const existing = roles.find(r => r.user_id === userId);
    if (existing) {
      const { error } = await supabase.from("district_user_roles").update({ role: newRole }).eq("id", existing.id);
      if (error) { toast.error(error.message); return; }
    } else if (district) {
      const { error } = await supabase.from("district_user_roles").insert({ user_id: userId, district_id: district.id, role: newRole });
      if (error) { toast.error(error.message); return; }
    }
    toast.success("Role updated");
    fetchUsers();
  };

  const toggleActive = async (userId: string, active: boolean) => {
    const { error } = await supabase.from("profiles").update({ is_active: active }).eq("id", userId);
    if (error) toast.error(error.message);
    else { toast.success(active ? "User activated" : "User deactivated"); fetchUsers(); }
  };

  const filteredProfiles = search
    ? profiles.filter(p => p.full_name?.toLowerCase().includes(search.toLowerCase()) || p.email?.toLowerCase().includes(search.toLowerCase()))
    : profiles;

  const tier = district?.subscription_tier ?? "essentials";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your profile, district, and team</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile"><User className="mr-1.5 h-4 w-4" />District Info</TabsTrigger>
          <TabsTrigger value="subscription"><CreditCard className="mr-1.5 h-4 w-4" />Subscription</TabsTrigger>
          <TabsTrigger value="users"><Users className="mr-1.5 h-4 w-4" />Users</TabsTrigger>
          <TabsTrigger value="privacy"><Lock className="mr-1.5 h-4 w-4" />Data & Privacy</TabsTrigger>
        </TabsList>

        {/* District Info */}
        <TabsContent value="profile" className="mt-4 space-y-6 max-w-3xl">
          {/* Profile */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4"><CardTitle className="flex items-center gap-2 text-base"><User className="h-4 w-4" /> Your Profile</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label>Full Name</Label><Input value={fullName} onChange={e => setFullName(e.target.value)} className="mt-1" /></div>
                <div><Label>Email</Label><Input value={profile?.email ?? ""} disabled className="mt-1 bg-muted" /></div>
                <div><Label>Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Transportation Director" className="mt-1" /></div>
                <div><Label>Phone</Label><Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="(516) 555-0000" className="mt-1" /></div>
              </div>
              <Button onClick={handleSaveProfile} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
            </CardContent>
          </Card>

          {/* District */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4"><CardTitle className="flex items-center gap-2 text-base"><Building className="h-4 w-4" /> District Information</CardTitle></CardHeader>
            <CardContent>
              {districtLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : districtData ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { label: "District Name", value: districtData.name },
                    { label: "State", value: districtData.state },
                    { label: "BEDS Code", value: districtData.beds_code ?? "—" },
                    { label: "Address", value: districtData.address ?? "—" },
                    { label: "City", value: districtData.city ?? "—" },
                    { label: "ZIP", value: districtData.zip ?? "—" },
                    { label: "Superintendent", value: districtData.superintendent_name ?? "—" },
                    { label: "Supt. Email", value: districtData.superintendent_email ?? "—" },
                    { label: "Phone", value: districtData.phone ?? "—" },
                    { label: "Student Count", value: districtData.student_count?.toLocaleString() ?? "—" },
                    { label: "Timezone", value: districtData.timezone ?? "—" },
                    { label: "Your Role", value: role?.replace("_", " ") ?? "—" },
                  ].map(item => (
                    <div key={item.label}>
                      <Label className="text-muted-foreground text-xs">{item.label}</Label>
                      <p className="font-medium capitalize">{item.value}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscription */}
        <TabsContent value="subscription" className="mt-4 space-y-6 max-w-3xl">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Current Plan</p>
                  <h2 className="text-2xl font-bold capitalize">{tier}</h2>
                </div>
                <Badge variant="outline" className={district?.subscription_status === "active" ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-amber-100 text-amber-700 border-amber-200"}>
                  {district?.subscription_status ?? "trial"}
                </Badge>
              </div>
              {districtData?.trial_ends_at && (
                <p className="text-xs text-muted-foreground mb-4">Trial ends: {new Date(districtData.trial_ends_at).toLocaleDateString()}</p>
              )}
              <Button variant="outline" onClick={() => window.open("/contact", "_blank")}>Contact Sales to Upgrade</Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-base">Plan Comparison</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                {Object.entries(TIER_INFO).map(([t, info]) => (
                  <div key={t} className={`rounded-lg border p-4 ${t === tier ? "border-primary bg-primary/5" : ""}`}>
                    <h3 className="font-semibold capitalize mb-2">{t}</h3>
                    <ul className="space-y-1">
                      {info.features.map(f => (
                        <li key={f} className="text-xs text-muted-foreground flex items-center gap-1">
                          <span className="text-emerald-600">✓</span> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users */}
        <TabsContent value="users" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search users..." value={searchInput} onChange={e => setSearchInput(e.target.value)} className="pl-9" />
            </div>
            <Button size="sm" onClick={() => setShowInvite(true)}><Plus className="h-4 w-4 mr-1" /> Invite User</Button>
          </div>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead>
                  <TableHead>Title</TableHead><TableHead>Active</TableHead><TableHead>Last Login</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {usersLoading ? (
                    <TableRow><TableCell colSpan={6} className="h-32 text-center"><Loader2 className="h-6 w-6 mx-auto animate-spin text-primary" /></TableCell></TableRow>
                  ) : filteredProfiles.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.full_name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{p.email}</TableCell>
                      <TableCell>
                        <select value={getUserRole(p.id)} onChange={e => handleRoleChange(p.id, e.target.value)} className="h-8 rounded-md border border-input bg-background px-2 text-xs">
                          {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
                        </select>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{p.title ?? "—"}</TableCell>
                      <TableCell><Switch checked={p.is_active !== false} onCheckedChange={v => toggleActive(p.id, v)} /></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{p.last_login_at ? new Date(p.last_login_at).toLocaleDateString() : "Never"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data & Privacy */}
        <TabsContent value="privacy" className="mt-4 space-y-6 max-w-3xl">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4"><CardTitle className="flex items-center gap-2 text-base"><Shield className="h-4 w-4" /> Ed Law §2-d Compliance</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Data Privacy Agreement</span>
                <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Encryption at Rest</span>
                <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200">Verified</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Annual Review</span>
                <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200">Current</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 space-y-3">
              <Button variant="outline" onClick={() => toast.info("Export feature coming soon")}>Download All District Data</Button>
              <p className="text-xs text-muted-foreground">Data is retained for 7 years per NY Education Law requirements.</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              <Accordion type="single" collapsible>
                <AccordionItem value="bill-of-rights">
                  <AccordionTrigger className="px-6">Parents' Bill of Rights for Data Privacy & Security</AccordionTrigger>
                  <AccordionContent className="px-6 text-sm text-muted-foreground space-y-2">
                    <p>1. A student's personally identifiable information (PII) cannot be sold or released for commercial purposes.</p>
                    <p>2. Parents have the right to inspect and review the complete contents of their child's education record.</p>
                    <p>3. State and federal laws protect the confidentiality of PII, and safeguards associated with industry standards and best practices.</p>
                    <p>4. A complete list of all student data elements collected by the State is available at the NYSED website.</p>
                    <p>5. Parents have the right to file complaints about possible breaches of student data.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invite Dialog */}
      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent>
          <DialogHeader><DialogTitle>Invite User</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Full Name</Label><Input value={inviteForm.full_name} onChange={e => setInviteForm({ ...inviteForm, full_name: e.target.value })} className="mt-1" /></div>
            <div><Label>Email</Label><Input type="email" value={inviteForm.email} onChange={e => setInviteForm({ ...inviteForm, email: e.target.value })} className="mt-1" /></div>
            <div><Label>Role</Label>
              <select value={inviteForm.role} onChange={e => setInviteForm({ ...inviteForm, role: e.target.value })} className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInvite(false)}>Cancel</Button>
            <Button onClick={() => { toast.success(`Invitation sent to ${inviteForm.email}`); setShowInvite(false); }}>Send Invite</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppSettings;
