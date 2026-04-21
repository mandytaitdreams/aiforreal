const questions = [
  "Am I cheating if I use this?",
  "How do I use AI without losing my voice?",
  "Is this safe for my client's data?",
  "Will this replace me?",
  "I tried it once and felt stupid. Where do I even start?",
];

export const Problem = () => (
  <section className="bg-[#2a1b3d] text-white py-24 md:py-32 relative overflow-hidden">
    <div className="absolute -top-20 -left-20 w-[500px] h-[500px] rounded-full bg-[#ff0054]/20 blur-3xl" />
    <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-[#ffd60a]/10 blur-3xl" />
    <div className="container relative max-w-3xl">
      <p className="font-display font-black text-3xl md:text-5xl leading-tight text-white">
        Most AI training was designed by tech bros, for tech bros.
      </p>
      <p className="mt-6 text-lg md:text-xl text-white/80">
        It doesn't answer what women actually ask:
      </p>

      <ul className="mt-8 space-y-4">
        {questions.map((q, i) => (
          <li key={i} className="font-handwritten text-2xl md:text-3xl text-[#ffd60a] leading-snug">
            "{q}"
          </li>
        ))}
      </ul>

      <div className="mt-14 p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
        <p className="font-display font-black text-2xl md:text-4xl text-white leading-tight">
          68% of women have tried AI tools.<br />
          <span className="text-[#ff0054]">Only 6% feel confident using them.</span>
        </p>
        <p className="mt-5 text-white/80 text-lg leading-relaxed">
          That gap isn't intelligence. It's time, safety, and training that was never designed for the way women actually live and work.
        </p>
      </div>
    </div>
  </section>
);
