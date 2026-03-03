"use client";

import { useState } from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  useReducedMotion,
  AnimatePresence,
} from "framer-motion";
import { Scissors, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
] as const;

const SCROLL_THRESHOLD = 50;

export function GlassmorphismNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const shouldReduceMotion = useReducedMotion();

  // Smooth height transition driven by scroll position
  const navHeight = useTransform(scrollY, [0, SCROLL_THRESHOLD], [80, 64]);
  const bgOpacity = useTransform(scrollY, [0, SCROLL_THRESHOLD], [0, 0.6]);
  const borderColor = useTransform(scrollY, [0, SCROLL_THRESHOLD], [
    "oklch(0.91 0.02 260 / 0)",
    "oklch(0.91 0.02 260 / 0.4)",
  ]);

  // Track boolean state for blur toggle (CSS backdrop-filter can't be partially applied via motion value)
  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > SCROLL_THRESHOLD);
  });

  return (
    <>
      <motion.nav
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[backdrop-filter] duration-300",
          scrolled && "backdrop-blur-xl"
        )}
        style={{
          height: navHeight,
          borderBottomWidth: 1,
          borderBottomColor: borderColor,
        }}
        aria-label="Main navigation"
      >
        {/* Dynamic background layer */}
        <motion.div
          className="absolute inset-0 -z-10 bg-background"
          style={{ opacity: bgOpacity }}
        />

        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-6">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-foreground"
            aria-label="KitFix home"
          >
            <Scissors className="size-5" />
            <span className="text-lg font-bold tracking-tight">KitFix</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <Link
              href="/sign-up"
              className="inline-flex h-9 items-center justify-center rounded-lg px-5 text-sm font-medium text-primary-foreground shadow-sm transition-shadow hover:shadow-[var(--glow-primary)]"
              style={{ background: "var(--gradient-primary)" }}
            >
              Get Started
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="flex size-10 items-center justify-center rounded-lg text-foreground/70 transition-colors hover:text-foreground md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </motion.nav>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-[60] flex flex-col bg-background/95 backdrop-blur-2xl overscroll-contain md:hidden"
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.25 }}
          >
            {/* Close button */}
            <div className="flex h-20 items-center justify-between px-6">
              <Link
                href="/"
                className="flex items-center gap-2 text-foreground"
                aria-label="KitFix home"
                onClick={() => setMobileOpen(false)}
              >
                <Scissors className="size-5" />
                <span className="text-lg font-bold tracking-tight">
                  KitFix
                </span>
              </Link>
              <button
                className="flex size-10 items-center justify-center rounded-lg text-foreground/70 transition-colors hover:text-foreground"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Mobile links */}
            <nav className="flex flex-1 flex-col items-center justify-center gap-8">
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={shouldReduceMotion ? undefined : { opacity: 0, y: 10 }}
                  transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.1 + i * 0.08, duration: 0.3 }}
                >
                  <Link
                    href={link.href}
                    className="text-2xl font-semibold text-foreground/80 transition-colors hover:text-foreground"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, y: 10 }}
                transition={shouldReduceMotion ? { duration: 0 } : {
                  delay: 0.1 + NAV_LINKS.length * 0.08,
                  duration: 0.3,
                }}
              >
                <Link
                  href="/sign-up"
                  className="inline-flex h-12 items-center justify-center rounded-xl px-8 text-base font-medium text-primary-foreground shadow-sm transition-shadow hover:shadow-[var(--glow-primary)]"
                  style={{ background: "var(--gradient-primary)" }}
                  onClick={() => setMobileOpen(false)}
                >
                  Get Started
                </Link>
              </motion.div>

              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, y: 10 }}
                transition={shouldReduceMotion ? { duration: 0 } : {
                  delay: 0.1 + (NAV_LINKS.length + 1) * 0.08,
                  duration: 0.3,
                }}
              >
                <Link
                  href="/sign-in"
                  className="text-base font-medium text-foreground/60 transition-colors hover:text-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign In
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
