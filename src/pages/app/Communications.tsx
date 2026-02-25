import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useDistrict } from "@/contexts/DistrictContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Search, Loader2, Plus, Phone, Mail, MessageCircle, Users,
  ArrowDownLeft, ArrowUpRight, Building2,
} from "lucide-react";
import { toast } from "sonner";

const CHANNEL_ICON: Record<string, React.ElementType> = {
  phone: Phone, email: Mail, text: MessageCircle, in_person: Users,
};

const DIRECTION_ICON: Record<string, { icon: React.ElementType; color: string }> = {
  inbound: { icon: ArrowDownLeft, color: "text-blue-600" },
  outbound: { icon: ArrowUpRight, color: "text-emerald-600" },
};

const CONTACT_COLOR: Record<string, string> = {
  parent: "bg-blue-50 text-blue-700",
  school: "bg-amber-50 text-amber-700",
  contractor: "bg-purple-50 text-purple-700",
  other_district: "bg-cyan-50 text-cyan-700",
};

type CommLog = {
  id: string;
  contact_type: string;
  contact_name: string;
  direction: string;
  channel: string;
  subject: string;
  notes: string | null;
  created_at: string;
};

const Communications = () => {
  const { district } = useDistrict();
  const { user } = useAuth();
  const [logs, setLogs] = useState<CommLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [contactFilter, setContactFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    contact_type: "parent", contact_name: "", direction: "inbound",
    channel: "phone", subject: "", notes: "",
  });
  const [saving, setSaving] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    let query = supabase.from("communication_log").select("*").order("created_at", { ascending: false });
    if (contactFilter !== "all") query = query.eq("contact_type", contactFilter as any);
    if (channelFilter !== "all") query = query.eq("channel", channelFilter as any);
    if (search) query = query.or(`contact_name.ilike.%${search}%,subject.ilike.%${search}%`);
    const { data } = await query;
    setLogs((data as CommLog[]) ?? []);
    setLoading(false);
  }, [search, contactFilter, channelFilter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleAdd = async () => {
    if (!form.contact_name || !form.subject || !district || !user) {
      toast.error("Fill required fields"); return;
    }
    setSaving(true);
    const { error } = await supabase.from("communication_log").insert({
      district_id: district.id,
      contact_type: form.contact_type as any,
      contact_name: form.contact_name,
      direction: form.direction as any,
      channel: form.channel as any,
      subject: form.subject,
      notes: form.notes || null,
      logged_by: user.id,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Communication logged");
      setShowAdd(false);
      setForm({ contact_type: "parent", contact_name: "", direction: "inbound", channel: "phone", subject: "", notes: "" });
      fetchLogs();
    }
    setSaving(false);
  };

  const inboundCount = logs.filter(l => l.direction === "inbound").length;
  const outboundCount = logs.filter(l => l.direction === "outbound").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Communication Log</h1>
          <p className="text-sm text-muted-foreground">Track calls, emails & texts with parents, schools and contractors</p>
        </div>
        <Button size="sm" onClick={() => setShowAdd(true)}>
          <Plus className="h-4 w-4 mr-1" /> Log Communication
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-0 shadow-sm"><CardContent className="p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted"><MessageCircle className="h-5 w-5 text-foreground" /></div>
          <div><p className="text-xs text-muted-foreground uppercase">Total</p><p className="text-xl font-bold">{logs.length}</p></div>
        </CardContent></Card>
        <Card className="border-0 shadow-sm"><CardContent className="p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50"><ArrowDownLeft className="h-5 w-5 text-blue-600" /></div>
          <div><p className="text-xs text-muted-foreground uppercase">Inbound</p><p className="text-xl font-bold">{inboundCount}</p></div>
        </CardContent></Card>
        <Card className="border-0 shadow-sm"><CardContent className="p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50"><ArrowUpRight className="h-5 w-5 text-emerald-600" /></div>
          <div><p className="text-xs text-muted-foreground uppercase">Outbound</p><p className="text-xl font-bold">{outboundCount}</p></div>
        </CardContent></Card>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search contacts or subjects..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <select value={contactFilter} onChange={e => setContactFilter(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
          <option value="all">All Contacts</option>
          <option value="parent">Parents</option>
          <option value="school">Schools</option>
          <option value="contractor">Contractors</option>
          <option value="other_district">Other Districts</option>
        </select>
        <select value={channelFilter} onChange={e => setChannelFilter(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
          <option value="all">All Channels</option>
          <option value="phone">Phone</option>
          <option value="email">Email</option>
          <option value="text">Text</option>
          <option value="in_person">In Person</option>
        </select>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Direction</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Date</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="h-32 text-center"><Loader2 className="h-6 w-6 mx-auto animate-spin text-primary" /></TableCell></TableRow>
              ) : logs.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="h-32 text-center text-muted-foreground">No communications logged</TableCell></TableRow>
              ) : logs.map(l => {
                const dir = DIRECTION_ICON[l.direction] ?? DIRECTION_ICON.inbound;
                const ChannelIcon = CHANNEL_ICON[l.channel] ?? Phone;
                return (
                  <TableRow key={l.id}>
                    <TableCell><dir.icon className={`h-4 w-4 ${dir.color}`} /></TableCell>
                    <TableCell>
                      <div>
                        <span className="font-medium">{l.contact_name}</span>
                        <span className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${CONTACT_COLOR[l.contact_type] ?? ""}`}>
                          {l.contact_type.replace("_", " ")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell><ChannelIcon className="h-4 w-4 text-muted-foreground" /></TableCell>
                    <TableCell className="max-w-[300px]">
                      <p className="font-medium truncate">{l.subject}</p>
                      {l.notes && <p className="text-xs text-muted-foreground truncate">{l.notes}</p>}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(l.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Log Communication</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Contact Type</label>
                <select value={form.contact_type} onChange={e => setForm({ ...form, contact_type: e.target.value })} className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="parent">Parent</option>
                  <option value="school">School</option>
                  <option value="contractor">Contractor</option>
                  <option value="other_district">Other District</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Direction</label>
                <select value={form.direction} onChange={e => setForm({ ...form, direction: e.target.value })} className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="inbound">Inbound</option>
                  <option value="outbound">Outbound</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Contact Name *</label>
              <Input value={form.contact_name} onChange={e => setForm({ ...form, contact_name: e.target.value })} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Channel</label>
              <select value={form.channel} onChange={e => setForm({ ...form, channel: e.target.value })} className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value="phone">Phone</option>
                <option value="email">Email</option>
                <option value="text">Text</option>
                <option value="in_person">In Person</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Subject *</label>
              <Input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Notes</label>
              <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={saving}>{saving ? "Saving..." : "Log Communication"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Communications;
