

## What's Still Missing from the PRD

You've shipped Phase 1 (tracks, prompts, videos, toolkits, playlists, challenges, saved library, AI chat, admin, global search). Below is everything in the PRD that is **not yet built**, grouped so you can decide what to ship next.

### Gap map

```text
SHIPPED                          MISSING
─────────────────────────────    ──────────────────────────────────────
✓ 10 tracks + agents             ✗ Audio mode ("Listen instead")
✓ Prompt library                 ✗ Prompt Generator (one-click custom)
✓ Video library                  ✗ Video metadata: duration, "questions
✓ Toolkit (HTML)                   this answers", difficulty, watched %
✓ Curated playlists + chapters   ✗ "Do This Now" / "Try in AI" deep-link
✓ Per-track AI chat                from prompts, videos, templates,
✓ Saved library                    challenges into the agent
✓ Admin CRUD                     ✗ Global AI Chat Hub page (agent grid)
✓ Global search (basic)          ✗ Events module + .ics calendar
✓ Auth + roles                   ✗ Community: forum, wins, chat rooms
                                 ✗ Member profile page + progress stats
                                 ✗ Mobile bottom nav (5 tabs)
                                 ✗ Admin analytics + AI usage monitor
                                 ✗ Scout (web/YouTube search agent)
                                 ✗ Notifications (in-app bell)
```

### Recommended build order (3 phases)

**Phase 2A — Audio + Action Loop (highest member value)**
1. **Audio mode for videos.** Generate per-video TTS once on demand via Lovable AI, cache to Storage, expose a "Listen instead" button in `TrackDetail` and Library. Falls back to YouTube embed if generation fails.
2. **"Do This Now" everywhere.** Add `Try in AI` / `Apply with AI` buttons on prompt, video, template, and challenge cards. Each opens the track agent with a pre-loaded seed message (prompt body, video title + question, template fill request, challenge brief).
3. **Prompt Generator.** Top-of-library button → modal that asks "what do you need?" → calls Lovable AI to draft a tailored prompt → save to library or send to agent.
4. **Global AI Chat Hub** at `/chat` — card grid of all 16 agents grouped by category; clicking opens chat without a track context.

**Phase 2B — Events + Community (retention engines)**
5. **Events.** New tables `events`, `event_rsvps`. Admin can create Q&As / masterclasses with title, description, speaker bio, date, timezone, platform, join link, track tags, replay URL. Member-facing `/events` lists upcoming + past with **one-click .ics download** (generated client-side) and RSVP. Dashboard surfaces next event.
6. **Community.** Tables `forum_posts`, `forum_replies`, `forum_reactions`, `wins` (wins are forum_posts with `section='wins'` + featured flag). Sections: Questions / Wins / Resources / Feedback. Track-tagged. "Ask AI about this" button on every post. Track-detail page filters posts to that track. Wins surface on Dashboard.
7. **Notifications bell** — minimal: new event, reply to your post, featured win.

**Phase 2C — Profile, Progress, Mobile, Admin Analytics**
8. **Member profile** at `/profile` — display name, avatar, tracks started, videos watched (auto at 80% via player events), prompts used (auto on Copy/Try-in-AI), events attended, notification prefs.
9. **Progress tracking.** Extend `user_track_progress` (already exists) with completion % computed from videos watched + prompts used. Show progress bar on every track card.
10. **Mobile bottom tab bar** (Home / Tracks / AI Chat / Community / Saved) replaces hamburger on `<md` viewports.
11. **Admin analytics dashboard.** New tab in `/admin`: signups over time, AI queries per agent, top saved prompts/videos, event attendance, retention 7/30/90, top search terms. Backed by aggregation queries.
12. **AI usage monitor + per-member daily query cap** (configurable, enforced in `agent-chat` edge function).

**Phase 2D — Polish (defer if needed)**
13. **Scout search agent** with web/YouTube lookup (Perplexity or Lovable AI + URL fetching).
14. **Video metadata enrichment**: add `duration_seconds`, `questions_answered jsonb`, `difficulty` to `videos`; show in card and filters.
15. **Structured Chat rooms** (Weekly Focus, Live Q&A, Track Chats) — built on the same `forum_posts` schema with a `room_id` field and a realtime subscription.
16. **WhatsApp sprint links** — single admin-managed field surfaced in event detail when a sprint is active.

### What I need you to decide

Pick one of these starting points and I'll execute end-to-end:

- **A — "Make the platform feel alive"**: Phase 2A only (audio + Do This Now + prompt generator + chat hub). Biggest perceived value lift, ~1 build cycle.
- **B — "Lock in retention"**: Phase 2A + 2B (adds events + community). Roughly twice the surface area.
- **C — "Full PRD parity"**: 2A → 2D in sequence. I'll ship 2A first and check in before moving on.

### Technical notes for the implementation phase

- **Audio**: store generated MP3s in a new `audio` storage bucket; key = `videos/{video_id}.mp3`. Edge function `generate-audio` accepts `video_id` + `script`, calls Lovable AI TTS, uploads, returns URL. Cached on second request.
- **Events**: `.ics` file generated client-side via a tiny helper (no library); 32-line function.
- **Community**: realtime via `supabase.channel()` on `forum_posts` for new-post indicators. Every post requires a `track_id` to drive the per-track filter.
- **"Do This Now"**: pass seed via URL param `?seed=<base64>` to `TrackDetail` agent tab; `AgentChat` reads on mount and auto-sends.
- **No new external API keys required for 2A or 2B** — all AI runs through the existing Lovable AI Gateway.

