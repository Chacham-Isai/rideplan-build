import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { routes, stops, bellSchedules } = await req.json();

    const systemPrompt = `You are an expert school bus route optimization analyst. You analyze route data and provide actionable optimization recommendations.

Given route and stop data, you must:
1. Identify routes that can be consolidated (similar schools, overlapping areas, low utilization)
2. Suggest new optimized routes based on student clustering
3. Identify bell-time tiering opportunities (staggering school start times to reuse buses)
4. Calculate projected cost savings ($85,000 per eliminated route annually)
5. Flag safety concerns (excessive ride times >60min, overcrowded buses)

Always provide specific, data-driven recommendations with route numbers and projected impact.`;

    const userPrompt = `Analyze these ${routes.length} bus routes and ${stops.length} stops and provide optimization recommendations.

ROUTES DATA:
${JSON.stringify(routes.map((r: any) => ({
  route: r.route_number, school: r.school, students: r.total_students,
  capacity: r.capacity, miles: r.total_miles, duration: r.avg_ride_time_min,
  onTime: r.on_time_pct, cost: r.cost_per_student, tier: r.tier,
  status: r.status, bus: r.bus_number
})), null, 2)}

${stops.length > 0 ? `STOPS DATA (sample):
${JSON.stringify(stops.slice(0, 100).map((s: any) => ({
  route: s.route_id, stop: s.stop_name, lat: s.lat, lng: s.lng,
  boarding: s.students_boarding, order: s.stop_order
})), null, 2)}` : "No stop-level data available."}

${bellSchedules?.length > 0 ? `BELL SCHEDULES:
${JSON.stringify(bellSchedules, null, 2)}` : ""}

Provide your analysis using the suggest_optimizations function.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_optimizations",
              description: "Return structured route optimization suggestions",
              parameters: {
                type: "object",
                properties: {
                  summary: {
                    type: "object",
                    properties: {
                      total_routes_analyzed: { type: "number" },
                      routes_to_eliminate: { type: "number" },
                      projected_annual_savings: { type: "number" },
                      avg_utilization_after: { type: "number" },
                      safety_flags: { type: "number" },
                    },
                    required: ["total_routes_analyzed", "routes_to_eliminate", "projected_annual_savings", "avg_utilization_after", "safety_flags"],
                  },
                  consolidations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        merge_routes: { type: "array", items: { type: "string" }, description: "Route numbers to merge" },
                        resulting_students: { type: "number" },
                        resulting_utilization: { type: "number" },
                        savings: { type: "number" },
                        rationale: { type: "string" },
                        risk: { type: "string", enum: ["low", "medium", "high"] },
                      },
                      required: ["merge_routes", "resulting_students", "resulting_utilization", "savings", "rationale", "risk"],
                    },
                  },
                  bell_time_suggestions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        school: { type: "string" },
                        current_tier: { type: "number" },
                        suggested_tier: { type: "number" },
                        buses_freed: { type: "number" },
                        rationale: { type: "string" },
                      },
                      required: ["school", "rationale"],
                    },
                  },
                  safety_alerts: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        route: { type: "string" },
                        issue: { type: "string" },
                        severity: { type: "string", enum: ["warning", "critical"] },
                        recommendation: { type: "string" },
                      },
                      required: ["route", "issue", "severity", "recommendation"],
                    },
                  },
                  narrative: { type: "string", description: "Executive summary paragraph for board reports" },
                },
                required: ["summary", "consolidations", "safety_alerts", "narrative"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "suggest_optimizations" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds in workspace settings." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "No optimization results returned" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("optimize-routes error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
