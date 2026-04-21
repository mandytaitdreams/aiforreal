import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { SiteHeader } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import { Bookmark, ArrowRight, Brain, MessageCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Saved = {
  id: string;
  item_id: string;
  item_type: string;
  track_id: string | null;
  created_at: string;
  resolved?: { title?: string; body?: string; description?: string; track_slug?: string };
};

type Memory = {
  id: string;
  title: string;
  updated_at: string;
  agent_id: string;
  agent_name?: string;
  track_slug?: string;
};

export default function Library() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [items, setItems] = useState<Saved[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => { if (!loading && !user) nav("/auth", { replace: true }); }, [loading, user, nav]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: saves } = await supabase.from("saved_items").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      const list = (saves ?? []) as Saved[];
      // resolve titles by item_type
      const byType: Record<string, string[]> = {};
      list.forEach(s => { (byType[s.item_type] ||= []).push(s.item_id); });

      const lookups: Record<string, Record<string, any>> = {};
      const tableMap: Record<string, string> = { prompt: "prompts", template: "templates", video: "videos", tool: "tools", playlist: "playlists" };
      for (const [type, ids] of Object.entries(byType)) {
        const table = tableMap[type];
        if (!table) continue;
        const { data } = await supabase.from(table as any).select("id, title, body, description").in("id", ids);
        lookups[type] = Object.fromEntries((data ?? []).map((r: any) => [r.id, r]));
      }

      const trackIds = Array.from(new Set(list.map(s => s.track_id).filter(Boolean))) as string[];
      const { data: trackRows } = trackIds.length
        ? await supabase.from("tracks").select("id, slug, title").in("id", trackIds)
        : { data: [] as any[] };
      const trackMap = Object.fromEntries((trackRows ?? []).map((t: any) => [t.id, t]));

      setItems(list.map(s => ({
        ...s,
        resolved: {
          ...(lookups[s.item_type]?.[s.item_id] ?? {}),
          track_slug: s.track_id ? trackMap[s.track_id]?.slug : undefined,
        },
      })));

      // Memories = pinned agent conversations
      const { data: convos } = await supabase
        .from("agent_conversations")
        .select("id, title, updated_at, agent_id, track_id, pinned")
        .eq("user_id", user.id)
        .eq("pinned", true)
        .order("updated_at", { ascending: false });
      const cs = (convos ?? []) as any[];
      const agentIds = Array.from(new Set(cs.map(c => c.agent_id)));
      const memTrackIds = Array.from(new Set(cs.map(c => c.track_id).filter(Boolean)));
      const [{ data: agentRows }, { data: memTrackRows }] = await Promise.all([
        agentIds.length ? supabase.from("agents").select("id, name").in("id", agentIds) : Promise.resolve({ data: [] as any[] }),
        memTrackIds.length ? supabase.from("tracks").select("id, slug").in("id", memTrackIds) : Promise.resolve({ data: [] as any[] }),
      ]);
      const aMap = Object.fromEntries((agentRows ?? []).map((a: any) => [a.id, a.name]));
      const tMap = Object.fromEntries((memTrackRows ?? []).map((t: any) => [t.id, t.slug]));
      setMemories(cs.map(c => ({
        id: c.id, title: c.title, updated_at: c.updated_at, agent_id: c.agent_id,
        agent_name: aMap[c.agent_id], track_slug: c.track_id ? tMap[c.track_id] : undefined,
      })));

      setBusy(false);
    })();
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container py-12">
        <div className="flex items-center gap-3 mb-2">
          <Bookmark className="w-6 h-6 text-pink" />
          <h1 className="font-display font-black text-4xl">Saved library</h1>
        </div>
        <p className="text-muted-foreground">Everything you've saved and the AI conversations you've pinned as memories.</p>

        {busy ? <div className="mt-12 text-center text-muted-foreground">Loading…</div> : (
          <Tabs defaultValue="saved" className="mt-8">
            <TabsList className="rounded-full bg-blush p-1.5 h-auto">
              <TabsTrigger value="saved" className="rounded-full data-[state=active]:bg-pink data-[state=active]:text-white"><Bookmark className="w-4 h-4 mr-1.5"/>Saved ({items.length})</TabsTrigger>
              <TabsTrigger value="memories" className="rounded-full data-[state=active]:bg-pink data-[state=active]:text-white"><Brain className="w-4 h-4 mr-1.5"/>Memories ({memories.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="saved" className="mt-6">
              {items.length === 0 ? (
                <div className="mt-12 text-center">
                  <p className="font-handwritten text-3xl text-foreground/60">Nothing saved yet.</p>
                  <p className="text-sm text-muted-foreground mt-2">Tap the bookmark on any prompt, template, video or tool.</p>
                  <Link to="/dashboard" className="mt-6 inline-flex items-center gap-2 text-pink font-bold">Go to dashboard <ArrowRight className="w-4 h-4"/></Link>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map(s => (
                    <Link
                      key={s.id}
                      to={s.resolved?.track_slug ? `/track/${s.resolved.track_slug}` : "/dashboard"}
                      className="p-5 rounded-3xl bg-card border border-border shadow-soft hover:shadow-pink hover:-translate-y-0.5 transition-all"
                    >
                      <div className="text-xs uppercase tracking-wider font-bold text-pink">{s.item_type}</div>
                      <h3 className="mt-2 font-display font-bold">{s.resolved?.title ?? "Saved item"}</h3>
                      {s.resolved?.body && <p className="mt-2 text-xs text-muted-foreground line-clamp-3 font-mono">{s.resolved.body}</p>}
                      {s.resolved?.description && !s.resolved.body && <p className="mt-2 text-xs text-muted-foreground line-clamp-3">{s.resolved.description}</p>}
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="memories" className="mt-6">
              {memories.length === 0 ? (
                <div className="mt-12 text-center">
                  <p className="font-handwritten text-3xl text-foreground/60">No memories yet.</p>
                  <p className="text-sm text-muted-foreground mt-2">Pin any AI chat to keep the context handy across sessions.</p>
                  <Link to="/chat" className="mt-6 inline-flex items-center gap-2 text-pink font-bold">Open AI Chat <ArrowRight className="w-4 h-4"/></Link>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {memories.map(m => (
                    <Link
                      key={m.id}
                      to={m.track_slug ? `/track/${m.track_slug}?tab=agent&conv=${m.id}` : `/chat?conv=${m.id}`}
                      className="p-5 rounded-3xl bg-card border border-border shadow-soft hover:shadow-pink hover:-translate-y-0.5 transition-all"
                    >
                      <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider font-bold text-pink">
                        <MessageCircle className="w-3 h-3"/> {m.agent_name ?? "Agent"}
                      </div>
                      <h3 className="mt-2 font-display font-bold line-clamp-2">{m.title}</h3>
                      <p className="mt-3 text-xs text-muted-foreground">Pinned · {new Date(m.updated_at).toLocaleDateString()}</p>
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}