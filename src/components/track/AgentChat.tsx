import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string };

type Agent = { id: string; name: string; role: string; tagline: string; system_prompt: string; model: string };

export const AgentChat = ({ agent, trackId, seedPrompt }: { agent: Agent; trackId: string; seedPrompt?: string }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState(seedPrompt ?? "");
  const [streaming, setStreaming] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (seedPrompt) setInput(seedPrompt);
  }, [seedPrompt]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  const ensureConversation = async () => {
    if (conversationId || !user) return conversationId;
    const { data, error } = await supabase
      .from("agent_conversations")
      .insert({ user_id: user.id, agent_id: agent.id, track_id: trackId, title: `Chat with ${agent.name}` })
      .select("id")
      .single();
    if (error) { toast.error(error.message); return null; }
    setConversationId(data.id);
    return data.id;
  };

  const send = async () => {
    const text = input.trim();
    if (!text || streaming) return;
    if (!user) { toast.error("Please sign in"); return; }

    const convId = await ensureConversation();
    if (!convId) return;

    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setStreaming(true);

    // persist user message
    supabase.from("agent_messages").insert({ conversation_id: convId, user_id: user.id, role: "user", content: text });

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/agent-chat`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          system: agent.system_prompt,
          model: agent.model,
          messages: next.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok || !res.body) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Chat failed");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let assistant = "";
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const data = line.slice(5).trim();
          if (!data || data === "[DONE]") continue;
          try {
            const json = JSON.parse(data);
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) {
              assistant += delta;
              setMessages(prev => {
                const copy = [...prev];
                copy[copy.length - 1] = { role: "assistant", content: assistant };
                return copy;
              });
            }
          } catch { /* skip parse errors */ }
        }
      }

      // persist assistant message
      if (assistant) {
        await supabase.from("agent_messages").insert({ conversation_id: convId, user_id: user.id, role: "assistant", content: assistant });
      }
    } catch (e: any) {
      toast.error(e.message || "Chat failed");
      setMessages(prev => prev.filter(m => m.content !== ""));
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] rounded-3xl border border-border bg-card shadow-soft overflow-hidden">
      <div className="px-5 py-4 border-b border-border bg-blush flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center text-white font-display font-black">
          {agent.name[0]}
        </div>
        <div>
          <div className="font-display font-bold text-foreground">{agent.name}</div>
          <div className="text-xs text-muted-foreground">{agent.tagline}</div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Sparkles className="w-8 h-8 mx-auto mb-3 text-primary" />
            <p className="font-handwritten text-2xl text-foreground">Tell {agent.name} what's on your mind.</p>
            <p className="text-sm mt-2">Real situations. No fluff. One small win.</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] px-4 py-3 rounded-2xl ${
              m.role === "user"
                ? "bg-pink text-white rounded-br-sm"
                : "bg-blush text-foreground rounded-bl-sm"
            }`}>
              {m.role === "assistant" ? (
                <div className="prose prose-sm max-w-none prose-headings:font-display prose-headings:font-bold prose-p:my-2 prose-ul:my-2">
                  <ReactMarkdown>{m.content || "…"}</ReactMarkdown>
                </div>
              ) : (
                <div className="whitespace-pre-wrap text-sm">{m.content}</div>
              )}
            </div>
          </div>
        ))}
        {streaming && messages[messages.length - 1]?.role === "user" && (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> {agent.name} is thinking…
          </div>
        )}
      </div>

      <div className="border-t border-border p-3 bg-card">
        <div className="flex gap-2 items-end">
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={`Message ${agent.name}…`}
            rows={2}
            className="resize-none rounded-2xl"
          />
          <Button onClick={send} disabled={streaming || !input.trim()} className="rounded-full bg-pink text-white hover:bg-pink/90 h-12 w-12 p-0 shrink-0">
            {streaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};