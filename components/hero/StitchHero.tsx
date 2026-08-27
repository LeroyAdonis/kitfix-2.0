"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { logger } from "@/lib/logger";

/**
 * StitchHero — "Repair Sheet" hero for KitFix 2.0 (full-bleed, restaurant-height).
 *
 * Height recipe from The Golden Fork landing (header38): the hero is exactly
 * viewport height (`h-screen` capped at `max-h-[60rem]`), so the headline +
 * CTA always sit above the fold. At ~100vh the 1344×768 photo (7:4) nearly
 * matches a 16:9/16:10 container, so `object-cover` crops only a few percent
 * of dark edge — the story stays intact. Gradient dark-left carries the text.
 *
 * Photo: `public/hero-repair-wide.jpg` (1344×768, FLUX.1-dev on NVIDIA NIM).
 */
export default function StitchHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const seamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return;

      const tl = gsap.timeline({ delay: 0.1 });
      tl.fromTo(
        imgRef.current,
        { scale: 1.06, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.2, ease: "power2.out" }
      );
      tl.fromTo(
        headlineRef.current,
        { opacity: 0, y: 26 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" },
        0.25
      );
      tl.fromTo(
        subRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.55, ease: "power3.out" },
        0.4
      );
      tl.fromTo(
        ctaRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" },
        0.52
      );
      tl.fromTo(
        seamRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: 0.7, ease: "power2.inOut" },
        0.55
      );
    }, sectionRef);

    logger.info("StitchHero mounted (full-bleed restaurant-height edition)");
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-[var(--color-pitch-deep)]">
      {/* Desktop (lg+): full-bleed photo, viewport height — CTA always above the fold */}
      <div className="relative hidden lg:block lg:h-screen lg:max-h-[60rem] lg:min-h-[560px]">
        <div ref={imgRef} className="absolute inset-0">
          <Image
            src="/hero-repair-wide.jpg"
            alt="Forest green jersey with a tear, golden thread and needle ready for repair on the workbench"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>
        {/* Gradient: dark left for text legibility, fades right */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, var(--color-pitch-deep) 0%, rgba(23,53,26,0.92) 28%, rgba(23,53,26,0.45) 55%, transparent 78%)",
          }}
        />

        {/* Content — vertically centered (restaurant hero pattern) */}
        <div className="relative z-10 mx-auto flex h-full max-w-6xl items-center px-6">
          <div className="max-w-xl">
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.22em] text-[var(--color-stitch)]">
              Job Ref: KF-2026 — Jersey Repair &amp; Refresh
            </p>
            <h1
              ref={headlineRef}
              className="font-display text-[clamp(2rem,4vw,3.5rem)] leading-[0.95] uppercase tracking-[-0.01em] text-[var(--color-thread)]"
            >
              Kit
              <br />
              Repaired.
              <br />
              <span className="text-[var(--color-stitch)]">Kit</span>
              <br />
              Refreshed.
            </h1>
            <p ref={subRef} className="mt-6 max-w-[46ch] text-[var(--color-thread-dim)] text-base md:text-lg leading-relaxed">
              Jersey repairs, renumbers and badge restitches for{" "}
              <span className="font-medium text-[var(--color-thread)]">SA clubs and schools</span>{" "}
              — turned around in days, not weeks. Every stitch matches your
              kit&apos;s original thread, weave and wear.
            </p>
            <div ref={ctaRef} className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/repair/new"
                className="inline-flex items-center gap-2 bg-[var(--color-stitch)] px-8 py-4 text-base font-bold uppercase tracking-wide text-[var(--color-ink)] transition hover:brightness-110"
              >
                Kick Off a Repair
              </Link>
              <span className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-thread-dim)]">
                Photos in · quote in 60 min
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile/tablet (<lg): stacked — text, then photo at natural ratio */}
      <div className="lg:hidden">
        <div className="mx-auto max-w-6xl px-6 pt-14">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.22em] text-[var(--color-stitch)]">
            Job Ref: KF-2026 — Jersey Repair &amp; Refresh
          </p>
          <h1 className="font-display text-[clamp(2rem,4vw,3.5rem)] leading-[0.95] uppercase tracking-[-0.01em] text-[var(--color-thread)]">
            Kit
            <br />
            Repaired.
            <br />
            <span className="text-[var(--color-stitch)]">Kit</span>
            <br />
            Refreshed.
          </h1>
          <p className="mt-6 max-w-[46ch] text-[var(--color-thread-dim)] text-base leading-relaxed">
            Jersey repairs, renumbers and badge restitches for{" "}
            <span className="font-medium text-[var(--color-thread)]">SA clubs and schools</span>{" "}
            — turned around in days, not weeks. Every stitch matches your
            kit&apos;s original thread, weave and wear.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/repair/new"
              className="inline-flex items-center gap-2 bg-[var(--color-stitch)] px-8 py-4 text-base font-bold uppercase tracking-wide text-[var(--color-ink)] transition hover:brightness-110"
            >
              Kick Off a Repair
            </Link>
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-thread-dim)]">
              Photos in · quote in 60 min
            </span>
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-6 py-10">
          <Image
            src="/hero-repair-wide.jpg"
            alt="Forest green jersey with a tear, golden thread and needle ready for repair on the workbench"
            width={1344}
            height={768}
            priority
            sizes="100vw"
            className="h-auto w-full"
          />
        </div>
      </div>

      {/* Signature: the stitch seam */}
      <div
        ref={seamRef}
        aria-hidden="true"
        className="relative h-[6px] w-full origin-left"
        style={{
          background:
            "repeating-linear-gradient(90deg, var(--color-stitch) 0 14px, transparent 14px 22px)",
        }}
      />
    </section>
  );
}
