"use client";

import React from "react";

export interface JerseySVGProps {
  className?: string;
  svgRef?: React.RefObject<SVGSVGElement | null>;
}

/**
 * JerseySVG — "Repair Sheet" jersey illustration.
 *
 * Design (frontend-design skill):
 * - The jersey is the thesis of the hero. It must READ instantly, so it's
 *   drawn like a garment on a workbench: bone thread outline (#EFE9D8) on
 *   deep pitch (#17351A), like chalk lines on grass / thread on fabric.
 * - Foul-red jagged tears = the damage. Gold dashed stitches = the repair
 *   already in progress. Gold hem seam = the signature stitch (ties into
 *   the page's StitchRule divider).
 * - All colors use current repair-sheet CSS vars (the old --color-brand-*
 *   tokens were removed and left this SVG invisible).
 */
export default function JerseySVG({ className, svgRef }: JerseySVGProps) {
  return (
    <svg
      ref={svgRef}
      viewBox="0 0 800 600"
      className={className}
      aria-hidden="true"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="jerseyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="var(--color-pitch)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="var(--color-pitch)" stopOpacity="0.12" />
        </linearGradient>
        <filter id="goldGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feFlood floodColor="var(--color-stitch)" floodOpacity="0.6" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Jersey body — visible thread outline + pitch-green garment fill */}
      <path
        d="M 250 120 
           L 200 140 L 140 180 L 120 250 L 140 260 L 180 220 L 200 280 
           L 200 480 L 600 480 L 600 280 L 620 220 L 660 260 L 680 250 
           L 660 180 L 600 140 L 550 120 
           L 500 140 L 400 150 L 300 140 Z"
        fill="url(#jerseyGradient)"
        stroke="var(--color-thread)"
        strokeWidth="5"
        strokeOpacity="0.95"
        strokeLinejoin="round"
      />

      {/* Collar — V-neck with ribbing line */}
      <path
        d="M 320 125 Q 400 100 480 125"
        stroke="var(--color-thread)"
        strokeWidth="3.5"
        strokeOpacity="0.9"
        fill="none"
      />
      <path
        d="M 340 138 Q 400 118 460 138"
        stroke="var(--color-thread)"
        strokeWidth="1.5"
        strokeOpacity="0.4"
        fill="none"
      />

      {/* Sleeve seams — dashed stitch lines */}
      <path
        d="M 205 155 L 150 200"
        stroke="var(--color-thread)"
        strokeWidth="2"
        strokeOpacity="0.7"
        strokeDasharray="6 6"
        fill="none"
      />
      <path
        d="M 595 155 L 650 200"
        stroke="var(--color-thread)"
        strokeWidth="2"
        strokeOpacity="0.7"
        strokeDasharray="6 6"
        fill="none"
      />

      {/* Side seams — dashed stitch lines */}
      <path
        d="M 218 300 L 218 462"
        stroke="var(--color-thread)"
        strokeWidth="2"
        strokeOpacity="0.55"
        strokeDasharray="5 7"
        fill="none"
      />
      <path
        d="M 582 300 L 582 462"
        stroke="var(--color-thread)"
        strokeWidth="2"
        strokeOpacity="0.55"
        strokeDasharray="5 7"
        fill="none"
      />

      {/* Center seam */}
      <path
        d="M 400 150 L 400 470"
        stroke="var(--color-thread)"
        strokeWidth="1.5"
        strokeOpacity="0.4"
        fill="none"
        strokeDasharray="4 8"
      />

      {/* Hem — gold signature stitch seam along the bottom edge */}
      <path
        d="M 205 472 L 595 472"
        stroke="var(--color-stitch)"
        strokeWidth="3.5"
        strokeOpacity="0.9"
        strokeLinecap="round"
        strokeDasharray="10 8"
        fill="none"
      />

      {/* Tear 1 — upper left chest (foul red, jagged) */}
      <path
        className="tear-path"
        d="M 310 190 Q 320 210 315 230 Q 330 250 320 270 Q 310 290 325 310"
        stroke="var(--color-foul)"
        strokeWidth="4"
        strokeOpacity="0.95"
        fill="none"
        strokeLinecap="round"
      />

      {/* Gold repair stitches across tear 1 */}
      <path
        d="M 298 212 L 332 218"
        stroke="var(--color-stitch)"
        strokeWidth="3.5"
        strokeOpacity="0.95"
        strokeLinecap="round"
        strokeDasharray="5 4"
        fill="none"
      />
      <path
        d="M 302 252 L 334 258"
        stroke="var(--color-stitch)"
        strokeWidth="3.5"
        strokeOpacity="0.95"
        strokeLinecap="round"
        strokeDasharray="5 4"
        fill="none"
      />
      <path
        d="M 305 292 L 332 298"
        stroke="var(--color-stitch)"
        strokeWidth="3.5"
        strokeOpacity="0.95"
        strokeLinecap="round"
        strokeDasharray="5 4"
        fill="none"
      />

      {/* Tear 2 — right torso */}
      <path
        className="tear-path"
        d="M 470 250 Q 480 270 475 290 Q 490 310 480 330"
        stroke="var(--color-foul)"
        strokeWidth="4"
        strokeOpacity="0.95"
        fill="none"
        strokeLinecap="round"
      />

      {/* Gold repair stitches across tear 2 */}
      <path
        d="M 458 268 L 492 274"
        stroke="var(--color-stitch)"
        strokeWidth="3.5"
        strokeOpacity="0.95"
        strokeLinecap="round"
        strokeDasharray="5 4"
        fill="none"
      />
      <path
        d="M 460 304 L 494 310"
        stroke="var(--color-stitch)"
        strokeWidth="3.5"
        strokeOpacity="0.95"
        strokeLinecap="round"
        strokeDasharray="5 4"
        fill="none"
      />

      {/* Tear 3 — lower left */}
      <path
        className="tear-path"
        d="M 260 330 Q 270 350 265 370 Q 280 390 270 410"
        stroke="var(--color-foul)"
        strokeWidth="4"
        strokeOpacity="0.95"
        fill="none"
        strokeLinecap="round"
      />

      {/* Gold repair stitches across tear 3 */}
      <path
        d="M 248 352 L 282 358"
        stroke="var(--color-stitch)"
        strokeWidth="3.5"
        strokeOpacity="0.95"
        strokeLinecap="round"
        strokeDasharray="5 4"
        fill="none"
      />
      <path
        d="M 252 388 L 284 394"
        stroke="var(--color-stitch)"
        strokeWidth="3.5"
        strokeOpacity="0.95"
        strokeLinecap="round"
        strokeDasharray="5 4"
        fill="none"
      />

      {/* Gold glow zones (damage highlights — animated by MacrophageHero) */}
      <ellipse
        className="gold-glow"
        cx="318"
        cy="250"
        rx="30"
        ry="50"
        fill="var(--color-stitch)"
        opacity="0"
        filter="url(#goldGlow)"
      />
      <ellipse
        className="gold-glow"
        cx="478"
        cy="290"
        rx="25"
        ry="40"
        fill="var(--color-stitch)"
        opacity="0"
        filter="url(#goldGlow)"
      />
      <ellipse
        className="gold-glow"
        cx="268"
        cy="370"
        rx="25"
        ry="40"
        fill="var(--color-stitch)"
        opacity="0"
        filter="url(#goldGlow)"
      />
    </svg>
  );
}
