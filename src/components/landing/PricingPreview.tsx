import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const PricingPreview = () => {
  const nav = useNavigate();
  return (
    <section id="pricing" className="py-24 md:py-32 bg-[#fff0f5]">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <h2 className="font-display font-black text-4xl md:text-6xl leading-tight text-[#141414]">
            Two ways in.<br />
            <span className="font-handwritten text-[#ff0054] font-normal">Cancel any time.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto items-stretch">
          {/* Tier 2 — Hero card */}
          <div className="relative md:order-2 p-10 rounded-[2.5rem] bg-[#ff0054] text-white shadow-pink-lg flex flex-col">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full bg-[#ffd60a] text-[#141414] text-xs font-black uppercase tracking-wider shadow-yellow">
              Most women start here
            </div>
            <div className="text-sm font-bold uppercase tracking-wider text-[#ffd60a]">Tier 2</div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="font-display font-black text-7xl">$29</span>
              <span className="text-white/80 text-lg">/month</span>
            </div>
            <p className="mt-3 text-white/90 leading-relaxed">
              Keep this win <strong>and</strong> have your AI team help you act on it — today, and every week.
            </p>
            <p className="mt-4 text-sm text-white/85 font-semibold">Everything in $9, plus:</p>
            <ul className="mt-3 space-y-2.5 text-sm flex-1">
              {[
                "Full AI agent suite — all agents unlocked",
                "120 strategy sessions a month to use across your whole team",
                "Cross-agent workflows — Zuri hands off to Lyric, Nova, Raya",
                "Saved agent conversation history — your work doesn't disappear",
                "Priority responses",
                "Personalised onboarding concierge email sequence",
              ].map(f => (
                <li key={f} className="flex gap-2"><Check className="w-4 h-4 text-[#ffd60a] mt-0.5 shrink-0" /> {f}</li>
              ))}
            </ul>
            <Button
              size="lg"
              onClick={() => nav("/onboarding")}
              className="mt-7 rounded-full bg-white text-[#ff0054] border-2 border-white hover:bg-[#ffd60a] hover:border-[#ffd60a] hover:text-[#141414] font-bold h-13"
            >
              Get my AI team — $29/month <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>

          {/* Tier 1 */}
          <div className="md:order-1 p-10 rounded-[2.5rem] bg-white border border-[#ffe0eb] flex flex-col">
            <div className="text-sm font-bold uppercase tracking-wider text-[#141414]/60">Tier 1</div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="font-display font-black text-6xl text-[#141414]">$9</span>
              <span className="text-[#141414]/60 text-lg">/month</span>
            </div>
            <p className="mt-3 text-[#141414]/75 leading-relaxed">
              Keep this win, explore the tracks, come back when you're ready to move.
            </p>
            <ul className="mt-6 space-y-2.5 text-sm flex-1 text-[#141414]/85">
              {[
                "All 10 tracks and their full content libraries",
                "20 prompts per track (200 total) with one-click copy and generator",
                "Foundation toolkit per track: key takeaways, templates, challenges",
                "Curated playlists across all tracks",
                "Bi-weekly Q&As and monthly masterclasses",
                "Community forum: Questions, Wins, Resources, Feedback",
                "Personal saved dashboard",
                "Foundation-level AI access",
              ].map(f => (
                <li key={f} className="flex gap-2"><Check className="w-4 h-4 text-[#ff0054] mt-0.5 shrink-0" /> {f}</li>
              ))}
            </ul>
            <Button
              variant="outline"
              onClick={() => nav("/onboarding")}
              className="mt-7 rounded-full border-2 border-[#ff0054] text-[#ff0054] hover:bg-[#ff0054] hover:text-white font-bold"
            >
              Start smaller — $9/month
            </Button>
          </div>
        </div>

        {/* What 120 sessions looks like */}
        <div className="mt-12 max-w-3xl mx-auto p-8 rounded-[2rem] bg-white border border-[#ffe0eb]">
          <h3 className="font-display font-bold text-xl text-[#141414]">What 120 strategy sessions actually looks like</h3>
          <table className="mt-5 w-full text-sm">
            <tbody>
              {[
                ["Quick question to an agent", "1 session"],
                ["Deeper breakdown or analysis", "2–3 sessions"],
                ["Full strategy plan", "5 sessions"],
                ["Full business or content audit", "10 sessions"],
              ].map(r => (
                <tr key={r[0]} className="border-b border-[#ffe0eb] last:border-0">
                  <td className="py-3 text-[#141414]/85">{r[0]}</td>
                  <td className="py-3 text-right font-bold text-[#ff0054]">{r[1]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-5 text-sm text-[#141414]/75 leading-relaxed">
            <strong className="text-[#141414]">For most women, 120 sessions means weekly progress with room to spare.</strong>{" "}
            Most members never hit the ceiling — and that's intentional.
          </p>
        </div>
      </div>
    </section>
  );
};
