export type Track = {
  slug: string;
  number: string;
  title: string;
  tagline: string;
  description: string;
  agentName: string;
  agentRole: string;
  hue: "pink" | "yellow" | "lavender" | "blush";
  tier: "try" | "growth" | "power";
  lessons: { title: string; minutes: number }[];
};

export const TRACKS: Track[] = [
  {
    slug: "ai-foundations",
    number: "01",
    title: "AI Foundations for Women's Lives",
    tagline: "Build a confident base. No jargon.",
    description:
      "For capable women who haven't had training that respects their intelligence or their schedule. Plain language, real prompts, real wins.",
    agentName: "Neo",
    agentRole: "Learning — explains anything clearly",
    hue: "lavender",
    tier: "try",
    lessons: [
      { title: "What AI actually is (no jargon)", minutes: 6 },
      { title: "Your first 20 useful prompts", minutes: 8 },
      { title: "A 5-minute weekly habit", minutes: 7 },
    ],
  },
  {
    slug: "home-life-admin",
    number: "02",
    title: "AI For Home Life Admin",
    tagline: "Clear your mental load. Reclaim your week.",
    description:
      "Brain-dump everything on your plate. Raya turns it into a structured weekly plan and hands you back time.",
    agentName: "Raya",
    agentRole: "Life design — scheduling, planning, mental load",
    hue: "pink",
    tier: "try",
    lessons: [
      { title: "Brain-dump → structured weekly plan", minutes: 6 },
      { title: "Meal planning that fits your real life", minutes: 9 },
      { title: "Tricky messages you dread writing", minutes: 5 },
    ],
  },
  {
    slug: "your-9-to-5",
    number: "03",
    title: "AI For Your 9–5",
    tagline: "Use AI at work — faster, smarter, safely.",
    description:
      "Name the work task that's eating the most of your time. Zuri builds a specific, practical tool for that exact task.",
    agentName: "Zuri",
    agentRole: "Strategy and clarity — career & decisions",
    hue: "yellow",
    tier: "growth",
    lessons: [
      { title: "The 30-second email rewrite", minutes: 5 },
      { title: "Performance review prep framework", minutes: 7 },
      { title: "The salary negotiation script", minutes: 10 },
    ],
  },
  {
    slug: "ai-business-school",
    number: "04",
    title: "AI Business School",
    tagline: "Build and run your business with an AI team.",
    description:
      "Bring the messy half-formed version of your business. Zuri gives you back the clearest version of your offer you've ever seen.",
    agentName: "Zuri",
    agentRole: "Strategic thinking partner",
    hue: "blush",
    tier: "growth",
    lessons: [
      { title: "Articulate your offer clearly", minutes: 12 },
      { title: "Pricing & positioning with Nova", minutes: 15 },
      { title: "Next-action planning prompts", minutes: 10 },
    ],
  },
  {
    slug: "ai-for-students",
    number: "05",
    title: "AI For Students",
    tagline: "Study smarter. Write better. Stay ethical.",
    description:
      "Study plans, essay structure, exam prep — using AI to understand, not to outsource your brain.",
    agentName: "Neo",
    agentRole: "Learning companion",
    hue: "lavender",
    tier: "try",
    lessons: [
      { title: "Turn a syllabus into a study plan", minutes: 8 },
      { title: "Essay outlines that hold up", minutes: 10 },
      { title: "Exam-week energy management", minutes: 6 },
    ],
  },
  {
    slug: "ai-for-creators",
    number: "06",
    title: "AI For Creators",
    tagline: "Create more content in less time, in your voice.",
    description:
      "Lyric protects your voice instead of replacing it. Name one piece you've been avoiding — get the full brief in under 15 minutes.",
    agentName: "Lyric",
    agentRole: "Writing in your voice",
    hue: "pink",
    tier: "growth",
    lessons: [
      { title: "Batch a week of content in 1 hour", minutes: 12 },
      { title: "Repurpose one idea 7 ways", minutes: 9 },
    ],
  },
  {
    slug: "personal-brand",
    number: "07",
    title: "AI For Your Personal Brand",
    tagline: "Build your visibility consistently.",
    description:
      "Find your 3 content pillars in your voice. Lyric and Aria help you sound like you — just clearer.",
    agentName: "Aria",
    agentRole: "Content strategy — newsletters, blogs, SEO",
    hue: "yellow",
    tier: "growth",
    lessons: [
      { title: "Personal brand clarity exercise", minutes: 9 },
      { title: "A LinkedIn post in your real voice", minutes: 7 },
    ],
  },
  {
    slug: "ethics-privacy-safety",
    number: "08",
    title: "AI Bias, Ethics, Privacy & Safety",
    tagline: "Use AI confidently and responsibly.",
    description:
      "Rue gives you peace not by hiding the truth — by explaining it. A personal AI Safety Map for your exact role.",
    agentName: "Rue",
    agentRole: "Safety, ethics, privacy",
    hue: "blush",
    tier: "try",
    lessons: [
      { title: "What never to share with AI", minutes: 6 },
      { title: "AI with clients — what's safe", minutes: 8 },
    ],
  },
  {
    slug: "ai-power-users",
    number: "09",
    title: "AI Power Users",
    tagline: "Go deeper. Build real capability.",
    description:
      "Multi-step workflows, custom agents, automations. The good stuff — made accessible.",
    agentName: "Scout",
    agentRole: "Research & workflow architect",
    hue: "lavender",
    tier: "power",
    lessons: [
      { title: "Your first 3-step workflow", minutes: 14 },
      { title: "Build a custom agent", minutes: 18 },
    ],
  },
  {
    slug: "leading-with-ai",
    number: "10",
    title: "Building & Leading With AI",
    tagline: "For women leading teams or products.",
    description:
      "How to bring AI into a team without chaos. Echo turns long documents into decisions in seconds.",
    agentName: "Echo",
    agentRole: "Summaries & decision support",
    hue: "pink",
    tier: "power",
    lessons: [
      { title: "Rolling out AI to your team", minutes: 12 },
      { title: "Document → decisions in seconds", minutes: 10 },
    ],
  },
];

export const tierLabel = (t: Track["tier"]) =>
  t === "try" ? "Try It" : t === "growth" ? "Growth" : "Power";

export const hueBg = (h: Track["hue"]) =>
  h === "pink" ? "bg-pink" : h === "yellow" ? "bg-yellow" : h === "lavender" ? "bg-lavender" : "bg-blush";

export const AGENTS = [
  { name: "Raya", job: "Life design — scheduling, planning, home admin, mental load" },
  { name: "Zuri", job: "Strategy and clarity — decisions, business thinking, career moves" },
  { name: "Lyric", job: "Writing in your voice — brand story, captions, content" },
  { name: "Nova", job: "Numbers — budgets, pricing, financial decisions" },
  { name: "Neo", job: "Learning — explains anything clearly, builds study plans" },
  { name: "Rue", job: "Safety and ethics — privacy, bias, AI-safe practices" },
  { name: "Scout", job: "Research — searches the web so you don't have to" },
  { name: "Sage", job: "Reflection — when you're stuck, spiralling, or need to think out loud" },
  { name: "Aria", job: "Content strategy — newsletters, blog posts, SEO writing" },
  { name: "Echo", job: "Summaries — turns long documents into decisions in seconds" },
];

export type QuizOption = { label: string; scores: Partial<Record<string, number>> };
export type QuizQuestion = { id: string; prompt: string; options: QuizOption[] };

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    prompt: "Where do you want help first?",
    options: [
      { label: "Home & life admin", scores: { "home-life-admin": 5 } },
      { label: "At work", scores: { "your-9-to-5": 5 } },
      { label: "In my business", scores: { "ai-business-school": 5 } },
      { label: "Studying", scores: { "ai-for-students": 5 } },
      { label: "Creating content", scores: { "ai-for-creators": 5 } },
      { label: "Leading a team", scores: { "leading-with-ai": 5 } },
    ],
  },
  {
    id: "q2",
    prompt: "What's eating most of your energy right now?",
    options: [
      { label: "Mental load", scores: { "home-life-admin": 2 } },
      { label: "Career decisions", scores: { "your-9-to-5": 2 } },
      { label: "Selling my offer", scores: { "ai-business-school": 2, "personal-brand": 1 } },
      { label: "Writing & content", scores: { "ai-for-creators": 2, "personal-brand": 1 } },
      { label: "Learning new things", scores: { "ai-foundations": 2, "ai-for-students": 1 } },
      { label: "People & teams", scores: { "leading-with-ai": 2 } },
    ],
  },
  {
    id: "q3",
    prompt: "How comfortable are you with AI today?",
    options: [
      { label: "Total beginner", scores: { "ai-foundations": 3 } },
      { label: "I've dabbled", scores: { "ai-foundations": 1 } },
      { label: "I use it weekly", scores: {} },
      { label: "I want to go deeper", scores: { "ai-power-users": 3 } },
    ],
  },
  {
    id: "q4",
    prompt: "What would make this week feel lighter?",
    options: [
      { label: "A plan I can follow", scores: { "home-life-admin": 1, "ai-for-students": 1 } },
      { label: "A hard conversation handled", scores: { "your-9-to-5": 1 } },
      { label: "A piece of content done", scores: { "ai-for-creators": 1, "personal-brand": 1 } },
      { label: "A decision made", scores: { "leading-with-ai": 1, "ai-business-school": 1 } },
      { label: "Time back", scores: { "home-life-admin": 1 } },
    ],
  },
];

export function suggestTrack(answers: Record<string, number>): Track {
  const scores: Record<string, number> = {};
  for (const q of QUIZ_QUESTIONS) {
    const idx = answers[q.id];
    if (idx == null) continue;
    const opt = q.options[idx];
    if (!opt) continue;
    for (const [slug, n] of Object.entries(opt.scores)) {
      scores[slug] = (scores[slug] ?? 0) + (n ?? 0);
    }
  }
  let best = TRACKS[0];
  let bestScore = -1;
  for (const t of TRACKS) {
    const s = scores[t.slug] ?? 0;
    if (s > bestScore) { bestScore = s; best = t; }
  }
  return best;
}