"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/motion";
import { Footer } from "@/components/layout/footer";
import { useRef } from "react";

/* ── Data ── */

const _featuredWork = [
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

/* ── Section helpers ── */

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

/* ── Featured Work Card ── */

function FeaturedWorkCard({
  work,
  index,
}: {
  work: (typeof _featuredWork)[number];
  index: number;
}) {
  const isEven = index % 2 === 1;

  return (
    <FullBleedSection
      id={`work-0${index + 1}`}
      className="relative border-t border-white/5"
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
        style={{
          background: `radial-gradient(ellipse 60% 50% at ${isEven ? "70%" : "30%"} 50%, ${work.accent}08 0%, transparent 70%)`,
        }}
      />

      <div
        className={`mx-auto grid w-full max-w-7xl grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24 ${isEven ? "" : ""}`}
      >
        {/* Content side */}
        <div
          className={`flex flex-col justify-center ${isEven ? "lg:order-2" : "lg:order-1"}`}
        >
          <ScrollReveal direction="up" delay={0.1}>
            <p
              className="text-[10px] font-semibold tracking-[0.3em] uppercase"
              style={{ color: work.accent }}
            >
              Featured Work
            </p>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.15}>
            <p
              className="font-display mt-4 text-[clamp(5rem,14vw,10rem)] font-extrabold leading-[0.78] tracking-[-0.05em] select-none"
              style={{ color: `${work.accent}15` }}
            >
              {work.number}
            </p>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.2}>
            <h2 className="font-display -mt-2 text-3xl font-bold tracking-[-0.02em] sm:text-4xl lg:text-5xl leading-[1.05]">
              {work.title.split(" ").map((word, i) => (
                <span key={i}>
                  {word}
                  {i < work.title.split(" ").length - 1 && <br />}
                </span>
              ))}
            </h2>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.3}>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-text-secondary sm:text-base">
              {work.description}
            </p>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.4}>
            <Link
              href={work.link}
              className="group mt-8 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-white/70 uppercase hover:text-white transition-all duration-300 border-b border-transparent hover:border-white/30 pb-0.5"
            >
              View Project
              <motion.span
                className="inline-block"
                initial={false}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <ArrowRight className="size-3" />
              </motion.span>
            </Link>
          </ScrollReveal>
        </div>

        {/* Media side */}
        <ScrollReveal
          direction={isEven ? "left" : "right"}
          delay={0.2}
          className={`flex items-center justify-center ${isEven ? "lg:order-1" : "lg:order-2"}`}
        >
          <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-gradient-to-br from-bg-elevated to-surface group cursor-pointer">
            {/* Editorial grid lines */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              aria-hidden="true"
              style={{
                backgroundImage: [
                  "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.08) 2px, rgba(255,255,255,0.08) 3px)",
                  "repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.08) 2px, rgba(255,255,255,0.08) 3px)",
                ].join(", "),
              }}
            />
            {/* Accent corner markers */}
            <div
              className="absolute top-0 left-0 h-12 w-12"
              style={{
                borderTop: `2px solid ${work.accent}40`,
                borderLeft: `2px solid ${work.accent}40`,
              }}
            />
            <div
              className="absolute top-0 right-0 h-12 w-12"
              style={{
                borderTop: `2px solid ${work.accent}40`,
                borderRight: `2px solid ${work.accent}40`,
              }}
            />
            <div
              className="absolute bottom-0 left-0 h-12 w-12"
              style={{
                borderBottom: `2px solid ${work.accent}40`,
                borderLeft: `2px solid ${work.accent}40`,
              }}
            />
            <div
              className="absolute bottom-0 right-0 h-12 w-12"
              style={{
                borderBottom: `2px solid ${work.accent}40`,
                borderRight: `2px solid ${work.accent}40`,
              }}
            />
            <motion.span
              className="text-8xl opacity-40 select-none transition-all duration-500 group-hover:scale-110 group-hover:opacity-60"
              whileHover={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.5 }}
            >
              {work.media}
            </motion.span>
            {/* Hover reveal */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/40 to-transparent translate-y-full transition-transform duration-500 group-hover:translate-y-0" />
          </div>
        </ScrollReveal>
      </div>
    </FullBleedSection>
  );
}

/* ── Animated Stat ── */

function AnimatedStat({
  value,
  label,
  delay,
}: {
  value: string;
  label: string;
  delay: number;
}) {
  return (
    <ScrollReveal direction="up" delay={delay}>
      <div className="text-center group">
        <motion.p
          className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {value}
        </motion.p>
        <p className="mt-2 text-[11px] font-medium tracking-[0.15em] text-text-tertiary uppercase transition-colors duration-300 group-hover:text-green-400">
          {label}
        </p>
      </div>
    </ScrollReveal>
  );
}

/* ── Page ── */

export default function Home() {
  const prefersReduced = useReducedMotion();
  const heroRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-bg-deep text-text-primary overflow-x-hidden">
      <main>
        {/* ════════════════════════════════════════
            HERO — Full-viewport editorial splash
           ════════════════════════════════════════ */}
        <section
          ref={heroRef}
          className="relative isolate flex min-h-screen flex-col items-center justify-center overflow-hidden"
        >
          {/* Dark base with dramatic green atmospheric glow */}
          <div
            className="pointer-events-none absolute inset-0 -z-10"
            aria-hidden="true"
            style={{
              background: [
                "radial-gradient(ellipse 80% 50% at 50% 25%, rgba(0,232,89,0.10) 0%, transparent 70%)",
                "radial-gradient(ellipse 50% 40% at 20% 80%, rgba(0,232,89,0.06) 0%, transparent 50%)",
                "radial-gradient(ellipse 40% 30% at 80% 70%, rgba(0,168,107,0.04) 0%, transparent 50%)",
              ].join(", "),
            }}
          />
          {/* Noise texture */}
          <div
            className="pointer-events-none absolute inset-0 -z-20 opacity-[0.035]"
            aria-hidden="true"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            }}
          />
          {/* Editorial vignette */}
          <div
            className="pointer-events-none absolute inset-0 -z-10"
            aria-hidden="true"
            style={{
              background:
                "radial-gradient(ellipse 100% 80% at 50% 50%, transparent 40%, rgba(0,0,0,0.6) 100%)",
            }}
          />

          {/* Hero content */}
          <motion.div
            className="text-center px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <motion.h1
              className="font-display text-[clamp(4.5rem,16vw,12rem)] font-extrabold leading-[0.82] tracking-[-0.05em] text-white select-none"
              initial={{ opacity: 0, y: 60, filter: "blur(12px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{
                duration: 1.2,
                delay: 0.3,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              KitFix
            </motion.h1>

            {/* Subtitle with editorial divider */}
            <motion.div
              className="mt-6 flex flex-col items-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              <div className="h-px w-16 bg-gradient-to-r from-transparent via-green-400/60 to-transparent" />
              <p className="text-xs font-medium tracking-[0.4em] text-white/50 uppercase sm:text-sm">
                South Africa&apos;s Premier Jersey Restoration
              </p>
              <div className="h-px w-16 bg-gradient-to-r from-transparent via-green-400/60 to-transparent" />
            </motion.div>

            {/* Editorial tagline */}
            <motion.p
              className="mx-auto mt-8 max-w-lg text-[11px] font-light tracking-[0.25em] text-white/25 uppercase leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.3 }}
            >
              Every stitch tells a story
            </motion.p>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 0.8 }}
          >
            <span className="text-[9px] font-semibold tracking-[0.3em] text-white/20 uppercase">
              Scroll
            </span>
            <motion.div
              className="h-10 w-px bg-gradient-to-b from-green-400/40 to-transparent"
              animate={
                prefersReduced
                  ? {}
                  : { height: [32, 56, 32], opacity: [0.4, 0.8, 0.4] }
              }
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>

          {/* Bottom fade */}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bg-deep to-transparent" />
        </section>

        {/* ════════════════════════════════════════
            FEATURED WORK × 3 — Editorial spreads
           ════════════════════════════════════════ */}
        {_featuredWork.map((work, i) => (
          <FeaturedWorkCard key={work.number} work={work} index={i} />
        ))}

        {/* ════════════════════════════════════════
            STATS — Clean, minimal, editorial
           ════════════════════════════════════════ */}
        <section className="relative border-t border-white/5 px-6 py-24 lg:py-32">
          {/* Subtle green glow */}
          <div
            className="pointer-events-none absolute inset-0 -z-10"
            aria-hidden="true"
            style={{
              background:
                "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(0,232,89,0.04) 0%, transparent 60%)",
            }}
          />
          <div className="mx-auto max-w-5xl">
            <div className="grid grid-cols-2 gap-16 sm:grid-cols-4 sm:gap-8">
              {stats.map((stat, i) => (
                <AnimatedStat
                  key={stat.label}
                  value={stat.value}
                  label={stat.label}
                  delay={0.1 * i}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════
            OUR STORY — Craft & Heritage
           ════════════════════════════════════════ */}
        <FullBleedSection className="relative border-t border-white/5">
          {/* Ambient glow */}
          <div
            className="pointer-events-none absolute inset-0 -z-10"
            aria-hidden="true"
            style={{
              background:
                "radial-gradient(ellipse 50% 60% at 30% 50%, rgba(0,232,89,0.05) 0%, transparent 60%)",
            }}
          />
          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-24">
            <div>
              <ScrollReveal direction="up" delay={0.1}>
                <div className="flex items-center gap-3">
                  <div className="h-px w-8 bg-green-400/40" />
                  <p className="text-[10px] font-semibold tracking-[0.3em] text-green-400 uppercase">
                    Our Story
                  </p>
                </div>
              </ScrollReveal>
              <ScrollReveal direction="up" delay={0.15}>
                <h2 className="font-display mt-8 text-4xl font-bold tracking-[-0.03em] sm:text-5xl lg:text-6xl leading-[1.02]">
                  Craft &amp;<br />
                  <span className="text-green-400">Heritage</span>
                </h2>
              </ScrollReveal>
              <ScrollReveal direction="up" delay={0.2}>
                <div className="mt-8 space-y-5">
                  <p className="max-w-lg text-sm leading-relaxed text-text-secondary sm:text-base">
                    Born on the pitches of South Africa. Every jersey has a
                    story — match-winning goals, cup final tears, Friday night
                    lights. We don&apos;t just repair kits; we preserve
                    memories.
                  </p>
                  <p className="max-w-lg text-sm leading-relaxed text-text-secondary sm:text-base">
                    From Soweto to Cape Town, from amateur clubhouses to the
                    Springbok change room — our craft is rooted in the belief
                    that the best jersey is the one with history written into
                    every fibre.
                  </p>
                </div>
              </ScrollReveal>
              <ScrollReveal direction="up" delay={0.3}>
                <Link
                  href="#"
                  className="group mt-10 inline-flex items-center gap-3 px-6 py-3 bg-green-400/10 border border-green-400/20 text-green-400 text-xs font-semibold tracking-[0.2em] uppercase transition-all duration-300 hover:bg-green-400/20 hover:border-green-400/40"
                >
                  Our Process
                  <ArrowRight className="size-3 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </ScrollReveal>
            </div>
            <ScrollReveal
              direction="right"
              delay={0.2}
              className="flex items-center justify-center"
            >
              <div className="relative flex aspect-square w-full max-w-md items-center justify-center overflow-hidden bg-gradient-to-br from-green-900/20 via-bg-elevated to-bg group cursor-pointer">
                {/* Editorial grid */}
                <div
                  className="absolute inset-0 opacity-[0.03]"
                  aria-hidden="true"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(0,232,89,0.1) 4px, rgba(0,232,89,0.1) 5px)",
                  }}
                />
                {/* Corner accents */}
                <div className="absolute top-3 left-3 h-8 w-8 border-t border-l border-green-400/20" />
                <div className="absolute top-3 right-3 h-8 w-8 border-t border-r border-green-400/20" />
                <div className="absolute bottom-3 left-3 h-8 w-8 border-b border-l border-green-400/20" />
                <div className="absolute bottom-3 right-3 h-8 w-8 border-b border-r border-green-400/20" />
                <motion.div
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="block text-6xl opacity-30 select-none">
                    🇿🇦
                  </span>
                  <p className="mt-4 text-[10px] font-semibold tracking-[0.2em] text-white/20 uppercase">
                    Since 2024
                  </p>
                </motion.div>
              </div>
            </ScrollReveal>
          </div>
        </FullBleedSection>

        {/* ════════════════════════════════════════
            CLIENTS — Trusted By
           ════════════════════════════════════════ */}
        <section className="relative border-t border-white/5 px-6 py-24 lg:py-32">
          <div className="mx-auto max-w-6xl">
            <ScrollReveal direction="up" delay={0.1}>
              <div className="flex items-center justify-center gap-4 mb-16">
                <div className="h-px flex-1 max-w-32 bg-gradient-to-l from-white/10 to-transparent" />
                <p className="text-[10px] font-semibold tracking-[0.3em] text-white/40 uppercase text-center">
                  Trusted By
                </p>
                <div className="h-px flex-1 max-w-32 bg-gradient-to-r from-white/10 to-transparent" />
              </div>
            </ScrollReveal>
            <div className="grid grid-cols-3 gap-6 sm:grid-cols-6 sm:gap-8">
              {clubLogos.map((club, i) => (
                <ScrollReveal key={club.name} direction="up" delay={0.05 * i}>
                  <motion.div
                    className="flex aspect-square items-center justify-center border border-white/5 bg-white/[0.02] p-4 transition-all duration-500 cursor-default group"
                    whileHover={{ y: -4, borderColor: "rgba(0,232,89,0.2)" }}
                  >
                    <div className="text-center">
                      <div
                        className="mx-auto h-10 w-10 rounded-full transition-transform duration-500 group-hover:scale-110"
                        style={{ backgroundColor: club.color }}
                      />
                      <p className="mt-3 text-[10px] font-semibold tracking-[0.05em] text-text-tertiary leading-tight">
                        {club.name}
                      </p>
                    </div>
                  </motion.div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════
            SHOP — Match-Ready Kits
           ════════════════════════════════════════ */}
        <section id="shop" className="relative border-t border-white/5 px-6 py-24 lg:py-32">
          {/* Green glow */}
          <div
            className="pointer-events-none absolute inset-0 -z-10"
            aria-hidden="true"
            style={{
              background:
                "radial-gradient(ellipse 50% 40% at 50% 30%, rgba(0,232,89,0.04) 0%, transparent 60%)",
            }}
          />
          <div className="mx-auto max-w-6xl">
            <ScrollReveal direction="up" delay={0.1}>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-px w-8 bg-green-400/40" />
                <p className="text-[10px] font-semibold tracking-[0.3em] text-green-400 uppercase">
                  Shop
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={0.15}>
              <h2 className="font-display text-3xl font-bold tracking-[-0.02em] sm:text-4xl lg:text-5xl">
                Match-Ready Kits
              </h2>
            </ScrollReveal>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product, i) => (
                <ScrollReveal key={product.title} direction="up" delay={0.08 * i}>
                  <motion.div
                    className="group cursor-pointer"
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden bg-gradient-to-br from-bg-elevated to-surface border border-white/[0.03]">
                      {product.badge && (
                        <span className="absolute left-3 top-3 z-10 rounded-sm bg-green-500/20 px-2.5 py-1 text-[9px] font-semibold tracking-[0.1em] text-green-400 uppercase">
                          {product.badge}
                        </span>
                      )}
                      <motion.span
                        className="text-6xl transition-all duration-500 select-none"
                        aria-hidden="true"
                        whileHover={{ scale: 1.15, rotate: [0, -3, 3, 0] }}
                      >
                        👕
                      </motion.span>
                      {/* Hover overlay - editorial reveal */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-500 group-hover:bg-black/50">
                        <span className="translate-y-6 text-[10px] font-semibold tracking-[0.2em] text-white uppercase opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                          Quick View
                        </span>
                      </div>
                      {/* Bottom border reveal */}
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-400 scale-x-0 transition-transform duration-500 origin-left group-hover:scale-x-100" />
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
                  </motion.div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════
            CTA — Restore Your Kit
           ════════════════════════════════════════ */}
        <section className="relative border-t border-white/5 px-6 py-32 lg:py-40">
          {/* Dramatic green glow */}
          <div
            className="pointer-events-none absolute inset-0 -z-10"
            aria-hidden="true"
            style={{
              background: [
                "radial-gradient(ellipse 70% 40% at 50% 50%, rgba(0,232,89,0.06) 0%, transparent 70%)",
                "radial-gradient(ellipse 40% 30% at 80% 20%, rgba(0,232,89,0.04) 0%, transparent 50%)",
              ].join(", "),
            }}
          />
          <div className="mx-auto max-w-3xl text-center">
            <ScrollReveal direction="up" delay={0.1}>
              <motion.h2
                className="font-display text-4xl font-bold tracking-[-0.03em] sm:text-5xl lg:text-7xl leading-[1.02]"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                Restore Your
                <br />
                <span className="text-green-400">Kit</span>
              </motion.h2>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={0.2}>
              <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-text-secondary sm:text-base">
                Every jersey deserves a second half. Send us your kit and
                we&apos;ll bring it back to match-day condition.
              </p>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={0.3}>
              <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link
                  href="/sign-up"
                  className="group relative inline-flex items-center gap-2 overflow-hidden rounded-none border border-green-400 bg-green-400 px-8 py-3 text-xs font-semibold tracking-[0.2em] text-bg-deep uppercase transition-all duration-300 hover:bg-green-300"
                >
                  <span className="relative z-10">Get a Quote</span>
                  <motion.span
                    className="relative z-10 inline-block"
                    whileHover={{ x: 2 }}
                  >
                    <ArrowRight className="size-3" />
                  </motion.span>
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
