import { TRACKS, hueBg } from "@/data/tracks";
import { useNavigate } from "react-router-dom";

export const TracksGrid = () => {
  const nav = useNavigate();
  return (
    <section id="tracks" className="py-24 md:py-32 bg-[#fffdf7]">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center mb-14">
          <h2 className="font-display font-black text-4xl md:text-6xl leading-tight text-[#141414]">
            Everything you need.<br />
            <span className="font-handwritten text-[#ff0054] font-normal">Nothing you don't.</span>
          </h2>
          <p className="mt-6 text-lg text-[#141414]/75">
            The platform gives every member access to all 10 tracks on day one. You start where the pain is loudest. You grow from there.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TRACKS.map((t) => (
            <button
              key={t.slug}
              onClick={() => nav("/auth?mode=signup")}
              className={`interactive-card group text-left p-7 rounded-[2rem] ${hueBg(t.hue)} text-[#141414] relative overflow-hidden cursor-pointer`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="hover-icon-wrap inline-flex w-12 h-12 rounded-full bg-white items-center justify-center font-display font-black text-[#ff0054] text-base">
                  {t.number}
                </span>
                <span className="text-xs uppercase tracking-wider font-bold text-[#141414]/50 hover-invert">{t.tier === "try" ? "Try" : t.tier === "growth" ? "Growth" : "Power"}</span>
              </div>
              <h3 className="font-display font-bold text-xl leading-tight">{t.title}</h3>
              <p className="mt-2 font-handwritten text-xl text-[#ff0054] hover-invert leading-tight">{t.tagline}</p>
              <p className="mt-3 text-sm text-[#141414]/80 hover-invert leading-relaxed">{t.description}</p>
              <div className="mt-5 pt-4 border-t border-[#141414]/10 text-sm font-bold flex items-center justify-between hover-invert">
                <span>Meet {t.agentName}</span>
                <span>→</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
