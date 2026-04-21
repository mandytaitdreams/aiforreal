import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Plus, Sparkles, Star, ThumbsUp, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Section = "questions" | "wins" | "resources" | "feedback";
const SECTIONS: { id: Section; label: string }[] = [
  { id: "questions", label: "Questions" },
  { id: "wins", label: "Wins" },
  { id: "resources", label: "Resources" },
  { id: "feedback", label: "Feedback" },
];

type Track = { id: string; slug: string; title: string };
type Post = {
  id: string; user_id: string; section: Section; title: string; body: string;
  track_id: string | null; featured: boolean; created_at: string;
};
type Reply = { id: string; post_id: string; user_id: string; body: string; created_at: string };

export default function Community() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [section, setSection] = useState<Section>((params.get("section") as Section) || "questions");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [reactions, setReactions] = useState<Record<string, number>>({});
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [replies, setReplies] = useState<Record<string, Reply[]>>({});
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ title: "", body: "", track_id: "" });
  const [isAdmin, setIsAdmin] = useState(false);
  const [openPostId, setOpenPostId] = useState<string | null>(params.get("post"));

  useEffect(() => { if (!loading && !user) nav("/auth", { replace: true }); }, [loading, user, nav]);

  useEffect(() => {
    if (!user) return;
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => setIsAdmin(!!data));
    supabase.from("tracks").select("id, slug, title").order("sort_order").then(({ data }) => setTracks((data ?? []) as Track[]));
  }, [user]);

  const loadPosts = async () => {
    const { data } = await supabase.from("forum_posts").select("*").eq("section", section).order("featured", { ascending: false }).order("created_at", { ascending: false }).limit(100);
    const list = (data ?? []) as Post[];
    setPosts(list);
    if (list.length) {
      const ids = list.map(p => p.id);
      const userIds = Array.from(new Set(list.map(p => p.user_id)));
      const [{ data: rxs }, { data: profs }] = await Promise.all([
        supabase.from("forum_reactions").select("post_id").in("post_id", ids),
        supabase.from("profiles").select("user_id, display_name").in("user_id", userIds),
      ]);
      const counts: Record<string, number> = {};
      (rxs ?? []).forEach((r: any) => { counts[r.post_id] = (counts[r.post_id] || 0) + 1; });
      setReactions(counts);
      const pmap: Record<string, string> = {};
      (profs ?? []).forEach((p: any) => { pmap[p.user_id] = p.display_name || "Member"; });
      setProfiles(pmap);
    }
  };

  useEffect(() => { if (user) loadPosts(); }, [user, section]);

  // Realtime new-post indicator
  useEffect(() => {
    if (!user) return;
    const ch = supabase.channel("forum_posts_live")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "forum_posts" }, () => loadPosts())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, section]);

  const loadReplies = async (postId: string) => {
    const { data } = await supabase.from("forum_replies").select("*").eq("post_id", postId).order("created_at");
    setReplies(r => ({ ...r, [postId]: (data ?? []) as Reply[] }));
  };

  useEffect(() => { if (openPostId) loadReplies(openPostId); }, [openPostId]);

  const submit = async () => {
    if (!user) return;
    if (!draft.title.trim() || !draft.body.trim()) return toast.error("Title and body required");
    const { error } = await supabase.from("forum_posts").insert({
      user_id: user.id, section, title: draft.title.trim(), body: draft.body.trim(),
      track_id: draft.track_id || null,
    });
    if (error) return toast.error(error.message);
    toast.success("Posted");
    setDraft({ title: "", body: "", track_id: "" });
    setOpen(false);
    loadPosts();
  };

  const react = async (postId: string) => {
    if (!user) return;
    const { error } = await supabase.from("forum_reactions").insert({ post_id: postId, user_id: user.id, emoji: "👍" });
    if (error && !error.message.includes("duplicate")) return;
    setReactions(r => ({ ...r, [postId]: (r[postId] || 0) + 1 }));
  };

  const reply = async (postId: string, body: string) => {
    if (!user || !body.trim()) return;
    const { error } = await supabase.from("forum_replies").insert({ post_id: postId, user_id: user.id, body: body.trim() });
    if (error) return toast.error(error.message);
    loadReplies(postId);
  };

  const toggleFeature = async (post: Post) => {
    const { error } = await supabase.from("forum_posts").update({ featured: !post.featured }).eq("id", post.id);
    if (error) return toast.error(error.message);
    loadPosts();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    await supabase.from("forum_posts").delete().eq("id", id);
    loadPosts();
  };

  const askAi = (post: Post) => {
    const seed = `I want help with this post from the community:\n\n"${post.title}"\n\n${post.body}\n\nWhat would you suggest?`;
    const enc = btoa(unescape(encodeURIComponent(seed)));
    if (post.track_id) {
      const trackSlug = tracks.find(t => t.id === post.track_id)?.slug;
      if (trackSlug) { nav(`/track/${trackSlug}?tab=agent&seed=${enc}`); return; }
    }
    nav(`/chat?seed=${enc}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container py-10 pb-24">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-pink" />
            <h1 className="font-display font-black text-4xl">Community</h1>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full bg-pink text-white hover:bg-pink/90"><Plus className="w-4 h-4"/> New post</Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader><DialogTitle className="font-display capitalize">New {section.slice(0, -1)}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Title</Label><Input value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} className="rounded-xl"/></div>
                <div><Label>Body</Label><Textarea value={draft.body} onChange={e => setDraft({ ...draft, body: e.target.value })} rows={6} className="rounded-xl"/></div>
                <div><Label>Related track (optional)</Label>
                  <Select value={draft.track_id} onValueChange={v => setDraft({ ...draft, track_id: v })}>
                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="None"/></SelectTrigger>
                    <SelectContent>{tracks.map(t => <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" className="rounded-full" onClick={() => setOpen(false)}>Cancel</Button>
                <Button className="rounded-full bg-pink text-white hover:bg-pink/90" onClick={submit}>Post</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs value={section} onValueChange={v => setSection(v as Section)} className="mt-6">
          <TabsList className="rounded-full bg-blush p-1.5 h-auto">
            {SECTIONS.map(s => <TabsTrigger key={s.id} value={s.id} className="rounded-full data-[state=active]:bg-pink data-[state=active]:text-white">{s.label}</TabsTrigger>)}
          </TabsList>
        </Tabs>

        <div className="mt-6 space-y-3">
          {posts.length === 0 && <div className="text-center py-16 text-muted-foreground">Be the first to post.</div>}
          {posts.map(p => {
            const trackSlug = p.track_id ? tracks.find(t => t.id === p.track_id)?.slug : null;
            const opened = openPostId === p.id;
            return (
              <article key={p.id} className={`p-5 rounded-2xl bg-card border shadow-soft ${p.featured ? "border-pink ring-2 ring-pink/20" : "border-border"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium">{profiles[p.user_id] || "Member"}</span>
                      <span>·</span>
                      <span>{new Date(p.created_at).toLocaleDateString()}</span>
                      {p.featured && <span className="ml-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-pink/10 text-pink"><Star className="w-3 h-3"/> Featured</span>}
                      {trackSlug && <Link to={`/track/${trackSlug}`} className="ml-1 px-2 py-0.5 rounded-full bg-blush text-pink">{tracks.find(t => t.id === p.track_id)?.title}</Link>}
                    </div>
                    <h3 className="mt-1 font-display font-bold text-lg">{p.title}</h3>
                    <p className="mt-1 text-sm text-foreground/80 whitespace-pre-wrap">{p.body}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Button size="sm" variant="outline" className="rounded-full" onClick={() => react(p.id)}><ThumbsUp className="w-3.5 h-3.5"/> {reactions[p.id] || 0}</Button>
                  <Button size="sm" variant="outline" className="rounded-full" onClick={() => setOpenPostId(opened ? null : p.id)}>{opened ? "Hide replies" : "Replies"}</Button>
                  <Button size="sm" variant="outline" className="rounded-full" onClick={() => askAi(p)}><Sparkles className="w-3.5 h-3.5"/> Ask AI about this</Button>
                  {isAdmin && (
                    <Button size="sm" variant="outline" className="rounded-full" onClick={() => toggleFeature(p)}>
                      <Star className="w-3.5 h-3.5"/> {p.featured ? "Unfeature" : "Feature"}
                    </Button>
                  )}
                  {(isAdmin || p.user_id === user?.id) && (
                    <Button size="sm" variant="outline" className="rounded-full text-destructive border-destructive/30" onClick={() => remove(p.id)}><Trash2 className="w-3.5 h-3.5"/></Button>
                  )}
                </div>
                {opened && (
                  <div className="mt-4 pl-4 border-l-2 border-blush space-y-2">
                    {(replies[p.id] || []).map(r => (
                      <div key={r.id} className="text-sm">
                        <span className="font-medium">{profiles[r.user_id] || "Member"}: </span>
                        <span className="text-foreground/80 whitespace-pre-wrap">{r.body}</span>
                      </div>
                    ))}
                    <ReplyBox onSubmit={(b) => reply(p.id, b)} />
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}

function ReplyBox({ onSubmit }: { onSubmit: (body: string) => void }) {
  const [v, setV] = useState("");
  return (
    <div className="flex gap-2 pt-2">
      <Input placeholder="Write a reply…" value={v} onChange={e => setV(e.target.value)} className="rounded-xl" />
      <Button size="sm" className="rounded-full bg-pink text-white hover:bg-pink/90" onClick={() => { onSubmit(v); setV(""); }}>Reply</Button>
    </div>
  );
}