export type Track = {
  slug: string;
  number: string;
  title: string;
  tagline: string;
  description: string;
  agentName: string;
  agentRole: string;
  emoji: string;
  hue: string; // tailwind utility background
  tier: "try" | "growth" | "power";
  lessons: { title: string; minutes: number }[];
};

export const TRACKS: Track[] = [
  {
    slug: "ai-foundations",
    number: "01",
    title: "AI Foundations for Women's Lives",
    tagline: "Start here. No jargon. No tech bros.",
    description:
      "What AI actually is, what it's good for in your real week, and how to talk to it without feeling like a fraud.",
    agentName: "Iris",
    agentRole: "Your gentle starter coach",
    emoji: "🌱",
    hue: "bg-gradient-sunrise",
    tier: "try",
    lessons: [
      { title: "What AI is (in plain English)", minutes: 6 },
      { title: "Your first useful prompt", minutes: 8 },
      { title: "When NOT to use AI", minutes: 5 },
      { title: "Building a daily 5-min habit", minutes: 7 },
    ],
  },
  {
    slug: "home-life-admin",
    number: "02",
    title: "AI For Home & Life Admin",
    tagline: "The mental load, finally shared.",
    description:
      "Meal plans, school forms, family calendars, the never-ending to-do list. Hand it to AI and breathe.",
    agentName: "Hazel",
    agentRole: "Household commander",
    emoji: "🏡",
    hue: "bg-gradient-warm",
    tier: "try",
    lessons: [
      { title: "The Sunday reset prompt", minutes: 6 },
      { title: "Meal plans that fit your real life", minutes: 9 },
      { title: "Birthday & gift autopilot", minutes: 5 },
    ],
  },
  {
    slug: "your-9-to-5",
    number: "03",
    title: "AI For Your 9–5",
    tagline: "Look senior. Feel less tired.",
    description:
      "Emails, meeting notes, performance reviews, hard conversations with your boss. Done with you, not for you.",
    agentName: "Nora",
    agentRole: "Career strategist",
    emoji: "💼",
    hue: "bg-gradient-coral-saffron",
    tier: "growth",
    lessons: [
      { title: "The 30-second email rewrite", minutes: 5 },
      { title: "Meeting notes that actually get read", minutes: 7 },
      { title: "Asking for the raise (script)", minutes: 10 },
    ],
  },
  {
    slug: "ai-business-school",
    number: "04",
    title: "AI Business School",
    tagline: "Build the thing. Without the burnout.",
    description:
      "Offers, pricing, sales pages, client onboarding. AI as your strategy partner — not just your intern.",
    agentName: "Vera",
    agentRole: "Business co-founder",
    emoji: "🚀",
    hue: "bg-gradient-plum",
    tier: "growth",
    lessons: [
      { title: "Find your first paid offer", minutes: 12 },
      { title: "Write a sales page in 30 minutes", minutes: 15 },
      { title: "Onboard clients without the chaos", minutes: 10 },
    ],
  },
  {
    slug: "ai-for-students",
    number: "05",
    title: "AI For Students",
    tagline: "Learn faster. Cheat never.",
    description:
      "Study plans, essay structure, exam prep — using AI to *understand*, not to outsource your brain.",
    agentName: "Sage",
    agentRole: "Study companion",
    emoji: "📚",
    hue: "bg-gradient-warm",
    tier: "try",
    lessons: [
      { title: "Turn a syllabus into a study plan", minutes: 8 },
      { title: "Essay outlines that hold up", minutes: 10 },
      { title: "Exam-week energy management", minutes: 6 },
    ],
  },
  {
    slug: "ai-power-users",
    number: "06",
    title: "AI Power Users",
    tagline: "For women building at speed.",
    description:
      "Multi-step workflows, agents, automations, custom GPTs. The good stuff, made accessible.",
    agentName: "Atlas",
    agentRole: "Workflow architect",
    emoji: "⚡",
    hue: "bg-gradient-plum",
    tier: "power",
    lessons: [
      { title: "Your first 3-step workflow", minutes: 14 },
      { title: "Building a custom agent", minutes: 18 },
    ],
  },
  {
    slug: "personal-brand",
    number: "07",
    title: "AI For Your Personal Brand",
    tagline: "Sound like *you*, just clearer.",
    description:
      "LinkedIn, bios, talks, intros. AI that mirrors your voice instead of flattening it.",
    agentName: "Lumi",
    agentRole: "Brand stylist",
    emoji: "✨",
    hue: "bg-gradient-sunrise",
    tier: "growth",
    lessons: [
      { title: "Find your voice in 3 prompts", minutes: 9 },
      { title: "A LinkedIn post that doesn't cringe", minutes: 7 },
    ],
  },
  {
    slug: "ai-for-creators",
    number: "08",
    title: "AI For Creators",
    tagline: "Make more. Burn out less.",
    description:
      "Content batching, captions, scripts, repurposing. The 1-to-10 multiplier for creative women.",
    agentName: "Cleo",
    agentRole: "Content director",
    emoji: "🎨",
    hue: "bg-gradient-coral-saffron",
    tier: "growth",
    lessons: [
      { title: "Batch a week of content in 1 hour", minutes: 12 },
      { title: "Repurpose one idea 7 ways", minutes: 9 },
    ],
  },
  {
    slug: "ethics-privacy-safety",
    number: "09",
    title: "AI Bias, Ethics, Privacy & Safety",
    tagline: "Use it wisely. Protect yourself.",
    description:
      "What to never paste into AI, how to spot bias, and the rights you have. Quiet, important, essential.",
    agentName: "Juno",
    agentRole: "Trust & safety guide",
    emoji: "🛡️",
    hue: "bg-gradient-plum",
    tier: "try",
    lessons: [
      { title: "What never to share with AI", minutes: 6 },
      { title: "Spotting bias in answers", minutes: 8 },
    ],
  },
];

export const tierLabel = (t: Track["tier"]) =>
  t === "try" ? "Try It" : t === "growth" ? "Growth" : "Power";