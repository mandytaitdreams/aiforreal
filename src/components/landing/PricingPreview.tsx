import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const PricingPreview = () => {
  const nav = useNavigate();
  return (
    <section id="pricing" className="py-24 md:py-32 bg-background">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <span className="text-xs uppercase tracking-[0.2em] font-bold text-primary">Pricing</span>
          <h2 className="mt-4 font-display font-black text-4xl md:text-6xl leading-tight">
            Less than your weekly oat latte.
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">Cancel anytime. No "annual contract" tricks.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto items-stretch">
          {/* Try */}
          <div className="p-8 rounded-3xl bg-card border border-border shadow-card flex flex-col">
            <div className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Try It</div>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="font-display font-black text-5xl">$9</span>
              <span className="text-muted-foreground">/mo</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">Start here if you're not sure yet.</p>
            <ul className="mt-6 space-y-3 text-sm flex-1">
              {["Full library of all 9 tracks", "Prompt library + saved chats", "Community + monthly Q&A"].map(f => (
                <li key={f} className="flex gap-2"><Check className="w-4 h-4 text-primary mt-0.5 shrink-0" /> {f}</li>
              ))}
            </ul>
            <Button variant="outline" className="mt-8 rounded-full" onClick={() => nav("/auth?mode=signup")}>
              Start at $9
            </Button>
          </div>

          {/* Growth — recommended */}
          <div className="relative p-8 rounded-3xl bg-gradient-plum text-secondary-foreground shadow-warm flex flex-col scale-[1.02] border-2 border-accent">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-accent text-accent-foreground text-xs font-bold uppercase tracking-wider shadow-glow">
              ★ Most popular · Start here
            </div>
            <div className="text-sm font-bold uppercase tracking-wider text-accent">Growth</div>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="font-display font-black text-6xl">$29</span>
              <span className="text-secondary-foreground/70">/mo</span>
            </div>
            <p className="mt-3 text-sm text-secondary-foreground/80">Your AI strategy team, ready when you are.</p>
            <ul className="mt-6 space-y-3 text-sm flex-1">
              {[
                "Everything in Try It",
                "Full AI agent suite — all 9 named agents",
                "120 strategy sessions a month",
                "Live monthly group coaching",
                "Track-specific bridge plans",
              ].map(f => (
                <li key={f} className="flex gap-2"><Check className="w-4 h-4 text-accent mt-0.5 shrink-0" /> {f}</li>
              ))}
            </ul>
            <Button className="mt-8 rounded-full bg-gradient-sunrise text-primary-foreground border-0 hover:opacity-95" onClick={() => nav("/auth?mode=signup")}>
              Start moving with Growth →
            </Button>
          </div>

          {/* Power */}
          <div className="p-8 rounded-3xl bg-card border border-border shadow-card flex flex-col opacity-90">
            <div className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Power</div>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="font-display font-black text-5xl">$79</span>
              <span className="text-muted-foreground">/mo</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">For women building at speed.</p>
            <ul className="mt-6 space-y-3 text-sm flex-1">
              {["Everything in Growth", "Unlimited strategy sessions", "Custom workflow builds", "1:1 founder access"].map(f => (
                <li key={f} className="flex gap-2"><Check className="w-4 h-4 text-primary mt-0.5 shrink-0" /> {f}</li>
              ))}
            </ul>
            <Button variant="outline" disabled className="mt-8 rounded-full">Coming soon</Button>
          </div>
        </div>
      </div>
    </section>
  );
};