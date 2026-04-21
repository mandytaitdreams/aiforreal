import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { PlayCircle, Sparkles, Target, Trophy } from "lucide-react";

type Mom = { lessons: number; prompts: number; challenges: number; wins: number };

export const MomentumBar = () => {
  const { user } = useAuth();
  const [m, setM] = useState<Mom>({ lessons: 0, prompts: 0, challenges: 0, wins: 0 });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.rpc("week_momentum", { _user: user.id });
      const row = Array.isArray(data) ? (data[0] as any) : data;
      if (row) setM({ lessons: row.lessons ?? 0, prompts: row.prompts ?? 0, challenges: row.challenges ?? 0, wins: row.wins ?? 0 });
    })();
  }, [user]);

  const total = m.lessons + m.prompts + m.challenges + m.wins;

  return (
    <div className="p-5 rounded-3xl bg-card border border-border shadow-soft">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold">This week's momentum</h3>
        {total === 0 ? (
          <span className="text-xs text-muted-foreground">A small step counts.</span>
        ) : (
          <span className="text-xs text-pink font-bold">{total} action{total === 1 ? "" : "s"}</span>
        )}
      </div>
      <div className="mt-3 grid grid-cols-4 gap-3">
        <Tile icon={<PlayCircle className="w-3.5 h-3.5"/>} label="Lessons" value={m.lessons} />
        <Tile icon={<Sparkles className="w-3.5 h-3.5"/>} label="Prompts" value={m.prompts} />
        <Tile icon={<Target className="w-3.5 h-3.5"/>} label="Challenges" value={m.challenges} />
        <Tile icon={<Trophy className="w-3.5 h-3.5"/>} label="Wins" value={m.wins} />
      </div>
    </div>
  );
};

const Tile = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) => (
  <div className={`px-3 py-2 rounded-2xl ${value > 0 ? "bg-pink/10" : "bg-blush/40"} border border-border`}>
    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">{icon}{label}</div>
    <div className="font-display font-black text-2xl mt-0.5">{value}</div>
  </div>
);