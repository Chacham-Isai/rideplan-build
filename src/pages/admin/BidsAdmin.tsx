import { useEffect, useState } from "react";
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
import { toast } from "sonner";
import { Plus, Award, FileText, Users } from "lucide-react";

const bidStatusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  open: "bg-success/20 text-green-700",
  closed: "bg-primary/10 text-primary",
  awarded: "bg-accent/20 text-accent-foreground",
};

const responseStatusColors: Record<string, string> = {
  submitted: "bg-primary/10 text-primary",
  shortlisted: "bg-accent/20 text-accent-foreground",
  awarded: "bg-success/20 text-green-700",
  rejected: "bg-destructive/20 text-destructive",
};

const BidsAdmin = () => {
  const [bids, setBids] = useState<any[]>([]);
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showAddResponse, setShowAddResponse] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", routes_spec: "", open_date: "", close_date: "" });
  const [respForm, setRespForm] = useState({ contractor_name: "", proposed_rate: "", fleet_details: "", safety_record: "" });

  const fetchData = async () => {
    setLoading(true);
    const [b, r] = await Promise.all([
      supabase.from("bids").select("*").order("created_at", { ascending: false }),
      supabase.from("bid_responses").select("*"),
    ]);
    setBids(b.data || []);
    setResponses(r.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddBid = async () => {
    const { error } = await supabase.from("bids").insert({
      title: form.title,
      description: form.description || null,
      routes_spec: form.routes_spec || null,
      open_date: form.open_date || null,
      close_date: form.close_date || null,
    });
    if (error) toast.error(error.message);
    else { toast.success("Bid created"); setShowAdd(false); fetchData(); }
  };

  const handleAddResponse = async () => {
    if (!selected) return;
    // Score: price 40%, safety 25%, fleet 20%, experience 15% — simplified scoring
    const score = Math.min(100, Math.max(0,
      (respForm.proposed_rate ? 40 * (100000 / Number(respForm.proposed_rate)) : 0) +
      (respForm.safety_record ? 25 : 0) +
      (respForm.fleet_details ? 20 : 0) + 15
    ));
    const { error } = await supabase.from("bid_responses").insert({
      bid_id: selected.id,
      contractor_name: respForm.contractor_name,
      proposed_rate: Number(respForm.proposed_rate) || 0,
      fleet_details: respForm.fleet_details || null,
      safety_record: respForm.safety_record || null,
      total_score: Math.round(score * 10) / 10,
    });
    if (error) toast.error(error.message);
    else { toast.success("Response added"); setShowAddResponse(false); setRespForm({ contractor_name: "", proposed_rate: "", fleet_details: "", safety_record: "" }); fetchData(); }
  };

  const updateBidStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("bids").update({ status: status as any }).eq("id", id);
    if (error) toast.error(error.message);
    else fetchData();
  };

  const updateResponseStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("bid_responses").update({ status: status as any }).eq("id", id);
    if (error) toast.error(error.message);
    else fetchData();
  };

  const selectedResponses = selected ? responses.filter(r => r.bid_id === selected.id).sort((a, b) => (b.total_score || 0) - (a.total_score || 0)) : [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card className="p-4 flex items-center gap-3">
          <FileText className="w-8 h-8 text-primary" />
          <div><p className="text-2xl font-bold text-primary">{bids.length}</p><p className="text-xs text-muted-foreground">Total Bids</p></div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <Users className="w-8 h-8 text-accent" />
          <div><p className="text-2xl font-bold text-primary">{bids.filter(b => b.status === "open").length}</p><p className="text-xs text-muted-foreground">Open</p></div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <Award className="w-8 h-8 text-green-600" />
          <div><p className="text-2xl font-bold text-primary">{bids.filter(b => b.status === "awarded").length}</p><p className="text-xs text-muted-foreground">Awarded</p></div>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => setShowAdd(true)} className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Plus className="w-4 h-4 mr-1" /> New Bid Solicitation
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Open Date</TableHead>
              <TableHead>Close Date</TableHead>
              <TableHead>Responses</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : bids.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No bids</TableCell></TableRow>
            ) : bids.map(b => (
              <TableRow key={b.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelected(b)}>
                <TableCell className="font-medium">{b.title}</TableCell>
                <TableCell className="text-sm">{b.open_date ? new Date(b.open_date).toLocaleDateString() : "—"}</TableCell>
                <TableCell className="text-sm">{b.close_date ? new Date(b.close_date).toLocaleDateString() : "—"}</TableCell>
                <TableCell>{responses.filter(r => r.bid_id === b.id).length}</TableCell>
                <TableCell><Badge className={bidStatusColors[b.status] || ""}>{b.status}</Badge></TableCell>
                <TableCell>
                  <Select value={b.status} onValueChange={v => updateBidStatus(b.id, v)}>
                    <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="awarded">Awarded</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add Bid Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="font-display">New Bid Solicitation</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} /></div>
            <div><Label>Routes Specification</Label><Textarea value={form.routes_spec} onChange={e => setForm(f => ({ ...f, routes_spec: e.target.value }))} rows={2} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Open Date</Label><Input type="date" value={form.open_date} onChange={e => setForm(f => ({ ...f, open_date: e.target.value }))} /></div>
              <div><Label>Close Date</Label><Input type="date" value={form.close_date} onChange={e => setForm(f => ({ ...f, close_date: e.target.value }))} /></div>
            </div>
            <Button onClick={handleAddBid} className="w-full bg-accent text-accent-foreground">Create Bid</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bid Detail with Responses */}
      <Dialog open={!!selected} onOpenChange={open => { if (!open) setSelected(null); }}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader><DialogTitle className="font-display">{selected.title}</DialogTitle></DialogHeader>
              <div className="space-y-4 text-sm">
                {selected.description && <p className="text-muted-foreground">{selected.description}</p>}
                {selected.routes_spec && <div className="p-3 bg-secondary rounded"><span className="text-muted-foreground">Routes Spec:</span> {selected.routes_spec}</div>}

                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-primary">Bid Responses ({selectedResponses.length})</h3>
                  <Button size="sm" onClick={() => setShowAddResponse(true)} className="bg-accent text-accent-foreground">
                    <Plus className="w-4 h-4 mr-1" /> Add Response
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground">Scoring: Price 40% · Safety 25% · Fleet Quality 20% · Experience 15%</p>

                {selectedResponses.length > 0 && (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Contractor</TableHead>
                          <TableHead>Rate</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedResponses.map(r => (
                          <TableRow key={r.id}>
                            <TableCell className="font-medium">{r.contractor_name}</TableCell>
                            <TableCell>${Number(r.proposed_rate).toLocaleString()}</TableCell>
                            <TableCell className="font-semibold">{r.total_score?.toFixed(1) || "—"}</TableCell>
                            <TableCell><Badge className={responseStatusColors[r.status] || ""}>{r.status}</Badge></TableCell>
                            <TableCell>
                              <Select value={r.status} onValueChange={v => updateResponseStatus(r.id, v)}>
                                <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="submitted">Submitted</SelectItem>
                                  <SelectItem value="shortlisted">Shortlisted</SelectItem>
                                  <SelectItem value="awarded">Awarded</SelectItem>
                                  <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Response Dialog */}
      <Dialog open={showAddResponse} onOpenChange={setShowAddResponse}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="font-display">Add Bid Response</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Contractor Name</Label><Input value={respForm.contractor_name} onChange={e => setRespForm(f => ({ ...f, contractor_name: e.target.value }))} /></div>
            <div><Label>Proposed Rate ($)</Label><Input type="number" value={respForm.proposed_rate} onChange={e => setRespForm(f => ({ ...f, proposed_rate: e.target.value }))} /></div>
            <div><Label>Fleet Details</Label><Textarea value={respForm.fleet_details} onChange={e => setRespForm(f => ({ ...f, fleet_details: e.target.value }))} rows={2} /></div>
            <div><Label>Safety Record</Label><Textarea value={respForm.safety_record} onChange={e => setRespForm(f => ({ ...f, safety_record: e.target.value }))} rows={2} /></div>
            <Button onClick={handleAddResponse} className="w-full bg-accent text-accent-foreground">Add Response</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BidsAdmin;
