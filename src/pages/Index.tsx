import { SiteFooter } from "@/components/SiteFooter";
import { Hero } from "@/components/landing/Hero";
import { Problem } from "@/components/landing/Problem";
import { Solution } from "@/components/landing/Solution";
import { ProblemSolutionTabs } from "@/components/landing/ProblemSolutionTabs";
import { TracksGrid } from "@/components/landing/TracksGrid";
import { WhatYouGet } from "@/components/landing/WhatYouGet";
import { AgentTeam } from "@/components/landing/AgentTeam";
import { Community } from "@/components/landing/Community";
import { WinsWall } from "@/components/landing/WinsWall";
import { Founder } from "@/components/landing/Founder";
import { PricingPreview } from "@/components/landing/PricingPreview";
import { Compare } from "@/components/landing/Compare";
import { FAQ } from "@/components/landing/FAQ";
import { FinalCTA } from "@/components/landing/FinalCTA";

const Index = () => (
  <div className="min-h-screen bg-background">
    {/* Per Dopamine Daydream spec: no header on landing page */}
    <main>
      <Hero />
      <Problem />
      <Solution />
      <ProblemSolutionTabs />
      <TracksGrid />
      <WhatYouGet />
      <AgentTeam />
      <Community />
      <WinsWall />
      <Founder />
      <PricingPreview />
      <Compare />
      <FAQ />
      <FinalCTA />
    </main>
    <SiteFooter />
  </div>
);

export default Index;
