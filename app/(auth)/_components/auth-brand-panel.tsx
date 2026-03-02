"use client";

import { Scissors } from "lucide-react";
import { FloatingShapes } from "@/components/motion";

/**
 * Left-side brand showcase panel for the auth split-screen layout.
 * Renders a gradient background with floating shapes and the KitFix logo.
 * Hidden on mobile (< md breakpoint).
 */
export function AuthBrandPanel() {
  return (
    <div className="relative hidden w-[45%] shrink-0 overflow-hidden md:flex md:flex-col md:items-center md:justify-center">
      {/* Gradient background */}
      <div
        className="absolute inset-0"
        style={{ background: "var(--gradient-primary)" }}
      />

      {/* Subtle overlay for depth */}
      <div className="absolute inset-0 bg-black/10" />

      {/* Floating shapes – very subtle */}
      <FloatingShapes count={6} className="opacity-40" />

      {/* Logo + tagline */}
      <div className="relative z-10 flex flex-col items-center gap-4 px-8 text-center">
        <div className="flex items-center gap-3">
          <Scissors className="size-10 text-white" />
          <span className="text-4xl font-bold tracking-tight text-white">
            KitFix
          </span>
        </div>
        <p className="max-w-[240px] text-lg font-light leading-relaxed text-white/80">
          Professional Jersey Repair
        </p>
      </div>
    </div>
  );
}
