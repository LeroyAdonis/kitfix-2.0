"use client";

import { useEffect, useRef, useState } from "react";
import {
  useInView,
  useMotionValue,
  useReducedMotion,
  animate,
} from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}

export function AnimatedCounter({
  value,
  suffix = "",
  prefix = "",
  duration = 2,
  className,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });
  const shouldReduceMotion = useReducedMotion();
  const motionValue = useMotionValue(0);
  const [displayValue, setDisplayValue] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isInView || hasAnimated.current) return;
    hasAnimated.current = true;

    if (shouldReduceMotion) {
      setDisplayValue(value);
      return;
    }

    const decimals = (value.toString().split(".")[1] || "").length;
    const controls = animate(motionValue, value, {
      duration,
      ease: "easeOut",
      onUpdate: (latest) => {
        setDisplayValue(
          decimals > 0
            ? parseFloat(latest.toFixed(decimals))
            : Math.round(latest)
        );
      },
    });

    return () => controls.stop();
  }, [isInView, value, duration, shouldReduceMotion, motionValue]);

  const formatted = new Intl.NumberFormat("en-ZA").format(displayValue);

  return (
    <span ref={ref} className={cn(className)} data-slot="animated-counter">
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
