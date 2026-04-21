import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { TRACKS, tierLabel, hueBg } from "@/data/tracks";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Lock, PlayCircle, Clock } from "lucide-react";

export default function TrackDetail() {
  const { slug } = useParams();
  const { user, profile, loading } = useAuth();
  const nav = useNavigate();
  const track = TRACKS.find(t => t.slug === slug);

  useEffect(() => {
    if (!loading && !user) nav("/auth", { replace: true });
  }, [loading, user, nav]);

  if (!track) return (
    <div className="min-h-screen bg-background"><SiteHeader />
      <div className="container py-24 text-center">
        <h1 className="font-display font-black text-3xl">Track not found</h1>
        <Link to="/dashboard" className="text-primary mt-4 inline-block">← Back to dashboard</Link>
      </div>
    </div>
  );

  // DEV: unlock all tiers in this environment
  const tier = "power";
  const tierOrder = { try: 0, growth: 1, power: 2 } as const;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className={`${hueBg(track.hue)} text-foreground`}>
          <div className="container py-16">
            <Link to="/dashboard" className="text-sm text-foreground/70 hover:text-foreground">← Dashboard</Link>
            <div className="mt-6 flex items-start gap-6">
              <span className="w-20 h-20 rounded-full bg-card flex items-center justify-center font-display font-black text-3xl text-foreground shadow-soft">{track.number}</span>
              <div>
                <span className="text-xs uppercase tracking-[0.2em] font-bold">{tierLabel(track.tier)} track · {track.number}</span>
                <h1 className="mt-2 font-display font-black text-4xl md:text-5xl leading-tight max-w-2xl">{track.title}</h1>
                <p className="mt-3 font-handwritten text-2xl">{track.tagline}</p>
                <p className="mt-4 max-w-2xl text-foreground/80">{track.description}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="container py-14 max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display font-black text-2xl">Lessons</h2>
            <span className="text-sm text-muted-foreground">with {track.agentName} · {track.agentRole}</span>
          </div>
          <div className="space-y-3">
            {track.lessons.map((l, i) => {
              const locked = false;
              return (
                <div key={i} className="flex items-center gap-4 p-5 rounded-2xl bg-card border border-border shadow-soft hover:shadow-card transition-all">
                  <span className="font-display font-black text-2xl text-muted-foreground/40 w-8">{String(i+1).padStart(2,"0")}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-foreground">{l.title}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3" /> {l.minutes} min</div>
                  </div>
                  {locked ? (
                    <Button variant="outline" size="sm" className="rounded-full" onClick={() => nav("/pricing")}>
                      <Lock className="w-3.5 h-3.5 mr-1.5" /> Upgrade
                    </Button>
                  ) : (
                    <Button size="sm" className="rounded-full bg-gradient-sunrise text-primary-foreground border-0">
                      <PlayCircle className="w-4 h-4 mr-1.5" /> Start
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}