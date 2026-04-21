// Generates a tailored prompt for the user via Lovable AI Gateway.
// Returns plain text. Public function (verify_jwt = false).
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const need = String(body?.need ?? "").trim();
    const context = String(body?.context ?? "").trim();
    const trackTitle = String(body?.trackTitle ?? "").trim();

    if (!need || need.length > 1000) {
      return new Response(JSON.stringify({ error: "Tell me what you need (under 1000 chars)." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const system = `You are a prompt engineer for AI For Real Life — a platform that helps multi-hyphenate women use AI in plain English. Write ONE concrete, copy-paste-ready prompt the user can paste into ChatGPT, Claude or any LLM. 

Rules:
- Plain English, no jargon, no hashtags, no markdown headings.
- Include role, context, the specific task, format, and tone.
- Keep it focused on a single small win.
- Output ONLY the prompt body. No preamble, no explanation, no quotes around it.
- Max 220 words.`;

    const userMsg = [
      `What I need: ${need}`,
      context ? `Extra context: ${context}` : "",
      trackTitle ? `Track context: ${trackTitle}` : "",
    ].filter(Boolean).join("\n");

    const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: userMsg },
        ],
      }),
    });

    if (upstream.status === 429) return new Response(JSON.stringify({ error: "Rate limit reached. Try again in a moment." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (upstream.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (!upstream.ok) {
      const txt = await upstream.text();
      return new Response(JSON.stringify({ error: txt || "AI gateway error" }), { status: upstream.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await upstream.json();
    const prompt = String(data?.choices?.[0]?.message?.content ?? "").trim();
    return new Response(JSON.stringify({ prompt }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});