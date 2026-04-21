import { Video, Library, Wrench, ListMusic, Bot } from "lucide-react";

const features = [
  { icon: <Video className="w-5 h-5" />, title: "Video library", body: "Short, practical videos answering the questions you actually have. Audio mode included — because most of us are listening while doing something else." },
  { icon: <Library className="w-5 h-5" />, title: "Prompt library", body: "20 curated prompts per track, written in plain language, grouped by when you'd use them. One click to copy. One click to try with your AI agent." },
  { icon: <Wrench className="w-5 h-5" />, title: "Foundation toolkit", body: "The 5–8 most important things to understand, the best tools for this track, and templates you can use immediately." },
  { icon: <ListMusic className="w-5 h-5" />, title: "Curated playlists", body: "Free YouTube content, hand-picked and organised by track, clearly credited to the original creators." },
  { icon: <Bot className="w-5 h-5" />, title: "Your AI agent", body: "One click to the agent built for this track, with your context already loaded." },
];

export const WhatYouGet = () => (
  <section className="py-24 md:py-32 bg-[#fff0f5]">
    <div className="container grid md:grid-cols-2 gap-14 items-start">
      <div>
        <h2 className="font-display font-black text-4xl md:text-6xl leading-tight text-[#141414]">
          Inside <span className="font-handwritten text-[#ff0054] font-normal">every track.</span>
        </h2>
        <p className="mt-6 text-lg text-[#141414]/75 leading-relaxed">
          Every track contains five things — designed for women who access the platform between meetings, during school pickup, or after the kids are asleep.
        </p>
      </div>
      <div className="space-y-3">
        {features.map((f, i) => (
          <div key={i} className="interactive-card p-6 rounded-[2rem] bg-white border border-[#ffe0eb] flex gap-4 cursor-default">
            <div className="hover-icon-wrap shrink-0 w-12 h-12 rounded-full bg-[#fff0f5] flex items-center justify-center text-[#ff0054]">
              {f.icon}
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-[#141414] hover-invert">{f.title}</h3>
              <p className="mt-1 text-sm text-[#141414]/80 hover-invert leading-relaxed">{f.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
