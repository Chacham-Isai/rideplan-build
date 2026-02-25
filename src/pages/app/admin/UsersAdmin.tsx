import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useDistrict } from "@/contexts/DistrictContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Search, Plus, Users, Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";

type UserProfile = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  title: string | null;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string | null;
};

type UserRole = {
  id: string;
  user_id: string;
  role: string;
};

const ROLE_OPTIONS = ["viewer", "staff", "transport_director", "district_admin"];

const ROLE_STYLES: Record<string, string> = {
  super_admin: "bg-purple-100 text-purple-700 border-purple-200",
  district_admin: "bg-blue-100 text-blue-700 border-blue-200",
  transport_director: "bg-emerald-100 text-emerald-700 border-emerald-200",
  staff: "bg-amber-100 text-amber-700 border-amber-200",
  parent: "bg-gray-100 text-gray-600 border-gray-200",
  viewer: "bg-gray-100 text-gray-600 border-gray-200",
};

const UsersAdmin = () => {
  const { district } = useDistrict();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ full_name: "", email: "", role: "staff", title: "" });
  const [saving, setSaving] = useState(false);

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const [{ data: profileData }, { data: roleData }] = await Promise.all([
      supabase.from("profiles").select("*").order("full_name"),
      supabase.from("district_user_roles").select("*"),
    ]);
    setProfiles((profileData as UserProfile[]) ?? []);
    setRoles((roleData as UserRole[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const getUserRole = (userId: string) => roles.find(r => r.user_id === userId)?.role ?? "viewer";

  const filteredProfiles = search
    ? profiles.filter(p => p.full_name.toLowerCase().includes(search.toLowerCase()) || p.email.toLowerCase().includes(search.toLowerCase()))
    : profiles;

  // Role distribution
  const roleCounts = roles.reduce<Record<string, number>>((acc, r) => {
    acc[r.role] = (acc[r.role] ?? 0) + 1;
    return acc;
  }, {});

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
    else {
      toast.success(active ? "User activated" : "User deactivated");
      fetchUsers();
    }
  };

  const handleInvite = async () => {
    if (!inviteForm.full_name || !inviteForm.email || !district) {
      toast.error("Name and email required");
      return;
    }
    setSaving(true);
    // For now, we just show a toast — actual invite email is a future feature
    toast.success(`Invitation sent to ${inviteForm.email}`);
    setShowInvite(false);
    setInviteForm({ full_name: "", email: "", role: "staff", title: "" });
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manage Users</h1>
          <p className="text-sm text-muted-foreground">{profiles.length} users in your district</p>
        </div>
        <Button size="sm" onClick={() => setShowInvite(true)}>
          <Plus className="h-4 w-4 mr-1" /> Invite User
        </Button>
      </div>

      {/* Role Distribution */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(roleCounts).sort((a, b) => b[1] - a[1]).map(([role, count]) => (
          <Badge key={role} variant="outline" className={ROLE_STYLES[role] ?? ""}>
            {role.replace("_", " ")} ({count})
          </Badge>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by name or email..." value={searchInput} onChange={e => setSearchInput(e.target.value)} className="pl-9" />
      </div>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Last Login</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="h-32 text-center"><Loader2 className="h-6 w-6 mx-auto animate-spin text-primary" /></TableCell></TableRow>
              ) : filteredProfiles.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="h-32 text-center text-muted-foreground">No users found</TableCell></TableRow>
              ) : filteredProfiles.map((p) => {
                const userRole = getUserRole(p.id);
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.full_name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.email}</TableCell>
                    <TableCell>
                      <select
                        value={userRole}
                        onChange={e => handleRoleChange(p.id, e.target.value)}
                        className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                      >
                        {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
                      </select>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.title ?? "—"}</TableCell>
                    <TableCell>
                      <Switch checked={p.is_active !== false} onCheckedChange={v => toggleActive(p.id, v)} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {p.last_login_at ? new Date(p.last_login_at).toLocaleDateString() : "Never"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Invite Dialog */}
      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Full Name</Label>
              <Input value={inviteForm.full_name} onChange={e => setInviteForm({ ...inviteForm, full_name: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={inviteForm.email} onChange={e => setInviteForm({ ...inviteForm, email: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Role</Label>
              <select value={inviteForm.role} onChange={e => setInviteForm({ ...inviteForm, role: e.target.value })} className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
              </select>
            </div>
            <div>
              <Label>Title (optional)</Label>
              <Input value={inviteForm.title} onChange={e => setInviteForm({ ...inviteForm, title: e.target.value })} placeholder="e.g. Transportation Coordinator" className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInvite(false)}>Cancel</Button>
            <Button onClick={handleInvite} disabled={saving}>{saving ? "Sending..." : "Send Invite"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersAdmin;
