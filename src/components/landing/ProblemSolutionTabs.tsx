import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

type Item = {
  id: string;
  label: string;
  problem: string[];
  solutionTrack: string;
  solutionAgent: string;
  solutionFirst: string;
  bullets: string[];
  quote?: string;
};

const items: Item[] = [
  {
    id: "brain",
    label: "My brain never stops running.",
    problem: [
      "You are the household's operating system. You manage the school schedule, the grocery list, the doctor appointments, the birthday cards, the home admin — all of it, on top of everything else. By the time you sit down to actually work, you've already made 47 micro-decisions and you're running on nothing.",
      "This isn't a productivity problem. It's a mental load problem. And most tools make it worse by adding more to manage.",
      "The research is clear: women carry a disproportionate share of cognitive and domestic labour — and it compounds. Every task you hold in your head takes energy you could be using elsewhere.",
    ],
    solutionTrack: "AI For Home Life Admin",
    solutionAgent: "Raya",
    solutionFirst:
      "On your first session, you brain-dump everything on your plate. Raya turns it into a structured weekly plan, flags what AI can do for you directly, and hands you back time.",
    bullets: [
      "20 prompts for home admin: meal planning, scheduling, tricky conversations with schools, landlords, doctors",
      "Templates for the messages you dread writing",
      "A 5-day challenge to offload your mental load in 15 minutes a day",
    ],
    quote: "I exhaled for the first time in months. It was genuinely physical relief.",
  },
  {
    id: "stuck",
    label: "I use AI sometimes, but I'm getting nothing out of it.",
    problem: [
      "You open ChatGPT, stare at the cursor, and type \"help me with my email\" — and then get something completely unusable. You don't know what to ask. You don't know what it can actually do. And every time you try, you feel like you're the problem.",
      "You're not. The training for most AI tools assumes you already know what you want and how to ask for it. For women juggling everything at once, that's a completely unrealistic starting point.",
    ],
    solutionTrack: "AI Foundations for Women's Lives",
    solutionAgent: "Neo",
    solutionFirst:
      "It doesn't assume you're technical. It doesn't start with history lessons. It starts with your actual life and gives you the 20 most useful prompts for someone at your stage, in plain language.",
    bullets: [
      "A myth-busting session with Neo, your learning AI, addressing your specific concerns",
      "A plain-language guide to what AI can and can't do for women in your situation",
      "A simple weekly habit that makes AI a natural part of your day",
    ],
  },
  {
    id: "replace",
    label: "I worry AI will replace me — or already is.",
    problem: [
      "The headlines are alarming. The LinkedIn posts are either \"AI will take all jobs\" or \"AI will free us all.\" Neither is useful. You want an honest answer: is your specific role, field, or skill set at risk — and what do you do about it if it is?",
      "This anxiety is rational. It's not paranoia. The landscape is changing fast and most \"AI for careers\" content is either too vague or too technical to be useful for women in non-tech roles.",
    ],
    solutionTrack: "AI For Your 9–5",
    solutionAgent: "Zuri",
    solutionFirst:
      "In your first session, you name the one work task that's eating the most of your time or confidence. Zuri builds a specific, practical tool for that exact task — an email template, a meeting prep framework, a prompt chain for your biggest recurring drain.",
    bullets: [
      "A track dedicated to understanding how AI is actually changing your industry — specific, honest, no catastrophising",
      "Prompts for performance reviews, salary negotiations, tricky professional emails, and doing your work faster without getting flagged",
      "Guidance on using AI at work without violating your company's policies or your own ethics",
    ],
    quote: "This is exactly what I needed for that email. Why did it take me this long to find this?",
  },
  {
    id: "business",
    label: "I'm building a business but I'm stuck in my head.",
    problem: [
      "You have a business — or something that could be one — but you can't quite articulate what it is. You know your offer, your pricing, and your positioning are all a bit off, but every time you try to fix it you end up on Canva designing a new logo instead of doing the actual work.",
      "Decision paralysis is real. So is the isolation of building something alone, with no one to think alongside.",
    ],
    solutionTrack: "AI Business School",
    solutionAgent: "Zuri",
    solutionFirst:
      "In your first session, you bring the messy half-formed version of your business. Zuri gives you back the clearest version of your offer you've ever seen — in your language, grounded in your reality.",
    bullets: [
      "Nova, your numbers agent, for pricing, budgeting, and financial decisions",
      "Prompts for offer descriptions, positioning statements, and next-action planning",
      "A community of women building alongside you — with forum threads tagged to your exact track",
    ],
  },
  {
    id: "content",
    label: "I keep saying I'll do content. I never do.",
    problem: [
      "You have ideas. You have things to say. But between the brainstorming, the writing, the editing, the captions, the hashtags, and the posting — content takes an entire day for one post. So you avoid it. And then you feel guilty. And then the cycle starts again.",
      "For women who care about their voice and their values, generic AI-generated content feels worse than nothing — it reads like a stranger wrote it and published it under your name.",
    ],
    solutionTrack: "AI For Creators & Personal Brand",
    solutionAgent: "Lyric",
    solutionFirst:
      "In your first session, you name one piece of content you've been avoiding. Lyric builds the full brief: hook, structure, CTA, caption, hashtag strategy. In under 15 minutes.",
    bullets: [
      "A personal brand clarity exercise that gives you your 3 content pillars in your voice",
      "A monthly content batch workflow",
      "Prompts that produce content that sounds like you — because you built them with your words",
    ],
  },
  {
    id: "safety",
    label: "I don't know if AI is safe for me — or for the women I serve.",
    problem: [
      "Data privacy. Bias. Copyright. Using AI with clients. Using AI for work without your employer knowing. These are real concerns, and most AI training either ignores them or dismisses them as overcaution.",
      "Women — especially women who work with vulnerable people, handle sensitive data, or operate in regulated industries — need honest answers, not reassurance.",
    ],
    solutionTrack: "AI Bias, Ethics, Privacy & Safety",
    solutionAgent: "Rue",
    solutionFirst:
      "In your first session, Rue addresses your specific concern directly: what's actually true, what's overstated, and what you can do right now to protect yourself and the people you serve.",
    bullets: [
      "A personal AI Safety Map for your specific role and situation",
      "Plain-language guides to data privacy, copyright, and using AI with clients",
      "A checklist of what never to put into any AI tool",
    ],
  },
];

export const ProblemSolutionTabs = () => {
  const nav = useNavigate();
  return (
    <section className="py-24 md:py-32 bg-[#fff0f5]">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center mb-14">
          <h2 className="font-display font-black text-4xl md:text-6xl leading-tight text-[#141414]">
            Which one sounds <span className="font-handwritten text-[#ff0054] font-normal">most like you</span> right now?
          </h2>
        </div>

        <Tabs defaultValue={items[0].id} className="max-w-5xl mx-auto">
          <TabsList className="h-auto flex flex-wrap justify-center gap-2 bg-transparent p-0 mb-10">
            {items.map(it => (
              <TabsTrigger
                key={it.id}
                value={it.id}
                className="rounded-full px-5 py-3 bg-white border border-[#ffe0eb] text-[#141414] text-sm font-semibold data-[state=active]:bg-[#ff0054] data-[state=active]:text-white data-[state=active]:border-[#ff0054] data-[state=active]:shadow-pink whitespace-normal text-left"
              >
                "{it.label}"
              </TabsTrigger>
            ))}
          </TabsList>

          {items.map(it => (
            <TabsContent key={it.id} value={it.id} className="mt-0">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-8 rounded-[2rem] bg-white border border-[#ffe0eb]">
                  <div className="text-xs uppercase tracking-[0.2em] font-bold text-[#ff0054]">The problem</div>
                  <div className="mt-4 space-y-4 text-[#141414]/85 leading-relaxed">
                    {it.problem.map((p, i) => <p key={i}>{p}</p>)}
                  </div>
                </div>
                <div className="p-8 rounded-[2rem] bg-[#2a1b3d] text-white">
                  <div className="text-xs uppercase tracking-[0.2em] font-bold text-[#ffd60a]">The solution inside AI For Real Life</div>
                  <p className="mt-4 leading-relaxed">
                    The <strong className="text-[#ffd60a]">{it.solutionTrack}</strong> track gives you{" "}
                    <strong>{it.solutionAgent}</strong>. {it.solutionFirst}
                  </p>
                  <p className="mt-5 font-semibold">You'll also find:</p>
                  <ul className="mt-3 space-y-2">
                    {it.bullets.map((b, i) => (
                      <li key={i} className="flex gap-2 text-white/85">
                        <span className="text-[#ff0054] mt-1">♥</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                  {it.quote && (
                    <p className="mt-6 font-handwritten text-xl text-[#ffd60a] leading-snug">
                      "{it.quote}"
                    </p>
                  )}
                  <Button
                    onClick={() => nav("/onboarding")}
                    className="mt-7 rounded-full bg-[#ff0054] text-white border-2 border-transparent hover:bg-white hover:text-[#ff0054] hover:border-[#ff0054] font-bold"
                  >
                    Get my first AI win <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
};
