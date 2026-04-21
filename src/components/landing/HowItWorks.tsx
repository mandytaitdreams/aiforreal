const steps = [
  { n: "01", title: "Tell us where you're stuck", body: "30-second onboarding. Pick the part of your life you want unstuck first." },
  { n: "02", title: "Get one real result", body: "Your matched agent walks you through your first AI win — usually in 10 minutes." },
  { n: "03", title: "Keep going at your pace", body: "Daily 5-min wins, weekly tracks, and live strategy sessions when you need them." },
];

export const HowItWorks = () => (
  <section id="how" className="py-24 md:py-32 bg-gradient-warm grain">
    <div className="container">
      <div className="max-w-2xl mb-16">
        <span className="text-xs uppercase tracking-[0.2em] font-bold text-primary">How it works</span>
        <h2 className="mt-4 font-display font-black text-4xl md:text-6xl leading-tight text-foreground">
          Relief in <span className="italic text-gradient-sunrise">15 minutes</span>.<br />
          Not another course.
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {steps.map((s, i) => (
          <div key={s.n} className="p-8 rounded-3xl bg-card border border-border shadow-card relative">
            <div className="absolute -top-4 -left-4 w-14 h-14 rounded-full bg-gradient-sunrise flex items-center justify-center font-display font-black text-primary-foreground text-xl shadow-warm">
              {s.n}
            </div>
            <h3 className="mt-6 font-display font-bold text-2xl text-foreground">{s.title}</h3>
            <p className="mt-3 text-muted-foreground leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);