import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const items = [
  { q: "I've tried AI tools before and they didn't stick. What's different here?", a: "Most AI tools dump you into a chat box and expect you to figure it out. AI For Real Life starts by learning what you actually need this week — from a 5-question quiz — and routes you to the right track, the right agent, and the right first task. Your first session ends with a real, usable output. Not a tutorial. Not an example. Something done." },
  { q: "I'm not technical at all. Is this for me?", a: "Yes. This is specifically built for capable women who are not technical and don't want to be. The AI Foundations track starts with the questions women actually ask — not definitions of models or infrastructure. The agents speak like humans. The prompts are written in plain language. You do not need to understand how AI works to use it well here." },
  { q: "Will this take a lot of time?", a: "The platform is designed for women who access it between meetings, during school pickup, or after the kids are asleep. Videos include an audio-only mode for commuting or cooking. Every lesson has a single Do This Now action. Your first win takes under 15 minutes. You can build from there at your own pace — no deadlines, no cohorts, no pressure." },
  { q: "Is it safe to put my client data or work information into these AI tools?", a: "The AI Bias, Ethics, Privacy & Safety track addresses this directly, as does the Rue agent who is specifically designed for safety and ethics questions. You'll get honest, specific guidance on what to put into AI tools, what to keep out, and how to use AI with clients safely. There is no \"don't worry about it\" answer here — because that's not good enough." },
  { q: "I already pay for ChatGPT / Claude / other AI tools. Why do I need this?", a: "Raw AI tools give you access. This platform gives you direction. It tells you what to ask, how to ask it, and what to do with the output — for your specific situation, not a generic use case. It also gives you named agents already configured for your life, a community of women asking the same questions, and a structured learning path. Most members use both — and find they finally get value from the tools they already pay for." },
  { q: "Is this just a course?", a: "No. It is a learning and action platform. Courses end. This is built to be the place you return every week when you hit a new problem — because there will always be a new problem. The prompt library, the agents, the community, and the events are all designed to be useful now and six months from now." },
  { q: "I'm worried I'll join and never use it.", a: "That's a real concern and it's worth naming. Most online communities fail because they don't give you a clear next step from day one. AI For Real Life is designed so your first session ends with something done. After that, your dashboard shows your track progress, your next recommended action, and upcoming events. You are never looking at an overwhelming content library with no idea where to start." },
  { q: "Can I cancel?", a: "Yes. No notice period, no cancellation fee, no guilt. If you leave, your saved prompts and results stay on your dashboard for 30 days so you can export them. If you rejoin, your history is still there." },
  { q: "What's the difference between $9 and $29?", a: "At $9 you get the full content library — all 10 tracks, all prompts, all playlists, all events, and community. At $29 you get everything in $9 plus the full AI agent suite with 120 strategy sessions a month. The $9 tier is for exploring and learning. The $29 tier is for acting, doing, and moving — with a team." },
  { q: "Who is this specifically for?", a: "Women aged 25–45 who are doing more than one thing at once: a job, a side project, a business, a household, caregiving, creative work, or some combination of all of the above. If you've ever felt like AI training was built for someone younger, simpler, or with fewer responsibilities than you — this is built for you." },
];

export const FAQ = () => (
  <section id="faq" className="py-24 md:py-32 bg-[#fffdf7]">
    <div className="container max-w-3xl">
      <div className="text-center mb-12">
        <h2 className="font-display font-black text-4xl md:text-6xl leading-tight text-[#141414]">
          The <span className="font-handwritten text-[#ff0054] font-normal">honest</span> questions.
        </h2>
      </div>
      <Accordion type="single" collapsible defaultValue="i-0" className="space-y-3">
        {items.map((it, i) => (
          <AccordionItem key={i} value={`i-${i}`} className="bg-white border border-[#ffe0eb] rounded-[1.5rem] px-6 shadow-soft data-[state=open]:border-[#ff0054]">
            <AccordionTrigger className="font-display font-bold text-base md:text-lg text-left text-[#141414] hover:no-underline hover:text-[#ff0054]">
              {it.q}
            </AccordionTrigger>
            <AccordionContent className="text-[#141414]/80 leading-relaxed">{it.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </section>
);
