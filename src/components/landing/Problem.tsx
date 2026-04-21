const symptoms = [
  "You've bookmarked 47 ChatGPT tutorials. Watched maybe 3.",
  "Every productivity app feels like another job to keep up with.",
  '"AI for business" courses sound like they\'re for someone else.',
  "You're already running 3 mental tabs. You don't need a 4th.",
];

export const Problem = () => (
  <section className="bg-secondary text-secondary-foreground py-24 md:py-32 relative overflow-hidden">
    <div className="absolute inset-0 grain opacity-30" />
    <div className="container relative">
      <div className="max-w-3xl">
        <span className="text-xs uppercase tracking-[0.2em] font-bold text-accent">The problem</span>
        <h2 className="mt-4 font-display font-black text-4xl md:text-6xl leading-tight">
          You're not behind on AI.<br />
          <span className="italic text-accent">AI is behind on you.</span>
        </h2>
        <p className="mt-6 text-lg md:text-xl text-secondary-foreground/80 leading-relaxed">
          Most AI content is written by men, for men, about jobs that don't look like yours.
          You don't need to "10x your output." You need to get through Tuesday with your nervous system intact.
        </p>

        <div className="mt-12 grid sm:grid-cols-2 gap-4">
          {symptoms.map((s, i) => (
            <div key={i} className="p-6 rounded-3xl bg-secondary-foreground/5 border border-secondary-foreground/10 backdrop-blur-sm">
              <p className="text-secondary-foreground/90 leading-relaxed">"{s}"</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);