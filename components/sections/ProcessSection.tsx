import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/Reveal";

const STEPS = [
  {
    no: "01",
    heading: "Photograph the damage",
    description:
      "WhatsApp or upload a few clear photos of the tear, number or badge. No forms, no fuss.",
    buttonText: "Send photos",
    href: "https://wa.me/27721234567",
    external: true,
  },
  {
    no: "02",
    heading: "Get a fixed quote",
    description:
      "Flat-rate pricing, confirmed in about 60 minutes. You approve the quote before we touch a thread.",
    buttonText: "See pricing",
    href: "#pricing",
    external: false,
  },
  {
    no: "03",
    heading: "Post or drop the kit",
    description:
      "Door-to-door courier anywhere in SA, or drop-off points in Joburg and Cape Town.",
    buttonText: "Repair a kit",
    href: "/repair/new",
    external: false,
  },
  {
    no: "04",
    heading: "Match-day ready",
    description:
      "Repaired kit returned with a stitch-quality checklist signed by the seamster.",
    buttonText: "Track my job",
    href: "/my-jobs",
    external: false,
  },
];

export function ProcessSection({ className = "" }: { className?: string }) {
  return (
    <section id="process" className={`px-6 py-16 md:py-24 ${className}`}>
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px w-5 bg-[var(--color-stitch)]/60" />
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-stitch)]">
              KF-02 — The Process
            </p>
          </div>
          <h2 className="font-display text-3xl md:text-5xl uppercase text-[var(--color-thread)] leading-[1.05]">
            From sideline to service in four touches.
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 place-items-start gap-x-8 gap-y-12 md:grid-cols-2 md:gap-y-16 lg:grid-cols-4">
          {STEPS.map((step) => (
            <div
              key={step.no}
              className="border-t border-dashed border-[var(--color-pitch-line)]/50 pt-5"
            >
              <span className="font-mono text-xs tracking-[0.2em] text-[var(--color-stitch)]">
                {step.no}
              </span>
              <h3 className="mt-3 mb-3 font-display text-lg uppercase text-[var(--color-thread)]">
                {step.heading}
              </h3>
              <p className="text-sm text-[var(--color-thread-dim)] leading-relaxed">
                {step.description}
              </p>
              <Button
                asChild
                variant="link"
                size="link"
                className="mt-6 md:mt-8"
                iconRight={<ArrowRight className="size-4" />}
              >
                {step.external ? (
                  <a href={step.href} target="_blank" rel="noopener noreferrer">
                    {step.buttonText}
                  </a>
                ) : (
                  <Link href={step.href}>{step.buttonText}</Link>
                )}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}