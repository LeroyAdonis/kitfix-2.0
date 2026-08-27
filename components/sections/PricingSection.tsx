import Link from "next/link";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/Reveal";

type Tier = {
  name: string;
  price: string;
  desc: string;
  features: string[];
  highlight?: boolean;
};

const TIERS: Tier[] = [
  {
    name: "Basic Repair",
    price: "R150",
    desc: "Torn seams, loose stitching, small holes.",
    features: ["Seam & tear restitch", "Matching thread & backing", "3-day turnaround"],
  },
  {
    name: "Complex Repair",
    price: "R250",
    desc: "Large tears, number/name replacement, panel repair.",
    highlight: true,
    features: [
      "Large tear & panel repair",
      "Number / name replacement",
      "Badge restitch or rebadge",
      "4-day turnaround",
    ],
  },
  {
    name: "Full Refresh",
    price: "R400",
    desc: "Multiple repairs + deep clean. Like new.",
    features: [
      "Everything in Complex",
      "Deep clean & re-grease zips",
      "Stitch-quality checklist",
      "Up to 7-day turnaround",
    ],
  },
];

export function PricingSection({ className = "" }: { className?: string }) {
  return (
    <section id="pricing" className={`px-6 py-16 md:py-24 ${className}`}>
      <div className="max-w-6xl mx-auto">
        <div className="mx-auto mb-12 max-w-2xl text-center md:mb-18 lg:mb-20">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-stitch)] md:mb-4">
            No hidden fees · pay when it&apos;s done
          </p>
          <Reveal>
            <h2 className="font-display text-3xl md:text-5xl uppercase text-[var(--color-thread)]">
              Flat Rates
            </h2>
          </Reveal>
          <p className="mt-4 text-medium text-[var(--color-thread-dim)] leading-relaxed">
            A fixed quote per repair, confirmed before we stitch a single thread.
            Most quotes within 60 minutes of your photos.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {TIERS.map((tier) => (
            <Card
              key={tier.name}
              className={`flex h-full flex-col px-6 py-8 md:p-8 ${
                tier.highlight ? "border-[var(--color-stitch)]/70" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-thread-dim)]">
                  {tier.name}
                </h3>
                {tier.highlight && (
                  <span className="border border-[var(--color-stitch)] bg-[var(--color-stitch)] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-ink)]">
                    Most repaired
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-[var(--color-thread-dim)]">{tier.desc}</p>

              <div className="my-8 h-px w-full bg-[var(--color-pitch-line)]/50" />

              <div className="mb-2 flex items-baseline gap-2">
                <span className="font-display text-5xl text-[var(--color-stitch)]">
                  {tier.price}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-thread-dim)]">
                  flat · incl. VAT
                </span>
              </div>

              <div className="mt-6 md:mt-8">
                <Button asChild className="w-full">
                  <Link href="/repair/new">Start your repair</Link>
                </Button>
              </div>

              <div className="my-8 h-px w-full bg-[var(--color-pitch-line)]/50" />

              <ul className="grid grid-cols-1 gap-y-4 py-2">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex self-start">
                    <Check
                      aria-hidden="true"
                      className="mr-4 size-5 flex-none text-[var(--color-stitch)]"
                    />
                    <span className="text-sm text-[var(--color-thread)]">{feature}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}