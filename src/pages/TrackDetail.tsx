import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { SiteHeader } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AgentChat } from "@/components/track/AgentChat";
import { Bookmark, BookmarkCheck, Copy, ExternalLink, PlayCircle, Sparkles, Wrench, FileText, Youtube, MessageCircle, Target } from "lucide-react";
import { toast } from "sonner";
import { sanitizeHtml } from "@/lib/sanitize";

type Track = { id: string; slug: string; number: string; title: string; tagline: string; description: string; agent_name: string; agent_role: string; hue: string; tier: string };
type Agent = { id: string; name: string; role: string; tagline: string; system_prompt: string; model: string };
type Prompt = { id: string; title: string; body: string; use_case: string; difficulty: string };
type Video = { id: string; title: string; description: string | null; duration_minutes: number; youtube_id: string | null; questions_answered: string[] };
type Tool = { id: string; name: string; description: string; use_case: string | null; url: string | null; html_content: string | null };
type Template = { id: string; title: string; body: string; use_case: string; problem_solved: string | null };
type Chapter = { label: string; t: number };
type Playlist = { id: string; title: string; youtube_url: string; creator: string | null; duration_minutes: number | null; chapters: Chapter[] };
type Challenge = { id: string; title: string; description: string; success_metric: string | null; kind: string };

const hueClass = (h: string) => h === "pink" ? "bg-pink" : h === "yellow" ? "bg-yellow" : h === "lavender" ? "bg-lavender" : "bg-blush";
const tierLabel = (t: string) => t === "try" ? "Try It" : t === "growth" ? "Growth" : t === "power" ? "Power" : "Free";

const youtubeEmbedUrl = (url: string): string | null => {
  try {
    const u = new URL(url);
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const params = `?enablejsapi=1&origin=${encodeURIComponent(origin)}&rel=0`;
    // playlist
    const list = u.searchParams.get("list");
    if (list) return `https://www.youtube.com/embed/videoseries${params}&list=${list}`;
    // watch?v=
    const v = u.searchParams.get("v");
    if (v) return `https://www.youtube.com/embed/${v}${params}`;
    // youtu.be/<id>
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      if (id) return `https://www.youtube.com/embed/${id}${params}`;
    }
    // /embed/<id> already
    if (u.pathname.startsWith("/embed/")) return url + (url.includes("?") ? "&" : "?") + "enablejsapi=1";
    return null;
  } catch { return null; }
};

const fmtTime = (sec: number) => {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  return h > 0 ? `${h}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}` : `${m}:${String(s).padStart(2,"0")}`;
};

const seekIframeTo = (iframe: HTMLIFrameElement | null, seconds: number) => {
  if (!iframe || !iframe.contentWindow) return;
  iframe.contentWindow.postMessage(JSON.stringify({
    event: "command",
    func: "seekTo",
    args: [seconds, true],
  }), "*");
  iframe.contentWindow.postMessage(JSON.stringify({
    event: "command", func: "playVideo", args: [],
  }), "*");
};

export default function TrackDetail() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const { user, loading } = useAuth();
  const nav = useNavigate();

  const [track, setTrack] = useState<Track | null>(null);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [seedPrompt, setSeedPrompt] = useState<string | undefined>();
  const [tab, setTab] = useState(() => searchParams.get("tab") || "videos");
  const playerRefs = useRef<Record<string, HTMLIFrameElement | null>>({});

  useEffect(() => { if (!loading && !user) nav("/auth", { replace: true }); }, [loading, user, nav]);

  // Sync tab from URL ?tab= and scroll to anchored item from #item-<id>
  useEffect(() => {
    const t = searchParams.get("tab");
    if (t) setTab(t);
  }, [searchParams]);

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    const tries = [0, 200, 500, 900];
    tries.forEach(d => setTimeout(() => {
      const el = document.querySelector(hash);
      if (el) (el as HTMLElement).scrollIntoView({ behavior: "smooth", block: "center" });
    }, d));
  }, [tab, playlists, prompts, videos, tools, templates, challenges]);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { data: t } = await supabase.from("tracks").select("*").eq("slug", slug).maybeSingle();
      if (!t) return;
      setTrack(t as Track);

      const [{ data: ta }, { data: pr }, { data: vd }, { data: tl }, { data: tp }, { data: pl }, { data: ch }] = await Promise.all([
        supabase.from("track_agents").select("agent_id, is_primary, agents(*)").eq("track_id", t.id).eq("is_primary", true).maybeSingle(),
        supabase.from("prompts").select("*").eq("track_id", t.id).order("sort_order"),
        supabase.from("videos").select("*").eq("track_id", t.id).eq("published", true).order("sort_order"),
        supabase.from("tools").select("*").eq("track_id", t.id).order("sort_order"),
        supabase.from("templates").select("*").eq("track_id", t.id).order("sort_order"),
        supabase.from("playlists").select("*").eq("track_id", t.id).order("sort_order"),
        supabase.from("challenges").select("*").eq("track_id", t.id).order("sort_order"),
      ]);

      if (ta?.agents) setAgent(ta.agents as Agent);
      setPrompts((pr ?? []) as Prompt[]);
      setVideos((vd ?? []) as Video[]);
      setTools((tl ?? []) as Tool[]);
      setTemplates((tp ?? []) as Template[]);
      setPlaylists(((pl ?? []) as any[]).map(p => ({ ...p, chapters: Array.isArray(p.chapters) ? p.chapters : [] })) as Playlist[]);
      setChallenges((ch ?? []) as Challenge[]);

      if (user) {
        const { data: saves } = await supabase.from("saved_items").select("item_id").eq("user_id", user.id).eq("track_id", t.id);
        setSavedIds(new Set((saves ?? []).map(s => s.item_id)));
      }
    })();
  }, [slug, user]);

  const toggleSave = async (item_id: string, item_type: string) => {
    if (!user || !track) return;
    if (savedIds.has(item_id)) {
      await supabase.from("saved_items").delete().eq("user_id", user.id).eq("item_id", item_id);
      setSavedIds(prev => { const n = new Set(prev); n.delete(item_id); return n; });
      toast("Removed from library");
    } else {
      await supabase.from("saved_items").insert({ user_id: user.id, item_id, item_type, track_id: track.id });
      setSavedIds(prev => new Set(prev).add(item_id));
      toast.success("Saved to your library");
    }
  };

  const tryInChat = (body: string) => {
    setSeedPrompt(body);
    setTab("agent");
    setTimeout(() => document.getElementById("agent-tab")?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const copyText = (t: string) => { navigator.clipboard.writeText(t); toast.success("Copied"); };

  if (!track) return <div className="min-h-screen bg-background"><SiteHeader /></div>;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className={`${hueClass(track.hue)} text-foreground`}>
          <div className="container py-14">
            <Link to="/dashboard" className="text-sm text-foreground/70 hover:text-foreground">← Dashboard</Link>
            <div className="mt-6 flex items-start gap-6 flex-wrap">
              <span className="w-20 h-20 rounded-full bg-card flex items-center justify-center font-display font-black text-3xl text-foreground shadow-soft">{track.number}</span>
              <div className="flex-1 min-w-0">
                <span className="text-xs uppercase tracking-[0.2em] font-bold">{tierLabel(track.tier)} · Track {track.number}</span>
                <h1 className="mt-2 font-display font-black text-4xl md:text-5xl leading-tight">{track.title}</h1>
                <p className="mt-3 font-handwritten text-2xl">{track.tagline}</p>
                <p className="mt-4 max-w-2xl text-foreground/80">{track.description}</p>
                {agent && <p className="mt-3 text-sm text-foreground/70">with <span className="font-bold">{agent.name}</span> · {agent.role}</p>}
              </div>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <section className="container py-10">
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="rounded-full bg-blush p-1.5 h-auto flex-wrap">
              <TabsTrigger value="videos" className="rounded-full data-[state=active]:bg-pink data-[state=active]:text-white"><PlayCircle className="w-4 h-4 mr-1.5"/>Videos</TabsTrigger>
              <TabsTrigger value="prompts" className="rounded-full data-[state=active]:bg-pink data-[state=active]:text-white"><Sparkles className="w-4 h-4 mr-1.5"/>Prompts</TabsTrigger>
              <TabsTrigger value="toolkit" className="rounded-full data-[state=active]:bg-pink data-[state=active]:text-white"><Wrench className="w-4 h-4 mr-1.5"/>Toolkit</TabsTrigger>
              <TabsTrigger value="templates" className="rounded-full data-[state=active]:bg-pink data-[state=active]:text-white"><FileText className="w-4 h-4 mr-1.5"/>Templates</TabsTrigger>
              <TabsTrigger value="playlists" className="rounded-full data-[state=active]:bg-pink data-[state=active]:text-white"><Youtube className="w-4 h-4 mr-1.5"/>Playlists</TabsTrigger>
              <TabsTrigger value="challenges" className="rounded-full data-[state=active]:bg-pink data-[state=active]:text-white"><Target className="w-4 h-4 mr-1.5"/>Do This Now</TabsTrigger>
              <TabsTrigger value="agent" id="agent-tab" className="rounded-full data-[state=active]:bg-pink data-[state=active]:text-white"><MessageCircle className="w-4 h-4 mr-1.5"/>Ask {agent?.name ?? "Agent"}</TabsTrigger>
            </TabsList>

            <TabsContent value="videos" className="mt-8">
              {videos.length === 0 ? <Empty label="Videos coming soon" /> : (
                <div className="grid md:grid-cols-2 gap-5">
                  {videos.map(v => (
                    <div key={v.id} id={`item-${v.id}`} className="p-6 rounded-3xl bg-card border border-border shadow-soft scroll-mt-24">
                      <div className="aspect-video rounded-2xl bg-blush flex items-center justify-center mb-4">
                        {v.youtube_id ? (
                          <iframe className="w-full h-full rounded-2xl" src={`https://www.youtube.com/embed/${v.youtube_id}`} allowFullScreen />
                        ) : (
                          <PlayCircle className="w-12 h-12 text-pink/40" />
                        )}
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-display font-bold text-lg">{v.title}</h3>
                        <SaveBtn saved={savedIds.has(v.id)} onClick={() => toggleSave(v.id, "video")} />
                      </div>
                      {v.description && <p className="text-sm text-muted-foreground mt-2">{v.description}</p>}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        <Badge variant="secondary" className="rounded-full">{v.duration_minutes} min</Badge>
                        {v.questions_answered?.slice(0, 2).map((q, i) => <Badge key={i} variant="outline" className="rounded-full">{q}</Badge>)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="prompts" className="mt-8">
              {prompts.length === 0 ? <Empty label="Prompts coming soon" /> : (
                <div className="grid md:grid-cols-2 gap-5">
                  {prompts.map(p => (
                    <div key={p.id} id={`item-${p.id}`} className="p-6 rounded-3xl bg-card border border-border shadow-soft flex flex-col scroll-mt-24">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-display font-bold text-lg">{p.title}</h3>
                        <SaveBtn saved={savedIds.has(p.id)} onClick={() => toggleSave(p.id, "prompt")} />
                      </div>
                      <div className="flex gap-1.5 mt-2">
                        <Badge variant="secondary" className="rounded-full text-xs">{p.use_case}</Badge>
                        <Badge variant="outline" className="rounded-full text-xs">{p.difficulty}</Badge>
                      </div>
                      <pre className="mt-4 p-4 bg-blush rounded-2xl text-xs text-foreground/80 whitespace-pre-wrap font-mono flex-1 overflow-auto max-h-48">{p.body}</pre>
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline" onClick={() => copyText(p.body)} className="rounded-full flex-1"><Copy className="w-3.5 h-3.5 mr-1.5"/>Copy</Button>
                        <Button size="sm" onClick={() => tryInChat(p.body)} className="rounded-full bg-pink text-white hover:bg-pink/90 flex-1"><Sparkles className="w-3.5 h-3.5 mr-1.5"/>Try in chat</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="toolkit" className="mt-8">
              {tools.length === 0 ? <Empty label="Toolkit coming soon" /> : (
                <div className="space-y-6">
                  {tools.map(t => (
                    <div key={t.id} id={`item-${t.id}`} className="p-6 rounded-3xl bg-card border border-border shadow-soft scroll-mt-24">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-display font-bold text-lg">{t.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{t.description}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {t.use_case && <Badge variant="secondary" className="rounded-full">{t.use_case}</Badge>}
                            {t.url && (
                              <a href={t.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-pink hover:underline">
                                Open source <ExternalLink className="w-3 h-3"/>
                              </a>
                            )}
                          </div>
                        </div>
                        <SaveBtn saved={savedIds.has(t.id)} onClick={() => toggleSave(t.id, "tool")} />
                      </div>
                      {t.html_content && (
                        <div
                          className="mt-5 p-5 rounded-2xl bg-blush/50 border border-border prose prose-sm max-w-none prose-headings:font-display prose-headings:text-foreground prose-a:text-pink prose-strong:text-foreground"
                          dangerouslySetInnerHTML={{ __html: sanitizeHtml(t.html_content) }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="templates" className="mt-8">
              {templates.length === 0 ? <Empty label="Templates coming soon" /> : (
                <div className="grid md:grid-cols-2 gap-5">
                  {templates.map(t => (
                    <div key={t.id} id={`item-${t.id}`} className="p-6 rounded-3xl bg-card border border-border shadow-soft flex flex-col scroll-mt-24">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-display font-bold text-lg">{t.title}</h3>
                        <SaveBtn saved={savedIds.has(t.id)} onClick={() => toggleSave(t.id, "template")} />
                      </div>
                      {t.problem_solved && <p className="text-xs text-muted-foreground mt-1 italic">Solves: {t.problem_solved}</p>}
                      <pre className="mt-4 p-4 bg-blush rounded-2xl text-xs text-foreground/80 whitespace-pre-wrap font-mono flex-1 overflow-auto max-h-56">{t.body}</pre>
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline" onClick={() => copyText(t.body)} className="rounded-full flex-1"><Copy className="w-3.5 h-3.5 mr-1.5"/>Copy</Button>
                        <Button size="sm" onClick={() => tryInChat(t.body)} className="rounded-full bg-pink text-white hover:bg-pink/90 flex-1">Use it now</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="playlists" className="mt-8">
              {playlists.length === 0 ? <Empty label="Playlist coming soon" /> : (
                <div className="grid md:grid-cols-2 gap-5">
                  {playlists.map(p => {
                    const embed = youtubeEmbedUrl(p.youtube_url);
                    return (
                      <div key={p.id} id={`item-${p.id}`} className="p-5 rounded-3xl bg-card border border-border shadow-soft scroll-mt-24">
                        <div className="aspect-video rounded-2xl overflow-hidden bg-blush flex items-center justify-center mb-4">
                          {embed ? (
                            <iframe
                              ref={(el) => { playerRefs.current[p.id] = el; }}
                              className="w-full h-full"
                              src={embed}
                              title={p.title}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          ) : (
                            <Youtube className="w-10 h-10 text-pink/40" />
                          )}
                        </div>
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-display font-bold">{p.title}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{p.creator}{p.duration_minutes ? ` · ${p.duration_minutes} min` : ""}</div>
                          </div>
                          <a href={p.youtube_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-pink hover:underline shrink-0">
                            YouTube <ExternalLink className="w-3 h-3"/>
                          </a>
                        </div>
                        {p.chapters && p.chapters.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-border">
                            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Chapters</div>
                            <div className="flex flex-wrap gap-1.5">
                              {p.chapters.map((c, i) => (
                                <button
                                  key={i}
                                  onClick={() => seekIframeTo(playerRefs.current[p.id], c.t)}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blush hover:bg-pink hover:text-white text-xs font-medium transition-colors"
                                >
                                  <span className="font-mono opacity-70">{fmtTime(c.t)}</span>
                                  <span>{c.label}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="challenges" className="mt-8">
              {challenges.length === 0 ? <Empty label="Challenges coming soon" /> : (
                <div className="grid md:grid-cols-3 gap-5">
                  {challenges.map(c => (
                    <div key={c.id} id={`item-${c.id}`} className="p-6 rounded-3xl bg-gradient-brand text-white shadow-pink scroll-mt-24">
                      <Badge className="rounded-full bg-white/20 text-white border-0">{c.kind === "five_day" ? "5-day" : "Quick"}</Badge>
                      <h3 className="mt-3 font-display font-black text-xl">{c.title}</h3>
                      <p className="mt-2 text-sm text-white/90">{c.description}</p>
                      {c.success_metric && <p className="mt-3 text-xs italic text-white/80">✓ {c.success_metric}</p>}
                      <Button size="sm" onClick={() => { setTab("agent"); setSeedPrompt(c.description); }} className="mt-4 rounded-full bg-white text-pink hover:bg-white/90 font-bold">Start now</Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="agent" className="mt-8">
              {agent ? (
                <AgentChat agent={agent} trackId={track.id} seedPrompt={seedPrompt} />
              ) : <Empty label="Agent setup in progress" />}
            </TabsContent>
          </Tabs>
        </section>
      </main>
    </div>
  );
}

const SaveBtn = ({ saved, onClick }: { saved: boolean; onClick: () => void }) => (
  <button onClick={onClick} className="shrink-0 p-1.5 rounded-full hover:bg-blush transition-colors" aria-label={saved ? "Unsave" : "Save"}>
    {saved ? <BookmarkCheck className="w-4 h-4 text-pink"/> : <Bookmark className="w-4 h-4 text-muted-foreground"/>}
  </button>
);

const Empty = ({ label }: { label: string }) => (
  <div className="text-center py-16 text-muted-foreground">
    <p className="font-handwritten text-2xl text-foreground/60">{label}</p>
    <p className="text-sm mt-2">Content uploads via the admin portal.</p>
  </div>
);