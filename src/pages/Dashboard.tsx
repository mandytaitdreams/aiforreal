import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { SiteHeader } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import { Flame, Sparkles, Trophy, Bookmark, MessageCircle, ArrowRight } from "lucide-react";
import { Calendar, Star } from "lucide-react";
import { GlobalSearch } from "@/components/GlobalSearch";

type DBTrack = { id: string; slug: string; number: string; title: string; tagline: string; agent_name: string; hue: string; tier: string };
const hueBg = (h: string) => h === "pink" ? "bg-pink" : h === "yellow" ? "bg-yellow" : h === "lavender" ? "bg-lavender" : "bg-blush";
const tierLabel = (t: string) => t === "try" ? "Try It" : t === "growth" ? "Growth" : t === "power" ? "Power" : "Free";

export default function Dashboard() {
  const { user, profile, loading } = useAuth();
  const nav = useNavigate();
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [tracks, setTracks] = useState<DBTrack[]>([]);
  const [savedCount, setSavedCount] = useState(0);
  const [recentConv, setRecentConv] = useState<{ id: string; title: string; agent: string; track_slug: string | null } | null>(null);
  const [nextEvent, setNextEvent] = useState<{ id: string; title: string; starts_at: string } | null>(null);
  const [featuredWins, setFeaturedWins] = useState<{ id: string; title: string; body: string }[]>([]);

  useEffect(() => {
    if (!loading && !user) nav("/auth", { replace: true });
    else if (!loading && profile && !profile.onboarding_complete) nav("/onboarding", { replace: true });
  }, [loading, user, profile, nav]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: tr }, { data: prog }, { data: saves }, { data: conv }] = await Promise.all([
        supabase.from("tracks").select("id, slug, number, title, tagline, agent_name, hue, tier").order("sort_order"),
        supabase.from("user_track_progress").select("track_slug, percent_complete").eq("user_id", user.id),
        supabase.from("saved_items").select("id", { count: "exact", head: false }).eq("user_id", user.id),
        supabase.from("agent_conversations")
          .select("id, title, track_id, agents(name), tracks(slug)")
          .eq("user_id", user.id).order("updated_at", { ascending: false }).limit(1).maybeSingle(),
      ]);
      setTracks((tr ?? []) as DBTrack[]);
      const m: Record<string, number> = {};
      prog?.forEach(r => { m[r.track_slug] = r.percent_complete; });
      setProgress(m);
      setSavedCount(saves?.length ?? 0);
      if (conv) setRecentConv({ id: (conv as any).id, title: (conv as any).title, agent: (conv as any).agents?.name ?? "Agent", track_slug: (conv as any).tracks?.slug ?? null });
      const [{ data: ev }, { data: wins }] = await Promise.all([
        supabase.from("events").select("id, title, starts_at").eq("published", true).gte("starts_at", new Date().toISOString()).order("starts_at").limit(1).maybeSingle(),
        supabase.from("forum_posts").select("id, title, body").eq("section", "wins").eq("featured", true).order("updated_at", { ascending: false }).limit(3),
      ]);
      if (ev) setNextEvent(ev as any);
      setFeaturedWins((wins ?? []) as any);
    })();
  }, [user]);

  if (loading || !profile) return <div className="min-h-screen bg-background" />;

  // DEV: unlock all tiers in this environment
  const tier = "power";

  const resumeTrack = profile.primary_track ? tracks.find(t => t.slug === profile.primary_track) : tracks[0];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        {/* Greeting band */}
        <section className="bg-gradient-cream border-b border-border/60">
          <div className="container py-12">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Welcome back,</p>
                <h1 className="mt-1 font-display font-black text-4xl md:text-5xl text-foreground">
                  {profile.display_name} <span className="inline-block">👋</span>
                </h1>
                <p className="mt-2 text-muted-foreground">One small win today is enough.</p>
              </div>
              <div className="flex gap-3">
                <Stat icon={<Flame className="w-4 h-4 text-pink" />} label="Streak" value={`${profile.streak_days}d`} />
                <Stat icon={<Sparkles className="w-4 h-4 text-accent" />} label="XP" value={profile.xp.toString()} />
                <Stat icon={<Trophy className="w-4 h-4 text-secondary" />} label="Tier" value={tierLabel(tier as any)} />
              </div>
            </div>
            <div className="mt-8 max-w-2xl">
              <GlobalSearch />
            </div>
          </div>
        </section>

        {/* Resume + Quick actions */}
        <section className="container py-10 grid md:grid-cols-3 gap-5">
          {resumeTrack && (
            <Link to={`/track/${resumeTrack.slug}`} className="md:col-span-2 p-6 rounded-3xl bg-gradient-brand text-white shadow-pink hover:-translate-y-0.5 transition-all relative overflow-hidden">
              <div className="text-xs uppercase tracking-wider opacity-80">Pick up where you left off</div>
              <h2 className="mt-2 font-display font-black text-3xl">{resumeTrack.title}</h2>
              <p className="mt-1 opacity-90 font-handwritten text-xl">{resumeTrack.tagline}</p>
              <div className="mt-6 inline-flex items-center gap-2 font-bold">Continue <ArrowRight className="w-4 h-4"/></div>
            </Link>
          )}
          <div className="space-y-3">
            <Link to="/library" className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border shadow-soft hover:shadow-pink transition-all">
              <div className="w-10 h-10 rounded-full bg-blush flex items-center justify-center"><Bookmark className="w-4 h-4 text-pink"/></div>
              <div className="flex-1">
                <div className="font-bold">Your library</div>
                <div className="text-xs text-muted-foreground">{savedCount} saved {savedCount === 1 ? "item" : "items"}</div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground"/>
            </Link>
            <Link to="/chat" className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border shadow-soft hover:shadow-pink transition-all">
              <div className="w-10 h-10 rounded-full bg-blush flex items-center justify-center"><MessageCircle className="w-4 h-4 text-pink"/></div>
              <div className="flex-1">
                <div className="font-bold">AI Chat Hub</div>
                <div className="text-xs text-muted-foreground">Talk to any of your 16 agents</div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground"/>
            </Link>
            {recentConv && (
              <Link to={recentConv.track_slug ? `/track/${recentConv.track_slug}` : "/dashboard"} className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border shadow-soft hover:shadow-pink transition-all">
                <div className="w-10 h-10 rounded-full bg-blush flex items-center justify-center"><MessageCircle className="w-4 h-4 text-pink"/></div>
                <div className="flex-1">
                  <div className="font-bold">Resume chat</div>
                  <div className="text-xs text-muted-foreground truncate">with {recentConv.agent}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground"/>
              </Link>
            )}
            {profile.first_win && (
              <div className="p-4 rounded-2xl bg-secondary text-secondary-foreground shadow-soft">
                <div className="text-xs uppercase tracking-wider font-bold text-accent">Your first win</div>
                <p className="mt-2 text-sm italic line-clamp-2">"{profile.first_win}"</p>
              </div>
            )}
            {nextEvent && (
              <Link to="/events" className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border shadow-soft hover:shadow-pink transition-all">
                <div className="w-10 h-10 rounded-full bg-blush flex items-center justify-center"><Calendar className="w-4 h-4 text-pink"/></div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate">Next event: {nextEvent.title}</div>
                  <div className="text-xs text-muted-foreground">{new Date(nextEvent.starts_at).toLocaleString()}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground"/>
              </Link>
            )}
          </div>
        </section>

        {featuredWins.length > 0 && (
          <section className="container py-4">
            <div className="flex items-end justify-between mb-4">
              <h2 className="font-display font-black text-2xl flex items-center gap-2"><Star className="w-5 h-5 text-pink"/> Featured wins</h2>
              <Link to="/community?section=wins" className="text-sm text-primary hover:underline">All wins →</Link>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {featuredWins.map(w => (
                <Link key={w.id} to={`/community?section=wins`} className="p-5 rounded-2xl bg-gradient-cream border border-pink/20 shadow-soft hover:shadow-pink transition-all">
                  <div className="font-display font-bold">{w.title}</div>
                  <p className="mt-1 text-sm text-foreground/80 line-clamp-3">{w.body}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Tracks */}
        <section className="container py-10 pb-24">
          <div className="flex items-end justify-between mb-6">
            <h2 className="font-display font-black text-3xl">Your 10 tracks</h2>
            <Link to="/pricing" className="text-sm text-primary hover:underline">Upgrade tier →</Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tracks.map(t => {
              const pct = progress[t.slug] ?? 0;
              const locked = false;
              return (
                <Link
                  key={t.slug}
                  to={locked ? "/pricing" : `/track/${t.slug}`}
                  className="group p-6 rounded-3xl bg-card border border-border shadow-soft hover:shadow-pink hover:-translate-y-1 transition-all relative overflow-hidden"
                >
                  <div className={`absolute top-0 left-0 right-0 h-1.5 ${hueBg(t.hue)}`} />
                  <div className="flex items-center justify-between">
                    <span className="font-display font-black text-2xl text-muted-foreground/40">{t.number}</span>
                    {locked && <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">Power tier</span>}
                    {!locked && pct > 0 && <span className="text-xs px-2 py-1 rounded-full bg-accent/20 text-accent-foreground font-semibold">{pct}%</span>}
                  </div>
                  <h3 className="mt-4 font-display font-bold text-lg leading-tight">{t.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">with {t.agent_name}</p>
                  {!locked && (
                    <div className="mt-4 h-1 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-brand transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

const Stat = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="px-5 py-3 rounded-2xl bg-card border border-border shadow-soft">
    <div className="flex items-center gap-2 text-xs text-muted-foreground">{icon}{label}</div>
    <div className="font-display font-black text-2xl text-foreground">{value}</div>
  </div>
);