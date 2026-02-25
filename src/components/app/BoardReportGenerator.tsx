import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useDistrict } from "@/contexts/DistrictContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, Download, FileText } from "lucide-react";
import { toast } from "sonner";

const SECTIONS = [
  { key: "executive", label: "Executive Summary" },
  { key: "financial", label: "Financial Overview" },
  { key: "benchmarks", label: "Regional Benchmarks" },
  { key: "routes", label: "Route Analysis" },
  { key: "contractors", label: "Contractor Performance" },
  { key: "compliance", label: "Compliance Status" },
  { key: "safety", label: "Safety Reports" },
  { key: "requests", label: "Service Requests" },
] as const;

const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BoardReportGenerator = ({ open, onOpenChange }: Props) => {
  const { district } = useDistrict();
  const [selectedSections, setSelectedSections] = useState<Set<string>>(
    new Set(SECTIONS.map(s => s.key))
  );
  const [generating, setGenerating] = useState(false);
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 3);
    return d.toISOString().split("T")[0];
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split("T")[0]);

  const toggleSection = (key: string) => {
    const next = new Set(selectedSections);
    if (next.has(key)) next.delete(key); else next.add(key);
    setSelectedSections(next);
  };

  const generate = async () => {
    if (!district) return;
    setGenerating(true);

    try {
      const [routesRes, contractsRes, requestsRes, safetyRes, certsRes, benchRes] = await Promise.all([
        supabase.from("routes").select("*"),
        supabase.from("contracts").select("*"),
        supabase.from("service_requests").select("*").gte("created_at", dateFrom).lte("created_at", dateTo),
        supabase.from("safety_reports").select("*").gte("created_at", dateFrom).lte("created_at", dateTo),
        supabase.from("driver_certifications").select("*"),
        supabase.rpc("get_regional_benchmarks"),
      ]);

      const routes = routesRes.data ?? [];
      const contracts = contractsRes.data ?? [];
      const requests = requestsRes.data ?? [];
      const safety = safetyRes.data ?? [];
      const certs = certsRes.data ?? [];
      const benchmarks = benchRes.data as any;

      const activeRoutes = routes.filter(r => r.status === "active");
      const totalStudents = activeRoutes.reduce((s, r) => s + (r.total_students ?? 0), 0);
      const avgUtil = activeRoutes.length
        ? Math.round(activeRoutes.reduce((s, r) => s + (r.capacity && r.capacity > 0 ? ((r.total_students ?? 0) / r.capacity) * 100 : 0), 0) / activeRoutes.length)
        : 0;
      const totalMiles = Math.round(routes.reduce((s, r) => s + (r.total_miles ?? 0), 0));
      const avgOnTime = activeRoutes.length
        ? Math.round(activeRoutes.reduce((s, r) => s + (r.on_time_pct ?? 0), 0) / activeRoutes.length * 10) / 10
        : 0;

      const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

      let md = `# ${district.name} — Board Transportation Report\n\n`;
      md += `**Generated:** ${date}  \n**Period:** ${dateFrom} to ${dateTo}\n\n---\n\n`;

      if (selectedSections.has("executive")) {
        md += `## Executive Summary\n\n`;
        md += `| Metric | Value |\n|--------|-------|\n`;
        md += `| Total Students Transported | ${totalStudents.toLocaleString()} |\n`;
        md += `| Active Routes | ${activeRoutes.length} of ${routes.length} |\n`;
        md += `| Average Utilization | ${avgUtil}% |\n`;
        md += `| On-Time Rate | ${avgOnTime}% |\n`;
        md += `| Daily Route Miles | ${totalMiles.toLocaleString()} |\n`;
        md += `| Active Contracts | ${contracts.filter(c => c.status === "active").length} |\n`;
        md += `| Open Service Requests | ${requests.filter(r => r.status === "open" || r.status === "in_progress").length} |\n`;
        md += `| Safety Incidents (Period) | ${safety.length} |\n\n`;
      }

      if (selectedSections.has("financial")) {
        const totalContract = contracts.filter(c => c.status === "active").reduce((s, c) => s + (c.annual_value ?? 0), 0);
        md += `## Financial Overview\n\n`;
        md += `| Metric | Value |\n|--------|-------|\n`;
        md += `| Total Contract Value | ${fmt.format(totalContract)} |\n`;
        md += `| Active Contracts | ${contracts.filter(c => c.status === "active").length} |\n`;
        md += `| Average Rate/Route | ${fmt.format(totalContract / Math.max(1, activeRoutes.length))} |\n\n`;
      }

      if (selectedSections.has("benchmarks") && benchmarks) {
        md += `## Regional Benchmarks\n\n`;
        md += `| Metric | District | Regional Avg |\n|--------|----------|-------------|\n`;
        md += `| On-Time % | ${avgOnTime}% | ${benchmarks.avg_on_time_pct ?? "N/A"}% |\n`;
        md += `| Utilization | ${avgUtil}% | ${benchmarks.avg_utilization ?? "N/A"}% |\n\n`;
      }

      if (selectedSections.has("routes")) {
        md += `## Route Analysis\n\n`;
        const ghostRoutes = routes.filter(r => {
          const pct = r.capacity && r.capacity > 0 ? ((r.total_students ?? 0) / r.capacity) * 100 : 0;
          return pct < 50;
        });
        md += `- **Ghost Routes (<50% utilization):** ${ghostRoutes.length}\n`;
        md += `- **Long Duration Routes (>60 min):** ${routes.filter(r => (r.avg_ride_time_min ?? 0) > 60).length}\n\n`;
      }

      if (selectedSections.has("contractors")) {
        md += `## Contractor Performance\n\n`;
        md += `| Contractor | Status | Routes | Annual Value |\n|------------|--------|--------|-------------|\n`;
        contracts.forEach(c => {
          md += `| ${c.contractor_name} | ${c.status} | ${c.routes_count} | ${fmt.format(c.annual_value)} |\n`;
        });
        md += `\n`;
      }

      if (selectedSections.has("compliance")) {
        md += `## Compliance Status\n\n`;
        const expiredCerts = certs.filter(c => c.status === "expired").length;
        const expiringCerts = certs.filter(c => c.status === "expiring").length;
        md += `- **Total Driver Certifications:** ${certs.length}\n`;
        md += `- **Expired:** ${expiredCerts}\n`;
        md += `- **Expiring Soon:** ${expiringCerts}\n\n`;
      }

      if (selectedSections.has("safety")) {
        md += `## Safety Reports\n\n`;
        md += `- **Total Incidents (Period):** ${safety.length}\n`;
        const byType: Record<string, number> = {};
        safety.forEach(s => { byType[s.report_type] = (byType[s.report_type] ?? 0) + 1; });
        Object.entries(byType).forEach(([type, count]) => {
          md += `- ${type}: ${count}\n`;
        });
        md += `\n`;
      }

      if (selectedSections.has("requests")) {
        md += `## Service Requests\n\n`;
        md += `- **Total (Period):** ${requests.length}\n`;
        md += `- **Open:** ${requests.filter(r => r.status === "open").length}\n`;
        md += `- **Resolved:** ${requests.filter(r => r.status === "resolved" || r.status === "closed").length}\n`;
        md += `- **Urgent:** ${requests.filter(r => r.priority === "urgent").length}\n\n`;
      }

      md += `---\n\n*Report generated by RideLine AI on ${date}*\n`;

      // Download as .md
      const blob = new Blob([md], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${district.name.replace(/\s+/g, "_")}_Board_Report_${dateTo}.md`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success("Board report generated!");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to generate report");
    }
    setGenerating(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" /> Generate Board Report
          </DialogTitle>
          <DialogDescription>
            Select sections to include and the reporting period.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">From</Label>
              <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">To</Label>
              <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold">Sections</Label>
            {SECTIONS.map(s => (
              <label key={s.key} className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox
                  checked={selectedSections.has(s.key)}
                  onCheckedChange={() => toggleSection(s.key)}
                />
                {s.label}
              </label>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={generate} disabled={generating || selectedSections.size === 0}>
            {generating ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Download className="h-4 w-4 mr-1" />}
            Generate Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
