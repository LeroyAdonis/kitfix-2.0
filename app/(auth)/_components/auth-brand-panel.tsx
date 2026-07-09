"use client";

import { Scissors } from "lucide-react";
import { FloatingShapes } from "@/components/motion";

export function AuthBrandPanel() {
  return (
    <div className="relative hidden w-[45%] shrink-0 overflow-hidden md:flex md:flex-col md:items-center md:justify-center">
      <div
        className="absolute inset-0"
        style={{ background: "var(--gradient-sport)" }}
      />

      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="absolute inset-0 bg-black/10" />

      <FloatingShapes count={8} className="opacity-50" />

      <div className="relative z-10 flex flex-col items-center gap-4 px-8 text-center">
        <div className="flex items-center gap-3">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
            <Scissors className="size-7 text-white" />
          </div>
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
