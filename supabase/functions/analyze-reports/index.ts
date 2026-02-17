import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { bus_number, report_type, description } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // 1. Auto-flag bullying as high priority
    if (report_type === "bullying") {
      // Update the most recent report for this bus to high priority
      const { data: recent } = await supabase
        .from("safety_reports")
        .select("id")
        .eq("bus_number", bus_number)
        .eq("report_type", "bullying")
        .order("created_at", { ascending: false })
        .limit(1);

      if (recent && recent.length > 0) {
        await supabase
          .from("safety_reports")
          .update({ ai_priority: "high" })
          .eq("id", recent[0].id);
      }
    }

    // 2. Check for pattern — multiple reports on same bus
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: busReports, error: countError } = await supabase
      .from("safety_reports")
      .select("id")
      .eq("bus_number", bus_number)
      .gte("created_at", thirtyDaysAgo);

    if (!countError && busReports && busReports.length >= 3) {
      // Create or update alert
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
            const { data: latest } = await supabase
              .from("safety_reports")
              .select("id")
              .eq("bus_number", bus_number)
              .order("created_at", { ascending: false })
              .limit(1);
            if (latest && latest.length > 0) {
              await supabase.from("safety_reports").update({ ai_priority: severity }).eq("id", latest[0].id);
            }
          }
        }
      } catch (aiErr) {
        console.error("AI classification failed (non-blocking):", aiErr);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-reports error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
