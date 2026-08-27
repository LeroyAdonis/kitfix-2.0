import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/Reveal";

type Service = {
  no: string;
  title: string;
  description: string;
};

const SERVICES: Service[] = [
  {
    no: "01",
    title: "Tear & Seam Repair",
    description:
      "Torn shoulders, split seams and pitch burns repaired with matching thread and reinforced backing. Invisible from a metre away.",
  },
  {
    no: "02",
    title: "Renumber & Rebadge",
    description:
      "Heat-pressed numbers and badges removed cleanly, replaced with official-style lettering that survives the wash cycle and the season.",
  },
  {
    no: "03",
    title: "Zips, Cuffs & Collars",
    description:
      "Jacket zips, goalkeeper cuffs and collar elastic replaced to original spec — the parts manufacturers stop making, we keep in stock.",
  },
];

export function ServicesSection({ className = "" }: { className?: string }) {
  return (
    <section id="services" className={`px-6 py-16 md:py-24 ${className}`}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 grid grid-cols-1 items-start gap-5 md:grid-cols-2 md:gap-x-12 lg:gap-x-20">
          <div>
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-stitch)] md:mb-4">
              KF-01 — Services
            </p>
            <Reveal>
              <h2 className="font-display text-3xl md:text-5xl uppercase text-[var(--color-thread)]">
                The Repair Sheet
              </h2>
            </Reveal>
          </div>
          <p className="text-medium text-[var(--color-thread-dim)] leading-relaxed md:pt-10">
            Anything a kit can throw at a season — we stitch it back. One photo,
            one fixed quote, one repair sheet per item. No surprises on the
            workbench.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-y-12 md:grid-cols-3 md:gap-x-8 lg:gap-x-12">
          {SERVICES.map((service) => (
            <div
              key={service.no}
              className="flex flex-col border border-[var(--color-pitch-line)] bg-[var(--color-pitch)]/30 p-6 md:p-8 border-t-2 border-t-[var(--color-stitch)]"
            >
              <div
                aria-hidden="true"
                className="mb-5 flex-none w-fit border border-[var(--color-stitch)]/50 px-3 py-1.5"
              >
                <span className="font-mono text-sm tracking-[0.2em] text-[var(--color-stitch)]">
                  {service.no}
                </span>
              </div>
              <h3 className="mb-4 font-display text-xl uppercase text-[var(--color-thread)]">
                {service.title}
              </h3>
              <p className="text-sm text-[var(--color-thread-dim)] leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-4 md:mt-18 lg:mt-20">
          <Button asChild size="default">
            <Link href="/repair/new">Start a Repair</Link>
          </Button>
          <Button asChild variant="link" size="link" iconRight={<ArrowRight className="size-4" />}>
            <Link href="#pricing">See flat rates</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}