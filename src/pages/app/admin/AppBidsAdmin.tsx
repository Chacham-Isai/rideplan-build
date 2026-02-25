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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Eye, Award, Loader2, FileText, Gavel } from "lucide-react";
import { toast } from "sonner";

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600 border-gray-200",
  open: "bg-blue-100 text-blue-700 border-blue-200",
  closed: "bg-amber-100 text-amber-700 border-amber-200",
  awarded: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const RESPONSE_STYLES: Record<string, string> = {
  submitted: "bg-blue-100 text-blue-700 border-blue-200",
  shortlisted: "bg-amber-100 text-amber-700 border-amber-200",
  awarded: "bg-emerald-100 text-emerald-700 border-emerald-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
};

const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const AppBidsAdmin = () => {
  const { district } = useDistrict();
  const { user } = useAuth();
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ title: "", description: "", routes_spec: "", open_date: "", close_date: "" });
  const [saving, setSaving] = useState(false);

  // Detail
  const [selectedBid, setSelectedBid] = useState<any>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  // Add response
  const [showAddResponse, setShowAddResponse] = useState(false);
  const [responseForm, setResponseForm] = useState({ contractor_name: "", proposed_rate: "", fleet_details: "", safety_record: "" });

  const fetchBids = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("bids").select("*").order("created_at", { ascending: false });
    setBids(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchBids(); }, [fetchBids]);

  const openDetail = async (bid: any) => {
    setSelectedBid(bid);
    setDetailLoading(true);
    const { data } = await supabase.from("bid_responses").select("*").eq("bid_id", bid.id).order("total_score", { ascending: false });
    setResponses(data ?? []);
    setDetailLoading(false);
  };

  const handleCreate = async () => {
    if (!createForm.title) { toast.error("Title required"); return; }
    setSaving(true);
    const { error } = await supabase.from("bids").insert({
      title: createForm.title,
      description: createForm.description || null,
      routes_spec: createForm.routes_spec || null,
      open_date: createForm.open_date || null,
      close_date: createForm.close_date || null,
      status: "draft",
    });
    if (error) toast.error(error.message);
    else { toast.success("Bid created"); setShowCreate(false); setCreateForm({ title: "", description: "", routes_spec: "", open_date: "", close_date: "" }); fetchBids(); }
    setSaving(false);
  };

  const handleAddResponse = async () => {
    if (!selectedBid || !responseForm.contractor_name) { toast.error("Contractor name required"); return; }
    setSaving(true);
    const proposedRate = parseFloat(responseForm.proposed_rate) || 0;
    // Simple scoring: lower rate = higher score (relative to $85000 benchmark)
    const priceScore = Math.max(0, Math.min(100, ((85000 - proposedRate) / 85000) * 100)) * 0.4;
    const totalScore = Math.round(priceScore + 25 + 20 + 15); // baseline scores for other categories

    const { error } = await supabase.from("bid_responses").insert({
      bid_id: selectedBid.id,
      contractor_name: responseForm.contractor_name,
      proposed_rate: proposedRate,
      fleet_details: responseForm.fleet_details || null,
      safety_record: responseForm.safety_record || null,
      total_score: totalScore,
      status: "submitted",
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Response added");
      setShowAddResponse(false);
      setResponseForm({ contractor_name: "", proposed_rate: "", fleet_details: "", safety_record: "" });
      openDetail(selectedBid);
    }
    setSaving(false);
  };

  const awardBid = async (responseId: string) => {
    if (!selectedBid) return;
    const { error: e1 } = await supabase.from("bid_responses").update({ status: "awarded" }).eq("id", responseId);
    const { error: e2 } = await supabase.from("bids").update({ status: "awarded" }).eq("id", selectedBid.id);
    if (e1 || e2) toast.error("Error awarding bid");
    else {
      toast.success("Bid awarded!");
      fetchBids();
      openDetail({ ...selectedBid, status: "awarded" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Bid Management</h1>
          <p className="text-sm text-muted-foreground">{bids.length} bids total</p>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-1" /> Create Bid
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Draft", count: bids.filter(b => b.status === "draft").length },
          { label: "Open", count: bids.filter(b => b.status === "open").length },
          { label: "Closed", count: bids.filter(b => b.status === "closed").length },
          { label: "Awarded", count: bids.filter(b => b.status === "awarded").length },
        ].map(s => (
          <Card key={s.label} className="border-0 shadow-sm">
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">{s.label}</p>
              <p className="mt-1 text-2xl font-bold">{s.count}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bids Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Open Date</TableHead>
                <TableHead>Close Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="h-32 text-center"><Loader2 className="h-6 w-6 mx-auto animate-spin text-primary" /></TableCell></TableRow>
              ) : bids.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="h-32 text-center text-muted-foreground">No bids created yet</TableCell></TableRow>
              ) : bids.map(b => (
                <TableRow key={b.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openDetail(b)}>
                  <TableCell className="font-medium">{b.title}</TableCell>
                  <TableCell><Badge variant="outline" className={STATUS_STYLES[b.status] ?? ""}>{b.status}</Badge></TableCell>
                  <TableCell className="text-xs">{b.open_date ? new Date(b.open_date).toLocaleDateString() : "—"}</TableCell>
                  <TableCell className="text-xs">{b.close_date ? new Date(b.close_date).toLocaleDateString() : "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{b.description ?? "—"}</TableCell>
                  <TableCell><Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Bid Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create New Bid</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Title</Label><Input value={createForm.title} onChange={e => setCreateForm({ ...createForm, title: e.target.value })} className="mt-1" /></div>
            <div><Label>Description</Label><Textarea value={createForm.description} onChange={e => setCreateForm({ ...createForm, description: e.target.value })} className="mt-1" rows={3} /></div>
            <div><Label>Routes/Services Spec</Label><Textarea value={createForm.routes_spec} onChange={e => setCreateForm({ ...createForm, routes_spec: e.target.value })} className="mt-1" rows={2} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Open Date</Label><Input type="date" value={createForm.open_date} onChange={e => setCreateForm({ ...createForm, open_date: e.target.value })} className="mt-1" /></div>
              <div><Label>Close Date</Label><Input type="date" value={createForm.close_date} onChange={e => setCreateForm({ ...createForm, close_date: e.target.value })} className="mt-1" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving}>{saving ? "Creating..." : "Create Bid"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bid Detail Dialog */}
      <Dialog open={!!selectedBid} onOpenChange={() => setSelectedBid(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedBid && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Gavel className="h-5 w-5" /> {selectedBid.title}
                  <Badge variant="outline" className={STATUS_STYLES[selectedBid.status] ?? ""}>{selectedBid.status}</Badge>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 text-sm">
                {selectedBid.description && <p className="text-muted-foreground">{selectedBid.description}</p>}
                {selectedBid.routes_spec && (
                  <div>
                    <span className="text-muted-foreground font-medium">Spec:</span>
                    <p className="text-foreground">{selectedBid.routes_spec}</p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Responses ({responses.length})</h3>
                  <Button size="sm" variant="outline" onClick={() => setShowAddResponse(true)}>
                    <Plus className="h-4 w-4 mr-1" /> Add Response
                  </Button>
                </div>

                {detailLoading ? (
                  <div className="text-center py-4"><Loader2 className="h-5 w-5 mx-auto animate-spin text-primary" /></div>
                ) : responses.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No responses yet</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Contractor</TableHead>
                        <TableHead className="text-right">Proposed Rate</TableHead>
                        <TableHead className="text-right">Score</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {responses.map(r => (
                        <TableRow key={r.id}>
                          <TableCell className="font-medium">{r.contractor_name}</TableCell>
                          <TableCell className="text-right">{fmt.format(r.proposed_rate)}</TableCell>
                          <TableCell className="text-right font-bold">{r.total_score ?? "—"}</TableCell>
                          <TableCell><Badge variant="outline" className={RESPONSE_STYLES[r.status] ?? ""}>{r.status}</Badge></TableCell>
                          <TableCell>
                            {selectedBid.status !== "awarded" && r.status !== "awarded" && (
                              <Button size="sm" variant="outline" onClick={() => awardBid(r.id)}>
                                <Award className="h-3 w-3 mr-1" /> Award
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Response Dialog */}
      <Dialog open={showAddResponse} onOpenChange={setShowAddResponse}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Contractor Response</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Contractor Name</Label><Input value={responseForm.contractor_name} onChange={e => setResponseForm({ ...responseForm, contractor_name: e.target.value })} className="mt-1" /></div>
            <div><Label>Proposed Rate ($)</Label><Input type="number" value={responseForm.proposed_rate} onChange={e => setResponseForm({ ...responseForm, proposed_rate: e.target.value })} className="mt-1" /></div>
            <div><Label>Fleet Details</Label><Textarea value={responseForm.fleet_details} onChange={e => setResponseForm({ ...responseForm, fleet_details: e.target.value })} className="mt-1" rows={2} /></div>
            <div><Label>Safety Record</Label><Textarea value={responseForm.safety_record} onChange={e => setResponseForm({ ...responseForm, safety_record: e.target.value })} className="mt-1" rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddResponse(false)}>Cancel</Button>
            <Button onClick={handleAddResponse} disabled={saving}>{saving ? "Adding..." : "Add Response"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppBidsAdmin;
