import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";

export const Hero = () => {
  const nav = useNavigate();
  return (
    <section className="relative overflow-hidden bg-gradient-warm grain">
      {/* Decorative blobs */}
      <div className="absolute -top-32 -right-24 w-[480px] h-[480px] bg-gradient-sunrise opacity-40 blur-3xl animate-blob" />
      <div className="absolute top-40 -left-32 w-[380px] h-[380px] bg-accent/40 blur-3xl animate-blob [animation-delay:-3s]" />

      <div className="container relative pt-20 pb-28 md:pt-28 md:pb-36">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card border border-border text-xs font-semibold tracking-wide uppercase text-secondary shadow-soft animate-fade-up">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            For tired, ambitious women
          </span>

          <h1 className="mt-6 font-display font-black text-5xl md:text-7xl leading-[0.95] text-foreground animate-fade-up [animation-delay:80ms]">
            Stop collecting tips.<br />
            <span className="text-gradient-sunrise italic">Start getting things done.</span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed animate-fade-up [animation-delay:160ms]">
            You don't need another YouTube video explaining what a large language model is.
            You need AI that helps with <span className="text-foreground font-semibold">your actual week</span> —
            your inbox, your clients, your household, your business.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-3 animate-fade-up [animation-delay:240ms]">
            <Button
              size="lg"
              onClick={() => nav("/auth?mode=signup")}
              className="bg-gradient-sunrise text-primary-foreground border-0 shadow-warm hover:opacity-95 hover:shadow-glow transition-all text-base h-14 px-8 rounded-full font-semibold"
            >
              Get your first AI win in under 15 minutes →
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => document.getElementById("tracks")?.scrollIntoView({ behavior: "smooth" })}
              className="h-14 px-7 rounded-full border-2 border-secondary/20 text-secondary hover:bg-secondary hover:text-secondary-foreground"
            >
              See the 9 tracks
            </Button>
          </div>

          <p className="mt-4 text-sm text-muted-foreground animate-fade-up [animation-delay:320ms]">
            No credit card needed. No AI jargon. Just one real thing, done.
          </p>

          <div className="mt-12 flex flex-wrap gap-6 text-sm text-muted-foreground animate-fade-up [animation-delay:400ms]">
            <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary" /> 9 tracks for real life</div>
            <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-accent" /> Named AI agents, no jargon</div>
            <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-secondary" /> Start at $9 · cancel anytime</div>
          </div>
        </div>
      </div>
    </section>
  );
};