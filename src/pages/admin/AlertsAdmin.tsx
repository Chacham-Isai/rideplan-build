import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";
import { CheckCircle2 } from "lucide-react";

type Alert = Tables<"report_alerts">;

const AlertsAdmin = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAlerts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("report_alerts").select("*").order("created_at", { ascending: false });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else setAlerts(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchAlerts(); }, []);

  const acknowledge = async (id: string) => {
    const { error } = await supabase.from("report_alerts").update({ acknowledged: true }).eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else fetchAlerts();
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Bus</TableHead>
              <TableHead>Report Count</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : alerts.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No alerts</TableCell></TableRow>
            ) : alerts.map(a => (
              <TableRow key={a.id} className={a.acknowledged ? "opacity-60" : ""}>
                <TableCell className="text-sm">{new Date(a.created_at).toLocaleDateString()}</TableCell>
                <TableCell><Badge variant="outline">{a.alert_type}</Badge></TableCell>
                <TableCell className="text-sm font-mono">{a.bus_number}</TableCell>
                <TableCell className="text-sm">{a.report_count}</TableCell>
                <TableCell className="text-sm max-w-xs truncate">{a.details || "—"}</TableCell>
                <TableCell>
                  <Badge className={a.acknowledged ? "bg-success/20 text-success-foreground" : "bg-destructive/20 text-destructive"}>
                    {a.acknowledged ? "Acknowledged" : "Active"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {!a.acknowledged && (
                    <Button variant="ghost" size="sm" onClick={() => acknowledge(a.id)}>
                      <CheckCircle2 className="h-4 w-4 mr-1" /> Ack
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">{alerts.length} alert(s)</p>
    </div>
  );
};

export default AlertsAdmin;
