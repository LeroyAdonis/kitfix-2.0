import LabHero from "@/components/landing/lab-hero";
import MobileLabHero from "@/components/landing/lab-hero-mobile";
import { Footer } from "@/components/layout/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-surface-deep text-white overflow-x-hidden">
      <main>
        {/* Desktop: pinned scroll animation (lg+) */}
        <div className="hidden lg:block">
          <LabHero />
        </div>

        {/* Mobile: stacked cards (<lg) */}
        <div className="lg:hidden">
          <MobileLabHero />
        </div>
      </main>
      <Footer />
    </div>
  );
}
