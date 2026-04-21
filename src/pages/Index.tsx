import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Hero } from "@/components/landing/Hero";
import { Problem } from "@/components/landing/Problem";
import { TracksGrid } from "@/components/landing/TracksGrid";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { PricingPreview } from "@/components/landing/PricingPreview";
import { FAQ } from "@/components/landing/FAQ";
import { FinalCTA } from "@/components/landing/FinalCTA";

const Index = () => (
  <div className="min-h-screen bg-background">
    <SiteHeader />
    <main>
      <Hero />
      <Problem />
      <TracksGrid />
      <HowItWorks />
      <PricingPreview />
      <FAQ />
      <FinalCTA />
    </main>
    <SiteFooter />
  </div>
);

export default Index;
