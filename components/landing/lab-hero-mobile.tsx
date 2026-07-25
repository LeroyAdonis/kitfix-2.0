"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

gsap.registerPlugin(useGSAP, ScrollTrigger, DrawSVGPlugin);

const MOBILE_STAGES = [
  {
    id: "arrival",
    label: "01 — Arrival",
    sub: "Your jersey enters the lab. Every garment is logged, photographed, and assigned a unique Repair ID.",
    damage: true,
    assessment: false,
    stitch: false,
  },
  {
    id: "assessment",
    label: "02 — Assessment",
    sub: "AI damage analysis identifies every tear, loose thread, and worn area. You receive a transparent quote — R180 Basic or R650 Pro.",
    damage: true,
    assessment: true,
    stitch: false,
  },
  {
    id: "preparation",
    label: "03 — Preparation",
    sub: "Exact Pantone thread match sourced. Original manufacturer fabric where needed. No generic fixes — every material is matched.",
    damage: true,
    assessment: true,
    stitch: false,
    spools: true,
  },
  {
    id: "restoration",
    label: "04 — Restoration",
    sub: "Hand-finished precision repair. Each stitch reinforces the original structure. Watch it heal in real time.",
    damage: false,
    stitch: true,
  },
  {
    id: "quality",
    label: "05 — Quality Check",
    sub: "12-point lab inspection. Every repair passes through magnification, tension testing, and match verification.",
    stamp: true,
  },
  {
    id: "shipping",
    label: "06 — Certified & Shipped",
    sub: "Your jersey leaves the lab with a Lab Report certificate. Ready for match day.",
  },
];

function MobileStageCard({
  stage,
  index,
}: {
  stage: (typeof MOBILE_STAGES)[number];
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const stitchRef = useRef<SVGPathElement>(null);
  const stampRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const card = cardRef.current;
      if (!card) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: card,
          start: "top 75%",
          end: "top 25%",
          scrub: 0.8,
        },
      });

      /* Card entrance */
      tl.fromTo(card, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.6 });

      /* Stitch animation if this stage has it */
      if (stage.stitch && stitchRef.current) {
        tl.fromTo(stitchRef.current, { drawSVG: 0 }, { drawSVG: "100%", duration: 0.8 }, 0.2);
      }

      /* PASSED stamp */
      if (stage.stamp && stampRef.current) {
        tl.fromTo(
          stampRef.current,
          { opacity: 0, scale: 0.5, rotation: -15 },
          { opacity: 1, scale: 1, rotation: 0, duration: 0.5 },
          0.3,
        );
      }
    },
    { scope: cardRef },
  );

  return (
    <div
      ref={cardRef}
      className="relative mx-4 mb-8 rounded-sm border border-white/5 bg-white/[0.02] p-6 opacity-0"
    >
      {/* Stage number accent */}
      <div className="absolute top-0 left-0 h-full w-1 bg-[#00E859]/30" />

      {/* Image */}
      <div className="relative mb-5 aspect-square w-full overflow-hidden rounded-sm bg-[#0a0a0a]">
        <img
          ref={imgRef}
          src="/jersey-damaged.jpg"
          alt="Jersey restoration"
          className="h-full w-full object-contain"
        />

        {/* SVG overlay for damage marks + stitches */}
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 1024 1024"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Damage marks */}
          {stage.damage && (
            <>
              <path
                d="M 680 180 L 720 175 L 718 210 L 695 215 Z"
                fill="none"
                stroke="#ff4444"
                strokeWidth="2.5"
                opacity="0.7"
              />
              <path
                d="M 280 780 L 285 775 L 305 778 L 300 785 Z"
                fill="none"
                stroke="#ff4444"
                strokeWidth="2"
                opacity="0.6"
              />
            </>
          )}

          {/* Assessment circles */}
          {stage.assessment && (
            <>
              <circle
                cx="700"
                cy="195"
                r="28"
                fill="none"
                stroke="#00E859"
                strokeWidth="2"
                strokeDasharray="4 3"
                opacity="0.8"
              />
              <circle
                cx="292"
                cy="780"
                r="16"
                fill="none"
                stroke="#00E859"
                strokeWidth="2"
                strokeDasharray="4 3"
                opacity="0.8"
              />
            </>
          )}

          {/* Stitches (DrawSVG animated) */}
          {stage.stitch && (
            <path
              ref={stitchRef}
              d="M 678 182 L 688 176 L 692 184 L 700 177 L 704 186 L 712 180 L 716 190 L 720 183 L 718 198 L 710 203 L 704 210 L 695 213 L 688 208 L 682 200 L 678 192 Z"
              fill="none"
              stroke="#00E859"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#mobile-glow)"
            />
          )}
        </svg>

        {/* PASSED stamp overlay */}
        {stage.stamp && (
          <div
            ref={stampRef}
            className="absolute top-6 right-6 rounded-sm border-2 border-[#00E859] bg-[#00E859]/10 px-4 py-2 opacity-0"
            style={{ transform: "rotate(-12deg)" }}
          >
            <span className="font-mono text-lg font-bold text-[#00E859] tracking-[0.15em]">
              PASSED
            </span>
          </div>
        )}

        {/* Thread spools indicator */}
        {stage.spools && (
          <div className="absolute bottom-4 left-4 flex gap-3">
            <div className="flex items-center gap-2 rounded-sm bg-[#1a3a1a]/80 border border-[#00E859]/30 px-3 py-1.5">
              <div className="h-2 w-2 rounded-full bg-[#00E859]" />
              <span className="text-[9px] font-mono text-[#00E859]/70">#00E859</span>
            </div>
            <div className="flex items-center gap-2 rounded-sm bg-[#1a2a1a]/80 border border-[#00E859]/30 px-3 py-1.5">
              <div className="h-2 w-2 rounded-full bg-[#1a4a1a]" />
              <span className="text-[9px] font-mono text-[#00E859]/70">DARK MATCH</span>
            </div>
          </div>
        )}
      </div>

      {/* Label + Sub */}
      <h3 className="font-display text-lg font-bold tracking-[-0.02em] text-white">
        {stage.label}
      </h3>
      <p className="mt-2 text-xs leading-relaxed text-white/40">{stage.sub}</p>
    </div>
  );
}

export default function MobileLabHero() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="bg-[#080808] lg:hidden">
      {/* Hero header */}
      <section className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-20">
        <div className="relative mb-8 aspect-square w-full max-w-sm">
          <img
            src="/jersey-damaged.jpg"
            alt="Damaged jersey — KitFix Lab"
            className="h-full w-full object-contain"
          />
          {/* Damage highlights */}
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 1024 1024"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <filter id="mobile-glow">
                <feGaussianBlur stdDeviation="2" />
              </filter>
            </defs>
            <path
              d="M 680 180 L 720 175 L 718 210 L 695 215 Z"
              fill="none"
              stroke="#ff4444"
              strokeWidth="2.5"
              opacity="0.7"
              filter="url(#mobile-glow)"
            />
            <path
              d="M 280 780 L 285 775 L 305 778 L 300 785 Z"
              fill="none"
              stroke="#ff4444"
              strokeWidth="2"
              opacity="0.6"
              filter="url(#mobile-glow)"
            />
          </svg>
        </div>

        <h1 className="font-display text-center text-4xl font-extrabold tracking-[-0.04em] text-white leading-[0.95]">
          Your Jersey,
          <br />
          <span className="text-[#00E859]">Lab-Restored</span>
        </h1>
        <p className="mt-4 max-w-xs text-center text-xs text-white/40 leading-relaxed">
          Scroll to watch the KitFix Lab process — from damage assessment to certified restoration.
        </p>

        {/* Scroll indicator */}
        <div className="mt-12 flex flex-col items-center gap-2">
          <span className="text-[9px] font-semibold tracking-[0.3em] text-white/15 uppercase">
            Scroll
          </span>
          <div className="h-10 w-px bg-gradient-to-b from-[#00E859]/30 to-transparent" />
        </div>
      </section>

      {/* Stage cards */}
      <div className="pb-32">
        {MOBILE_STAGES.map((stage, i) => (
          <MobileStageCard key={stage.id} stage={stage} index={i} />
        ))}
      </div>

      {/* Pricing + CTA */}
      <section className="border-t border-white/5 px-6 py-20">
        <div className="mx-auto max-w-sm">
          <h2 className="font-display text-center text-3xl font-bold tracking-[-0.02em] text-white">
            Start Your Repair
          </h2>

          <div className="mt-8 space-y-4">
            {/* Basic */}
            <a
              href="/repairs/new"
              className="block rounded-sm border border-white/10 bg-white/[0.02] p-6 transition-all active:border-[#00E859]/30"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.3em] text-white/30 uppercase">
                    Basic
                  </p>
                  <p className="mt-1 font-display text-3xl font-bold text-white">R180</p>
                </div>
                <span className="text-[#00E859] text-xl">→</span>
              </div>
              <p className="mt-3 text-[11px] text-white/40">
                5-day turnaround · 30-day guarantee
              </p>
            </a>

            {/* Pro */}
            <a
              href="/repairs/new?tier=pro"
              className="block rounded-sm border border-[#00E859]/30 bg-[#00E859]/[0.04] p-6 transition-all active:border-[#00E859]/50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.3em] text-[#00E859]/60 uppercase">
                    Pro — Recommended
                  </p>
                  <p className="mt-1 font-display text-3xl font-bold text-[#00E859]">R650</p>
                </div>
                <span className="text-[#00E859] text-xl">→</span>
              </div>
              <p className="mt-3 text-[11px] text-white/40">
                48-hour priority · 90-day guarantee · Lab Report
              </p>
            </a>
          </div>

          {/* Trust bar */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4 text-[9px] font-medium tracking-[0.2em] text-white/15 uppercase">
            <span>🇿🇦 SA Lab</span>
            <span>2,500+ Restored</span>
            <span>4.9★</span>
          </div>
        </div>
      </section>
    </div>
  );
}
