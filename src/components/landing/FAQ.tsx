import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const items = [
  { q: "I've tried AI before and didn't stick. How is this different?", a: "Most AI tools throw a blank box at you. We give you a named agent for the exact part of your life you want help with — and walk you through your first real win in under 15 minutes. No staring at a blinking cursor wondering what to ask." },
  { q: "Do I need to be technical?", a: "No. If you can text a friend, you can use this. Every prompt is written for you — you just adjust it to your situation." },
  { q: "Is my data safe?", a: "Yes. We never train models on your conversations. The Ethics, Privacy & Safety track also teaches you exactly what to never share with any AI tool, anywhere." },
  { q: "Can I cancel anytime?", a: "Yes. One click in your dashboard. We don't do annual lock-ins." },
  { q: "Why $29 instead of free?", a: "Because free tools sit unused. $29 buys you something tiny enough to commit to and big enough to actually change your week. That's the whole bet." },
];

export const FAQ = () => (
  <section id="faq" className="py-24 md:py-32 bg-gradient-warm grain">
    <div className="container max-w-3xl">
      <div className="text-center mb-12">
        <span className="text-xs uppercase tracking-[0.2em] font-bold text-primary">FAQ</span>
        <h2 className="mt-4 font-display font-black text-4xl md:text-5xl leading-tight">The honest questions.</h2>
      </div>
      <Accordion type="single" collapsible className="space-y-3">
        {items.map((it, i) => (
          <AccordionItem key={i} value={`i-${i}`} className="bg-card border border-border rounded-2xl px-6 shadow-soft">
            <AccordionTrigger className="font-display font-bold text-lg text-left hover:no-underline">
              {it.q}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed">{it.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </section>
);