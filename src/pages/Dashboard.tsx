import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { TRACKS, tierLabel, hueBg } from "@/data/tracks";
import { SiteHeader } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import { Flame, Sparkles, Trophy } from "lucide-react";

export default function Dashboard() {
  const { user, profile, loading } = useAuth();
  const nav = useNavigate();
  const [progress, setProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!loading && !user) nav("/auth", { replace: true });
    else if (!loading && profile && !profile.onboarding_complete) nav("/onboarding", { replace: true });
  }, [loading, user, profile, nav]);

  useEffect(() => {
    if (!user) return;
    supabase.from("user_track_progress").select("track_slug, percent_complete").eq("user_id", user.id).then(({ data }) => {
      const m: Record<string, number> = {};
      data?.forEach(r => { m[r.track_slug] = r.percent_complete; });
      setProgress(m);
    });
  }, [user]);

  if (loading || !profile) return <div className="min-h-screen bg-background" />;

  // DEV: unlock all tiers in this environment
  const tier = "power";

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        {/* Greeting band */}
        <section className="bg-gradient-warm grain border-b border-border/60">
          <div className="container py-12">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Welcome back,</p>
                <h1 className="mt-1 font-display font-black text-4xl md:text-5xl text-foreground">
                  {profile.display_name} <span className="inline-block animate-float-soft">👋</span>
                </h1>
                <p className="mt-2 text-muted-foreground">One small win today is enough.</p>
              </div>
              <div className="flex gap-3">
                <Stat icon={<Flame className="w-4 h-4 text-primary" />} label="Streak" value={`${profile.streak_days}d`} />
                <Stat icon={<Sparkles className="w-4 h-4 text-accent" />} label="XP" value={profile.xp.toString()} />
                <Stat icon={<Trophy className="w-4 h-4 text-secondary" />} label="Tier" value={tierLabel(tier as any)} />
              </div>
            </div>
          </div>
        </section>

        {profile.first_win && (
          <section className="container py-10">
            <div className="p-6 md:p-8 rounded-3xl bg-secondary text-secondary-foreground shadow-card relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-gradient-sunrise opacity-30 blur-2xl" />
              <div className="relative">
                <div className="text-xs uppercase tracking-[0.2em] font-bold text-accent">Your first win</div>
                <p className="mt-3 text-secondary-foreground/90 line-clamp-3 italic">"{profile.first_win}"</p>
              </div>
            </div>
          </section>
        )}

        {/* Tracks */}
        <section className="container py-10 pb-24">
          <div className="flex items-end justify-between mb-6">
            <h2 className="font-display font-black text-3xl">Your 9 tracks</h2>
            <Link to="/pricing" className="text-sm text-primary hover:underline">Upgrade tier →</Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {TRACKS.map(t => {
              const pct = progress[t.slug] ?? 0;
              const locked = false;
              return (
                <Link
                  key={t.slug}
                  to={locked ? "/pricing" : `/track/${t.slug}`}
                  className="group p-6 rounded-3xl bg-card border border-border shadow-card hover:shadow-warm hover:-translate-y-1 transition-all relative overflow-hidden"
                >
                  <div className={`absolute top-0 left-0 right-0 h-1.5 ${hueBg(t.hue)}`} />
                  <div className="flex items-center justify-between">
                    <span className="font-display font-black text-2xl text-muted-foreground/40">{t.number}</span>
                    {locked && <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">Power tier</span>}
                    {!locked && pct > 0 && <span className="text-xs px-2 py-1 rounded-full bg-accent/20 text-accent-foreground font-semibold">{pct}%</span>}
                  </div>
                  <h3 className="mt-4 font-display font-bold text-lg leading-tight">{t.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">with {t.agentName}</p>
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