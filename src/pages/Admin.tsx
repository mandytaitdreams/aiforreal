import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Shield, ExternalLink, Eye } from "lucide-react";
import { toast } from "sonner";
import { sanitizeHtml } from "@/lib/sanitize";

type Track = { id: string; slug: string; number: string; title: string };

// Maps content type to the tab value used inside TrackDetail
const TRACK_TAB: Record<ContentType, string> = {
  videos: "videos", prompts: "prompts", tools: "toolkit",
  templates: "templates", playlists: "playlists", challenges: "challenges",
};

type ContentType = "videos" | "prompts" | "tools" | "templates" | "playlists" | "challenges";

const TYPE_FIELDS: Record<ContentType, { name: string; label: string; type?: "text" | "textarea" | "number" | "url"; options?: string[] }[]> = {
  videos: [
    { name: "title", label: "Title" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "youtube_id", label: "YouTube ID (optional)" },
    { name: "duration_minutes", label: "Duration (min)", type: "number" },
    { name: "sort_order", label: "Sort order", type: "number" },
  ],
  prompts: [
    { name: "title", label: "Title" },
    { name: "body", label: "Prompt body", type: "textarea" },
    { name: "use_case", label: "Use case" },
    { name: "difficulty", label: "Difficulty", options: ["starter", "intermediate", "power"] },
    { name: "sort_order", label: "Sort order", type: "number" },
  ],
  tools: [
    { name: "name", label: "Tool name" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "use_case", label: "Use case" },
    { name: "url", label: "URL", type: "url" },
    { name: "html_content", label: "HTML content (renders inside the platform)", type: "textarea" },
    { name: "sort_order", label: "Sort order", type: "number" },
  ],
  templates: [
    { name: "title", label: "Title" },
    { name: "body", label: "Template body", type: "textarea" },
    { name: "use_case", label: "Use case" },
    { name: "problem_solved", label: "Problem solved" },
    { name: "sort_order", label: "Sort order", type: "number" },
  ],
  playlists: [
    { name: "title", label: "Title" },
    { name: "youtube_url", label: "YouTube URL", type: "url" },
    { name: "creator", label: "Creator" },
    { name: "duration_minutes", label: "Duration (min)", type: "number" },
    { name: "sort_order", label: "Sort order", type: "number" },
  ],
  challenges: [
    { name: "title", label: "Title" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "success_metric", label: "Success metric" },
    { name: "kind", label: "Kind", options: ["quick", "five_day"] },
    { name: "sort_order", label: "Sort order", type: "number" },
  ],
};

const NAME_KEY: Record<ContentType, string> = {
  videos: "title", prompts: "title", tools: "name", templates: "title", playlists: "title", challenges: "title",
};

export default function Admin() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [trackId, setTrackId] = useState<string>("");
  const [type, setType] = useState<ContentType>("prompts");
  const [rows, setRows] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => { if (!loading && !user) nav("/auth", { replace: true }); }, [loading, user, nav]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      setIsAdmin(!!data);
      const { data: tr } = await supabase.from("tracks").select("id, slug, number, title").order("sort_order");
      setTracks((tr ?? []) as Track[]);
      if (tr?.[0]) setTrackId(tr[0].id);
    })();
  }, [user]);

  const loadRows = async () => {
    if (!trackId) return;
    const { data } = await supabase.from(type as any).select("*").eq("track_id", trackId).order("sort_order");
    setRows((data ?? []) as any[]);
  };

  useEffect(() => { loadRows(); }, [trackId, type]);

  const fields = TYPE_FIELDS[type];

  const startNew = () => {
    const blank: any = { track_id: trackId };
    fields.forEach(f => { blank[f.name] = f.type === "number" ? 0 : ""; });
    setEditing(blank);
    setOpen(true);
  };

  const startEdit = (row: any) => { setEditing({ ...row }); setOpen(true); };

  const currentTrack = useMemo(() => tracks.find(t => t.id === trackId), [tracks, trackId]);
  const trackHref = currentTrack ? `/track/${currentTrack.slug}?tab=${TRACK_TAB[type]}` : "#";

  const save = async () => {
    if (!editing) return;
    const payload: any = { track_id: trackId };
    fields.forEach(f => {
      let v = editing[f.name];
      if (f.type === "number") v = Number(v) || 0;
      payload[f.name] = v === "" ? null : v;
    });
    // ensure required defaults to keep insert valid
    const upsert = editing.id ? { ...payload, id: editing.id } : payload;
    const { error } = await supabase.from(type as any).upsert(upsert);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved");
    setOpen(false); setEditing(null);
    loadRows();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    const { error } = await supabase.from(type as any).delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    loadRows();
  };

  if (isAdmin === false) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="container py-24 text-center">
          <Shield className="w-12 h-12 mx-auto text-muted-foreground" />
          <h1 className="mt-4 font-display font-black text-3xl">Admins only</h1>
          <p className="mt-2 text-muted-foreground">Your account doesn't have admin access.</p>
        </div>
      </div>
    );
  }
  if (isAdmin === null) return <div className="min-h-screen bg-background"><SiteHeader /></div>;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container py-10">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-6 h-6 text-pink" />
          <h1 className="font-display font-black text-4xl">Admin · Content</h1>
        </div>
        <p className="text-muted-foreground">Add, edit and delete content for any track.</p>

        <div className="mt-8 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[240px]">
            <Label className="text-xs">Track</Label>
            <Select value={trackId} onValueChange={setTrackId}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                {tracks.map(t => <SelectItem key={t.id} value={t.id}>{t.number} · {t.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={startNew} className="rounded-full bg-pink text-white hover:bg-pink/90"><Plus className="w-4 h-4 mr-1.5"/>New {type.slice(0, -1)}</Button>
        </div>

        <Tabs value={type} onValueChange={(v) => setType(v as ContentType)} className="mt-6">
          <TabsList className="rounded-full bg-blush p-1.5 h-auto flex-wrap">
            {(["videos", "prompts", "tools", "templates", "playlists", "challenges"] as ContentType[]).map(t => (
              <TabsTrigger key={t} value={t} className="rounded-full data-[state=active]:bg-pink data-[state=active]:text-white capitalize">{t}</TabsTrigger>
            ))}
          </TabsList>

          {(["videos", "prompts", "tools", "templates", "playlists", "challenges"] as ContentType[]).map(t => (
            <TabsContent key={t} value={t} className="mt-6">
              {rows.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">No {t} yet for this track.</div>
              ) : (
                <div className="space-y-2">
                  {rows.map(r => (
                    <div key={r.id} className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border shadow-soft">
                      <span className="font-display font-black text-lg text-muted-foreground/40 w-8">{r.sort_order ?? 0}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold truncate">{r[NAME_KEY[t]]}</div>
                        <div className="text-xs text-muted-foreground truncate">{r.description || r.body || r.use_case || r.url || ""}</div>
                      </div>
                      <Button size="sm" variant="outline" className="rounded-full" onClick={() => startEdit(r)}><Pencil className="w-3.5 h-3.5"/></Button>
                      {currentTrack && (
                        <Button asChild size="sm" variant="outline" className="rounded-full" title="Open in track">
                          <Link to={`/track/${currentTrack.slug}?tab=${TRACK_TAB[t]}#item-${r.id}`} target="_blank" rel="noreferrer">
                            <ExternalLink className="w-3.5 h-3.5"/>
                          </Link>
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="rounded-full text-destructive border-destructive/30 hover:bg-destructive hover:text-destructive-foreground" onClick={() => remove(r.id)}><Trash2 className="w-3.5 h-3.5"/></Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display capitalize">{editing?.id ? "Edit" : "New"} {type.slice(0, -1)}</DialogTitle>
            </DialogHeader>
            {editing && (
              <div className="space-y-4">
                {fields.map(f => (
                  <div key={f.name} className="space-y-1.5">
                    <Label htmlFor={f.name}>{f.label}</Label>
                    {f.options ? (
                      <Select value={editing[f.name] ?? ""} onValueChange={(v) => setEditing({ ...editing, [f.name]: v })}>
                        <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent>{f.options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                      </Select>
                    ) : f.type === "textarea" ? (
                      <Textarea id={f.name} value={editing[f.name] ?? ""} onChange={e => setEditing({ ...editing, [f.name]: e.target.value })} rows={6} className="rounded-xl font-mono text-sm" />
                    ) : (
                      <Input id={f.name} type={f.type === "number" ? "number" : f.type === "url" ? "url" : "text"} value={editing[f.name] ?? ""} onChange={e => setEditing({ ...editing, [f.name]: e.target.value })} className="rounded-xl" />
                    )}
                  </div>
                ))}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" className="rounded-full" onClick={() => setOpen(false)}>Cancel</Button>
              <Button className="rounded-full bg-pink text-white hover:bg-pink/90" onClick={save}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}