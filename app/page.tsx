"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/motion";
import { Footer } from "@/components/layout/footer";

/* ── Data ── */

const featuredWork = [
  {
    number: "01",
    title: "VINTAGE RESTORATION",
    description:
      "Bringing a 1998 Kaizer Chiefs match-worn jersey back to life. Full re-weave, color match, period-correct patches — every stitch honours the original.",
    link: "#",
    accent: "#00E859",
    media: "👕",
  },
  {
    number: "02",
    title: "MATCH-DAY REPAIR",
    description:
      "Same-day turnaround for Orlando Pirates' starting XI. Three torn jerseys inspected, repaired, and returned before kick-off. The benchmark for speed without compromise.",
    link: "#",
    accent: "#C8A951",
    media: "⚡",
  },
  {
    number: "03",
    title: "CUSTOM TEAM KIT",
    description:
      "Complete redesign of U15 academy kit. Twenty-two jerseys, custom woven badges, individual name sets, and team-colour detailing across every size.",
    link: "#",
    accent: "#00A859",
    media: "🏆",
  },
];

const stats = [
  { value: "2500+", label: "Jerseys Restored" },
  { value: "98%", label: "Satisfaction" },
  { value: "4.9★", label: "Rating" },
  { value: "3 Days", label: "Turnaround" },
];

const clubLogos = [
  { name: "Kaizer Chiefs", color: "#D4AF37" },
  { name: "Orlando Pirates", color: "#000000" },
  { name: "Mamelodi Sundowns", color: "#FFD700" },
  { name: "Springboks", color: "#006633" },
  { name: "WP Rugby", color: "#003580" },
  { name: "Stellenbosch FC", color: "#E31837" },
];

const products = [
  {
    category: "Soccer",
    title: "Kaizer Chiefs 2024 Home",
    price: "R899",
  },
  {
    category: "Soccer",
    title: "Orlando Pirates 2024 Away",
    price: "R849",
  },
  {
    category: "Rugby",
    title: "Springbok 2023 RWC",
    price: "R1,299",
    badge: "Best Seller",
  },
  {
    category: "Soccer",
    title: "Bafana Bafana 2024 Home",
    price: "R799",
  },
];

/* ── Section helper ── */

function FullBleedSection({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={`min-h-screen flex flex-col justify-center px-6 py-24 ${className}`}
    >
      {children}
    </section>
  );
}

/* ── Page ── */

export default function Home() {
  const prefersReduced = useReducedMotion();

  return (
    <div className="min-h-screen bg-bg-deep text-text-primary overflow-x-hidden">
      {/* ── Minimal Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 mix-blend-difference">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 sm:px-8">
          <span className="text-xs font-semibold tracking-[0.25em] text-white uppercase">
            KitFix
          </span>
          <div className="flex gap-8 text-xs font-medium tracking-[0.15em] text-white/70 uppercase">
            <Link href="#" className="hover:text-white transition-colors duration-300">
              Repair
            </Link>
            <Link href="#shop" className="hover:text-white transition-colors duration-300">
              Shop
            </Link>
            <Link href="#" className="hover:text-white transition-colors duration-300">
              Contact
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* ── HERO — full viewport ── */}
        <section className="relative isolate flex min-h-screen flex-col items-center justify-center overflow-hidden">
          {/* Dark base with subtle green radial glow */}
          <div
            className="pointer-events-none absolute inset-0 -z-10"
            aria-hidden="true"
            style={{
              background: [
                "radial-gradient(ellipse 70% 60% at 50% 30%, rgba(0,232,89,0.08) 0%, transparent 70%)",
                "radial-gradient(ellipse 50% 40% at 80% 80%, rgba(0,168,107,0.05) 0%, transparent 50%)",
              ].join(", "),
            }}
          />
          {/* Subtle noise texture */}
          <div
            className="pointer-events-none absolute inset-0 -z-20 opacity-[0.03]"
            aria-hidden="true"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            }}
          />

          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <motion.h1
              className="font-display text-[clamp(4rem,14vw,10rem)] font-extrabold leading-[0.88] tracking-[-0.04em] text-white"
              initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              KitFix
            </motion.h1>
            <motion.p
              className="mt-4 text-xs font-medium tracking-[0.35em] text-white/50 uppercase sm:text-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              South Africa&apos;s Premier Jersey Restoration
            </motion.p>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.8 }}
          >
            <span className="text-[10px] font-semibold tracking-[0.2em] text-white/30 uppercase">
              Scroll
            </span>
            <motion.div
              className="h-8 w-px bg-gradient-to-b from-white/20 to-transparent"
              animate={prefersReduced ? {} : { height: [32, 48, 32] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </section>

        {/* ── FEATURED WORK — Project 01 ── */}
        <FullBleedSection id="work-01" className="relative border-t border-white/5">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24">
            <div className="flex flex-col justify-center">
              <ScrollReveal direction="up" delay={0.1}>
                <p className="text-[10px] font-semibold tracking-[0.3em] text-green-400 uppercase">
                  Featured Work
                </p>
              </ScrollReveal>
              <ScrollReveal direction="up" delay={0.2}>
                <p
                  className="font-display mt-4 text-[clamp(5rem,12vw,9rem)] font-extrabold leading-[0.85] tracking-[-0.04em]"
                  style={{ color: "rgba(0,232,89,0.12)" }}
                >
                  01
                </p>
              </ScrollReveal>
              <ScrollReveal direction="up" delay={0.3}>
                <h2 className="font-display mt-2 text-3xl font-bold tracking-[-0.02em] sm:text-4xl lg:text-5xl">
                  Vintage<br />Restoration
                </h2>
              </ScrollReveal>
              <ScrollReveal direction="up" delay={0.4}>
                <p className="mt-6 max-w-md text-sm leading-relaxed text-text-secondary sm:text-base">
                  Bringing a 1998 Kaizer Chiefs match-worn jersey back to life.
                  Full re-weave, color match, period-correct patches — every
                  stitch honours the original.
                </p>
              </ScrollReveal>
              <ScrollReveal direction="up" delay={0.5}>
                <Link
                  href="#"
                  className="group mt-8 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-white/70 uppercase hover:text-white transition-all duration-300"
                >
                  View Project
                  <ArrowRight className="size-3 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </ScrollReveal>
            </div>
            <ScrollReveal direction="right" delay={0.2} className="flex items-center justify-center">
              <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-sm bg-gradient-to-br from-green-900/20 to-bg-elevated">
                <div
                  className="absolute inset-0 opacity-[0.04]"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,232,89,0.15) 2px, rgba(0,232,89,0.15) 3px)",
                  }}
                />
                <span className="text-8xl opacity-40 select-none">👕</span>
              </div>
            </ScrollReveal>
          </div>
        </FullBleedSection>

        {/* ── FEATURED WORK — Project 02 ── */}
        <FullBleedSection id="work-02" className="relative border-t border-white/5">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24">
            {/* Media first on mobile, second on desktop for alternating layout */}
            <ScrollReveal
              direction="left"
              delay={0.2}
              className="order-1 flex items-center justify-center lg:order-1"
            >
              <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-sm bg-gradient-to-br from-yellow-900/20 to-bg-elevated">
                <div
                  className="absolute inset-0 opacity-[0.04]"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(200,169,81,0.15) 2px, rgba(200,169,81,0.15) 3px)",
                  }}
                />
                <span className="text-8xl opacity-40 select-none">⚡</span>
              </div>
            </ScrollReveal>
            <div className="order-2 flex flex-col justify-center lg:order-2">
              <ScrollReveal direction="up" delay={0.1}>
                <p className="text-[10px] font-semibold tracking-[0.3em] text-yellow-400 uppercase">
                  Featured Work
                </p>
              </ScrollReveal>
              <ScrollReveal direction="up" delay={0.2}>
                <p
                  className="font-display mt-4 text-[clamp(5rem,12vw,9rem)] font-extrabold leading-[0.85] tracking-[-0.04em]"
                  style={{ color: "rgba(200,169,81,0.12)" }}
                >
                  02
                </p>
              </ScrollReveal>
              <ScrollReveal direction="up" delay={0.3}>
                <h2 className="font-display mt-2 text-3xl font-bold tracking-[-0.02em] sm:text-4xl lg:text-5xl">
                  Match-Day<br />Repair
                </h2>
              </ScrollReveal>
              <ScrollReveal direction="up" delay={0.4}>
                <p className="mt-6 max-w-md text-sm leading-relaxed text-text-secondary sm:text-base">
                  Same-day turnaround for Orlando Pirates&apos; starting XI. Three
                  torn jerseys inspected, repaired, and returned before
                  kick-off. The benchmark for speed without compromise.
                </p>
              </ScrollReveal>
              <ScrollReveal direction="up" delay={0.5}>
                <Link
                  href="#"
                  className="group mt-8 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-white/70 uppercase hover:text-white transition-all duration-300"
                >
                  View Project
                  <ArrowRight className="size-3 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </ScrollReveal>
            </div>
          </div>
        </FullBleedSection>

        {/* ── FEATURED WORK — Project 03 ── */}
        <FullBleedSection id="work-03" className="relative border-t border-white/5">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24">
            <div className="flex flex-col justify-center">
              <ScrollReveal direction="up" delay={0.1}>
                <p className="text-[10px] font-semibold tracking-[0.3em] text-green-300 uppercase">
                  Featured Work
                </p>
              </ScrollReveal>
              <ScrollReveal direction="up" delay={0.2}>
                <p
                  className="font-display mt-4 text-[clamp(5rem,12vw,9rem)] font-extrabold leading-[0.85] tracking-[-0.04em]"
                  style={{ color: "rgba(0,168,107,0.12)" }}
                >
                  03
                </p>
              </ScrollReveal>
              <ScrollReveal direction="up" delay={0.3}>
                <h2 className="font-display mt-2 text-3xl font-bold tracking-[-0.02em] sm:text-4xl lg:text-5xl">
                  Custom<br />Team Kit
                </h2>
              </ScrollReveal>
              <ScrollReveal direction="up" delay={0.4}>
                <p className="mt-6 max-w-md text-sm leading-relaxed text-text-secondary sm:text-base">
                  Complete redesign of U15 academy kit. Twenty-two jerseys,
                  custom woven badges, individual name sets, and team-colour
                  detailing across every size.
                </p>
              </ScrollReveal>
              <ScrollReveal direction="up" delay={0.5}>
                <Link
                  href="#"
                  className="group mt-8 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-white/70 uppercase hover:text-white transition-all duration-300"
                >
                  View Project
                  <ArrowRight className="size-3 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </ScrollReveal>
            </div>
            <ScrollReveal direction="right" delay={0.2} className="flex items-center justify-center">
              <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-sm bg-gradient-to-br from-green-600/20 to-bg-elevated">
                <div
                  className="absolute inset-0 opacity-[0.04]"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,168,107,0.15) 2px, rgba(0,168,107,0.15) 3px)",
                  }}
                />
                <span className="text-8xl opacity-40 select-none">🏆</span>
              </div>
            </ScrollReveal>
          </div>
        </FullBleedSection>

        {/* ── STATS — clean, minimal ── */}
        <section className="border-t border-white/5 px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <div className="grid grid-cols-2 gap-12 sm:grid-cols-4 sm:gap-8">
              {stats.map((stat, i) => (
                <ScrollReveal key={stat.label} direction="up" delay={0.1 * i}>
                  <div className="text-center">
                    <p className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                      {stat.value}
                    </p>
                    <p className="mt-2 text-[11px] font-medium tracking-[0.15em] text-text-tertiary uppercase">
                      {stat.label}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── OUR STORY — Craft & Heritage ── */}
        <FullBleedSection className="border-t border-white/5">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-24">
            <div>
              <ScrollReveal direction="up" delay={0.1}>
                <p className="text-[10px] font-semibold tracking-[0.3em] text-green-400 uppercase">
                  Our Story
                </p>
              </ScrollReveal>
              <ScrollReveal direction="up" delay={0.2}>
                <h2 className="font-display mt-4 text-4xl font-bold tracking-[-0.03em] sm:text-5xl lg:text-6xl">
                  Craft &amp;<br />
                  <span className="text-green-400">Heritage</span>
                </h2>
              </ScrollReveal>
              <ScrollReveal direction="up" delay={0.3}>
                <p className="mt-8 max-w-lg text-sm leading-relaxed text-text-secondary sm:text-base">
                  Born on the pitches of South Africa. Every jersey has a story
                  — match-winning goals, cup final tears, Friday night lights.
                  We don&apos;t just repair kits; we preserve memories.
                </p>
              </ScrollReveal>
              <ScrollReveal direction="up" delay={0.4}>
                <p className="mt-4 max-w-lg text-sm leading-relaxed text-text-secondary sm:text-base">
                  From Soweto to Cape Town, from amateur clubhouses to the
                  Springbok change room — our craft is rooted in the belief that
                  the best jersey is the one with history written into every
                  fibre.
                </p>
              </ScrollReveal>
            </div>
            <ScrollReveal direction="right" delay={0.2} className="flex items-center justify-center">
              <div className="relative flex aspect-square w-full max-w-md items-center justify-center overflow-hidden rounded-sm bg-gradient-to-br from-green-900/20 via-bg-elevated to-bg">
                <div
                  className="absolute inset-0 opacity-[0.03]"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(0,232,89,0.15) 4px, rgba(0,232,89,0.15) 5px)",
                  }}
                />
                <div className="text-center">
                  <span className="block text-6xl opacity-30 select-none">🇿🇦</span>
                  <p className="mt-4 text-[10px] font-semibold tracking-[0.2em] text-white/20 uppercase">
                    Since 2024
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </FullBleedSection>

        {/* ── CLIENTS — Trusted By ── */}
        <section className="border-t border-white/5 px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <ScrollReveal direction="up" delay={0.1}>
              <p className="mb-16 text-center text-[10px] font-semibold tracking-[0.3em] text-white/40 uppercase">
                Trusted By
              </p>
            </ScrollReveal>
            <div className="grid grid-cols-3 gap-8 sm:grid-cols-6 sm:gap-12">
              {clubLogos.map((club, i) => (
                <ScrollReveal key={club.name} direction="up" delay={0.05 * i}>
                  <div className="flex aspect-square items-center justify-center rounded-sm border border-white/5 bg-white/[0.02] p-4 transition-colors duration-300 hover:border-white/10">
                    <div className="text-center">
                      <div
                        className="mx-auto h-8 w-8 rounded-full"
                        style={{ backgroundColor: club.color }}
                      />
                      <p className="mt-3 text-[10px] font-semibold tracking-[0.05em] text-text-tertiary leading-tight">
                        {club.name}
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── SHOP — Match-Ready Kits ── */}
        <section
          id="shop"
          className="border-t border-white/5 px-6 py-24"
        >
          <div className="mx-auto max-w-6xl">
            <ScrollReveal direction="up" delay={0.1}>
              <p className="mb-2 text-[10px] font-semibold tracking-[0.3em] text-green-400 uppercase">
                Shop
              </p>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={0.15}>
              <h2 className="font-display text-3xl font-bold tracking-[-0.02em] sm:text-4xl">
                Match-Ready Kits
              </h2>
            </ScrollReveal>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product, i) => (
                <ScrollReveal key={product.title} direction="up" delay={0.08 * i}>
                  <div className="group cursor-pointer">
                    <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden bg-gradient-to-br from-bg-elevated to-surface">
                      {product.badge && (
                        <span className="absolute left-3 top-3 rounded-sm bg-green-500/20 px-2 py-1 text-[9px] font-semibold tracking-[0.1em] text-green-400 uppercase">
                          {product.badge}
                        </span>
                      )}
                      <span
                        className="text-6xl transition-transform duration-500 group-hover:scale-110 select-none"
                        aria-hidden="true"
                      >
                        👕
                      </span>
                      {/* Hover overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-500 group-hover:bg-black/40">
                        <span className="translate-y-4 text-[10px] font-semibold tracking-[0.2em] text-white uppercase opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                          Quick View
                        </span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-[10px] font-semibold tracking-[0.15em] text-text-tertiary uppercase">
                        {product.category}
                      </p>
                      <h3 className="mt-1 text-sm font-bold tracking-[-0.01em]">
                        {product.title}
                      </h3>
                      <p className="mt-1 text-base font-bold text-green-400">
                        {product.price}
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA — Restore Your Kit ── */}
        <section className="border-t border-white/5 px-6 py-32">
          <div className="mx-auto max-w-3xl text-center">
            <ScrollReveal direction="up" delay={0.1}>
              <h2 className="font-display text-4xl font-bold tracking-[-0.03em] sm:text-5xl lg:text-6xl">
                Restore Your Kit
              </h2>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={0.2}>
              <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-text-secondary sm:text-base">
                Every jersey deserves a second half. Send us your kit and we&apos;ll
                bring it back to match-day condition.
              </p>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={0.3}>
              <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link
                  href="/sign-up"
                  className="inline-flex items-center gap-2 rounded-none border border-green-400 bg-green-400 px-8 py-3 text-xs font-semibold tracking-[0.2em] text-bg-deep uppercase transition-all duration-300 hover:bg-green-300"
                >
                  Get a Quote
                  <ArrowRight className="size-3" />
                </Link>
                <Link
                  href="#work-01"
                  className="inline-flex items-center gap-2 rounded-none border border-white/20 px-8 py-3 text-xs font-semibold tracking-[0.2em] text-white/80 uppercase transition-all duration-300 hover:border-white/50 hover:text-white"
                >
                  Our Work
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ── Footer ── */}
        <Footer />
      </main>
    </div>
  );
}
