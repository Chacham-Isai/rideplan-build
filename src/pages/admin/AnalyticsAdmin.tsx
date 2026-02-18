import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { format, subDays, startOfDay } from "date-fns";
import { AlertTriangle, FileText, DollarSign, TrendingUp } from "lucide-react";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--destructive))",
  "hsl(var(--accent))",
  "hsl(var(--muted-foreground))",
];

const trendChartConfig: ChartConfig = {
  safety: { label: "Safety Reports", color: "hsl(var(--destructive))" },
  driver: { label: "Driver Reports", color: "hsl(var(--primary))" },
  tips: { label: "Tips", color: "hsl(var(--accent))" },
};

const statusChartConfig: ChartConfig = {
  new: { label: "New", color: "hsl(var(--primary))" },
  reviewing: { label: "Reviewing", color: "hsl(var(--accent))" },
  resolved: { label: "Resolved", color: "hsl(var(--muted-foreground))" },
};

const typeChartConfig: ChartConfig = {
  bullying: { label: "Bullying", color: "hsl(var(--destructive))" },
  driver_safety: { label: "Driver Safety", color: "hsl(var(--primary))" },
  other: { label: "Other", color: "hsl(var(--accent))" },
};

const AnalyticsAdmin = () => {
  const [safetyReports, setSafetyReports] = useState<any[]>([]);
  const [driverReports, setDriverReports] = useState<any[]>([]);
  const [tips, setTips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const [s, d, t] = await Promise.all([
        supabase.from("safety_reports").select("*").order("created_at", { ascending: true }),
        supabase.from("driver_reports").select("*").order("created_at", { ascending: true }),
        supabase.from("driver_tips").select("*").order("created_at", { ascending: true }),
      ]);
      if (s.error || d.error || t.error) {
        toast({ title: "Error loading analytics", variant: "destructive" });
      }
      setSafetyReports(s.data || []);
      setDriverReports(d.data || []);
      setTips(t.data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  // Daily trend data (last 30 days)
  const trendData = useMemo(() => {
    const days = 30;
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const day = startOfDay(subDays(new Date(), i));
      const dayStr = format(day, "yyyy-MM-dd");
      const label = format(day, "MMM d");
      result.push({
        date: label,
        safety: safetyReports.filter(r => r.created_at?.startsWith(dayStr)).length,
        driver: driverReports.filter(r => r.created_at?.startsWith(dayStr)).length,
        tips: tips.filter(t => t.created_at?.startsWith(dayStr)).length,
      });
    }
    return result;
  }, [safetyReports, driverReports, tips]);

  // Status breakdown for safety reports
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    safetyReports.forEach(r => { counts[r.status] = (counts[r.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [safetyReports]);

  // Safety report type breakdown
  const typeData = useMemo(() => {
    const counts: Record<string, number> = {};
    safetyReports.forEach(r => { counts[r.report_type] = (counts[r.report_type] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [safetyReports]);

  // Tip totals by week (last 8 weeks)
  const tipTrendData = useMemo(() => {
    const weeks = 8;
    const result = [];
    for (let i = weeks - 1; i >= 0; i--) {
      const weekStart = startOfDay(subDays(new Date(), i * 7 + 6));
      const weekEnd = startOfDay(subDays(new Date(), i * 7));
      const label = format(weekEnd, "MMM d");
      const weekTips = tips.filter(t => {
        const d = new Date(t.created_at);
        return d >= weekStart && d <= new Date(weekEnd.getTime() + 86400000);
      });
      result.push({
        week: label,
        amount: weekTips.reduce((sum: number, t: any) => sum + Number(t.tip_amount), 0),
        count: weekTips.length,
      });
    }
    return result;
  }, [tips]);

  const totalTips = tips.reduce((sum, t) => sum + Number(t.tip_amount), 0);

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Safety Reports</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safetyReports.length}</div>
            <p className="text-xs text-muted-foreground">{safetyReports.filter(r => r.status === "new").length} unresolved</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Driver Reports</CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{driverReports.length}</div>
            <p className="text-xs text-muted-foreground">{driverReports.filter(r => r.status === "new").length} unresolved</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Tips</CardTitle>
            <DollarSign className="h-4 w-4 text-accent-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalTips.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{tips.length} tip(s)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Resolution Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {safetyReports.length > 0
                ? Math.round((safetyReports.filter(r => r.status === "resolved").length / safetyReports.length) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Safety reports resolved</p>
          </CardContent>
        </Card>
      </div>

      {/* Report trends line chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Report Trends (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={trendChartConfig} className="h-[300px] w-full">
            <LineChart data={trendData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" className="fill-muted-foreground" />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} className="fill-muted-foreground" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="safety" stroke="var(--color-safety)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="driver" stroke="var(--color-driver)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="tips" stroke="var(--color-tips)" strokeWidth={2} dot={false} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status breakdown pie */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Safety Report Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={statusChartConfig} className="h-[250px] w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={2}>
                  {statusData.map((entry, i) => (
                    <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="flex justify-center gap-4 mt-2">
              {statusData.map((entry, i) => (
                <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                  <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="capitalize text-muted-foreground">{entry.name}: {entry.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Type breakdown bar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Report Types</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={typeChartConfig} className="h-[250px] w-full">
              <BarChart data={typeData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {typeData.map((entry, i) => (
                    <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Tip trends bar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Weekly Tips ($)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ amount: { label: "Amount", color: "hsl(var(--primary))" } }} className="h-[250px] w-full">
              <BarChart data={tipTrendData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="amount" fill="var(--color-amount)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsAdmin;
