import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ExternalLink, Download, Users, Video } from "lucide-react";
import { downloadICS } from "@/lib/ics";
import { toast } from "sonner";

type EventRow = {
  id: string; title: string; description: string | null;
  speaker_name: string | null; speaker_bio: string | null;
  starts_at: string; duration_minutes: number; timezone: string;
  platform: string | null; join_url: string | null; replay_url: string | null;
  cover_url: string | null; track_tags: string[];
};

export default function Events() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [rsvps, setRsvps] = useState<Set<string>>(new Set());

  useEffect(() => { if (!loading && !user) nav("/auth", { replace: true }); }, [loading, user, nav]);

  const load = async () => {
    const { data } = await supabase.from("events").select("*").eq("published", true).order("starts_at");
    setEvents((data ?? []) as EventRow[]);
    if (user) {
      const { data: r } = await supabase.from("event_rsvps").select("event_id").eq("user_id", user.id);
      setRsvps(new Set((r ?? []).map((x: any) => x.event_id)));
    }
  };
  useEffect(() => { if (user) load(); }, [user]);

  const toggleRsvp = async (id: string) => {
    if (!user) return;
    if (rsvps.has(id)) {
      await supabase.from("event_rsvps").delete().eq("event_id", id).eq("user_id", user.id);
      const next = new Set(rsvps); next.delete(id); setRsvps(next);
      toast("RSVP removed");
    } else {
      const { error } = await supabase.from("event_rsvps").insert({ event_id: id, user_id: user.id });
      if (error) return toast.error(error.message);
      setRsvps(new Set([...rsvps, id]));
      toast.success("You're in");
    }
  };

  const now = Date.now();
  const upcoming = events.filter(e => new Date(e.starts_at).getTime() >= now);
  const past = events.filter(e => new Date(e.starts_at).getTime() < now);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container py-10 pb-24">
        <div className="flex items-center gap-3 mb-2">
          <Calendar className="w-6 h-6 text-pink" />
          <h1 className="font-display font-black text-4xl">Events</h1>
        </div>
        <p className="text-muted-foreground">Live Q&amp;As, masterclasses and replays.</p>

        <section className="mt-10">
          <h2 className="font-display font-black text-2xl mb-4">Upcoming</h2>
          {upcoming.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground rounded-2xl bg-card border border-border">No events scheduled yet.</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-5">
              {upcoming.map(e => <EventCard key={e.id} ev={e} rsvped={rsvps.has(e.id)} onRsvp={toggleRsvp} />)}
            </div>
          )}
        </section>

        {past.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display font-black text-2xl mb-4">Replays</h2>
            <div className="grid md:grid-cols-2 gap-5">
              {past.map(e => <EventCard key={e.id} ev={e} rsvped={false} onRsvp={toggleRsvp} past />)}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function EventCard({ ev, rsvped, onRsvp, past }: { ev: EventRow; rsvped: boolean; onRsvp: (id: string) => void; past?: boolean }) {
  const d = new Date(ev.starts_at);
  const dateLabel = d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  const timeLabel = d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  return (
    <article className="p-6 rounded-3xl bg-card border border-border shadow-soft hover:shadow-pink transition-all">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Calendar className="w-3.5 h-3.5"/> {dateLabel}
        <span className="opacity-50">·</span>
        <Clock className="w-3.5 h-3.5"/> {timeLabel} {ev.timezone}
      </div>
      <h3 className="mt-2 font-display font-black text-xl leading-tight">{ev.title}</h3>
      {ev.speaker_name && <p className="mt-1 text-sm text-muted-foreground">with {ev.speaker_name}</p>}
      {ev.description && <p className="mt-3 text-sm text-foreground/80 line-clamp-3">{ev.description}</p>}
      <div className="mt-4 flex flex-wrap gap-2">
        {!past && (
          <Button onClick={() => onRsvp(ev.id)} size="sm" className={`rounded-full ${rsvped ? "bg-secondary text-secondary-foreground" : "bg-pink text-white hover:bg-pink/90"}`}>
            <Users className="w-3.5 h-3.5"/> {rsvped ? "Going" : "RSVP"}
          </Button>
        )}
        {!past && (
          <Button variant="outline" size="sm" className="rounded-full" onClick={() => downloadICS({
            id: ev.id, title: ev.title, description: ev.description || "",
            starts_at: ev.starts_at, duration_minutes: ev.duration_minutes,
            location: ev.platform || "", url: ev.join_url || "",
          })}>
            <Download className="w-3.5 h-3.5"/> .ics
          </Button>
        )}
        {!past && ev.join_url && (
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <a href={ev.join_url} target="_blank" rel="noreferrer"><ExternalLink className="w-3.5 h-3.5"/> Join link</a>
          </Button>
        )}
        {past && ev.replay_url && (
          <Button asChild size="sm" className="rounded-full bg-pink text-white hover:bg-pink/90">
            <a href={ev.replay_url} target="_blank" rel="noreferrer"><Video className="w-3.5 h-3.5"/> Watch replay</a>
          </Button>
        )}
      </div>
    </article>
  );
}