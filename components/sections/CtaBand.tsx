import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/Reveal";

const WHATSAPP_URL = "https://wa.me/27721234567";

export function CtaBand({ className = "" }: { className?: string }) {
  return (
    <section className={`px-6 py-20 md:py-28 ${className}`}>
      <div className="max-w-3xl mx-auto text-center">
        <Reveal>
          <h2 className="font-display text-4xl md:text-6xl uppercase text-[var(--color-thread)] leading-[0.95] mb-6">
            Don&apos;t bench that kit.
          </h2>
        </Reveal>
        <p className="mx-auto max-w-xl text-medium text-[var(--color-thread-dim)] leading-relaxed">
          Snap a photo, send it on WhatsApp, and get a fixed quote in about 60
          minutes. Approve it and we stitch — most kits are back in under a week.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 md:mt-10">
          <Button asChild size="default">
            <Link href="/repair/new">Start a Repair</Link>
          </Button>
          <Button asChild variant="secondary" size="default">
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              WhatsApp us
            </a>
          </Button>
        </div>
        <p className="mt-8 font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-thread-dim)]">
          Photos in · quote in 60 min · flat rates from R150
        </p>
      </div>
    </section>
  );
}