import Header from "@/components/Header";
import StitchHero from "@/components/hero/StitchHero";
import { StitchRule } from "@/components/StitchRule";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { ProcessSection } from "@/components/sections/ProcessSection";
import { PricingSection } from "@/components/sections/PricingSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { FaqSection } from "@/components/sections/FaqSection";
import { CtaBand } from "@/components/sections/CtaBand";
import { SiteFooter } from "@/components/sections/SiteFooter";

const STATS = [
  { big: "850+", cap: "Kits back on the pitch" },
  { big: "120", cap: "Clubs & schools served" },
  { big: "6wk", cap: "Avg. season saved per kit" },
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

      <TestimonialsSection />

      <FaqSection />

      <StitchRule />

      <CtaBand />

      <SiteFooter />
    </div>
  );
}