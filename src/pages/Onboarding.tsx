import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { TRACKS, hueBg } from "@/data/tracks";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, Loader2 } from "lucide-react";

type Step = "track" | "challenge" | "result";

export default function Onboarding() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const nav = useNavigate();
  const [step, setStep] = useState<Step>("track");
  const [trackSlug, setTrackSlug] = useState<string>("");
  const [challenge, setChallenge] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [result, setResult] = useState("");

  useEffect(() => {
    if (!loading && !user) nav("/auth", { replace: true });
  }, [loading, user, nav]);

  const track = TRACKS.find(t => t.slug === trackSlug);

  const generate = async () => {
    if (!track || !challenge.trim()) return;
    setStep("result");
    setStreaming(true);
    setResult("");
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/onboarding-win`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          trackSlug: track.slug,
          agentName: track.agentName,
          agentRole: track.agentRole,
          challenge,
          firstName: profile?.display_name ?? "",
        }),
      });
      if (resp.status === 429) { toast.error("Too many requests. Try again in a moment."); setStreaming(false); return; }
      if (resp.status === 402) { toast.error("AI credits exhausted. Add funds in Settings → Workspace → Usage."); setStreaming(false); return; }
      if (!resp.ok || !resp.body) throw new Error("Failed");

      const reader = resp.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      let acc = "";
      let done = false;
      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buf += dec.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, nl);
          buf = buf.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || !line.trim()) continue;
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const p = JSON.parse(json);
            const c = p.choices?.[0]?.delta?.content;
            if (c) { acc += c; setResult(acc); }
          } catch { buf = line + "\n" + buf; break; }
        }
      }

      // Persist
      if (user) {
        await supabase.from("profiles").update({
          primary_track: track.slug,
          first_win: acc.slice(0, 800),
          xp: (profile?.xp ?? 0) + 25,
          streak_days: 1,
        }).eq("user_id", user.id);
        await supabase.from("user_track_progress").upsert({
          user_id: user.id,
          track_slug: track.slug,
          percent_complete: 5,
        }, { onConflict: "user_id,track_slug" });
      }
    } catch (e) {
      toast.error("Couldn't reach the agent. Try again.");
    } finally {
      setStreaming(false);
    }
  };

  const finish = async () => {
    if (user) {
      await supabase.from("profiles").update({ onboarding_complete: true }).eq("user_id", user.id);
      await refreshProfile();
    }
    nav("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-warm grain">
      <div className="container py-6 flex items-center justify-between">
        <Logo />
        <div className="flex gap-1.5">
          {(["track", "challenge", "result"] as Step[]).map(s => (
            <span key={s} className={`h-1.5 w-12 rounded-full transition-colors ${
              ["track","challenge","result"].indexOf(step) >= ["track","challenge","result"].indexOf(s) ? "bg-primary" : "bg-border"
            }`} />
          ))}
        </div>
      </div>

      <div className="container max-w-3xl py-12 pb-24">
        {step === "track" && (
          <div className="animate-fade-up">
            <h1 className="font-display font-black text-4xl md:text-5xl leading-tight">
              Hi {profile?.display_name ? <>{profile.display_name},</> : "there,"}<br />
              <span className="text-gradient-sunrise italic">where do you want help first?</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">Pick one. You can explore the rest after.</p>
            <div className="mt-8 grid sm:grid-cols-2 gap-3">
              {TRACKS.map(t => (
                <button
                  key={t.slug}
                  onClick={() => { setTrackSlug(t.slug); setStep("challenge"); }}
                  className={`text-left p-5 rounded-2xl bg-card border-2 transition-all hover:shadow-card hover:-translate-y-0.5 ${
                    trackSlug === t.slug ? "border-primary shadow-warm" : "border-border"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-10 h-10 rounded-full ${hueBg(t.hue)} flex items-center justify-center font-display font-black text-sm text-foreground`}>{t.number}</span>
                    <div>
                      <div className="font-display font-bold leading-tight">{t.title}</div>
                      <div className="text-xs text-muted-foreground italic">with {t.agentName}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "challenge" && track && (
          <div className="animate-fade-up max-w-2xl">
            <button onClick={() => setStep("track")} className="text-sm text-muted-foreground hover:text-foreground mb-6">
              ← Pick a different track
            </button>
            <div className="flex items-center gap-3 mb-2">
              <span className={`w-12 h-12 rounded-full ${hueBg(track.hue)} flex items-center justify-center font-display font-black text-base text-foreground`}>{track.number}</span>
              <span className="text-sm text-muted-foreground">Meet <strong className="text-foreground">{track.agentName}</strong> · {track.agentRole}</span>
            </div>
            <h1 className="font-display font-black text-4xl md:text-5xl leading-tight">
              What's the <span className="text-gradient-brand">one thing</span><br />
              you want off your plate today?
            </h1>
            <p className="mt-4 text-muted-foreground">One sentence is plenty. Be honest — {track.agentName} is here for it.</p>
            <Textarea
              value={challenge}
              onChange={e => setChallenge(e.target.value)}
              placeholder={`e.g. "I have to write a tough email to my boss and I keep avoiding it."`}
              className="mt-6 min-h-[140px] rounded-2xl text-base p-4 bg-card border-2 focus-visible:ring-primary"
            />
            <Button
              onClick={generate}
              disabled={!challenge.trim()}
              size="lg"
              className="mt-6 h-12 px-8 rounded-full bg-gradient-brand text-primary-foreground border-0 shadow-pink hover:opacity-95 font-semibold"
            >
              <Sparkles className="w-4 h-4 mr-2" /> Get my first win
            </Button>
          </div>
        )}

        {step === "result" && track && (
          <div className="animate-fade-up">
            <div className="flex items-center gap-3 mb-4">
              <span className={`w-10 h-10 rounded-full ${hueBg(track.hue)} flex items-center justify-center font-display font-black text-sm`}>{track.number}</span>
              <div className="text-sm">
                <div className="font-bold">{track.agentName}</div>
                <div className="text-muted-foreground italic">{track.agentRole}</div>
              </div>
              {streaming && <Loader2 className="w-4 h-4 animate-spin text-primary ml-2" />}
            </div>
            <div className="bg-card border border-border rounded-3xl p-8 shadow-card relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-brand" />
              <div className="prose prose-sm max-w-none whitespace-pre-wrap text-foreground leading-relaxed">
                {result || (streaming ? "Thinking with you…" : "")}
              </div>
            </div>
            {!streaming && result && (
              <div className="mt-8 flex flex-col sm:flex-row gap-3 items-center justify-between p-6 rounded-2xl bg-secondary text-secondary-foreground">
                <div>
                  <div className="font-display font-bold text-lg">+25 XP · First win unlocked 🌅</div>
                  <div className="text-sm text-secondary-foreground/70">Keep this win. Come back tomorrow for more.</div>
                </div>
                <Button onClick={finish} className="rounded-full bg-gradient-sunrise text-primary-foreground border-0 hover:opacity-95">
                  Go to my dashboard →
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}