import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type DriverTip = Tables<"driver_tips">;

const TipsAdmin = () => {
  const [tips, setTips] = useState<DriverTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const fetchTips = async () => {
    setLoading(true);
    let query = supabase.from("driver_tips").select("*").order("created_at", { ascending: false });
    if (search) query = query.or(`bus_number.ilike.%${search}%,driver_name.ilike.%${search}%,tipper_name.ilike.%${search}%`);
    const { data, error } = await query;
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else setTips(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchTips(); }, [search]);

  const total = tips.reduce((sum, t) => sum + Number(t.tip_amount), 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <Input placeholder="Search bus, driver, or tipper..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" />
        <span className="text-sm text-muted-foreground ml-auto">Total: <strong className="text-foreground">${total.toFixed(2)}</strong></span>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Bus / Driver</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Tipper</TableHead>
              <TableHead>Message</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : tips.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No tips found</TableCell></TableRow>
            ) : tips.map(t => (
              <TableRow key={t.id}>
                <TableCell className="text-sm">{new Date(t.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-sm">{t.bus_number || "—"} / {t.driver_name || "—"}</TableCell>
                <TableCell className="text-sm font-semibold">${Number(t.tip_amount).toFixed(2)}</TableCell>
                <TableCell className="text-sm">{t.tipper_name}<br/><span className="text-muted-foreground text-xs">{t.tipper_email}</span></TableCell>
                <TableCell className="text-sm max-w-xs truncate">{t.message || "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">{tips.length} tip(s)</p>
    </div>
  );
};

export default TipsAdmin;
