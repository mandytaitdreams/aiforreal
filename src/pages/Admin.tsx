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
import { Plus, Pencil, Trash2, Shield, ExternalLink, Eye, Upload, Headphones } from "lucide-react";
import { Calendar } from "lucide-react";
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
    { name: "audio_url", label: "Audio link / embed URL (Spotify, SoundCloud, .mp3 …)", type: "url" },
    { name: "transcript", label: "Transcript (optional — paste or generate from audio)", type: "textarea" },
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
    { name: "name", label: "Tool name (e.g. 'Niche Quiz', 'Prompt Generator')" },
    { name: "description", label: "What problem does it solve in 1 minute?", type: "textarea" },
    { name: "use_case", label: "Use case (quiz, generator, calculator, checklist…)" },
    { name: "url", label: "External URL (only if hosted elsewhere)", type: "url" },
    { name: "html_content", label: "Interactive HTML (quiz, generator, form — runs inside the platform)", type: "textarea" },
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

        <EventsAdmin />

        <h2 className="mt-12 font-display font-black text-2xl">Track content</h2>

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
          <DialogContent className={`${type === "tools" ? "max-w-5xl" : "max-w-xl"} max-h-[90vh] overflow-y-auto`}>
            <DialogHeader>
              <DialogTitle className="font-display capitalize">{editing?.id ? "Edit" : "New"} {type.slice(0, -1)}</DialogTitle>
            </DialogHeader>
            {editing && (
              <div className={type === "tools" ? "grid md:grid-cols-2 gap-6" : "space-y-4"}>
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
                {type === "videos" && (
                  <AudioFileField
                    audioPath={editing.audio_path ?? ""}
                    onChange={(audio_path) => setEditing({ ...editing, audio_path })}
                  />
                )}
                {type === "playlists" && (
                  <ChaptersEditor
                    value={Array.isArray(editing.chapters) ? editing.chapters : []}
                    onChange={(chapters) => setEditing({ ...editing, chapters })}
                  />
                )}
                </div>
                {type === "tools" && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5"/> Live preview (sanitized)</Label>
                    <div className="rounded-2xl border border-border bg-blush/40 p-5 max-h-[60vh] overflow-y-auto prose prose-sm max-w-none prose-headings:font-display prose-a:text-pink prose-strong:text-foreground">
                      {editing.html_content ? (
                        <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(String(editing.html_content)) }} />
                      ) : (
                        <p className="text-muted-foreground italic m-0">Add HTML on the left to see how it will render in the platform.</p>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Scripts, iframes, inline styles and event handlers are stripped automatically for safety.</p>
                  </div>
                )}
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

type Chapter = { label: string; t: number };

function AudioFileField({ audioPath, onChange }: { audioPath: string; onChange: (path: string) => void }) {
  const [busy, setBusy] = useState(false);

  const publicUrl = audioPath
    ? supabase.storage.from("audio").getPublicUrl(audioPath).data.publicUrl
    : "";

  const upload = async (file: File) => {
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) { toast.error("File must be under 50MB"); return; }
    setBusy(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "mp3";
      const key = `videos/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("audio").upload(key, file, {
        cacheControl: "31536000", upsert: false, contentType: file.type || "audio/mpeg",
      });
      if (error) throw error;
      onChange(key);
      toast.success("Audio uploaded");
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-1.5 pt-2 border-t border-border">
      <Label className="flex items-center gap-1.5"><Headphones className="w-3.5 h-3.5"/> Audio file (optional, alternative to embed link)</Label>
      <div className="flex items-center gap-2">
        <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-input bg-background hover:bg-accent cursor-pointer text-sm">
          <Upload className="w-3.5 h-3.5"/>
          <span>{busy ? "Uploading…" : "Choose file"}</span>
          <input
            type="file"
            accept="audio/*,.mp3,.m4a,.wav,.ogg"
            className="sr-only"
            disabled={busy}
            onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); e.currentTarget.value = ""; }}
          />
        </label>
        {audioPath && (
          <Button type="button" variant="outline" size="sm" className="rounded-full text-destructive border-destructive/30" onClick={() => onChange("")}>
            Remove
          </Button>
        )}
      </div>
      {audioPath && (
        <div className="mt-2">
          <audio controls preload="none" src={publicUrl} className="w-full" />
          <p className="text-xs text-muted-foreground mt-1 truncate">{audioPath}</p>
        </div>
      )}
      <p className="text-xs text-muted-foreground">Either upload a file here or paste an embed link above. Members get a "Listen instead" toggle when audio exists.</p>
    </div>
  );
}

function ChaptersEditor({ value, onChange }: { value: Chapter[]; onChange: (next: Chapter[]) => void }) {
  const update = (i: number, patch: Partial<Chapter>) => {
    const next = value.map((c, idx) => idx === i ? { ...c, ...patch } : c);
    onChange(next);
  };
  const add = () => onChange([...value, { label: "", t: 0 }]);
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));

  // Accept "1:23" or "1:02:03" or seconds
  const parseTime = (s: string): number => {
    const trimmed = s.trim();
    if (/^\d+$/.test(trimmed)) return Number(trimmed);
    const parts = trimmed.split(":").map(p => Number(p));
    if (parts.some(isNaN)) return 0;
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return 0;
  };
  const fmt = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    return h > 0 ? `${h}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}` : `${m}:${String(s).padStart(2,"0")}`;
  };

  return (
    <div className="space-y-2 pt-2 border-t border-border">
      <div className="flex items-center justify-between">
        <Label>Chapter markers (optional)</Label>
        <Button type="button" size="sm" variant="outline" className="rounded-full" onClick={add}><Plus className="w-3.5 h-3.5 mr-1"/>Add</Button>
      </div>
      {value.length === 0 && <p className="text-xs text-muted-foreground">Add timestamps so members can jump to key moments inside the embedded player.</p>}
      {value.map((c, i) => (
        <div key={i} className="flex gap-2 items-center">
          <Input
            placeholder="Chapter title"
            value={c.label}
            onChange={e => update(i, { label: e.target.value })}
            className="rounded-xl flex-1"
          />
          <Input
            placeholder="0:00"
            defaultValue={fmt(c.t || 0)}
            onBlur={e => update(i, { t: parseTime(e.target.value) })}
            className="rounded-xl w-24 font-mono text-sm"
          />
          <Button type="button" size="sm" variant="outline" className="rounded-full text-destructive border-destructive/30" onClick={() => remove(i)}>
            <Trash2 className="w-3.5 h-3.5"/>
          </Button>
        </div>
      ))}
    </div>
  );
}

type EventForm = {
  id?: string; title: string; description: string; speaker_name: string;
  starts_at: string; duration_minutes: number; timezone: string;
  platform: string; join_url: string; replay_url: string; published: boolean;
};
const blankEvent = (): EventForm => ({
  title: "", description: "", speaker_name: "",
  starts_at: new Date(Date.now() + 3 * 24 * 3600_000).toISOString().slice(0, 16),
  duration_minutes: 60, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  platform: "Zoom", join_url: "", replay_url: "", published: true,
});

function EventsAdmin() {
  const [rows, setRows] = useState<any[]>([]);
  const [editing, setEditing] = useState<EventForm | null>(null);
  const [open, setOpen] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("events").select("*").order("starts_at", { ascending: false });
    setRows(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    const payload = {
      ...editing,
      starts_at: new Date(editing.starts_at).toISOString(),
      duration_minutes: Number(editing.duration_minutes) || 60,
    };
    const { error } = await supabase.from("events").upsert(payload as any);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setOpen(false); setEditing(null); load();
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    await supabase.from("events").delete().eq("id", id);
    load();
  };

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="font-display font-black text-2xl flex items-center gap-2"><Calendar className="w-5 h-5 text-pink"/> Events</h2>
        <Button onClick={() => { setEditing(blankEvent()); setOpen(true); }} className="rounded-full bg-pink text-white hover:bg-pink/90"><Plus className="w-4 h-4"/> New event</Button>
      </div>
      {rows.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground rounded-2xl bg-card border border-border">No events yet.</div>
      ) : (
        <div className="space-y-2">
          {rows.map(r => (
            <div key={r.id} className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border shadow-soft">
              <div className="flex-1 min-w-0">
                <div className="font-bold truncate">{r.title}</div>
                <div className="text-xs text-muted-foreground">{new Date(r.starts_at).toLocaleString()} · {r.platform || "—"} {r.published ? "" : "· Draft"}</div>
              </div>
              <Button size="sm" variant="outline" className="rounded-full" onClick={() => { setEditing({ ...r, starts_at: new Date(r.starts_at).toISOString().slice(0,16) }); setOpen(true); }}><Pencil className="w-3.5 h-3.5"/></Button>
              <Button size="sm" variant="outline" className="rounded-full text-destructive border-destructive/30" onClick={() => remove(r.id)}><Trash2 className="w-3.5 h-3.5"/></Button>
            </div>
          ))}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display">{editing?.id ? "Edit event" : "New event"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div><Label>Title</Label><Input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} className="rounded-xl"/></div>
              <div><Label>Description</Label><Textarea value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} rows={4} className="rounded-xl"/></div>
              <div><Label>Speaker</Label><Input value={editing.speaker_name} onChange={e => setEditing({ ...editing, speaker_name: e.target.value })} className="rounded-xl"/></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Start (local)</Label><Input type="datetime-local" value={editing.starts_at} onChange={e => setEditing({ ...editing, starts_at: e.target.value })} className="rounded-xl"/></div>
                <div><Label>Duration (min)</Label><Input type="number" value={editing.duration_minutes} onChange={e => setEditing({ ...editing, duration_minutes: Number(e.target.value) })} className="rounded-xl"/></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Timezone</Label><Input value={editing.timezone} onChange={e => setEditing({ ...editing, timezone: e.target.value })} className="rounded-xl"/></div>
                <div><Label>Platform</Label><Input value={editing.platform} onChange={e => setEditing({ ...editing, platform: e.target.value })} className="rounded-xl"/></div>
              </div>
              <div><Label>Join URL</Label><Input type="url" value={editing.join_url} onChange={e => setEditing({ ...editing, join_url: e.target.value })} className="rounded-xl"/></div>
              <div><Label>Replay URL (after the event)</Label><Input type="url" value={editing.replay_url} onChange={e => setEditing({ ...editing, replay_url: e.target.value })} className="rounded-xl"/></div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.published} onChange={e => setEditing({ ...editing, published: e.target.checked })}/>
                Published (visible to members)
              </label>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" className="rounded-full" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="rounded-full bg-pink text-white hover:bg-pink/90" onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}