const rows = [
  ["I open ChatGPT and go blank every time", "Your agent greets you by name and already knows what you're working on"],
  ["AI content sounds nothing like me", "Lyric writes with your voice because you trained her with your words"],
  ["I've watched 47 tutorials and still don't know what to do", "10-minute videos with one button: apply this now"],
  ["I'm the only one who keeps track of everything at home", "Raya holds it so you don't have to"],
  ["I don't know if using AI at work is safe or allowed", "Rue gives you a personalised AI Safety Map for your exact situation"],
  ["My business is stuck in my head", "Your first session ends with your offer written clearly, in your words"],
  ["I'm paying for 6 subscriptions and they don't talk to each other", "One platform. One place. Every part of your life connected."],
];

export const Compare = () => (
  <section className="py-24 md:py-32 bg-[#fffdf7]">
    <div className="container max-w-5xl">
      <div className="text-center mb-14">
        <h2 className="font-display font-black text-4xl md:text-6xl leading-tight text-[#141414]">
          Before <span className="text-gradient-brand">→</span> After
        </h2>
      </div>

      <div className="grid md:grid-cols-2 rounded-[2.5rem] overflow-hidden border border-[#ffe0eb]">
        <div className="p-6 md:p-8 bg-[#fff0f5]">
          <div className="text-xs uppercase tracking-[0.2em] font-bold text-[#141414]/60 mb-5">Before AI For Real Life</div>
          <ul className="space-y-4">
            {rows.map((r, i) => (
              <li key={i} className="text-[#141414]/75 leading-relaxed border-b border-[#ffe0eb] pb-4 last:border-0">
                "{r[0]}"
              </li>
            ))}
          </ul>
        </div>
        <div className="p-6 md:p-8 bg-[#ff0054] text-white">
          <div className="text-xs uppercase tracking-[0.2em] font-bold text-[#ffd60a] mb-5">Inside AI For Real Life</div>
          <ul className="space-y-4">
            {rows.map((r, i) => (
              <li key={i} className="font-bold leading-relaxed border-b border-white/15 pb-4 last:border-0">
                {r[1]}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </section>
);
