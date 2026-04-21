const wins = [
  {
    text: "I described my business out loud for the first time in three years and it finally made sense. The Business Brief Zuri gave me is going on my website tomorrow.",
    name: "Founding Member",
    track: "AI Business School",
    color: "bg-[#fff0f5]",
  },
  {
    text: "I've been avoiding writing that LinkedIn post for four weeks. Lyric built the full brief in 8 minutes. I'm embarrassed by how simple it was.",
    name: "Founding Member",
    track: "Creators Track",
    color: "bg-[#e0c3fc]",
  },
  {
    text: "I brain-dumped my entire week — the mess, the stress, the stuff I keep forgetting — and Raya turned it into an actual plan. I cried a little bit.",
    name: "Founding Member",
    track: "Home Life Track",
    color: "bg-[#ffd60a]",
  },
];

export const WinsWall = () => (
  <section className="py-24 md:py-32 bg-[#fff0f5]">
    <div className="container">
      <div className="max-w-3xl mx-auto text-center mb-14">
        <h2 className="font-display font-black text-4xl md:text-6xl leading-tight text-[#141414]">
          Women inside AI For Real Life <span className="font-handwritten text-[#ff0054] font-normal">this week:</span>
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
        {wins.map((w, i) => (
          <div key={i} className={`interactive-card p-7 rounded-[2rem] ${w.color} text-[#141414] cursor-default`}>
            <p className="leading-relaxed text-[#141414]/90 hover-invert">"{w.text}"</p>
            <div className="mt-5 pt-4 border-t border-[#141414]/15 hover-invert">
              <div className="font-bold text-sm">— {w.name}</div>
              <div className="text-xs uppercase tracking-wider mt-1 text-[#ff0054] hover-invert">{w.track}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
