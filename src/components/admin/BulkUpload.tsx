import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileUp, Download } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type FieldDef = { name: string; type?: "text" | "textarea" | "number" | "url"; options?: string[] };

type Props = {
  table: string;
  fields: FieldDef[];
  /** extra columns merged into every row (e.g. { track_id }) */
  fixed?: Record<string, any>;
  /** label, e.g. "prompts" */
  label: string;
  onDone?: () => void;
  /** override sample row for the template */
  sampleRow?: Record<string, any>;
  /** transform a parsed row before insert (e.g. coerce dates) */
  transformRow?: (row: any) => any;
};

function parseCSV(text: string): any[] {
  const rows: string[][] = [];
  let cur: string[] = [];
  let val = "";
  let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"' && text[i + 1] === '"') { val += '"'; i++; }
      else if (c === '"') { inQ = false; }
      else { val += c; }
    } else {
      if (c === '"') inQ = true;
      else if (c === ",") { cur.push(val); val = ""; }
      else if (c === "\n") { cur.push(val); rows.push(cur); cur = []; val = ""; }
      else if (c === "\r") { /* skip */ }
      else val += c;
    }
  }
  if (val.length > 0 || cur.length > 0) { cur.push(val); rows.push(cur); }
  if (rows.length === 0) return [];
  const headers = rows[0].map(h => h.trim());
  return rows.slice(1)
    .filter(r => r.some(v => v.trim() !== ""))
    .map(r => Object.fromEntries(headers.map((h, idx) => [h, (r[idx] ?? "").trim()])));
}

function toCSV(rows: any[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const esc = (v: any) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.join(","), ...rows.map(r => headers.map(h => esc(r[h])).join(","))].join("\n");
}

export function BulkUpload({ table, fields, fixed, label, onDone, sampleRow, transformRow }: Props) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const sample = sampleRow ?? Object.fromEntries(fields.map(f => {
      if (f.options) return [f.name, f.options[0]];
      if (f.type === "number") return [f.name, 0];
      if (f.type === "url") return [f.name, "https://example.com"];
      return [f.name, ""];
    }));
    const csv = toCSV([sample, sample]);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${label}-template.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleFile = async (file: File) => {
    const t = await file.text();
    setText(t);
  };

  const submit = async () => {
    if (!text.trim()) { toast.error("Paste CSV/JSON or choose a file first"); return; }
    setBusy(true);
    try {
      let rows: any[] = [];
      const trimmed = text.trim();
      if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
        const parsed = JSON.parse(trimmed);
        rows = Array.isArray(parsed) ? parsed : [parsed];
      } else {
        rows = parseCSV(trimmed);
      }
      if (rows.length === 0) { toast.error("No rows found"); return; }

      const allowed = new Set(fields.map(f => f.name));
      const cleaned = rows.map(r => {
        const out: any = { ...(fixed ?? {}) };
        for (const f of fields) {
          if (!(f.name in r)) continue;
          let v: any = r[f.name];
          if (v === "" || v == null) { out[f.name] = null; continue; }
          if (f.type === "number") v = Number(v) || 0;
          out[f.name] = v;
        }
        // also pass through any extra known columns the caller permits via fixed
        return transformRow ? transformRow(out) : out;
      });

      const { error } = await supabase.from(table as any).insert(cleaned as any);
      if (error) throw error;
      toast.success(`Inserted ${cleaned.length} ${label}`);
      setOpen(false); setText("");
      onDone?.();
    } catch (e: any) {
      toast.error(e.message || "Bulk upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button type="button" variant="outline" className="rounded-full" onClick={() => setOpen(true)}>
        <FileUp className="w-4 h-4 mr-1.5"/> Bulk upload
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display capitalize">Bulk upload {label}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Paste CSV (with headers) or a JSON array. Columns matching field names will be inserted.
              {fixed && Object.keys(fixed).length > 0 ? " Track is auto-applied to every row." : ""}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" variant="outline" className="rounded-full" onClick={downloadTemplate}>
                <Download className="w-3.5 h-3.5 mr-1"/> Download CSV template
              </Button>
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-input bg-background hover:bg-accent cursor-pointer text-sm">
                <Upload className="w-3.5 h-3.5"/> Choose .csv / .json
                <input ref={fileRef} type="file" accept=".csv,.json,text/csv,application/json" className="sr-only"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.currentTarget.value = ""; }}/>
              </label>
            </div>
            <Textarea value={text} onChange={e => setText(e.target.value)} rows={12}
              placeholder={`title,body,use_case\n"My prompt","Do X for me","writing"`}
              className="rounded-xl font-mono text-xs"/>
            <p className="text-xs text-muted-foreground">
              Recognized fields: <span className="font-mono">{fields.map(f => f.name).join(", ")}</span>
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-full" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="rounded-full bg-pink text-white hover:bg-pink/90" disabled={busy} onClick={submit}>
              {busy ? "Uploading…" : "Insert rows"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}