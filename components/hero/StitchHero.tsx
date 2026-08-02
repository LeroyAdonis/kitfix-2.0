"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { logger } from "@/lib/logger";

/**
 * StitchHero — "Repair Sheet" hero for KitFix 2.0 (full-bleed photo edition).
 *
 * Design direction (frontend-design skill + sports-site research):
 * - Trending sport brands (Nike, JD Sports) use full-bleed photography with a
 *   minimal headline overlay + single CTA. Line-art SVG read as "illustration",
 *   not "premium". The hero is now a real photograph: a jersey on the workbench,
 *   tear + golden thread — the repair story told in one image.
 * - The jersey photo was generated with FLUX.1-dev on NVIDIA NIM
 *   (`public/hero-repair-wide.jpg`, 1344×768). Dark left side has negative
 *   space for the headline overlay.
 * - Signature stays: the gold stitch seam runs under the hero.
 * - Motion is deliberate: one orchestrated load moment (image settle, headline
 *   rise, seam draw), reduced-motion safe.
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
        { scale: 1.08, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.4, ease: "power2.out" }
      );
      tl.fromTo(
        headlineRef.current,
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
        0.3
      );
      tl.fromTo(
        subRef.current,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
        0.5
      );
      tl.fromTo(
        ctaRef.current,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" },
        0.65
      );
      tl.fromTo(
        seamRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: 0.8, ease: "power2.inOut" },
        0.7
      );
    }, sectionRef);

    logger.info("StitchHero mounted (full-bleed photo)");
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-[var(--color-pitch-deep)]">
      {/* Full-bleed photo background */}
      <div ref={imgRef} className="absolute inset-0">
        <Image
          src="/hero-repair-wide.jpg"
          alt="Forest green jersey with a tear, golden thread and needle ready for repair on the workbench"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Gradient overlay: dark on the left for text legibility, fading to transparent right */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(23,53,26,0.94) 0%, rgba(23,53,26,0.82) 28%, rgba(23,53,26,0.35) 55%, rgba(23,53,26,0.05) 100%)",
          }}
        />
        {/* Vertical bottom fade so the seam reads clean */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-24"
          style={{ background: "linear-gradient(0deg, var(--color-pitch-deep) 0%, transparent 100%)" }}
        />
      </div>

      {/* Content */}
      <div className="relative max-w-6xl mx-auto px-6 pt-28 pb-32 md:pt-40 md:pb-44 min-h-[70vh] flex items-end">
        <div className="max-w-xl">
          <p className="font-mono text-xs tracking-[0.22em] uppercase text-[var(--color-stitch)] mb-6">
            Job Ref: KF-2026 — Jersey Repair &amp; Refresh
          </p>
          <h1
            ref={headlineRef}
            className="font-display text-[clamp(3rem,8vw,6rem)] leading-[0.92] uppercase tracking-[-0.01em] text-[var(--color-thread)]"
          >
            Kit
            <br />
            Repaired.
            <br />
            <span className="text-[var(--color-stitch)]">Kit</span>
            <br />
            Refreshed.
          </h1>
          <p ref={subRef} className="mt-8 max-w-[46ch] text-[var(--color-thread-dim)] text-base md:text-lg leading-relaxed">
            Jersey repairs, renumbers and badge restitches for{" "}
            <span className="text-[var(--color-thread)] font-medium">SA clubs and schools</span>{" "}
            — turned around in days, not weeks. Every stitch matches your
            kit&apos;s original thread, weave and wear.
          </p>
          <div ref={ctaRef} className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/repair/new"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--color-stitch)] text-[var(--color-ink)] font-bold text-base uppercase tracking-wide hover:brightness-110 transition"
            >
              Kick Off a Repair
            </Link>
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-thread-dim)]">
              Photos in · quote in 60 min
            </span>
          </div>
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
