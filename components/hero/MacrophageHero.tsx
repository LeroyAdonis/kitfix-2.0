"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import JerseySVG from "./JerseySVG";
import ParticleSystem from "./ParticleSystem";
import { TEAR_ZONES, createSwarmPath } from "./hero-animations";
import { logger } from "@/lib/logger";

const MOBILE_BREAKPOINT = 768;
const MOBILE_PARTICLE_COUNT = 30;
const DESKTOP_PARTICLE_COUNT = 80;

function getIsMobile(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches;
}

export default function MacrophageHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const jerseySvgRef = useRef<SVGSVGElement>(null);
  const particleSvgRef = useRef<SVGSVGElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const [isMobile] = useState(() => getIsMobile());
  const [particleCount] = useState(() => (getIsMobile() ? MOBILE_PARTICLE_COUNT : DESKTOP_PARTICLE_COUNT));
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  const buildAnimation = useCallback(() => {
    if (!jerseySvgRef.current || !particleSvgRef.current || !sectionRef.current || !headlineRef.current || !ctaRef.current) {
      return;
    }

    if (timelineRef.current) {
      timelineRef.current.kill();
    }
    if (scrollTriggerRef.current) {
      scrollTriggerRef.current.kill();
    }

    const circles = Array.from(particleSvgRef.current.querySelectorAll<SVGCircleElement>("circle"));
    const tearPaths = Array.from(jerseySvgRef.current!.querySelectorAll<SVGPathElement>(".tear-path"));
    const goldGlows = Array.from(jerseySvgRef.current!.querySelectorAll<SVGPathElement>(".gold-glow"));

    const tl = gsap.timeline({ paused: true });

    circles.forEach((circle, i) => {
      const tearZone = TEAR_ZONES[i % TEAR_ZONES.length];
      const startX = parseFloat(circle.getAttribute("cx") || "0");
      const startY = parseFloat(circle.getAttribute("cy") || "0");
      const pathPoints = createSwarmPath(startX, startY, tearZone);

      tl.to(
        circle,
        {
          motionPath: {
            path: pathPoints,
            curviness: 1.5,
            autoRotate: false,
          },
          opacity: 0.8,
          attr: { r: 3 + Math.random() * 2 },
          duration: 1,
          ease: "power1.inOut",
        },
        0 + (i / circles.length) * 0.3
      );
    });

    goldGlows.forEach((glow) => {
      tl.to(glow, { opacity: 0.6, duration: 0.5, ease: "power2.in" }, 0.2);
      tl.to(glow, { opacity: 0, duration: 0.5, ease: "power2.out" }, 0.8);
    });

    tearPaths.forEach((path) => {
      const length = path.getTotalLength();
      tl.fromTo(
        path,
        { strokeDasharray: `0 ${length}`, strokeDashoffset: 0 },
        { strokeDasharray: `${length} 0`, strokeDashoffset: 0, duration: 1.2, ease: "power2.inOut" },
        0.4
      );
    });

    circles.forEach((circle, i) => {
      tl.to(
        circle,
        { opacity: 0, attr: { r: 1 }, duration: 0.4, ease: "power2.out" },
        1.4 + (i / circles.length) * 0.2
      );
    });

    tl.fromTo(headlineRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, 1.6);
    tl.fromTo(ctaRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, 1.8);

    timelineRef.current = tl;

    scrollTriggerRef.current = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: "bottom top",
      scrub: isMobile ? 0.5 : 0.3,
      onUpdate: (self) => {
        tl.progress(self.progress);
      },
    });

    logger.info("MacrophageHero animation built", { particleCount, isMobile });
  }, [isMobile, particleCount]);

  useEffect(() => {
    const timer = setTimeout(buildAnimation, 100);
    return () => {
      clearTimeout(timer);
      timelineRef.current?.kill();
      scrollTriggerRef.current?.kill();
    };
  }, [buildAnimation, particleCount]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[200vh] overflow-hidden"
      style={{ background: "var(--color-surface-deep, #0A0A0B)" }}
    >
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center">
        <div className="relative w-full max-w-4xl mx-auto px-4">
          <JerseySVG
            svgRef={jerseySvgRef}
            className="w-full h-auto"
          />

          <svg
            ref={particleSvgRef}
            viewBox="0 0 800 600"
            className="absolute inset-0 w-full h-full pointer-events-none"
            aria-hidden="true"
          >
            <ParticleSystem
              count={particleCount}
              svgWidth={800}
              svgHeight={600}
            />
          </svg>
        </div>

        <div className="absolute bottom-20 left-0 right-0 text-center px-4">
          <h2
            ref={headlineRef}
            className="text-3xl md:text-5xl font-bold leading-tight mb-6 opacity-0"
            style={{ color: "var(--color-text-primary, #E8E8E3)" }}
          >
            Your jersey&apos;s not broken.
            <br />
            It&apos;s just getting started.
          </h2>

          <div ref={ctaRef} className="opacity-0">
            <a
              href="https://wa.me/27721234567"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-lg font-bold transition-all hover:scale-105"
              style={{
                background: "var(--color-brand-green, #00E859)",
                color: "#0A0A0B",
              }}
            >
              Send Your Jersey
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
