"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { logger } from "@/lib/logger";

/**
 * StitchHero — "Repair Sheet" hero for KitFix 2.0 (split edition).
 *
 * Design direction (frontend-design skill + sports-site research):
 * - Trending sport brands (Nike, JD Sports) lead with strong photography. The
 *   jersey-on-the-workbench photo is the story: tear + golden thread, one image.
 * - The photo was generated with FLUX.1-dev on NVIDIA NIM
 *   (`public/hero-repair-wide.jpg`, 1344×768, 7:4). It is shown at its natural
 *   ratio in a framed panel — NEVER cropped (a full-bleed cover crop cut the
 *   top/bottom on wide screens; split layout fixes that).
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
        { scale: 1.04, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.1, ease: "power2.out" }
      );
      tl.fromTo(
        headlineRef.current,
        { opacity: 0, y: 24 },
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

    logger.info("StitchHero mounted (split photo edition)");
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-[var(--color-pitch-deep)]">
      {/* Subtle radial glow behind the panel */}
      <div
        aria-hidden="true"
        className="absolute -right-32 top-0 h-[480px] w-[480px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(242,176,30,0.08) 0%, transparent 70%)" }}
      />

      <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-20">
        <div className="grid items-center gap-10 md:grid-cols-[1fr_1.1fr] md:gap-12 lg:gap-16">
          {/* Text */}
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

          {/* Photo — natural 7:4 ratio, never cropped */}
          <div
            ref={imgRef}
            className="relative border border-[var(--color-pitch-line)] border-t-2 border-t-[var(--color-stitch)] bg-[var(--color-pitch)]/30 p-3"
          >
            <Image
              src="/hero-repair-wide.jpg"
              alt="Forest green jersey with a tear, golden thread and needle ready for repair on the workbench"
              width={1344}
              height={768}
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="h-auto w-full"
            />
            {/* Gold corner stitch detail */}
            <span
              aria-hidden="true"
              className="absolute -bottom-3 left-6 h-6 w-[1px] bg-[var(--color-stitch)]"
            />
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
