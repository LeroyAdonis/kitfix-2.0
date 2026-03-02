"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FloatingShapesProps {
  count?: number;
  className?: string;
}

interface ShapeConfig {
  id: number;
  size: number;
  x: number;
  y: number;
  opacity: number;
  borderRadius: string;
  color: string;
  floatDistance: number;
  duration: number;
  rotation: number;
  delay: number;
}

/** Deterministic pseudo-random from seed (mulberry32). */
function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const COLORS = [
  "var(--color-primary)",
  "var(--color-secondary)",
  "var(--color-accent)",
];

function generateShapes(count: number): ShapeConfig[] {
  const random = seededRandom(42);

  return Array.from({ length: count }, (_, i) => ({
    id: i,
    size: 20 + random() * 60,
    x: random() * 100,
    y: random() * 100,
    opacity: 0.05 + random() * 0.1,
    borderRadius: random() > 0.5 ? "50%" : `${20 + random() * 30}%`,
    color: COLORS[Math.floor(random() * COLORS.length)]!,
    floatDistance: 20 + random() * 20,
    duration: 6 + random() * 8,
    rotation: 30 + random() * 330,
    delay: random() * -10,
  }));
}

export function FloatingShapes({
  count = 6,
  className,
}: FloatingShapesProps) {
  const shouldReduceMotion = useReducedMotion();
  const shapes = useMemo(() => generateShapes(count), [count]);

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
      aria-hidden="true"
      data-slot="floating-shapes"
    >
      {shapes.map((shape) =>
        shouldReduceMotion ? (
          <div
            key={shape.id}
            className="absolute"
            style={{
              width: shape.size,
              height: shape.size,
              left: `${shape.x}%`,
              top: `${shape.y}%`,
              opacity: shape.opacity,
              borderRadius: shape.borderRadius,
              backgroundColor: shape.color,
            }}
          />
        ) : (
          <motion.div
            key={shape.id}
            className="absolute"
            style={{
              width: shape.size,
              height: shape.size,
              left: `${shape.x}%`,
              top: `${shape.y}%`,
              opacity: shape.opacity,
              borderRadius: shape.borderRadius,
              backgroundColor: shape.color,
            }}
            animate={{
              y: [0, -shape.floatDistance, 0],
              rotate: [0, shape.rotation, 0],
            }}
            transition={{
              duration: shape.duration,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut",
              delay: shape.delay,
            }}
          />
        )
      )}
    </div>
  );
}
