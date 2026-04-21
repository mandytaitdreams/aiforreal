// Tiny .ics generator — RFC 5545 minimal subset, no library.
function pad(n: number) { return String(n).padStart(2, "0"); }
function toICSDate(d: Date) {
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    "Z"
  );
}
function escapeText(s: string) {
  return (s || "").replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

export type ICSEvent = {
  id: string;
  title: string;
  description?: string;
  starts_at: string | Date;
  duration_minutes: number;
  location?: string;
  url?: string;
};

export function buildICS(ev: ICSEvent): string {
  const start = new Date(ev.starts_at);
  const end = new Date(start.getTime() + (ev.duration_minutes || 60) * 60_000);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//AI For Real Life//Events//EN",
    "BEGIN:VEVENT",
    `UID:${ev.id}@aiforreal.life`,
    `DTSTAMP:${toICSDate(new Date())}`,
    `DTSTART:${toICSDate(start)}`,
    `DTEND:${toICSDate(end)}`,
    `SUMMARY:${escapeText(ev.title)}`,
    ev.description ? `DESCRIPTION:${escapeText(ev.description)}` : "",
    ev.location ? `LOCATION:${escapeText(ev.location)}` : "",
    ev.url ? `URL:${ev.url}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);
  return lines.join("\r\n");
}

export function downloadICS(ev: ICSEvent) {
  const blob = new Blob([buildICS(ev)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${ev.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}