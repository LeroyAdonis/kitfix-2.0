"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Repair", href: "/repairs" },
  { label: "Shop", href: "/shop" },
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
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out-expo",
        scrolled || mobileOpen
          ? "bg-bg-deep/85 backdrop-blur-xl border-b border-white/[0.03]"
          : "mix-blend-difference"
      )}
      initial={shouldReduceMotion ? undefined : { y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 group"
        >
          <Image src="/logo.svg" alt="KitFix" width={20} height={20} className="h-5 w-auto transition-opacity duration-300 group-hover:opacity-80" />
          {/* Brand dot */}
          <span className="hidden sm:block h-1.5 w-1.5 rounded-full bg-green-400 transition-all duration-300 group-hover:shadow-[0_0_8px_rgba(0,232,89,0.5)]" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-10 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="relative text-xs font-medium tracking-[0.15em] text-white/70 uppercase transition-colors duration-300 hover:text-white group"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 right-0 h-px bg-green-400/60 scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100" />
            </Link>
          ))}
        </nav>

        {/* Mobile Toggle */}
        <button
          className="flex items-center justify-center md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? (
            <X className="size-5 text-white" />
          ) : (
            <Menu className="size-5 text-white" />
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <motion.div
          className="fixed inset-0 top-16 z-40 bg-bg-deep/98 backdrop-blur-xl md:hidden"
          initial={shouldReduceMotion ? undefined : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
        >
          <nav className="flex flex-col items-center gap-10 px-6 pt-20">
            {NAV_LINKS.map((link, i) => (
              <motion.div
                key={link.label}
                initial={
                  shouldReduceMotion ? undefined : { opacity: 0, y: 20 }
                }
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * i, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  href={link.href}
                  className="text-3xl font-semibold text-white transition-colors hover:text-green-400 font-display"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
            {/* Mobile brand accent */}
            <motion.div
              className="mt-6 h-px w-20 bg-gradient-to-r from-transparent via-green-400/40 to-transparent"
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            />
          </nav>
        </motion.div>
      )}
    </motion.header>
  );
}
