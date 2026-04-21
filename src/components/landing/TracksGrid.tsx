import { TRACKS } from "@/data/tracks";
import { useNavigate } from "react-router-dom";

export const TracksGrid = () => {
  const nav = useNavigate();
  return (
    <section id="tracks" className="py-24 md:py-32 bg-background">
      <div className="container">
        <div className="max-w-2xl mb-16">
          <span className="text-xs uppercase tracking-[0.2em] font-bold text-primary">9 tracks · 1 membership</span>
          <h2 className="mt-4 font-display font-black text-4xl md:text-6xl leading-[1.05] text-foreground">
            Named agents.<br />
            <span className="italic text-gradient-sunrise">Real jobs done.</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Each track has a named AI agent — Iris, Hazel, Nora, Vera. They're not models.
            They're the help you'd call if you had a smarter, calmer best friend in every part of your life.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TRACKS.map((t, i) => (
            <button
              key={t.slug}
              onClick={() => nav("/auth?mode=signup")}
              className="group text-left p-7 rounded-3xl bg-card border border-border shadow-card hover:shadow-warm hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className={`absolute top-0 left-0 right-0 h-1.5 ${t.hue}`} />
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">{t.emoji}</span>
                <span className="font-display font-bold text-2xl text-muted-foreground/40">{t.number}</span>
              </div>
              <h3 className="font-display font-bold text-xl leading-tight text-foreground mb-2">
                {t.title}
              </h3>
              <p className="text-sm text-muted-foreground italic mb-4">{t.tagline}</p>
              <div className="pt-4 border-t border-border/60 flex items-center justify-between text-sm">
                <span className="text-foreground font-semibold">Meet {t.agentName}</span>
                <span className="text-primary group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};