import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useDistrict } from "@/contexts/DistrictContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Building, User, Shield, Bell } from "lucide-react";

const AppSettings = () => {
  const { district, profile, role } = useDistrict();
  const { user } = useAuth();
  const { toast } = useToast();
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [title, setTitle] = useState(profile?.title ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name);
      setPhone(profile.phone ?? "");
      setTitle(profile.title ?? "");
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, phone, title })
      .eq("id", user.id);

    if (error) {
      toast({ title: "Error saving", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated" });
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your profile and district configuration</p>
      </div>

      {/* Profile */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base"><User className="h-4 w-4" /> Your Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={profile?.email ?? ""} disabled className="mt-1 bg-muted" />
            </div>
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Transportation Director" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(516) 555-0000" className="mt-1" />
            </div>
          </div>
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </CardContent>
      </Card>

      {/* District info */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base"><Building className="h-4 w-4" /> District Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-muted-foreground text-xs">District Name</Label>
              <p className="font-medium">{district?.name ?? "—"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">State</Label>
              <p className="font-medium">{district?.state ?? "—"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Subscription</Label>
              <p className="font-medium capitalize">{district?.subscription_tier ?? "—"} <span className="text-xs text-muted-foreground">({district?.subscription_status})</span></p>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Your Role</Label>
              <p className="font-medium capitalize">{role?.replace("_", " ") ?? "—"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base"><Shield className="h-4 w-4" /> Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Authentication Method</p>
              <p className="text-xs text-muted-foreground">Google OAuth (managed by Lovable Cloud)</p>
            </div>
            <span className="inline-flex items-center rounded-full border bg-emerald-100 text-emerald-700 border-emerald-200 px-2 py-0.5 text-xs font-medium">Active</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Last Login</p>
              <p className="text-xs text-muted-foreground">{user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : "—"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppSettings;
