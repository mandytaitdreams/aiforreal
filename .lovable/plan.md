

## What's Left to Build

You've shipped Phase 1 + Phase 2A (audio, transcripts, prompt generator, chat hub, Try-in-AI deep links, role-based nav, memories). Two new docs landed: **PRD v4** and the **Gamification System** spec. Here's everything still missing, grouped so you can pick what to ship next.

### Gap map

```text
SHIPPED                              MISSING
──────────────────────────────────   ──────────────────────────────────────
✓ 10 tracks, agents, prompts         ✗ Events module (.ics, RSVP, replays)
✓ Videos + audio + transcripts       ✗ Community forum (Q/Wins/Resources)
✓ Toolkits (HTML + interactive)      ✗ Wins wall + featured wins
✓ Curated playlists + chapters       ✗ Member profile page
✓ Saved Library + Memories           ✗ Mobile bottom nav (5 tabs)
✓ Per-track + Global AI chat         ✗ Notifications bell
✓ Try-in-AI deep links               ✗ Admin analytics + AI usage caps
✓ Prompt Generator                   ✗ Separate admin URL/subdomain
✓ Admin CRUD + global search         ✗ Scout web-search agent
✓ Auth + roles + role-based nav      ✗ FULL gamification system (new)
```

### New scope from the gamification doc

```text
Progress visibility   →  Weekly momentum bar, track completion rings,
                         lesson states (Not started/Started/Applied/Done),
                         "You've already done" panel, goal pathway tracker
Level system          →  Member ladder (10 levels) + Track ladder (4 levels)
Badge system          →  Action badges (First Apply, 7-day streak, etc.)
Streaks               →  Gentle streak with weekly grace, never punishing
Wins & social proof   →  Shareable win cards, featured wins, "others like me"
Referrals             →  Invite links, referral ladder rewards
```

### Recommended build order

**Phase 2B — Events + Community + Wins** (retention engine)
1. **Events.** Tables `events`, `event_rsvps`. Admin creates Q&As/masterclasses (title, speaker, date, timezone, platform, join link, track tags, replay URL). Member `/events` page lists upcoming + past, one-click `.ics` download (client-side), RSVP. Next event surfaces on Dashboard.
2. **Forum.** Tables `forum_posts`, `forum_replies`, `forum_reactions`. Sections: Questions / Wins / Resources / Feedback. Track-tagged. "Ask AI about this" on every post (seeds chat). Track-detail page filters to its own posts.
3. **Wins wall.** Wins = `forum_posts` with `section='wins'` + admin `featured` flag. Surfaced on Dashboard + each track page. Shareable win card image (canvas-rendered).
4. **Notifications bell.** Minimal: new event, reply to your post, your win was featured.

**Phase 2C — Gamification core** (the new spec)
5. **Schema.** Extend `profiles` with `level`, `xp`, `current_streak_days`, `longest_streak_days`, `last_active_date`. New tables: `user_actions` (event log: video_watched, prompt_applied, challenge_done, win_posted, etc.), `user_badges`, `track_levels` (per-user per-track stage), `user_goals` (onboarding goal → pathway steps).
6. **Action logging.** A single `logAction(type, payload)` helper called from every meaningful interaction (video 80% watched, prompt copied/applied, challenge completed, event attended, win posted). Drives all progress, levels, and badges.
7. **Progress UI.**
   - Weekly **momentum bar** on Dashboard ("This week: 1 lesson, 2 prompts applied, 1 challenge").
   - **Track completion rings** on every track card using the weighted formula (15/20/20/20/15/10).
   - **Lesson states**: Not started / Started / Applied / Complete shown on every video card.
   - **"You've already done"** lifetime panel on Dashboard.
   - **Goal pathway tracker** — onboarding goal becomes a 3-5 step checklist on Dashboard.
8. **Levels + badges.**
   - Member level ladder (Arriving → Multi-Hyphenate Guide, 10 stages) with non-numeric supportive labels.
   - Track level ladder (Starter → Mastery, 4 stages per track).
   - Badge catalog (First Apply, First Win Posted, 7-Day Consistency, Challenge Finisher, Helpful Voice, Toolkit Done, etc.). Awarded automatically by triggers on `user_actions` inserts.
   - Quiet level-up modal: "You're now Building. Here's what to try next."
9. **Streaks (gentle).** Daily action = streak +1. Miss a day = grace token (1/week auto). Never lose more than current streak. Display only when ≥3 days.
10. **Profile page** at `/profile` — display name, avatar, member level + track levels, badge wall, lifetime stats (tracks started, videos watched, prompts applied, events attended, wins posted), referral link.
11. **Referrals.** `referral_code` on profile, `referrals` table, ladder: 1 invite = badge, 3 = featured win slot, 5 = early access flag.

**Phase 2D — Polish & Ops** (defer if needed)
12. **Mobile bottom tab bar** (Home / Tracks / AI Chat / Community / Saved) on `<md` viewports.
13. **Admin analytics tab** — signups over time, AI queries per agent, top saved prompts/videos, event attendance, retention 7/30/90, top searches.
14. **AI usage cap** — per-member daily query limit enforced in `agent-chat` edge function (configurable).
15. **Scout agent** — web/YouTube lookup via Lovable AI with URL fetching.
16. **Separate admin subdomain** (PRD calls for `admin.[domain]`). Currently `/admin` is hidden but same app — true separation deferred until you're ready to deploy a second app.

### What I need you to decide

Pick one:

- **A — Phase 2B only** (events + community + wins + notifications). Biggest retention lift, ~1 build cycle.
- **B — Phase 2C only** (full gamification system). Biggest perceived "this platform sees me" lift.
- **C — 2B + 2C** (community AND gamification together). They reinforce each other (wins feed badges, posting feeds XP). ~2 build cycles, I'll ship 2B first and check in.
- **D — Full sequence 2B → 2D** (everything left). I ship 2B, check in, then 2C, check in, then 2D polish.

### Technical notes

- **Events `.ics`** generated client-side, ~30 lines, no library.
- **Forum realtime** via `supabase.channel()` on `forum_posts` for "new posts" indicator.
- **Action log** is the source of truth — momentum, levels, streaks, badges all derive from `user_actions` via SQL views or simple aggregation queries. Keeps the schema clean.
- **Badges awarded server-side** via Postgres trigger on `user_actions` insert → calls `award_badge()` function. Avoids client tampering.
- **Streak grace** computed in a single SQL function `compute_streak(user_id)` called on Dashboard load.
- **No new external API keys** needed for 2B or 2C.
- **Mobile bottom nav** is a single new component swapped in at `<md` via `useIsMobile`.
- **Separate admin subdomain** is a deploy-time concern, not a code concern — flag for later.

