import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2, Copy, Wand2 } from "lucide-react";
import { toast } from "sonner";

export function PromptGenerator({ trackTitle, onUseInChat }: { trackTitle?: string; onUseInChat?: (text: string) => void }) {
  const [open, setOpen] = useState(false);
  const [need, setNeed] = useState("");
  const [context, setContext] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState("");

  const generate = async () => {
    if (!need.trim()) { toast.error("Tell me what you need first."); return; }
    setBusy(true);
    setResult("");
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-prompt`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        body: JSON.stringify({ need, context, trackTitle }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Failed");
      setResult(j.prompt || "");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate");
    } finally {
      setBusy(false);
    }
  };

  const reset = () => { setNeed(""); setContext(""); setResult(""); };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>
        <Button className="rounded-full bg-pink text-white hover:bg-pink/90 font-bold">
          <Wand2 className="w-4 h-4 mr-1.5"/> Generate a prompt
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2"><Sparkles className="w-5 h-5 text-pink"/> Custom prompt, made for you</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>What do you need?</Label>
            <Textarea
              value={need}
              onChange={e => setNeed(e.target.value)}
              placeholder="e.g. A weekly email to my team that summarises wins, blockers and asks"
              rows={3}
              className="rounded-xl"
              maxLength={1000}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Any extra context? (optional)</Label>
            <Textarea
              value={context}
              onChange={e => setContext(e.target.value)}
              placeholder="Tone, audience, length, examples, anything that matters"
              rows={2}
              className="rounded-xl"
              maxLength={1000}
            />
          </div>

          {result && (
            <div className="space-y-2">
              <Label>Your prompt</Label>
              <pre className="p-4 bg-blush rounded-2xl text-sm whitespace-pre-wrap font-mono text-foreground/90 max-h-72 overflow-y-auto">{result}</pre>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" className="rounded-full" onClick={() => { navigator.clipboard.writeText(result); toast.success("Copied"); }}>
                  <Copy className="w-3.5 h-3.5 mr-1.5"/> Copy
                </Button>
                {onUseInChat && (
                  <Button size="sm" className="rounded-full bg-pink text-white hover:bg-pink/90" onClick={() => { onUseInChat(result); setOpen(false); }}>
                    <Sparkles className="w-3.5 h-3.5 mr-1.5"/> Use it with the agent
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" className="rounded-full" onClick={() => setOpen(false)}>Close</Button>
          <Button className="rounded-full bg-pink text-white hover:bg-pink/90" onClick={generate} disabled={busy}>
            {busy ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin"/> Crafting…</> : <><Wand2 className="w-4 h-4 mr-1.5"/> {result ? "Regenerate" : "Generate"}</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}