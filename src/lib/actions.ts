import { supabase } from "@/integrations/supabase/client";

export type ActionType =
  | "video_started" | "video_watched"
  | "prompt_copied" | "prompt_applied"
  | "challenge_done" | "win_posted"
  | "event_attended" | "reply_posted"
  | "toolkit_done" | "template_used"
  | "playlist_opened";

/**
 * Fire-and-forget log of a meaningful interaction.
 * Drives momentum, levels, badges and gentle streaks.
 */
export async function logAction(
  type: ActionType,
  opts?: { trackId?: string | null; refId?: string | null; meta?: Record<string, unknown> }
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("user_actions").insert({
      user_id: user.id,
      action_type: type,
      track_id: opts?.trackId ?? null,
      ref_id: opts?.refId ?? null,
      meta: (opts?.meta as any) ?? {},
    });
  } catch {
    // never block the UI on a logging failure
  }
}

/** Member level ladder — derived from XP. Non-numeric, supportive labels. */
export const MEMBER_LEVELS: { min: number; label: string }[] = [
  { min: 0,    label: "Arriving" },
  { min: 50,   label: "Curious" },
  { min: 150,  label: "Exploring" },
  { min: 350,  label: "Building" },
  { min: 700,  label: "Practising" },
  { min: 1200, label: "Integrating" },
  { min: 2000, label: "Flowing" },
  { min: 3000, label: "Guiding" },
  { min: 4500, label: "Leading" },
  { min: 7000, label: "Multi-Hyphenate Guide" },
];

export function levelForXp(xp: number): { label: string; nextAt: number | null } {
  let current = MEMBER_LEVELS[0];
  let nextAt: number | null = null;
  for (let i = 0; i < MEMBER_LEVELS.length; i++) {
    if (xp >= MEMBER_LEVELS[i].min) {
      current = MEMBER_LEVELS[i];
      nextAt = MEMBER_LEVELS[i + 1]?.min ?? null;
    }
  }
  return { label: current.label, nextAt };
}

export const TRACK_STAGES = ["Starter", "Building", "Practising", "Mastery"] as const;
export function trackStageForPercent(pct: number): string {
  if (pct >= 80) return "Mastery";
  if (pct >= 50) return "Practising";
  if (pct >= 20) return "Building";
  return "Starter";
}

export const BADGES: Record<string, { label: string; description: string; emoji: string }> = {
  first_apply:        { label: "First Apply",        description: "You used a prompt for real.",         emoji: "✨" },
  first_win_posted:   { label: "First Win Shared",   description: "You shared a win with the community.", emoji: "🌟" },
  consistency_7:      { label: "7-Day Consistency",  description: "Showed up seven days in a row.",       emoji: "🔥" },
  consistency_30:     { label: "30-Day Consistency", description: "A whole month of small steps.",        emoji: "🌈" },
  challenge_finisher: { label: "Challenge Finisher", description: "Completed three challenges.",          emoji: "🎯" },
  helpful_voice:      { label: "Helpful Voice",      description: "Five replies to other members.",       emoji: "💬" },
  toolkit_done:       { label: "Toolkit Explorer",   description: "Tried your first toolkit.",            emoji: "🧰" },
  event_joiner:       { label: "Event Joiner",       description: "Showed up to a live event.",           emoji: "📅" },
};