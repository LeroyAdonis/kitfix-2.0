"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import JerseySVG from "./JerseySVG";
import { logger } from "@/lib/logger";

/**
 * StitchHero — "Repair Sheet" hero for KitFix 2.0.
 *
 * Design direction (frontend-design skill):
 * - Ground in the subject: pitch green field, bone thread, gold stitch.
 * - Hero is a thesis: "KIT REPAIRED. KIT REFRESHED." — the jersey is the
 *   most characteristic object in the subject's world.
 * - Signature element: the stitch seam that runs across the hero (a row of
 *   dashes, like real jersey stitching) — appears as the one memorable detail.
 * - Motion is deliberate: a single orchestrated load moment (jersey draw-in,
 *   stitch seam draw, headline rise). No scattered effects, reduced-motion safe.
 */
export default function StitchHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const jerseyRef = useRef<SVGSVGElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const seamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return;

      const tl = gsap.timeline({ delay: 0.1 });
      tl.fromTo(
        jerseyRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" }
      );
      tl.fromTo(
        seamRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: 0.8, ease: "power2.inOut" },
        0.3
      );
      tl.fromTo(
        headlineRef.current,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" },
        0.5
      );
      tl.fromTo(
        panelRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
        0.7
      );
    }, sectionRef);

    logger.info("StitchHero mounted");
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden pt-10 pb-16 md:pt-16 md:pb-24"
    >
      {/* faint pitch circle, like a centre-circle watermark */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -right-40 w-[520px] h-[520px] rounded-full border border-[var(--color-pitch-line)]/30"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-28 -right-28 w-[440px] h-[440px] rounded-full border border-[var(--color-pitch-line)]/20"
      />

      <div className="relative max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-10 lg:gap-14 items-end">
          {/* Left: thesis headline */}
          <div>
            <p className="font-mono text-xs tracking-[0.22em] uppercase text-[var(--color-stitch)] mb-6">
              Job Ref: KF-2026 — Jersey Repair &amp; Refresh
            </p>
            <h1
              ref={headlineRef}
              className="font-display text-[clamp(3rem,8vw,6.5rem)] leading-[0.92] uppercase tracking-[-0.01em] text-[var(--color-thread)]"
            >
              Kit
              <br />
              Repaired.
              <br />
              <span className="text-[var(--color-stitch)]">Kit</span>
              <br />
              Refreshed.
            </h1>
            <p className="mt-8 max-w-[46ch] text-[var(--color-thread-dim)] text-base md:text-lg leading-relaxed">
              Jersey repairs, renumbers and badge restitches for{" "}
              <span className="text-[var(--color-thread)] font-medium">
                SA clubs and schools
              </span>{" "}
              — turned around in days, not weeks. Every stitch matches your
              kit&apos;s original thread, weave and wear.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href="https://wa.me/27721234567"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--color-stitch)] text-[var(--color-ink)] font-bold text-base uppercase tracking-wide hover:brightness-110 transition"
              >
                Kick Off a Repair
              </a>
              <span className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-thread-dim)]">
                Photos in · quote in 60 min
              </span>
            </div>
          </div>

          {/* Right: jersey + match-day panel */}
          <div className="flex flex-col gap-6">
            <JerseySVG svgRef={jerseyRef} className="w-full max-w-md mx-auto h-auto" />
            <div
              ref={panelRef}
              className="border border-[var(--color-pitch-line)]/50 bg-[var(--color-pitch)]/40 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-thread-dim)]">
                  Match-day readiness
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-stitch)]">
                  Std: 3–5 days
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="font-display text-3xl text-[var(--color-stitch)]">4.9</div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-thread-dim)] mt-1">
                    Club rating
                  </div>
                </div>
                <div>
                  <div className="font-display text-3xl text-[var(--color-stitch)]">R180</div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-thread-dim)] mt-1">
                    Flat repair rate
                  </div>
                </div>
                <div>
                  <div className="font-display text-3xl text-[var(--color-stitch)]">850+</div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-thread-dim)] mt-1">
                    Kits saved
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Signature: the stitch seam */}
        <div
          ref={seamRef}
          aria-hidden="true"
          className="mt-14 h-[6px] w-full origin-left"
          style={{
            background:
              "repeating-linear-gradient(90deg, var(--color-stitch) 0 14px, transparent 14px 22px)",
          }}
        />
      </div>
    </section>
  );
}
