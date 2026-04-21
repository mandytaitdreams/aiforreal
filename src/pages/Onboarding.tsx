import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { TRACKS, hueBg, QUIZ_QUESTIONS, suggestTrack } from "@/data/tracks";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, Loader2 } from "lucide-react";

type Step = "name" | "quiz" | "reveal" | "challenge" | "signup" | "result";
const STEPS: Step[] = ["name", "quiz", "reveal", "challenge", "signup", "result"];

export default function Onboarding() {
  const { user, profile, refreshProfile } = useAuth();
  const nav = useNavigate();
  const [step, setStep] = useState<Step>("name");
  const [trackSlug, setTrackSlug] = useState<string>("");
  const [firstName, setFirstName] = useState("");
  const [challenge, setChallenge] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [result, setResult] = useState("");
  const [quizIdx, setQuizIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showAllTracks, setShowAllTracks] = useState(false);

  useEffect(() => {
    if (user && profile?.display_name && !firstName) {
      setFirstName(profile.display_name);
    }
  }, [user, profile, firstName]);

  const suggested = Object.keys(answers).length === QUIZ_QUESTIONS.length ? suggestTrack(answers) : null;
  const track = TRACKS.find(t => t.slug === trackSlug) ?? suggested ?? null;

  const generate = async (uid: string, displayName: string) => {
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
          firstName: displayName,
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

      await supabase.from("profiles").update({
        display_name: displayName,
        primary_track: track.slug,
        first_win: acc.slice(0, 800),
        xp: (profile?.xp ?? 0) + 25,
        streak_days: 1,
      }).eq("user_id", uid);
      await supabase.from("user_track_progress").upsert({
        user_id: uid,
        track_slug: track.slug,
        percent_complete: 5,
      }, { onConflict: "user_id,track_slug" });
    } catch (e) {
      toast.error("Couldn't reach the agent. Try again.");
    } finally {
      setStreaming(false);
    }
  };

  const handleSignupAndGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !email.trim() || password.length < 6) return;
    setSubmitting(true);
    try {
      if (user) {
        await generate(user.id, firstName.trim());
        return;
      }
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: { display_name: firstName.trim() },
        },
      });
      if (error) throw error;
      const uid = data.user?.id;
      if (!uid) throw new Error("Signup did not return a user");
      await generate(uid, firstName.trim());
    } catch (err: any) {
      toast.error(err.message || "Couldn't create your account");
    } finally {
      setSubmitting(false);
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
          {STEPS.map(s => (
            <span key={s} className={`h-1.5 w-10 rounded-full transition-colors ${
              STEPS.indexOf(step) >= STEPS.indexOf(s) ? "bg-primary" : "bg-border"
            }`} />
          ))}
        </div>
      </div>

      <div className="container max-w-3xl py-12 pb-24">
        {step === "name" && (
          <div className="animate-fade-up max-w-2xl">
            <h1 className="font-display font-black text-4xl md:text-5xl leading-tight">
              Hi there —<br />
              <span className="text-gradient-sunrise italic">what should we call you?</span>
            </h1>
            <p className="mt-4 text-muted-foreground">Just your first name is fine.</p>
            <Input
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              placeholder="Maya"
              autoFocus
              maxLength={50}
              className="mt-6 h-14 rounded-2xl text-lg p-4 bg-card border-2 focus-visible:ring-primary"
              onKeyDown={e => { if (e.key === "Enter" && firstName.trim()) setStep("quiz"); }}
            />
            <Button
              onClick={() => setStep("quiz")}
              disabled={!firstName.trim()}
              size="lg"
              className="mt-6 h-12 px-8 rounded-full bg-gradient-brand text-primary-foreground border-0 shadow-pink hover:opacity-95 font-semibold"
            >
              Continue →
            </Button>
          </div>
        )}

        {step === "quiz" && (() => {
          const q = QUIZ_QUESTIONS[quizIdx];
          return (
            <div className="animate-fade-up max-w-2xl">
              <button
                onClick={() => quizIdx === 0 ? setStep("name") : setQuizIdx(quizIdx - 1)}
                className="text-sm text-muted-foreground hover:text-foreground mb-6"
              >
                ← Back
              </button>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
                Question {quizIdx + 1} of {QUIZ_QUESTIONS.length}
              </div>
              <h1 className="font-display font-black text-3xl md:text-4xl leading-tight">
                {firstName ? `${firstName} — ` : ""}<span className="text-gradient-sunrise italic">{q.prompt}</span>
              </h1>
              <div className="mt-8 grid sm:grid-cols-2 gap-3">
                {q.options.map((opt, i) => (
                  <button
                    key={opt.label}
                    onClick={() => {
                      const next = { ...answers, [q.id]: i };
                      setAnswers(next);
                      if (quizIdx < QUIZ_QUESTIONS.length - 1) setQuizIdx(quizIdx + 1);
                      else setStep("reveal");
                    }}
                    className="text-left p-5 rounded-2xl bg-card border-2 border-border transition-all hover:shadow-card hover:-translate-y-0.5 hover:border-primary font-display font-semibold"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })()}

        {step === "reveal" && track && (
          <div className="animate-fade-up max-w-2xl">
            <button onClick={() => { setQuizIdx(QUIZ_QUESTIONS.length - 1); setStep("quiz"); }} className="text-sm text-muted-foreground hover:text-foreground mb-6">
              ← Back
            </button>
            <p className="text-lg text-muted-foreground">
              {firstName}, based on what you told us, your best starting point is:
            </p>
            <div className={`mt-6 p-8 rounded-3xl ${hueBg(track.hue)} shadow-warm`}>
              <div className="text-xs uppercase tracking-wider text-foreground/70 font-bold">Track {track.number}</div>
              <h1 className="mt-2 font-display font-black text-4xl md:text-5xl leading-tight text-foreground">
                {track.title}
              </h1>
              <p className="mt-3 text-foreground/80 text-lg">{track.tagline}</p>
              <p className="mt-6 text-foreground">
                You'll start with <span className="font-handwritten text-2xl">{track.agentName}</span> — {track.agentRole}.
              </p>
            </div>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <Button
                onClick={() => setStep("challenge")}
                size="lg"
                className="h-12 px-8 rounded-full bg-gradient-brand text-primary-foreground border-0 shadow-pink hover:opacity-95 font-semibold"
              >
                Let's get my first win →
              </Button>
              <button
                onClick={() => setShowAllTracks(v => !v)}
                className="text-sm text-muted-foreground underline hover:text-foreground"
              >
                {showAllTracks ? "Hide" : "Not quite right? See all 10 tracks"}
              </button>
            </div>
            {showAllTracks && (
              <div className="mt-6 grid sm:grid-cols-2 gap-3">
                {TRACKS.map(t => (
                  <button
                    key={t.slug}
                    onClick={() => { setTrackSlug(t.slug); setStep("challenge"); }}
                    className={`text-left p-4 rounded-2xl bg-card border-2 transition-all hover:shadow-card hover:-translate-y-0.5 ${
                      track.slug === t.slug ? "border-primary" : "border-border"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-9 h-9 rounded-full ${hueBg(t.hue)} flex items-center justify-center font-display font-black text-xs text-foreground`}>{t.number}</span>
                      <div>
                        <div className="font-display font-bold text-sm leading-tight">{t.title}</div>
                        <div className="text-xs text-muted-foreground italic">with {t.agentName}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {step === "challenge" && track && (
          <div className="animate-fade-up max-w-2xl">
            <button onClick={() => setStep("reveal")} className="text-sm text-muted-foreground hover:text-foreground mb-6">
              ← Back
            </button>
            <div className="flex items-center gap-3 mb-2">
              <span className={`w-12 h-12 rounded-full ${hueBg(track.hue)} flex items-center justify-center font-display font-black text-base text-foreground`}>{track.number}</span>
              <span className="text-sm text-muted-foreground">Hi {firstName} — meet <strong className="text-foreground">{track.agentName}</strong> · {track.agentRole}</span>
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
              onClick={() => user ? generate(user.id, firstName.trim()) : setStep("signup")}
              disabled={!challenge.trim()}
              size="lg"
              className="mt-6 h-12 px-8 rounded-full bg-gradient-brand text-primary-foreground border-0 shadow-pink hover:opacity-95 font-semibold"
            >
              <Sparkles className="w-4 h-4 mr-2" /> Get my first win
            </Button>
          </div>
        )}

        {step === "signup" && track && (
          <div className="animate-fade-up max-w-md">
            <button onClick={() => setStep("challenge")} className="text-sm text-muted-foreground hover:text-foreground mb-6">
              ← Back
            </button>
            <h1 className="font-display font-black text-4xl md:text-5xl leading-tight">
              Almost there, {firstName}.<br />
              <span className="text-gradient-sunrise italic">Where should we send your win?</span>
            </h1>
            <p className="mt-4 text-muted-foreground">
              {track.agentName} is ready. We'll save your progress so you can come back tomorrow.
            </p>
            <form onSubmit={handleSignupAndGenerate} className="mt-8 space-y-4 bg-card border border-border rounded-3xl p-6 shadow-card">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" className="rounded-xl h-11" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Choose a password</Label>
                <Input id="password" type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" className="rounded-xl h-11" />
              </div>
              <Button
                type="submit"
                disabled={submitting || !email.trim() || password.length < 6}
                size="lg"
                className="w-full h-12 rounded-full bg-gradient-brand text-primary-foreground border-0 shadow-pink hover:opacity-95 font-semibold"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-4 h-4 mr-2" /> Unlock my first win</>}
              </Button>
               <p className="text-xs text-muted-foreground text-center">No credit card required</p>
            </form>
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