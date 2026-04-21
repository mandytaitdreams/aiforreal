import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const FinalCTA = () => {
  const nav = useNavigate();
  return (
    <section className="py-24 md:py-32 bg-secondary text-secondary-foreground relative overflow-hidden">
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-gradient-sunrise opacity-30 blur-3xl animate-blob" />
      <div className="container relative max-w-3xl text-center">
        <h2 className="font-display font-black text-4xl md:text-6xl leading-tight">
          You're already doing enough.
          <br />
          <span className="italic text-accent">Let AI do the rest.</span>
        </h2>
        <p className="mt-6 text-lg text-secondary-foreground/80">
          Pick a track. Meet your agent. Get one thing off your plate today.
        </p>
        <Button
          size="lg"
          onClick={() => nav("/auth?mode=signup")}
          className="mt-10 bg-gradient-sunrise text-primary-foreground border-0 shadow-warm hover:opacity-95 hover:shadow-glow text-base h-14 px-10 rounded-full font-semibold"
        >
          Get my first AI win →
        </Button>
        <p className="mt-4 text-sm text-secondary-foreground/60">No credit card · Cancel anytime</p>
      </div>
    </section>
  );
};