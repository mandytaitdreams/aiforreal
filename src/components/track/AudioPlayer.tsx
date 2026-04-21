import { useState } from "react";
import { Headphones, PlayCircle } from "lucide-react";

/** Detects whether a URL is an embed (iframe) or a direct audio file. */
const isEmbedUrl = (url: string) => {
  try {
    const u = new URL(url);
    if (u.hostname.includes("spotify.com") && u.pathname.startsWith("/embed")) return true;
    if (u.hostname.includes("soundcloud.com")) return true; // we'll use SC widget
    if (u.hostname.includes("anchor.fm") && u.pathname.includes("/embed")) return true;
    if (u.hostname.includes("podcasters.spotify.com")) return true;
    if (u.pathname.endsWith(".mp3") || u.pathname.endsWith(".m4a") || u.pathname.endsWith(".wav") || u.pathname.endsWith(".ogg")) return false;
    return true; // unknown host → treat as embeddable iframe (e.g. Spotify share)
  } catch { return false; }
};

const normalizeEmbed = (url: string) => {
  try {
    const u = new URL(url);
    if (u.hostname.includes("open.spotify.com")) {
      // turn https://open.spotify.com/episode/xxx into embed
      return `https://open.spotify.com/embed${u.pathname}`;
    }
    if (u.hostname.includes("soundcloud.com")) {
      return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff0054&auto_play=false&hide_related=true`;
    }
    return url;
  } catch { return url; }
};

/**
 * Renders either an HTML5 <audio> element (uploaded file or direct .mp3/.wav URL)
 * or an embedded iframe (Spotify, SoundCloud, etc.).
 */
export function AudioPlayer({ src, title }: { src: string; title?: string }) {
  if (isEmbedUrl(src)) {
    return (
      <iframe
        src={normalizeEmbed(src)}
        title={title ?? "Audio player"}
        className="w-full h-[152px] rounded-2xl border-0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      />
    );
  }
  return (
    <div className="w-full p-4 rounded-2xl bg-blush border border-border">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-pink mb-2">
        <Headphones className="w-3.5 h-3.5"/> Listen
      </div>
      <audio controls preload="none" src={src} className="w-full">
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}

/** Toggle between video iframe and audio player. */
export function ListenToggle({ mode, onChange, hasAudio }: { mode: "watch" | "listen"; onChange: (m: "watch" | "listen") => void; hasAudio: boolean }) {
  if (!hasAudio) return null;
  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-full bg-blush border border-border text-xs font-bold">
      <button
        type="button"
        onClick={() => onChange("watch")}
        className={`px-3 py-1 rounded-full transition-colors flex items-center gap-1 ${mode === "watch" ? "bg-pink text-white" : "text-foreground/70 hover:text-foreground"}`}
      >
        <PlayCircle className="w-3 h-3"/> Watch
      </button>
      <button
        type="button"
        onClick={() => onChange("listen")}
        className={`px-3 py-1 rounded-full transition-colors flex items-center gap-1 ${mode === "listen" ? "bg-pink text-white" : "text-foreground/70 hover:text-foreground"}`}
      >
        <Headphones className="w-3 h-3"/> Listen
      </button>
    </div>
  );
}