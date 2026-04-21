import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PricingPreview } from "@/components/landing/PricingPreview";
import { FAQ } from "@/components/landing/FAQ";

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="bg-gradient-warm grain pt-20 pb-4">
          <div className="container max-w-3xl text-center">
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-primary">Pricing</span>
            <h1 className="mt-4 font-display font-black text-5xl md:text-6xl leading-tight">
              One price.<br />
              <span className="italic text-gradient-sunrise">Pick the one that fits this week.</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              Cancel anytime. Switch tiers anytime. No annual contracts.
            </p>
          </div>
        </section>
        <PricingPreview />
        <FAQ />
      </main>
      <SiteFooter />
    </div>
  );
}