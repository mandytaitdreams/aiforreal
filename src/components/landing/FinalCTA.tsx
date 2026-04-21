import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const FinalCTA = () => {
  const nav = useNavigate();
  const { user } = useAuth();
  const go = () => nav(user ? "/dashboard" : "/onboarding");
  return (
    <section className="py-24 md:py-32 bg-[#2a1b3d] text-white relative overflow-hidden">
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-[#ff0054]/25 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-[#ffd60a]/15 blur-3xl" />
      <div className="container relative max-w-3xl text-center">
        <h2 className="font-display font-black text-4xl md:text-6xl leading-[1.05]">
          You don't need to figure out AI.
        </h2>
        <p className="mt-4 font-handwritten text-3xl md:text-5xl text-[#ffd60a] leading-tight">
          You just need one useful win.
        </p>
        <p className="mt-8 text-lg text-white/85 leading-relaxed">
          Start with the part of your life that needs the most help right now. The platform will do the rest.
        </p>
        <p className="mt-3 text-white/70">Your first result takes under 15 minutes.</p>
        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            size="lg"
            onClick={go}
            className="bg-[#ff0054] text-white border-2 border-transparent hover:bg-white hover:text-[#ff0054] hover:border-[#ff0054] shadow-pink-lg text-base h-14 px-9 rounded-full font-bold"
          >
            Get my first AI win — $29/month <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={go}
            className="bg-transparent text-white border-2 border-white/30 hover:bg-white hover:text-[#2a1b3d] h-14 px-7 rounded-full font-bold"
          >
            Start smaller — $9/month
          </Button>
        </div>
        <p className="mt-5 text-sm text-white/60">
          No credit card needed to create your account. Payment processed before your first session.
        </p>
      </div>
    </section>
  );
};
