import Header from "@/components/Header";
import StitchHero from "@/components/hero/StitchHero";
import { StitchRule } from "@/components/StitchRule";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { ProcessSection } from "@/components/sections/ProcessSection";
import { PricingSection } from "@/components/sections/PricingSection";
// TestimonialsSection is intentionally not imported — see the comment where it used to render.
import { FaqSection } from "@/components/sections/FaqSection";
import { CtaBand } from "@/components/sections/CtaBand";
import { SiteFooter } from "@/components/sections/SiteFooter";

// These were invented performance claims — "850+ kits back on the pitch", "120 clubs & schools
// served", "6wk avg. season saved" — on a business that has not yet taken a single live order. They
// are replaced with published pricing facts, which are true and checkable. Restore real numbers only
// when there are real jobs to count.
const STATS = [
  { big: "R150", cap: "From — Basic repair" },
  { big: "R250", cap: "Complex repair" },
  { big: "R400", cap: "Full refresh" },
  { big: "R0", cap: "Quoting fee — send photos" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--color-pitch-deep)]">
      <Header />

      <StitchHero />

      <StitchRule />

      <ServicesSection />

      <StitchRule />

      {/* Stats */}
      <section className="px-6 py-12">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s) => (
            <div key={s.cap}>
              <div className="font-display text-4xl md:text-5xl text-[var(--color-stitch)]">
                {s.big}
              </div>
              <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--color-thread-dim)]">
                {s.cap}
              </div>
            </div>
          ))}
        </div>
      </section>

      <StitchRule />

      <ProcessSection />

      <StitchRule />

      <PricingSection />

      <StitchRule />

      {/* Testimonials are deliberately NOT rendered yet. TestimonialsSection.tsx ships invented
          quotes, invented customer names and Unsplash stock portraits ("Michael Ndlovu, Head Coach,
          Durban North FC") for a business with no completed jobs. Publishing fabricated social proof
          is both a standing honesty violation and a payment-provider risk flag. Put the section back
          the moment there are real, attributed quotes to show. */}

      <FaqSection />

      <StitchRule />

      <CtaBand />

      <SiteFooter />
    </div>
  );
}