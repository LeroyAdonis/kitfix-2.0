import LabHero from "@/components/landing/lab-hero";
import { Footer } from "@/components/layout/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#080808] text-white overflow-x-hidden">
      <main>
        <LabHero />
      </main>
      <Footer />
    </div>
  );
}
