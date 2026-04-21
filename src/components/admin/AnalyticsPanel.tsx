import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, Users, MessageCircle, Bookmark, Activity } from "lucide-react";

type Signup = { day: string; signups: number };
type Usage = { agent_id: string; agent_name: string; messages: number; conversations: number };
type Save = { item_type: string; item_id: string; saves: number };
type Retention = { bucket: string; users: number };

export const AnalyticsPanel = () => {
  const [signups, setSignups] = useState<Signup[]>([]);
  const [usage, setUsage] = useState<Usage[]>([]);
  const [saves, setSaves] = useState<Save[]>([]);
  const [retention, setRetention] = useState<Retention[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [s, u, sv, r] = await Promise.all([
        supabase.rpc("analytics_signups", { _days: 30 }),
        supabase.rpc("analytics_ai_usage", { _days: 30 }),
        supabase.rpc("analytics_top_saves", { _limit: 10 }),
        supabase.rpc("analytics_retention"),
      ]);
      setSignups((s.data ?? []) as Signup[]);
      setUsage((u.data ?? []) as Usage[]);
      setSaves((sv.data ?? []) as Save[]);
      setRetention((r.data ?? []) as Retention[]);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="text-muted-foreground py-8">Loading analytics…</div>;

  const totalSignups = signups.reduce((a, b) => a + b.signups, 0);
  const maxDay = Math.max(1, ...signups.map(s => s.signups));
  const totalMessages = usage.reduce((a, b) => a + b.messages, 0);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat icon={Users} label="Signups (30d)" value={totalSignups} />
        <Stat icon={MessageCircle} label="AI replies (30d)" value={totalMessages} />
        <Stat icon={Activity} label="Active 7d" value={retention.find(r => r.bucket === "active_7d")?.users ?? 0} />
        <Stat icon={Activity} label="Active 30d" value={retention.find(r => r.bucket === "active_30d")?.users ?? 0} />
      </div>

      <section className="rounded-3xl bg-card border border-border p-6 shadow-soft">
        <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-pink"/>Signups · last 30 days</h3>
        {signups.length === 0 ? (
          <p className="text-sm text-muted-foreground">No signups yet.</p>
        ) : (
          <div className="flex items-end gap-1 h-32">
            {signups.map(s => (
              <div key={s.day} className="flex-1 flex flex-col items-center gap-1" title={`${s.day}: ${s.signups}`}>
                <div className="w-full bg-pink rounded-t" style={{ height: `${(s.signups / maxDay) * 100}%`, minHeight: 2 }} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-3xl bg-card border border-border p-6 shadow-soft">
        <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2"><MessageCircle className="w-5 h-5 text-pink"/>AI usage by agent · 30d</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr><th className="text-left py-2">Agent</th><th className="text-right">Conversations</th><th className="text-right">Messages</th></tr>
            </thead>
            <tbody>
              {usage.map(u => (
                <tr key={u.agent_id} className="border-t border-border">
                  <td className="py-2 font-medium">{u.agent_name}</td>
                  <td className="text-right">{u.conversations}</td>
                  <td className="text-right">{u.messages}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-3xl bg-card border border-border p-6 shadow-soft">
        <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2"><Bookmark className="w-5 h-5 text-pink"/>Top saved items</h3>
        {saves.length === 0 ? (
          <p className="text-sm text-muted-foreground">No saves yet.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {saves.map(s => (
              <li key={s.item_id} className="flex justify-between border-b border-border pb-2">
                <span className="capitalize text-foreground/80">{s.item_type}</span>
                <span className="font-mono text-xs text-muted-foreground truncate max-w-[60%]">{s.item_id}</span>
                <span className="font-bold text-pink">{s.saves}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

const Stat = ({ icon: Icon, label, value }: { icon: any; label: string; value: number }) => (
  <div className="rounded-2xl bg-card border border-border p-4 shadow-soft">
    <div className="flex items-center gap-2 text-muted-foreground text-xs"><Icon className="w-4 h-4"/>{label}</div>
    <div className="font-display font-black text-3xl mt-1">{value}</div>
  </div>
);