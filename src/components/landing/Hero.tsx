import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, MessageCircle, Wallet, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const Hero = () => {
  const nav = useNavigate();
  const { user } = useAuth();
  return (
    <section className="relative overflow-hidden bg-gradient-cream pt-12 pb-20 md:pt-20 md:pb-28">
      {/* Top-right auth shortcut */}
      <div className="absolute top-4 right-4 z-20">
        {user ? (
          <Button
            asChild
            size="sm"
            variant="outline"
            className="rounded-full border-[#ff0054]/30 text-[#ff0054] hover:bg-[#ff0054] hover:text-white bg-white/80 backdrop-blur"
          >
            <Link to="/dashboard">
              <LogIn className="w-4 h-4 mr-1.5" /> Dashboard
            </Link>
          </Button>
        ) : (
          <Button
            asChild
            size="sm"
            variant="outline"
            className="rounded-full border-[#ff0054]/30 text-[#ff0054] hover:bg-[#ff0054] hover:text-white bg-white/80 backdrop-blur"
          >
            <Link to="/auth" aria-label="Log in">
              <LogIn className="w-4 h-4 mr-1.5" /> Log in
            </Link>
          </Button>
        )}
      </div>

      {/* Decorative blobs (Sorbet accents) */}
      <div className="absolute -top-32 -right-24 w-[480px] h-[480px] rounded-full bg-[#ffd60a]/40 blur-3xl animate-blob" />
      <div className="absolute top-40 -left-32 w-[420px] h-[420px] rounded-full bg-[#e0c3fc]/60 blur-3xl animate-blob [animation-delay:-3s]" />
      <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] rounded-full bg-[#fff0f5] blur-3xl" />

      <div className="container relative">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white border border-[#ffe0eb] text-xs font-bold tracking-wide uppercase text-[#ff0054] shadow-soft animate-fade-up">
            <Sparkles className="w-3.5 h-3.5" />
            For tired, ambitious women
          </span>

          <h1 className="mt-7 font-display font-black text-5xl md:text-7xl lg:text-8xl leading-[0.92] text-[#141414] animate-fade-up [animation-delay:80ms]">
            Stop collecting tips.<br />
            <span className="text-gradient-brand">Start getting</span>
            <span className="font-handwritten text-[#ff0054] block mt-2 text-6xl md:text-8xl lg:text-9xl font-normal tracking-normal">things done.</span>
          </h1>

          <p className="mt-8 text-lg md:text-xl text-[#141414]/70 max-w-2xl mx-auto leading-relaxed animate-fade-up [animation-delay:160ms]">
            You don't need another YouTube video explaining what a large language model is.
            You need AI that helps with <span className="text-[#141414] font-semibold">your actual week</span> —
            your inbox, your clients, your household, your business.
          </p>

          <p className="mt-5 text-base md:text-lg text-[#141414]/80 max-w-xl mx-auto animate-fade-up [animation-delay:200ms]">
            AI For Real Life is a membership built for women who are already good at everything — and exhausted from doing it alone.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center animate-fade-up [animation-delay:240ms]">
            <Button
              size="lg"
              onClick={() => nav("/onboarding")}
              className="bg-[#ff0054] text-white border-2 border-transparent shadow-pink hover:bg-white hover:text-[#ff0054] hover:border-[#ff0054] hover:-translate-y-0.5 transition-all text-base h-14 px-8 rounded-full font-bold"
            >
              Get your first AI win in under 15 minutes <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>

          <p className="mt-4 text-sm text-[#141414]/60 animate-fade-up [animation-delay:320ms]">
            No credit card needed. No AI jargon. Just one real thing, done.
          </p>

          {/* Hero proof bar */}
          <div className="mt-14 grid sm:grid-cols-3 gap-3 max-w-3xl mx-auto animate-fade-up [animation-delay:400ms]">
            {[
              { icon: <Sparkles className="w-5 h-5" />, text: "10 tracks covering real life: home, career, business, content, and more" },
              { icon: <MessageCircle className="w-5 h-5" />, text: "Named AI agents — no models, no jargon, just help" },
              { icon: <Wallet className="w-5 h-5" />, text: "Start at $9/month — cancel any time" },
            ].map((p, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-white/70 border border-[#ffe0eb] text-left text-sm text-[#141414]/80">
                <span className="text-[#ff0054] mt-0.5 shrink-0">{p.icon}</span>
                <span>{p.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
