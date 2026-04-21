export const Founder = () => (
  <section className="py-20 md:py-24 bg-[#fffdf7]">
    <div className="container max-w-3xl">
      <div className="p-10 md:p-14 rounded-[2.5rem] bg-[#2a1b3d] text-white relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-[280px] h-[280px] rounded-full bg-[#ff0054]/30 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-brand flex items-center justify-center font-display font-black text-2xl text-white shadow-pink">
              A
            </div>
            <div>
              <div className="font-display font-bold text-lg">Amanda</div>
              <div className="text-sm text-white/70">Founder, AI For Real Life</div>
            </div>
          </div>
          <p className="font-handwritten text-2xl md:text-3xl text-[#ffd60a] leading-snug">
            "I built this because I was tired, ambitious, and done with AI training that treated me like a beginner who just needed to 'be consistent.'"
          </p>
          <p className="mt-5 text-white/85 text-lg leading-relaxed">
            I needed AI to help with my actual life. So I built the platform I couldn't find anywhere else.
          </p>
        </div>
      </div>
    </div>
  </section>
);
