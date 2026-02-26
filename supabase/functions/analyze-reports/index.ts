import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const jsonResponse = (body: Record<string, unknown>, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // --- Authentication: require JWT ---
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    // Use SERVICE_ROLE_KEY for DB operations (safety_reports may lack user-scoped RLS for public inserts)
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { bus_number, report_type, description, district_id } = await req.json();

    if (!bus_number || typeof bus_number !== "string") {
      return jsonResponse({ error: "bus_number is required" }, 400);
    }

    // Scope all queries to district_id when available
    const buildQuery = (table: string) => {
      let q = supabase.from(table).select("id");
      q = q.eq("bus_number", bus_number);
      if (district_id) q = q.eq("district_id", district_id);
      return q;
    };

    // 1. Auto-flag bullying as high priority
    if (report_type === "bullying") {
      let q = supabase
        .from("safety_reports")
        .select("id")
        .eq("bus_number", bus_number)
        .eq("report_type", "bullying")
        .order("created_at", { ascending: false })
        .limit(1);
      if (district_id) q = q.eq("district_id", district_id);

      const { data: recent } = await q;

      if (recent && recent.length > 0) {
        await supabase
          .from("safety_reports")
          .update({ ai_priority: "high" })
          .eq("id", recent[0].id);
      }
    }

    // 2. Check for pattern — multiple reports on same bus
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    let patternQuery = supabase
      .from("safety_reports")
      .select("id")
      .eq("bus_number", bus_number)
      .gte("created_at", thirtyDaysAgo);
    if (district_id) patternQuery = patternQuery.eq("district_id", district_id);

    const { data: busReports, error: countError } = await patternQuery;

    if (!countError && busReports && busReports.length >= 3) {
      const { data: existingAlert } = await supabase
        .from("report_alerts")
        .select("id, report_count")
        .eq("bus_number", bus_number)
        .eq("acknowledged", false)
        .limit(1);

      if (existingAlert && existingAlert.length > 0) {
        await supabase
          .from("report_alerts")
          .update({ report_count: busReports.length, details: `${busReports.length} reports in the last 30 days for bus ${bus_number}` })
          .eq("id", existingAlert[0].id);
      } else {
        await supabase.from("report_alerts").insert({
          alert_type: "multiple_reports",
          bus_number,
          report_count: busReports.length,
          details: `${busReports.length} reports in the last 30 days for bus ${bus_number}. Requires investigation.`,
        });
      }
    }

    // 3. AI severity classification
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (LOVABLE_API_KEY && description) {
      try {
        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              {
                role: "system",
                content: "You classify school bus safety reports. Respond with ONLY one word: low, medium, high, or critical. Base your assessment on severity and urgency.",
              },
              { role: "user", content: `Report type: ${report_type}. Description: ${description}` },
            ],
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const severity = aiData.choices?.[0]?.message?.content?.trim()?.toLowerCase();
          if (["low", "medium", "high", "critical"].includes(severity)) {
            let latestQ = supabase
              .from("safety_reports")
              .select("id")
              .eq("bus_number", bus_number)
              .order("created_at", { ascending: false })
              .limit(1);
            if (district_id) latestQ = latestQ.eq("district_id", district_id);

            const { data: latest } = await latestQ;
            if (latest && latest.length > 0) {
              await supabase.from("safety_reports").update({ ai_priority: severity }).eq("id", latest[0].id);
            }
          }
        }
      } catch (aiErr) {
        console.error("AI classification failed (non-blocking):", aiErr);
      }
    }

    return jsonResponse({ success: true }, 200);
  } catch (e) {
    console.error("analyze-reports error:", e);
    return jsonResponse({ error: e.message }, 500);
  }
});
