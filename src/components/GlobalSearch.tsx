import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Search, Sparkles, PlayCircle, Wrench, FileText } from "lucide-react";

type Hit = { id: string; type: "prompt" | "video" | "tool" | "template"; title: string; snippet: string; track_slug: string; track_title: string };

const ICONS: Record<Hit["type"], any> = { prompt: Sparkles, video: PlayCircle, tool: Wrench, template: FileText };

export const GlobalSearch = () => {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | Hit["type"]>("all");
  const [hits, setHits] = useState<Hit[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const term = q.trim();
    if (!term) { setHits([]); return; }
    const t = setTimeout(async () => {
      setBusy(true);
      const like = `%${term.replace(/[%_]/g, "\\$&")}%`;
      const [{ data: tracks }, prRes, vdRes, tlRes, tpRes] = await Promise.all([
        supabase.from("tracks").select("id, slug, title"),
        supabase.from("prompts").select("id, title, body, use_case, track_id").or(`title.ilike.${like},body.ilike.${like},use_case.ilike.${like}`).limit(20),
        supabase.from("videos").select("id, title, description, track_id").or(`title.ilike.${like},description.ilike.${like}`).limit(20),
        supabase.from("tools").select("id, name, description, use_case, track_id").or(`name.ilike.${like},description.ilike.${like},use_case.ilike.${like}`).limit(20),
        supabase.from("templates").select("id, title, body, use_case, track_id").or(`title.ilike.${like},body.ilike.${like},use_case.ilike.${like}`).limit(20),
      ]);
      const trackMap = Object.fromEntries((tracks ?? []).map(t => [t.id, t]));
      const map = (rows: any[] | null, type: Hit["type"], titleKey: string, snipKey: string): Hit[] =>
        (rows ?? []).map(r => ({
          id: r.id, type,
          title: r[titleKey] ?? "Untitled",
          snippet: (r[snipKey] ?? "").slice(0, 140),
          track_slug: trackMap[r.track_id]?.slug ?? "",
          track_title: trackMap[r.track_id]?.title ?? "",
        }));
      const all: Hit[] = [
        ...map(prRes.data, "prompt", "title", "body"),
        ...map(vdRes.data, "video", "title", "description"),
        ...map(tlRes.data, "tool", "name", "description"),
        ...map(tpRes.data, "template", "title", "body"),
      ];
      setHits(all);
      setBusy(false);
    }, 220);
    return () => clearTimeout(t);
  }, [q]);

  const filtered = useMemo(() => filter === "all" ? hits : hits.filter(h => h.type === filter), [hits, filter]);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"/>
        <Input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search prompts, videos, tools, templates…"
          className="pl-11 h-12 rounded-full bg-card border-border shadow-soft"
        />
      </div>
      <div className="flex gap-2 mt-3 flex-wrap">
        {(["all", "prompt", "video", "tool", "template"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              filter === f ? "bg-pink text-white" : "bg-blush text-foreground/70 hover:bg-pink/10"
            }`}
          >{f}{f !== "all" ? "s" : ""}</button>
        ))}
        {q && <span className="text-xs text-muted-foreground self-center">{busy ? "searching…" : `${filtered.length} result${filtered.length === 1 ? "" : "s"}`}</span>}
      </div>

      {q && filtered.length > 0 && (
        <div className="mt-4 rounded-3xl bg-card border border-border shadow-soft max-h-[360px] overflow-y-auto divide-y divide-border">
          {filtered.map(h => {
            const Icon = ICONS[h.type];
            return (
              <Link
                key={`${h.type}-${h.id}`}
                to={`/track/${h.track_slug}`}
                className="flex items-start gap-3 p-4 hover:bg-blush transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-blush flex items-center justify-center shrink-0"><Icon className="w-4 h-4 text-pink"/></div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold truncate">{h.title}</span>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-pink">{h.type}</span>
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{h.snippet}</div>
                  <div className="text-[11px] text-muted-foreground/70 mt-0.5">in {h.track_title}</div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
      {q && !busy && filtered.length === 0 && (
        <div className="mt-4 p-6 rounded-3xl bg-card border border-border text-center text-sm text-muted-foreground">No matches for "{q}"</div>
      )}
    </div>
  );
};