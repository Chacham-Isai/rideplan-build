import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useDistrict } from "@/contexts/DistrictContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Beaker, X } from "lucide-react";
import { toast } from "sonner";

interface DistrictOption {
  id: string;
  name: string;
}

const ROLES = [
  { value: "super_admin", label: "Super Admin" },
  { value: "district_admin", label: "District Admin" },
  { value: "transport_director", label: "Transport Director" },
  { value: "staff", label: "Staff" },
  { value: "parent", label: "Parent" },
];

export const DemoSwitcher = () => {
  const { isSuperAdmin, demoActive, demoDistrict, demoRole, startDemo, endDemo } = useDistrict();
  const [open, setOpen] = useState(false);
  const [districts, setDistricts] = useState<DistrictOption[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedRole, setSelectedRole] = useState("district_admin");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      supabase
        .from("districts")
        .select("id, name")
        .order("name")
        .then(({ data }) => setDistricts((data as DistrictOption[]) ?? []));
    }
  }, [open]);

  if (!isSuperAdmin) return null;

  const handleStart = async () => {
    if (!selectedDistrict) return;
    setLoading(true);
    try {
      await startDemo(selectedDistrict, selectedRole);
      toast.success("Demo mode activated");
      setOpen(false);
      window.location.reload();
    } catch (e: any) {
      toast.error(e.message);
    }
    setLoading(false);
  };

  const handleEnd = async () => {
    setLoading(true);
    await endDemo();
    toast.success("Demo mode ended");
    setLoading(false);
    window.location.reload();
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className={`gap-1.5 ${demoActive ? "border-amber-400 text-amber-700 bg-amber-50 hover:bg-amber-100" : ""}`}
        onClick={() => (demoActive ? handleEnd() : setOpen(true))}
      >
        <Beaker className="h-4 w-4" />
        {demoActive ? "End Demo" : "Demo"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Start Demo Session</DialogTitle>
            <DialogDescription>Impersonate a district and role to preview the experience.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>District</Label>
              <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                <SelectTrigger><SelectValue placeholder="Select district..." /></SelectTrigger>
                <SelectContent>
                  {districts.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Role</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleStart} disabled={!selectedDistrict || loading}>
              {loading ? "Starting..." : "Start Demo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export const DemoBanner = () => {
  const { demoActive, demoDistrict, demoRole, endDemo } = useDistrict();

  if (!demoActive) return null;

  return (
    <div className="flex items-center justify-center gap-3 bg-amber-100 border-b border-amber-200 px-4 py-2 text-sm font-medium text-amber-800">
      <Beaker className="h-4 w-4" />
      <span>
        DEMO MODE — Viewing as <strong>{demoDistrict?.name}</strong> ({demoRole?.replace("_", " ")})
      </span>
      <button
        onClick={() => { endDemo(); window.location.reload(); }}
        className="ml-2 rounded-md bg-amber-200 hover:bg-amber-300 p-1 transition-colors"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
};
