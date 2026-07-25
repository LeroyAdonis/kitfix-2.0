"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

gsap.registerPlugin(useGSAP, ScrollTrigger, DrawSVGPlugin);

/* ── Stage data ── */
const STAGES = [
  {
    id: "arrival",
    label: "Arrival",
    sub: "Your jersey enters the lab",
    scrollPct: [0, 15],
  },
  {
    id: "assessment",
    label: "Assessment",
    sub: "AI damage analysis & quote",
    scrollPct: [15, 30],
  },
  {
    id: "preparation",
    label: "Preparation",
    sub: "Exact thread match sourced",
    scrollPct: [30, 45],
  },
  {
    id: "restoration",
    label: "Restoration",
    sub: "Precision repair in progress",
    scrollPct: [45, 70],
  },
  {
    id: "quality",
    label: "Quality Check",
    sub: "Lab QC — 12-point inspection",
    scrollPct: [70, 85],
  },
  {
    id: "return",
    label: "Ready for Match Day",
    sub: "Certified — shipped to you",
    scrollPct: [85, 100],
  },
];

export default function LabHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const jerseyRef = useRef<HTMLDivElement>(null);
  const stageIndicatorRef = useRef<HTMLDivElement>(null);

  /* ── SVG refs for GSAP targets ── */
  const tearPrimaryRef = useRef<SVGPathElement>(null);
  const tearSecondaryRef = useRef<SVGPathElement>(null);
  const assessmentCircle1Ref = useRef<SVGCircleElement>(null);
  const assessmentCircle2Ref = useRef<SVGCircleElement>(null);
  const measurementLine1Ref = useRef<SVGLineElement>(null);
  const measurementLine1bRef = useRef<SVGLineElement>(null);
  const measurementLine2Ref = useRef<SVGLineElement>(null);
  const stitchPrimaryRef = useRef<SVGPathElement>(null);
  const stitchSecondaryRef = useRef<SVGPathElement>(null);
  const threadSpool1Ref = useRef<HTMLDivElement>(null);
  const threadSpool2Ref = useRef<HTMLDivElement>(null);
  const magnifierRef = useRef<SVGGElement>(null);
  const passedStampRef = useRef<SVGGElement>(null);
  const stageLabelRef = useRef<HTMLDivElement>(null);
  const stageSubRef = useRef<HTMLDivElement>(null);
  const toolPanelRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      /* ── Master timeline pinned to the hero section ── */
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pinRef.current,
          start: "top top",
          end: "+=5000",
          scrub: 1,
          pin: true,
        },
        defaults: { ease: "none" },
      });

      /* ── Stage 0-15%: Arrival — jersey fades in with damage visible ── */
      tl.fromTo(
        jerseyRef.current,
        { opacity: 0, scale: 1.08 },
        { opacity: 1, scale: 1, duration: 1 },
        0,
      )
        .fromTo(
          tearPrimaryRef.current,
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, duration: 0.6 },
          0.2,
        )
        .fromTo(
          tearSecondaryRef.current,
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, duration: 0.6 },
          0.3,
        );

      /* ── Stage 15-30%: Assessment — red marks appear ── */
      tl.fromTo(
        [assessmentCircle1Ref.current, assessmentCircle2Ref.current],
        { opacity: 0, scale: 1.5, strokeDashoffset: 200 },
        { opacity: 1, scale: 1, strokeDashoffset: 0, duration: 1.5 },
        1.5,
      )
        .fromTo(
          [measurementLine1Ref.current, measurementLine1bRef.current, measurementLine2Ref.current],
          { opacity: 0, strokeDashoffset: 100 },
          { opacity: 1, strokeDashoffset: 0, duration: 1 },
          1.7,
        );

      /* ── Stage 30-45%: Preparation — thread spools + tools ── */
      tl.fromTo(
        threadSpool1Ref.current,
        { opacity: 0, x: -60, rotation: -30 },
        { opacity: 1, x: 0, rotation: 0, duration: 1.2 },
        3,
      )
        .fromTo(
          threadSpool2Ref.current,
          { opacity: 0, x: 60, rotation: 30 },
          { opacity: 1, x: 0, rotation: 0, duration: 1.2 },
          3.2,
        );

      /* ── Stage 45-70%: Restoration — DrawSVG stitches ── */
      tl.fromTo(
        stitchPrimaryRef.current,
        { drawSVG: 0 },
        { drawSVG: "100%", duration: 2 },
        4.5,
      )
        .fromTo(
          stitchSecondaryRef.current,
          { drawSVG: 0 },
          { drawSVG: "100%", duration: 1.2 },
          5,
        )
        /* Fade the tears as stitches complete */
        .to(
          [tearPrimaryRef.current, tearSecondaryRef.current],
          { opacity: 0, duration: 1 },
          5.8,
        );

      /* ── Stage 70-85%: Quality Check — magnifier + PASSED stamp ── */
      tl.fromTo(
        magnifierRef.current,
        { opacity: 0, scale: 0.5, rotation: -10 },
        { opacity: 1, scale: 1, rotation: 0, duration: 1 },
        7,
      )
        .to(magnifierRef.current, { x: 60, y: -40, duration: 2 }, 7.5)
        .fromTo(
          passedStampRef.current,
          { opacity: 0, scale: 0.3, rotation: -25 },
          { opacity: 1, scale: 1, rotation: 0, duration: 0.8 },
          8,
        );

      /* ── Stage 85-100%: Return — clean jersey + confidence ── */
      tl.to(jerseyRef.current, { filter: "brightness(1.15) saturate(1.1)", duration: 1.5 }, 8.5);

      /* ── Stage indicators ── */
      STAGES.forEach((stage, i) => {
        const progress = stage.scrollPct[0] / 100;
        tl.call(
          () => {
            if (stageLabelRef.current && stageSubRef.current) {
              stageLabelRef.current.textContent = stage.label;
              stageSubRef.current.textContent = stage.sub;
            }
          },
          [],
          progress * 10,
        );
      });
    },
    { scope: containerRef },
  );

  return (
    <div ref={containerRef}>
      {/* ═══ PINNED HERO SECTION ═══ */}
      <div
        ref={pinRef}
        className="relative h-screen w-full overflow-hidden bg-[#080808]"
      >
        {/* ── Jersey image + SVG overlay ── */}
        <div
          ref={jerseyRef}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="relative w-full h-full max-w-[900px] max-h-[900px] mx-auto flex items-center justify-center">
            {/* Base jersey image */}
            <img
              src="/jersey-damaged.jpg"
              alt="Damaged football jersey — KitFix Lab"
              className="w-auto h-auto max-w-full max-h-full object-contain"
              style={{ willChange: "transform, opacity" }}
            />

            {/* ── SVG OVERLAY LAYER ── */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 1024 1024"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <filter id="lab-glow">
                  <feGaussianBlur stdDeviation="2" />
                </filter>
                <filter id="red-glow">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* ═══ DAMAGE OVERLAYS (always visible, fade out at restoration) ═══ */}

              {/* Primary L-tear — upper right shoulder area */}
              <path
                ref={tearPrimaryRef}
                d="M 680 180 L 720 175 L 718 210 L 695 215 Z"
                fill="none"
                stroke="#ff4444"
                strokeWidth="2"
                opacity="0.85"
                filter="url(#lab-glow)"
                style={{ willChange: "transform, opacity" }}
              />
              {/* Tear edge detail */}
              <path
                d="M 680 180 L 685 188 M 685 188 L 690 183"
                fill="none"
                stroke="#ff6666"
                strokeWidth="1"
                opacity="0.6"
              />

              {/* Secondary rip — lower side seam near hem */}
              <path
                ref={tearSecondaryRef}
                d="M 280 780 L 285 775 L 305 778 L 300 785 Z"
                fill="none"
                stroke="#ff4444"
                strokeWidth="1.8"
                opacity="0.75"
                filter="url(#lab-glow)"
                style={{ willChange: "transform, opacity" }}
              />

              {/* ═══ ASSESSMENT MARKS (hidden, revealed at 15-30%) ═══ */}

              {/* Circle 1 — around primary tear */}
              <circle
                ref={assessmentCircle1Ref}
                cx="700"
                cy="195"
                r="28"
                fill="none"
                stroke="#00E859"
                strokeWidth="1.5"
                strokeDasharray="4 3"
                opacity="0"
                filter="url(#lab-glow)"
              />
              {/* Circle 2 — around secondary tear */}
              <circle
                ref={assessmentCircle2Ref}
                cx="292"
                cy="780"
                r="16"
                fill="none"
                stroke="#00E859"
                strokeWidth="1.5"
                strokeDasharray="4 3"
                opacity="0"
                filter="url(#lab-glow)"
              />

              {/* Measurement lines */}
              <line
                ref={measurementLine1Ref}
                x1="700"
                y1="160"
                x2="700"
                y2="230"
                stroke="#00E859"
                strokeWidth="0.8"
                opacity="0"
              />
              <line
                ref={measurementLine1bRef}
                x1="665"
                y1="195"
                x2="735"
                y2="195"
                stroke="#00E859"
                strokeWidth="0.8"
                opacity="0"
              />
              <line
                ref={measurementLine2Ref}
                x1="260"
                y1="780"
                x2="325"
                y2="780"
                stroke="#00E859"
                strokeWidth="0.8"
                opacity="0"
              />

              {/* ═══ RESTORATION — Stitch paths (DrawSVG animated) ═══ */}

              {/* Primary stitch — zigzag across the L-tear */}
              <path
                ref={stitchPrimaryRef}
                d="M 678 182 L 688 176 L 692 184 L 700 177 L 704 186 L 712 180 L 716 190 L 720 183 L 718 198 L 710 203 L 704 210 L 695 213 L 688 208 L 682 200 L 678 192 Z"
                fill="none"
                stroke="#00E859"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0"
                filter="url(#lab-glow)"
                style={{ willChange: "stroke-dashoffset" }}
              />

              {/* Secondary stitch — simple running stitch */}
              <path
                ref={stitchSecondaryRef}
                d="M 278 776 L 283 774 L 288 777 L 293 774 L 298 777 L 303 775"
                fill="none"
                stroke="#00E859"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0"
                filter="url(#lab-glow)"
                style={{ willChange: "stroke-dashoffset" }}
              />

              {/* ═══ QUALITY CHECK — Magnifying glass + PASSED stamp ═══ */}

              <g ref={magnifierRef} opacity="0">
                {/* Glass */}
                <circle
                  cx="350"
                  cy="350"
                  r="45"
                  fill="rgba(0,232,89,0.08)"
                  stroke="#00E859"
                  strokeWidth="1.5"
                />
                {/* Handle */}
                <line
                  x1="385"
                  y1="385"
                  x2="420"
                  y2="420"
                  stroke="#00E859"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                {/* Crosshair */}
                <line
                  x1="350" y1="330" x2="350" y2="370"
                  stroke="#00E859"
                  strokeWidth="0.5"
                  opacity="0.5"
                />
                <line
                  x1="330" y1="350" x2="370" y2="350"
                  stroke="#00E859"
                  strokeWidth="0.5"
                  opacity="0.5"
                />
              </g>

              {/* PASSED stamp */}
              <g ref={passedStampRef} opacity="0">
                <rect
                  x="380"
                  y="240"
                  width="130"
                  height="45"
                  rx="3"
                  fill="rgba(0,232,89,0.12)"
                  stroke="#00E859"
                  strokeWidth="2"
                  transform="rotate(-12, 445, 262)"
                />
                <text
                  x="445"
                  y="270"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontFamily="monospace"
                  fontSize="22"
                  fontWeight="bold"
                  fill="#00E859"
                  transform="rotate(-12, 445, 262)"
                  style={{ letterSpacing: "0.15em" }}
                >
                  PASSED
                </text>
              </g>
            </svg>

            {/* ── THREAD SPOOLS (Preparation stage) ── */}
            <div
              ref={threadSpool1Ref}
              className="absolute opacity-0"
              style={{ left: "18%", top: "25%", willChange: "transform, opacity" }}
            >
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-10 rounded-sm bg-[#1a3a1a] border border-[#00E859]/30 flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-[#00E859]" />
                </div>
                <span className="text-[9px] font-mono text-[#00E859]/60 tracking-wider">
                  #00E859
                </span>
              </div>
            </div>
            <div
              ref={threadSpool2Ref}
              className="absolute opacity-0"
              style={{ right: "18%", top: "30%", willChange: "transform, opacity" }}
            >
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-10 rounded-sm bg-[#1a2a1a] border border-[#00E859]/30 flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-[#00E859]" />
                </div>
                <span className="text-[9px] font-mono text-[#00E859]/60 tracking-wider">
                  DARK MATCH
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom vignette ── */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent opacity-40" />
      </div>

      {/* ═══ STAGE INDICATOR (fixed position overlay) ═══ */}
      <div
        ref={stageIndicatorRef}
        className="fixed bottom-12 left-0 right-0 z-30 flex flex-col items-center gap-2 pointer-events-none"
      >
        <div
          ref={stageLabelRef}
          className="font-display text-2xl sm:text-3xl font-bold tracking-[-0.02em] text-white"
        >
          Arrival
        </div>
        <div
          ref={stageSubRef}
          className="text-xs sm:text-sm text-white/40 font-medium tracking-[0.15em] uppercase"
        >
          Your jersey enters the lab
        </div>
      </div>

      {/* ═══ POST-SCROLL SECTION: CTA + Pricing ═══ */}
      <section className="relative bg-[#080808] border-t border-white/5 px-6 py-32">
        {/* Ambient glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 50% 40% at 50% 50%, rgba(0,232,89,0.06) 0%, transparent 60%)",
          }}
        />

        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.03em] text-white leading-[1.05]">
            Your Jersey,<br />
            <span className="text-[#00E859]">Lab-Restored</span>
          </h2>
          <p className="mt-6 max-w-xl mx-auto text-sm text-white/40 leading-relaxed">
            Every jersey that enters the KitFix Lab is documented, analyzed,
            and restored with surgical precision. Because your jersey deserves
            more than a repair — it deserves certification.
          </p>

          {/* Pricing cards */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Basic */}
            <div className="group relative p-8 bg-white/[0.03] border border-white/10 rounded-sm text-left transition-all duration-300 hover:border-[#00E859]/30 hover:bg-white/[0.05]">
              <p className="text-[10px] font-semibold tracking-[0.3em] text-white/30 uppercase">
                Basic
              </p>
              <p className="mt-3 font-display text-4xl font-bold text-white">
                R180
              </p>
              <ul className="mt-6 space-y-2 text-xs text-white/50">
                <li>Standard colour match</li>
                <li>Machine reinforced stitch</li>
                <li>Before/after photo</li>
                <li>5 working days</li>
                <li>30-day guarantee</li>
              </ul>
              <a
                href="/repairs/new"
                className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-[#00E859]/10 border border-[#00E859]/20 text-[#00E859] text-xs font-semibold tracking-[0.15em] uppercase transition-all duration-300 hover:bg-[#00E859]/20 hover:border-[#00E859]/40"
              >
                Start Basic Repair
                <span className="text-base">→</span>
              </a>
            </div>

            {/* Pro */}
            <div className="group relative p-8 bg-[#00E859]/[0.04] border border-[#00E859]/20 rounded-sm text-left transition-all duration-300 hover:border-[#00E859]/40 hover:bg-[#00E859]/[0.07]">
              <div className="absolute -top-3 left-6">
                <span className="px-3 py-1 bg-[#00E859] text-black text-[9px] font-bold tracking-[0.2em] uppercase rounded-sm">
                  Recommended
                </span>
              </div>
              <p className="text-[10px] font-semibold tracking-[0.3em] text-[#00E859]/60 uppercase mt-2">
                Pro
              </p>
              <p className="mt-3 font-display text-4xl font-bold text-[#00E859]">
                R650
              </p>
              <ul className="mt-6 space-y-2 text-xs text-white/50">
                <li>Exact Pantone thread match</li>
                <li>Hand-finished + machine zigzag</li>
                <li>Macro before/after photos</li>
                <li>48-hour priority queue</li>
                <li>90-day guarantee + Lab Report</li>
              </ul>
              <a
                href="/repairs/new?tier=pro"
                className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-[#00E859] text-black text-xs font-bold tracking-[0.15em] uppercase transition-all duration-300 hover:bg-[#00E859]/90"
              >
                Start Pro Repair
                <span className="text-base">→</span>
              </a>
            </div>
          </div>

          {/* Trust bar */}
          <div className="mt-20 flex flex-wrap items-center justify-center gap-8 text-[10px] font-medium tracking-[0.2em] text-white/20 uppercase">
            <span>🇿🇦 South African Lab</span>
            <span className="text-white/10">|</span>
            <span>12-Point QC</span>
            <span className="text-white/10">|</span>
            <span>2,500+ Restored</span>
            <span className="text-white/10">|</span>
            <span>4.9★ Rating</span>
          </div>
        </div>
      </section>
    </div>
  );
}
