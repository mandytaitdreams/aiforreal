import { Compass, MousePointerClick, Users } from "lucide-react";

const items = [
  {
    icon: <Compass className="w-6 h-6" />,
    title: "It starts with your life, not a tutorial.",
    body: "When you join, you answer 5 quick questions about what you actually need help with this week. The platform routes you to the right track and introduces the AI agent best suited to your situation. Your first session ends with a result you can use today.",
    color: "bg-[#e0c3fc]",
  },
  {
    icon: <MousePointerClick className="w-6 h-6" />,
    title: "Every lesson has a \"Do This Now\" button.",
    body: "Content without action is just content. Every video, prompt, and tool connects directly to an AI agent — one click and you're applying it to your real situation, not a hypothetical exercise.",
    color: "bg-[#ffd60a]",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Your AI team works like people, not software.",
    body: "The agents have names, voices, and clear jobs. Raya helps you clear your mental load. Zuri helps you think through strategy. Lyric writes with you in your voice. Neo explains things without talking down to you. You choose by outcome, not by model.",
    color: "bg-[#fff0f5]",
  },
];

export const Solution = () => (
  <section className="py-24 md:py-32 bg-[#fffdf7]">
    <div className="container">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h2 className="font-display font-black text-4xl md:text-6xl leading-tight text-[#141414]">
          AI For Real Life is <span className="text-gradient-brand">different.</span>
        </h2>
        <p className="mt-6 text-lg md:text-xl text-[#141414]/75">
          It's a learning and action membership where you pick the part of your life that hurts most right now —
          and start getting relief in under 15 minutes.
        </p>
        <p className="mt-4 font-handwritten text-2xl text-[#ff0054]">
          No theory. No homework. Just you, a real problem, and an AI agent built to help with it.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {items.map((it, i) => (
          <div
            key={i}
            className={`interactive-card p-8 rounded-[2rem] ${it.color} text-[#141414] cursor-default`}
          >
            <div className="hover-icon-wrap inline-flex w-12 h-12 rounded-full bg-white/80 items-center justify-center text-[#ff0054] mb-5">
              {it.icon}
            </div>
            <h3 className="font-display font-bold text-xl leading-tight">{it.title}</h3>
            <p className="mt-3 leading-relaxed text-[#141414]/85 hover-invert">{it.body}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
