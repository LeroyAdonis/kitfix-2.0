"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface HeroScrollVideoRevealProps {
  videoSrc: string;
  headlineTop?: string;
  headlineAccent?: string;
  ctaLabel?: string;
  ctaHref?: string;
  jobRef?: string;
}

/**
 * Hero scroll video pin reveal — the video is covered by a dark plate, then
 * pinned as you scroll: the plate fades, the video zooms to settle, and the
 * headline rises in. Unpins into the next section.
 */
export default function HeroScrollVideoReveal({
  videoSrc,
  headlineTop = "Kit Repaired.",
  headlineAccent = "Refreshed.",
  ctaLabel = "Kick Off a Repair",
  ctaHref = "/repair/new",
  jobRef = "KF-2026 — JERSEY REPAIR & REFRESH",
}: HeroScrollVideoRevealProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoWrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=160%",
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        },
      });

      tl.fromTo(
        videoWrapRef.current,
        { scale: 1.3, filter: "brightness(0.45)" },
        { scale: 1, filter: "brightness(1)", ease: "none" },
        0,
      )
        .fromTo(
          headlineRef.current,
          { opacity: 0, y: 64 },
          { opacity: 1, y: 0, ease: "none" },
          0.1,
        )
        .to(coverRef.current, { opacity: 0, ease: "none" }, 0.45);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden bg-[#0d0f0d]"
      aria-label="Hero"
    >
      {/* Pre-reveal cover plate */}
      <div
        ref={coverRef}
        className="absolute inset-0 z-20 bg-[#0d0f0d]"
        aria-hidden="true"
      />

      {/* Video — zooms + brightens as you scroll */}
      <div
        ref={videoWrapRef}
        className="absolute inset-0 will-change-transform"
        aria-hidden="true"
      >
        <video
          ref={videoRef}
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="h-full w-full object-cover"
        />
      </div>

      {/* Gradient + headline overlay */}
      <div className="absolute inset-0 z-30 flex items-center justify-center bg-gradient-to-b from-[#0d0f0d]/70 via-[#0d0f0d]/20 to-[#0d0f0d]">
        <div ref={headlineRef} className="px-6 text-center">
          <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--color-stitch)] md:text-xs">
            JOB REF: {jobRef}
          </p>
          <h1 className="font-display text-4xl uppercase leading-tight tracking-wide text-[var(--color-thread)] md:text-6xl lg:text-7xl">
            {headlineTop}
            <br />
            <span className="text-[var(--color-stitch)]">{headlineAccent}</span>
          </h1>
          <Link
            href={ctaHref}
            className="mt-8 inline-block bg-[var(--color-stitch)] px-6 py-3 font-bold text-sm uppercase tracking-wide text-[var(--color-ink)] transition hover:brightness-110"
          >
            {ctaLabel}
          </Link>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-6 left-1/2 z-30 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--color-thread-dim)]">
        Scroll to reveal
      </div>
    </section>
  );
}
