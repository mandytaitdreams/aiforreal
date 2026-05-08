import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { SiteHeader } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import { AgentChat } from "@/components/track/AgentChat";
import { Button } from "@/components/ui/button";
import { MessageCircle, ArrowLeft, Sparkles } from "lucide-react";

type Agent = { id: string; name: string; role: string; tagline: string; system_prompt: string; model: string; category: string };

export default function ChatHub() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [params, setParams] = useSearchParams();
  const selectedId = params.get("agent");
  const seedB64 = params.get("seed");
  const seed = seedB64 ? safeDecode(seedB64) : undefined;

  useEffect(() => { /* auth disabled */ }, [loading, user, nav]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("agents").select("*").order("category").order("name");
      setAgents((data ?? []) as Agent[]);
    })();
  }, []);

  const selected = agents.find(a => a.id === selectedId);

  const groups = agents.reduce<Record<string, Agent[]>>((acc, a) => {
    (acc[a.category] ||= []).push(a); return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container py-10">
        <div className="flex items-center gap-3 mb-2">
          <MessageCircle className="w-6 h-6 text-pink"/>
          <h1 className="font-display font-black text-4xl">AI Chat Hub</h1>
        </div>
        <p className="text-muted-foreground">Your team of 16 specialists — pick who to talk to.</p>

        {selected ? (
          <div className="mt-8">
            <Button variant="outline" className="rounded-full mb-4" onClick={() => { params.delete("agent"); params.delete("seed"); setParams(params, { replace: true }); }}>
              <ArrowLeft className="w-4 h-4 mr-1.5"/> Back to all agents
            </Button>
            <AgentChat agent={selected} trackId={null} seedPrompt={seed} autoSend={!!seed} />
          </div>
        ) : (
          <div className="mt-8 space-y-10">
            {Object.entries(groups).map(([cat, list]) => (
              <section key={cat}>
                <h2 className="font-display font-bold text-2xl capitalize mb-4">{cat}</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {list.map(a => (
                    <button
                      key={a.id}
                      onClick={() => { params.set("agent", a.id); setParams(params, { replace: false }); }}
                      className="text-left p-5 rounded-3xl bg-card border border-border shadow-soft hover:shadow-pink hover:-translate-y-0.5 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-brand text-white font-display font-black flex items-center justify-center">{a.name[0]}</div>
                        <div className="min-w-0">
                          <div className="font-display font-bold truncate">{a.name}</div>
                          <div className="text-xs text-muted-foreground truncate">{a.role}</div>
                        </div>
                      </div>
                      <p className="mt-3 text-sm text-foreground/80 line-clamp-3">{a.tagline}</p>
                      <div className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-pink">
                        <Sparkles className="w-3 h-3"/> Start chat
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            ))}
            {agents.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">No agents yet.</div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function safeDecode(b64: string): string | undefined {
  try { return decodeURIComponent(escape(atob(b64))); } catch { return undefined; }
}