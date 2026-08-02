"use client";

import React, { useRef, useEffect, useMemo, useState } from "react";
import { gsap } from "gsap";
import { createScatterPositions } from "./hero-animations";

export interface ParticleSystemProps {
  count: number;
  svgWidth: number;
  svgHeight: number;
}

export default function ParticleSystem({
  count,
  svgWidth,
  svgHeight,
}: ParticleSystemProps) {
  const circleRefs = useRef<(SVGCircleElement | null)[]>([]);

  // Lazy-initialise radii — runs once per count value, avoids ref access during render
  const [radii] = useState(() =>
    Array.from({ length: count }, () => 2 + Math.random() * 2)
  );

  const particles = useMemo(() => {
    const positions = createScatterPositions(count, svgWidth, svgHeight);
    return positions.map((pos, i) => ({
      id: i,
      cx: pos.x,
      cy: pos.y,
      r: radii[i],
    }));
  }, [count, svgWidth, svgHeight, radii]);

  useEffect(() => {
    circleRefs.current.forEach((circle, i) => {
      if (!circle) return;
      gsap.set(circle, {
        attr: {
          cx: particles[i].cx,
          cy: particles[i].cy,
          r: particles[i].r,
        },
        opacity: 0,
      });
    });
  }, [particles]);

  return (
    <g aria-hidden="true">
      {particles.map((p, i) => (
        <circle
          key={p.id}
          ref={(el) => {
            circleRefs.current[i] = el;
          }}
          cx={p.cx}
          cy={p.cy}
          r={p.r}
          fill="var(--color-brand-green)"
          opacity={0}
          style={{ mixBlendMode: "screen" }}
        />
      ))}
    </g>
  );
}
