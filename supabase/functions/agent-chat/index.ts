// Streaming AI chat for track agents. Uses Lovable AI Gateway.
// Public function (verify_jwt = false in config); we still require an auth token to associate writes.
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DAILY_CAP = parseInt(Deno.env.get("DAILY_AI_CAP") ?? "60", 10);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, system, model } = await req.json();
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Daily fair-use cap (best-effort; relies on user JWT to identify caller)
    try {
      const authHeader = req.headers.get("authorization") ?? "";
      const token = authHeader.replace(/^Bearer\s+/i, "");
      if (token) {
        const sb = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );
        const { data: userData } = await sb.auth.getUser(token);
        const uid = userData?.user?.id;
        if (uid) {
          const { data: cnt } = await sb.rpc("ai_messages_today", { _user: uid });
          if (typeof cnt === "number" && cnt >= DAILY_CAP) {
            return new Response(JSON.stringify({ error: `Daily AI limit reached (${DAILY_CAP} messages). Resets in 24h.` }), {
              status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        }
      }
    } catch (_) { /* fail-open if cap check breaks */ }

    const payload = {
      model: model || "google/gemini-2.5-flash",
      stream: true,
      messages: [
        { role: "system", content: system || "You are a helpful assistant." },
        ...messages,
      ],
    };

    const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (upstream.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit reached. Try again in a moment." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (upstream.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Lovable Cloud." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!upstream.ok || !upstream.body) {
      const txt = await upstream.text();
      return new Response(JSON.stringify({ error: txt || "AI gateway error" }), {
        status: upstream.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(upstream.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});