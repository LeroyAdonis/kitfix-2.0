"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Repair", href: "/repairs" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Contact", href: "/contact" },
];

export function LandingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <motion.header
      className={cn("sticky top-0 z-50 glass", scrolled && "scrolled")}
      initial={shouldReduceMotion ? undefined : { y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold tracking-wider uppercase text-text-primary"
        >
          KitFix
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link, i) => (
            <div key={link.label} className="flex items-center gap-1">
              {i > 0 && (
                <span className="mx-2 text-xs text-text-tertiary">·</span>
              )}
              <Link
                href={link.href}
                className="px-2 py-1 text-xs font-medium text-text-secondary tracking-wide transition-colors hover:text-text-primary"
              >
                {link.label}
              </Link>
            </div>
          ))}
          <Link
            href="/sign-up"
            className="ml-6 rounded-full border border-border px-4 py-1 text-xs font-medium text-text-secondary transition-colors hover:border-text-primary hover:text-text-primary"
          >
            Start a Repair
          </Link>
        </nav>

        {/* Mobile Toggle */}
        <button
          className="flex items-center justify-center md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? (
            <X className="size-6 text-text-primary" />
          ) : (
            <Menu className="size-6 text-text-primary" />
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <motion.div
          className="fixed inset-0 top-16 z-40 bg-bg-deep/98 backdrop-blur-xl md:hidden"
          initial={shouldReduceMotion ? undefined : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <nav className="flex flex-col items-center gap-6 px-6 pt-12">
            {NAV_LINKS.map((link, i) => (
              <motion.div
                key={link.label}
                initial={
                  shouldReduceMotion ? undefined : { opacity: 0, y: 16 }
                }
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.3 }}
              >
                <Link
                  href={link.href}
                  className="text-2xl font-semibold text-text-primary transition-colors hover:text-brand-green-bright"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
            <motion.div
              className="mt-4"
              initial={
                shouldReduceMotion ? undefined : { opacity: 0, y: 16 }
              }
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <Link
                href="/sign-up"
                className="rounded-full border border-border px-5 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:border-text-primary hover:text-text-primary"
                onClick={() => setMobileOpen(false)}
              >
                Start a Repair
              </Link>
            </motion.div>
          </nav>
        </motion.div>
      )}
    </motion.header>
  );
}
