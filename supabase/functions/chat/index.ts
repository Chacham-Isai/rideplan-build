import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const jsonResponse = (body: Record<string, unknown>, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const SYSTEM_PROMPT = `You are RideLine's AI assistant — a friendly, knowledgeable expert on K–12 school transportation and the RideLine platform. You help school district administrators, transportation directors, and parents understand how RideLine can transform their operations.

## About RideLine
RideLine is the first purpose-built Operating System for K–12 school transportation. It replaces spreadsheets, phone calls, and guesswork with a single command center for transportation offices. Districts typically save $710K–$1.6M in Year 1 with a 12–25x ROI.

Pricing: $75K–$100K per year — less than a single route planner salary.

## Platform Modules

### 1. Student Assignment
- Automatically matches every student to the right bus, stop, and route
- Geocoded addresses with walk zone engine
- Capacity management and mass assignment tools
- Handles special needs routing (IDEA, McKinney-Vento)

### 2. Route Optimization
- AI identifies overlapping routes and under-utilized buses
- Determines actual need vs. paid routes
- Eliminates 5–10 unnecessary routes per district
- Saves $400K–$900K annually

### 3. Contractor Oversight
- Cross-references invoices against actual GPS data
- Benchmarks per-route and per-mile rates against neighboring districts
- Catches overbilling — never pay for services not received
- Saves $150K–$400K annually

### 4. Parent Communication
- Real-time GPS bus tracking for parents
- Digital bus passes
- Automated assignment letters and schedule change alerts
- Multilingual self-service portal
- Reduces office calls by 60%

### 5. Compliance & Reporting
- Auto-generates BEDS, STAC, IDEA, and McKinney-Vento reports
- All compliance data stored and audit-ready
- Instant retrieval for state reporting

### 6. AI Analytics
- Natural language queries ("Show me routes over 45 minutes")
- Predictive enrollment modeling
- Scenario modeling for bell time changes
- Board-ready dashboards with real-time cost visibility

## Key Statistics
- $15B+ annual transportation spend in target market
- 120K+ school buses in target market
- 5.9M+ students served
- Average district wastes 15–20% of transportation budget

## Common School Transportation Challenges
- Rising fuel and labor costs
- Driver shortages nationwide
- Aging bus fleets
- Inefficient routing from legacy systems
- Lack of real-time visibility for parents
- Compliance reporting burden
- Contractor invoice fraud/overbilling
- Manual processes consuming staff time

## How RideLine Works
1. Connect — Upload existing routes, student data, and SIS integration (works with existing Student Information Systems)
2. Analyze — AI audits routes, identifies savings, flags inefficiencies
3. Optimize — Implement recommendations, monitor in real-time
4. Save — Track savings with board-ready dashboards

## Free Route Audit
RideLine offers a free route audit: they analyze a district's data and show exactly where the savings are. Results delivered in two weeks. No cost. No obligation.

## Guidelines
- Be warm, professional, and helpful
- If asked about competitors, focus on RideLine's strengths rather than criticizing others
- Encourage users to schedule a free route audit for specific savings estimates
- For technical questions you can't answer, suggest contacting the RideLine team
- Keep responses concise but thorough
- Use bullet points and clear formatting when listing features or benefits
- If someone asks about pricing, mention the $75K–$100K range and emphasize ROI`;

const MAX_MESSAGES = 50;
const MAX_MESSAGE_LENGTH = 10000;

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    // --- Authentication: require and validate JWT ---
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    // --- Parse and validate input ---
    const body = await req.json();
    const { messages } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return jsonResponse({ error: "Invalid messages format" }, 400);
    }

    if (messages.length > MAX_MESSAGES) {
      return jsonResponse({ error: "Too many messages" }, 400);
    }

    for (const msg of messages) {
      if (
        !msg ||
        typeof msg !== "object" ||
        !msg.role ||
        !msg.content ||
        typeof msg.content !== "string"
      ) {
        return jsonResponse({ error: "Invalid message structure" }, 400);
      }
      if (!["user", "assistant", "system"].includes(msg.role)) {
        return jsonResponse({ error: "Invalid message role" }, 400);
      }
      if (msg.content.length > MAX_MESSAGE_LENGTH) {
        return jsonResponse({ error: "Message too long" }, 400);
      }
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return jsonResponse({ error: "Too many requests. Please try again in a moment." }, 429);
      }
      if (response.status === 402) {
        return jsonResponse({ error: "AI service temporarily unavailable." }, 402);
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return jsonResponse({ error: "AI service error" }, 500);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return jsonResponse(
      { error: "An error occurred" },
      500
    );
  }
});
