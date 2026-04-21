

## Reframe Onboarding: Problem-First, Track Suggested

Instead of making her pick a track from a grid, we ask about her *life*, then suggest the right track based on her answers. This matches the V2 onboarding doc.

### New flow (5 steps before email)

```text
1. Name        → "What should we call you?"  (first name only)
2. Quiz        → 5 quick questions about her real life
3. Reveal      → "Based on what you told us, your best starting point is [TRACK] with [AGENT]"
                 + small link: "Not quite right? See all 10 tracks"
4. Challenge   → Agent asks: "What's the one thing you want off your plate today?"
5. Email gate  → "Where should we send your win?" (email + password)
6. Result      → Streaming AI win (unchanged)
```

Email stays where it is now — right before the AI generates the win. No email upfront.

### The 5-question quiz

Single-select, fast, visual cards. Each answer maps to a track via a scoring table.

1. **Where do you want help first?** Home & life admin / At work / In my business / Studying / Creating content / Leading a team
2. **What's eating most of your energy right now?** Mental load / Career decisions / Selling my offer / Writing & content / Learning new things / People & teams
3. **How comfortable are you with AI today?** Total beginner / I've dabbled / I use it weekly / I want to go deeper
4. **What would make this week feel lighter?** A plan I can follow / A hard conversation handled / A piece of content done / A decision made / Time back
5. **The one thing I wish I had more help with is…** (open text — powers agent greeting, result name, follow-up emails per the doc)

### Track suggestion logic

Simple weighted score across Q1–Q4 → highest scoring track wins. Q1 carries the most weight. Q5 (open text) is stored and passed to the agent as `challenge` context.

| Q1 answer | Suggested track |
|---|---|
| Home & life admin | 02 Home Life Admin (Raya) |
| At work | 03 Your 9–5 (Zuri) |
| In my business | 04 AI Business School (Zuri) |
| Studying | 05 AI For Students (Neo) |
| Creating content | 06 AI For Creators (Lyric) |
| Leading a team | 10 Building & Leading With AI (Echo) |

Q3 "Total beginner" nudges toward 01 AI Foundations (Neo). Q2/Q4 tie-break.

### Reveal screen

Per the doc:
> [Name], based on what you told us, your best starting point is:
> **[TRACK NAME]**
> [One-line description in her language]
> You'll start with **[Agent Name]**.
> Ready? Let's get your first win.

Secondary text link below: "Not quite right? See all 10 tracks" → opens the existing grid as a fallback override.

### Files to change

- **`src/pages/Onboarding.tsx`** — replace step machine. New steps: `name → quiz → reveal → challenge → signup → result`. Keep existing `signup` + `result` logic untouched; only the front half changes. Q5 free-text becomes the `challenge` value (skip the separate challenge step if Q5 is substantive, otherwise keep the dedicated challenge prompt — we'll keep it for richness).
- **`src/data/tracks.ts`** — add `suggestTrack(answers)` helper + `QUIZ_QUESTIONS` constant with options and per-option track-score mapping.
- No DB or edge function changes needed.

### Visual treatment

- Quiz: one question per screen, large tappable cards, progress dots already in header continue to work (we just expand `STEPS`).
- Reveal: hero treatment with the track's `hueBg`, agent name in `font-handwritten`, sunrise gradient on track title, primary CTA "Let's get my first win →".
- "See all 10 tracks" opens an inline sheet/grid; selecting overrides the suggestion and jumps to challenge step.

### Out of scope (call out for later)

- Founder welcome video (Step 2 in doc) — skippable video shell
- Animated transition screen (Step 5 in doc)
- Pricing trigger after result + 24h/72h email sequence
- Saving quiz answers to `profiles` (we'll just use them in-session for v1; can persist later)

