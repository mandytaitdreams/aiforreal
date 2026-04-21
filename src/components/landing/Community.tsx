import { Calendar, MessageSquare } from "lucide-react";

export const Community = () => (
  <section className="py-24 md:py-32 bg-[#fffdf7]">
    <div className="container grid md:grid-cols-2 gap-6">
      <div className="interactive-card p-10 rounded-[2.5rem] bg-[#e0c3fc] text-[#141414] cursor-default">
        <div className="hover-icon-wrap w-14 h-14 rounded-full bg-white flex items-center justify-center text-[#ff0054] mb-5">
          <MessageSquare className="w-6 h-6" />
        </div>
        <h2 className="font-display font-black text-3xl md:text-4xl leading-tight">Community</h2>
        <p className="mt-4 font-handwritten text-2xl text-[#ff0054] hover-invert">This is not a Facebook group.</p>
        <p className="mt-3 leading-relaxed hover-invert">
          The forum has four sections: <strong>Questions, Wins, Resources, Feedback.</strong> Every post is track-tagged
          and discoverable by members who join months later — which means the community compounds in value over time.
        </p>
        <p className="mt-4 leading-relaxed hover-invert">
          When you post "How do I price my offer?" today, a new member finds a rich, community-sourced answer in six months.
          That's the difference between a social media feed and a real community.
        </p>
      </div>

      <div className="interactive-card p-10 rounded-[2.5rem] bg-[#ffd60a] text-[#141414] cursor-default">
        <div className="hover-icon-wrap w-14 h-14 rounded-full bg-white flex items-center justify-center text-[#ff0054] mb-5">
          <Calendar className="w-6 h-6" />
        </div>
        <h2 className="font-display font-black text-3xl md:text-4xl leading-tight">Events</h2>
        <ul className="mt-5 space-y-3 leading-relaxed hover-invert">
          <li className="flex gap-2"><span className="text-[#ff0054] mt-1.5">♥</span><span><strong>Bi-weekly live Q&amp;A sessions</strong> — specific track topics, founder-hosted, questions answered in real time</span></li>
          <li className="flex gap-2"><span className="text-[#ff0054] mt-1.5">♥</span><span><strong>Monthly masterclasses</strong> — deep-dives with guest speakers relevant to where you are right now</span></li>
          <li className="flex gap-2"><span className="text-[#ff0054] mt-1.5">♥</span><span><strong>One-click Add to Calendar</strong> on every event — because we know your schedule is already full</span></li>
        </ul>
        <p className="mt-5 font-handwritten text-xl text-[#141414] hover-invert">Replays are always available for sessions you miss.</p>
      </div>
    </div>
  </section>
);
