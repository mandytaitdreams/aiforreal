import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Flame, Sparkles, Trophy, BookOpen, MessageCircle, Calendar as Cal, Star } from "lucide-react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { BADGES, levelForXp } from "@/lib/actions";

export default function Profile() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [stats, setStats] = useState({ tracksStarted: 0, savedItems: 0, conversations: 0, posts: 0, rsvps: 0 });
  const [badges, setBadges] = useState<{ badge_code: string; awarded_at: string }[]>([]);
  const [referralCode, setReferralCode] = useState<string>("");

  useEffect(() => { if (!loading && !user) nav("/auth", { replace: true }); }, [loading, user, nav]);
  useEffect(() => { if (profile?.display_name) setName(profile.display_name); }, [profile]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [a, b, c, d, e, bg, prof] = await Promise.all([
        supabase.from("user_track_progress").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("saved_items").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("agent_conversations").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("forum_posts").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("event_rsvps").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("user_badges").select("badge_code, awarded_at").eq("user_id", user.id),
        supabase.from("profiles").select("referral_code").eq("user_id", user.id).maybeSingle(),
      ]);
      setStats({
        tracksStarted: a.count ?? 0, savedItems: b.count ?? 0,
        conversations: c.count ?? 0, posts: d.count ?? 0, rsvps: e.count ?? 0,
      });
      setBadges((bg.data ?? []) as any);
      setReferralCode((prof.data as any)?.referral_code ?? "");
    })();
  }, [user]);

  const save = async () => {
    if (!user) return;
    const { error } = await supabase.from("profiles").update({ display_name: name }).eq("user_id", user.id);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    refreshProfile();
  };

  if (!profile) return <div className="min-h-screen bg-background"><SiteHeader/></div>;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container py-10 pb-24 max-w-3xl">
        <h1 className="font-display font-black text-4xl">Your profile</h1>
        <p className="text-muted-foreground">A quiet place to see how far you've come.</p>

        <section className="mt-8 p-6 rounded-3xl bg-card border border-border shadow-soft">
          <div className="flex flex-wrap gap-3">
            <Stat icon={<Flame className="w-4 h-4 text-pink"/>} label="Streak" value={`${profile.streak_days}d`} />
            <Stat icon={<Sparkles className="w-4 h-4 text-accent"/>} label="XP" value={`${profile.xp}`} />
            <Stat icon={<Trophy className="w-4 h-4 text-secondary"/>} label="Tier" value={profile.tier} />
          </div>
        </section>

        <section className="mt-6 p-6 rounded-3xl bg-card border border-border shadow-soft space-y-4">
          <h2 className="font-display font-bold text-xl">Display name</h2>
          <div className="flex gap-2">
            <Input value={name} onChange={e => setName(e.target.value)} className="rounded-xl"/>
            <Button onClick={save} className="rounded-full bg-pink text-white hover:bg-pink/90">Save</Button>
          </div>
        </section>

        <section className="mt-6 p-6 rounded-3xl bg-card border border-border shadow-soft">
          <h2 className="font-display font-bold text-xl">Lifetime</h2>
          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            <Row icon={<BookOpen className="w-4 h-4"/>} label="Tracks started" value={stats.tracksStarted}/>
            <Row icon={<Star className="w-4 h-4"/>} label="Saved items" value={stats.savedItems}/>
            <Row icon={<MessageCircle className="w-4 h-4"/>} label="AI conversations" value={stats.conversations}/>
            <Row icon={<MessageCircle className="w-4 h-4"/>} label="Community posts" value={stats.posts}/>
            <Row icon={<Cal className="w-4 h-4"/>} label="Events RSVP'd" value={stats.rsvps}/>
          </div>
        </section>
      </main>
    </div>
  );
}

const Stat = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="px-5 py-3 rounded-2xl bg-blush/40 border border-border">
    <div className="flex items-center gap-2 text-xs text-muted-foreground">{icon}{label}</div>
    <div className="font-display font-black text-2xl">{value}</div>
  </div>
);
const Row = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) => (
  <div className="flex items-center justify-between p-3 rounded-2xl bg-blush/30 border border-border">
    <span className="flex items-center gap-2 text-sm text-foreground/80">{icon}{label}</span>
    <span className="font-display font-black text-lg">{value}</span>
  </div>
);