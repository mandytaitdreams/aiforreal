import { AGENTS } from "@/data/tracks";

const colors = ["bg-[#fff0f5]", "bg-[#e0c3fc]", "bg-[#ffd60a]", "bg-[#fff0f5]", "bg-[#e0c3fc]"];

export const AgentTeam = () => (
  <section className="py-24 md:py-32 bg-[#fffdf7]">
    <div className="container">
      <div className="max-w-3xl mx-auto text-center mb-14">
        <h2 className="font-display font-black text-4xl md:text-6xl leading-tight text-[#141414]">
          Your <span className="text-gradient-brand">AI team.</span>
        </h2>
        <p className="mt-6 text-lg text-[#141414]/75">
          No model names. No technical specs. Just named agents with clear jobs — chosen by outcome, not by infrastructure.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
        {AGENTS.map((a, i) => (
          <div
            key={a.name}
            className={`interactive-card p-6 rounded-[2rem] ${colors[i % colors.length]} text-[#141414] cursor-default`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="hover-icon-wrap w-12 h-12 rounded-full bg-white flex items-center justify-center font-display font-black text-xl text-[#ff0054]">
                {a.name[0]}
              </div>
              <div className="font-display font-bold text-xl">{a.name}</div>
            </div>
            <p className="text-sm text-[#141414]/85 hover-invert leading-relaxed">{a.job}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
