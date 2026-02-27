import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Sparkles, Merge, AlertTriangle, Clock, TrendingDown, Shield, Copy } from "lucide-react";
import { toast } from "sonner";

interface OptimizationResult {
  summary: {
    total_routes_analyzed: number;
    routes_to_eliminate: number;
    projected_annual_savings: number;
    avg_utilization_after: number;
    safety_flags: number;
  };
  consolidations: Array<{
    merge_routes: string[];
    resulting_students: number;
    resulting_utilization: number;
    savings: number;
    rationale: string;
    risk: string;
  }>;
  bell_time_suggestions?: Array<{
    school: string;
    current_tier?: number;
    suggested_tier?: number;
    buses_freed?: number;
    rationale: string;
  }>;
  safety_alerts: Array<{
    route: string;
    issue: string;
    severity: string;
    recommendation: string;
  }>;
  narrative: string;
}

interface RouteOptimizerProps {
  routes: Array<any>;
  districtId: string | undefined;
}

const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const RouteOptimizer = ({ routes, districtId }: RouteOptimizerProps) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);

  const runOptimization = async () => {
    if (!districtId || routes.length === 0) {
      toast.error("No route data available to analyze");
      return;
    }

    setLoading(true);
    try {
      // Fetch stops and bell schedules in parallel
      const [stopsRes, bellRes] = await Promise.all([
        supabase.from("route_stops").select("*").not("lat", "is", null).order("stop_order"),
        supabase.from("bell_schedules").select("*"),
      ]);

      const { data, error } = await supabase.functions.invoke("optimize-routes", {
        body: {
          routes,
          stops: stopsRes.data ?? [],
          bellSchedules: bellRes.data ?? [],
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setResult(data as OptimizationResult);
      toast.success("Optimization analysis complete");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Optimization failed");
    } finally {
      setLoading(false);
    }
  };

  const copyNarrative = () => {
    if (result?.narrative) {
      navigator.clipboard.writeText(result.narrative);
      toast.success("Copied to clipboard");
    }
  };

  if (!result) {
    return (
      <div className="space-y-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-8 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">AI Route Optimization</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Analyze your {routes.length} routes using AI to identify consolidation opportunities,
              bell-time optimizations, and safety concerns. Average savings: $85K per eliminated route.
            </p>
            <Button onClick={runOptimization} disabled={loading || routes.length === 0} size="lg">
              {loading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing Routes...</>
              ) : (
                <><Sparkles className="h-4 w-4 mr-2" /> Run AI Optimization</>
              )}
            </Button>
            {loading && (
              <p className="text-xs text-muted-foreground animate-pulse">
                AI is analyzing {routes.length} routes, stops, and schedules...
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const { summary, consolidations, bell_time_suggestions, safety_alerts, narrative } = result;

  return (
    <div className="space-y-6">
      {/* Re-run button */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-foreground">Optimization Results</h2>
        <Button variant="outline" size="sm" onClick={runOptimization} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1" />}
          Re-analyze
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-5">
        <Card className="border-0 shadow-sm"><CardContent className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Analyzed</p>
          <p className="mt-1 text-xl font-bold">{summary.total_routes_analyzed}</p>
        </CardContent></Card>
        <Card className="border-0 shadow-sm border-l-4 border-l-red-400"><CardContent className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Can Eliminate</p>
          <p className="mt-1 text-xl font-bold text-red-600">{summary.routes_to_eliminate}</p>
        </CardContent></Card>
        <Card className="border-0 shadow-sm border-l-4 border-l-emerald-400"><CardContent className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Annual Savings</p>
          <p className="mt-1 text-xl font-bold text-emerald-600">{fmt.format(summary.projected_annual_savings)}</p>
        </CardContent></Card>
        <Card className="border-0 shadow-sm"><CardContent className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Util. After</p>
          <p className="mt-1 text-xl font-bold">{summary.avg_utilization_after}%</p>
        </CardContent></Card>
        <Card className="border-0 shadow-sm"><CardContent className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Safety Flags</p>
          <p className="mt-1 text-xl font-bold text-amber-600">{summary.safety_flags}</p>
        </CardContent></Card>
      </div>

      {/* Consolidation suggestions */}
      {consolidations.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Merge className="h-4 w-4" /> Route Consolidations ({consolidations.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {consolidations.map((c, i) => (
              <div key={i} className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">
                      Merge: {c.merge_routes.join(" + ")}
                    </span>
                    <Badge variant={c.risk === "low" ? "secondary" : c.risk === "medium" ? "outline" : "destructive"}>
                      {c.risk} risk
                    </Badge>
                  </div>
                  <span className="font-bold text-emerald-600 text-sm">{fmt.format(c.savings)}/yr</span>
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>{c.resulting_students} students</span>
                  <span>{c.resulting_utilization}% utilization</span>
                </div>
                <p className="text-sm text-muted-foreground">{c.rationale}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Bell time suggestions */}
      {bell_time_suggestions && bell_time_suggestions.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" /> Bell-Time Tiering Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {bell_time_suggestions.map((b, i) => (
              <div key={i} className="rounded-lg border p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-sm">{b.school}</p>
                    {b.current_tier && b.suggested_tier && (
                      <p className="text-xs text-muted-foreground">
                        Tier {b.current_tier} → Tier {b.suggested_tier}
                        {b.buses_freed ? ` (${b.buses_freed} buses freed)` : ""}
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{b.rationale}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Safety alerts */}
      {safety_alerts.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" /> Safety Alerts ({safety_alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {safety_alerts.map((a, i) => (
              <div key={i} className={`rounded-lg border p-4 ${a.severity === "critical" ? "border-red-200 bg-red-50/50" : "border-amber-200 bg-amber-50/50"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className={`h-4 w-4 ${a.severity === "critical" ? "text-red-600" : "text-amber-600"}`} />
                  <span className="font-medium text-sm">Route {a.route}</span>
                  <Badge variant={a.severity === "critical" ? "destructive" : "outline"} className="text-xs">
                    {a.severity}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{a.issue}</p>
                <p className="text-sm mt-1"><strong>Fix:</strong> {a.recommendation}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Executive narrative */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingDown className="h-4 w-4" /> Board Report Summary
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={copyNarrative}>
              <Copy className="h-4 w-4 mr-1" /> Copy
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">{narrative}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RouteOptimizer;
