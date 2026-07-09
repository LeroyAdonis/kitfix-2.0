"use client";

import Image from "next/image";
import { FloatingShapes } from "@/components/motion";
import { ShieldCheck } from "lucide-react";

export function AuthBrandPanel() {
  return (
    <div className="relative hidden w-[45%] shrink-0 overflow-hidden md:flex md:flex-col md:items-center md:justify-center">
      {/* Dark green-tinted gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: [
            "linear-gradient(135deg, #0A0A0B 0%, #0D1A12 30%, #0A0A0B 60%, #0D1A12 100%)",
          ].join(", "),
        }}
      />

      {/* Green atmospheric glow */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
        style={{
          background: [
            "radial-gradient(ellipse 60% 50% at 30% 40%, rgba(0,232,89,0.12) 0%, transparent 70%)",
            "radial-gradient(ellipse 40% 30% at 70% 80%, rgba(0,168,107,0.06) 0%, transparent 50%)",
          ].join(", "),
        }}
      />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,232,89,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,232,89,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Noise texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Subtle dark overlay */}
      <div className="absolute inset-0 bg-black/20" />

      <FloatingShapes count={8} className="opacity-40" />

      <div className="relative z-10 flex flex-col items-center gap-6 px-8 text-center">
        {/* Shield logo */}
        <div className="flex items-center gap-3">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-green-400/10 backdrop-blur-sm border border-green-400/20">
            <ShieldCheck className="size-7 text-green-400" />
          </div>
          <span className="text-4xl font-bold tracking-tight text-white font-display">
            KitFix
          </span>
        </div>

        {/* Editorial divider */}
        <div className="flex items-center justify-center gap-4">
          <div className="h-px w-12 bg-gradient-to-l from-green-400/40 to-transparent" />
          <p className="text-[10px] font-medium tracking-[0.3em] text-green-400/60 uppercase">
            Premium Service
          </p>
          <div className="h-px w-12 bg-gradient-to-r from-green-400/40 to-transparent" />
        </div>

        <p className="max-w-[240px] text-sm font-light leading-relaxed text-white/60">
          South Africa&apos;s trusted destination for professional jersey repair and customisation
        </p>
      </div>
    </div>
  );
}
