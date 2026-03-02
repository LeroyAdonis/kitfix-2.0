"use client";

import { type ReactNode } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { PageTransition } from "./page-transition";

interface CustomerShellProps {
  children: ReactNode;
}

export function CustomerShell({ children }: CustomerShellProps) {
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const shouldReduceMotion = useReducedMotion();

  return (
    <>
      {!shouldReduceMotion && (
        <motion.div
          className="fixed inset-x-0 top-0 z-50 h-[3px] origin-left"
          style={{
            scaleX,
            background: "var(--gradient-primary)",
          }}
          data-slot="scroll-progress"
        />
      )}
      <PageTransition>{children}</PageTransition>
    </>
  );
}
