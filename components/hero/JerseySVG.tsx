"use client";

import React from "react";

export interface JerseySVGProps {
  className?: string;
  svgRef?: React.RefObject<SVGSVGElement | null>;
}

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
          <stop offset="0%" stopColor="var(--color-brand-green)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="var(--color-brand-green)" stopOpacity="0.05" />
        </linearGradient>
        <filter id="goldGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feFlood floodColor="var(--color-brand-gold)" floodOpacity="0.6" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Jersey body */}
      <path
        d="M 250 120 
           L 200 140 L 140 180 L 120 250 L 140 260 L 180 220 L 200 280 
           L 200 480 L 600 480 L 600 280 L 620 220 L 660 260 L 680 250 
           L 660 180 L 600 140 L 550 120 
           L 500 140 L 400 150 L 300 140 Z"
        fill="url(#jerseyGradient)"
        stroke="var(--color-brand-green)"
        strokeWidth="1.5"
        strokeOpacity="0.4"
      />

      {/* Collar */}
      <path
        d="M 320 125 Q 400 100 480 125"
        stroke="var(--color-brand-green)"
        strokeWidth="2"
        strokeOpacity="0.6"
        fill="none"
      />

      {/* Left sleeve line */}
      <path
        d="M 200 160 L 160 200"
        stroke="var(--color-brand-green)"
        strokeWidth="1"
        strokeOpacity="0.3"
        fill="none"
      />

      {/* Right sleeve line */}
      <path
        d="M 600 160 L 640 200"
        stroke="var(--color-brand-green)"
        strokeWidth="1"
        strokeOpacity="0.3"
        fill="none"
      />

      {/* Center seam */}
      <path
        d="M 400 150 L 400 480"
        stroke="var(--color-brand-green)"
        strokeWidth="0.5"
        strokeOpacity="0.15"
        fill="none"
        strokeDasharray="4 8"
      />

      {/* Tear 1 — upper left chest */}
      <path
        className="tear-path"
        d="M 310 190 Q 320 210 315 230 Q 330 250 320 270 Q 310 290 325 310"
        stroke="var(--color-brand-green)"
        strokeWidth="2"
        strokeOpacity="0.7"
        fill="none"
        strokeLinecap="round"
      />

      {/* Tear 2 — right torso */}
      <path
        className="tear-path"
        d="M 470 250 Q 480 270 475 290 Q 490 310 480 330"
        stroke="var(--color-brand-green)"
        strokeWidth="2"
        strokeOpacity="0.7"
        fill="none"
        strokeLinecap="round"
      />

      {/* Tear 3 — lower left */}
      <path
        className="tear-path"
        d="M 260 330 Q 270 350 265 370 Q 280 390 270 410"
        stroke="var(--color-brand-green)"
        strokeWidth="2"
        strokeOpacity="0.7"
        fill="none"
        strokeLinecap="round"
      />

      {/* Gold glow zones (damage highlights) */}
      <ellipse
        className="gold-glow"
        cx="318"
        cy="250"
        rx="30"
        ry="50"
        fill="var(--color-brand-gold)"
        opacity="0"
        filter="url(#goldGlow)"
      />
      <ellipse
        className="gold-glow"
        cx="478"
        cy="290"
        rx="25"
        ry="40"
        fill="var(--color-brand-gold)"
        opacity="0"
        filter="url(#goldGlow)"
      />
      <ellipse
        className="gold-glow"
        cx="268"
        cy="370"
        rx="25"
        ry="40"
        fill="var(--color-brand-gold)"
        opacity="0"
        filter="url(#goldGlow)"
      />
    </svg>
  );
}
