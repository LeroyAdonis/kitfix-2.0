"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown, Star } from "lucide-react";
import {
  AnimatedText,
  ScrollReveal,
  AnimatedCounter,
} from "@/components/motion";

const stats = [
  { value: 2500, suffix: "+", label: "Jerseys Repaired" },
  { value: 98, suffix: "%", label: "Satisfaction Rate" },
  { value: 4.9, label: "Rating", hasStar: true },
  { value: 3, suffix: " Days", label: "Turnaround" },
];

const steps = [
  {
    number: "01",
    title: "Submit Your Jersey",
    description: "Snap photos of the damage and tell us what needs fixing. Takes 2 minutes.",
  },
  {
    number: "02",
    title: "Get a Quote",
    description: "We assess the damage and send you a fixed-price quote within 24 hours.",
  },
  {
    number: "03",
    title: "We Repair It",
    description: "Our technicians restore your jersey with matching materials and techniques.",
  },
  {
    number: "04",
    title: "Track & Receive",
    description: "Real-time tracking from our workshop to your door. Free SA delivery.",
    highlighted: true,
  },
];

const products = [
  {
    category: "Soccer",
    title: "Kaizer Chiefs 2024 Home",
    price: "R899",
    sizes: ["S", "M", "L", "XL", "2XL"],
    badge: "New",
  },
  {
    category: "Soccer",
    title: "Orlando Pirates 2024 Away",
    price: "R849",
    sizes: ["S", "M", "L", "XL", "2XL"],
  },
  {
    category: "Rugby",
    title: "Springbok 2023 RWC",
    price: "R1,299",
    sizes: ["S", "M", "L", "XL", "2XL"],
    badge: "Best Seller",
    goldBadge: true,
  },
  {
    category: "Soccer",
    title: "Bafana Bafana 2024 Home",
    price: "R799",
    sizes: ["S", "M", "L", "XL", "2XL"],
  },
];

const footerLinks = {
  Services: ["Jersey Repair", "Customisation", "Vintage Restoration", "Bulk Team Orders"],
  Shop: ["All Jerseys", "Soccer", "Rugby", "Custom Blanks"],
  Company: ["About Us", "How It Works", "Track Repair", "Contact"],
};

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <main id="main-content">
        {/* ── Hero ── */}
        <section className="relative isolate flex min-h-screen flex-col items-center justify-center overflow-hidden bg-bg-deep">
          <div
            className="pointer-events-none absolute inset-0 -z-20"
            aria-hidden="true"
            style={{
              background: [
                "radial-gradient(ellipse 80% 60% at 50% -20%, rgba(0,119,73,0.15) 0%, transparent 60%)",
                "radial-gradient(ellipse 60% 50% at 80% 80%, rgba(200,169,81,0.08) 0%, transparent 50%)",
                "radial-gradient(ellipse 70% 50% at 20% 80%, rgba(200,169,81,0.06) 0%, transparent 50%)",
              ].join(", "),
            }}
          />
          <div
            className="pointer-events-none absolute inset-0 -z-10"
            aria-hidden="true"
            style={{
              backgroundImage: [
                "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)",
                "linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
              ].join(", "),
              backgroundSize: "60px 60px",
            }}
          />

          <div className="mx-auto max-w-5xl px-6 pt-24 pb-16 text-center">
            <motion.div
              className="mb-8 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-widest"
              style={{
                borderColor: "rgba(200,169,81,0.25)",
                background: "rgba(200,169,81,0.08)",
                color: "var(--brand-gold)",
              }}
              initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              ✦ Trusted by 500+ SA Clubs
            </motion.div>

            <motion.h1
              className="font-display mx-auto max-w-4xl text-5xl font-extrabold leading-[0.95] tracking-[-3px] [text-wrap:balance] sm:text-7xl lg:text-8xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              We Fix{" "}
              <span
                className="bg-gradient-to-r from-brand-gold to-brand-gold-light bg-clip-text text-transparent"
              >
                What Matters
              </span>
            </motion.h1>

            <motion.p
              className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-text-secondary sm:text-xl"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              South Africa&apos;s premier jersey repair service. From match-day
              tears to vintage restoration — we bring your kit back to life.
            </motion.p>

            <motion.div
              className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.1 }}
            >
              <Link href="/sign-up" className="btn-primary">
                Start a Repair
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link href="/shop" className="btn-secondary">
                Browse Shop
              </Link>
            </motion.div>
          </div>

          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.6 }}
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <ChevronDown className="size-5 text-text-tertiary/50" aria-hidden="true" />
            </motion.div>
          </motion.div>
        </section>

        {/* ── Stats Bar ── */}
        <section className="border-t border-border bg-bg">
          <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
            <div className="grid grid-cols-2 gap-y-10 sm:grid-cols-4 sm:gap-8">
              {stats.map((stat) => (
                <ScrollReveal key={stat.label} direction="up" delay={0.1}>
                  <div className="text-center">
                    <p className="font-display flex items-center justify-center gap-1 text-4xl font-extrabold tracking-tight text-brand-gold sm:text-5xl">
                      {stat.hasStar ? (
                        <>
                          <AnimatedCounter
                            value={4.9}
                            duration={2.5}
                            className="tabular-nums"
                          />
                          <Star
                            className="size-6 fill-brand-gold"
                            aria-hidden="true"
                          />
                        </>
                      ) : (
                        <AnimatedCounter
                          value={stat.value}
                          suffix={stat.suffix}
                          duration={2.5}
                          className="tabular-nums"
                        />
                      )}
                    </p>
                    <p className="mt-2 text-sm font-medium text-text-tertiary">
                      {stat.label}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section id="how-it-works" className="border-t border-border bg-bg-deep">
          <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
            <div className="mb-16">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">
                ✦ Process
              </p>
              <AnimatedText
                text="How It Works"
                as="h2"
                delay={0.1}
                stagger={0.06}
                className="mt-3 text-4xl font-extrabold tracking-[-2px] sm:text-5xl"
              />
              <p className="mt-4 text-lg text-text-secondary">
                From sideline to spotlight
              </p>
            </div>

            <div className="relative grid gap-6 md:grid-cols-4 md:gap-4">
              {steps.map((step, i) => (
                <ScrollReveal key={step.title} direction="up" delay={0.1 * i}>
                  <div
                    className="card-base relative p-8"
                    style={
                      step.highlighted
                        ? { borderColor: "rgba(200,169,81,0.35)" }
                        : undefined
                    }
                  >
                    {i < steps.length - 1 && (
                      <div
                        className="pointer-events-none absolute -right-3 top-1/2 hidden -translate-y-1/2 text-xl text-text-tertiary md:block"
                        aria-hidden="true"
                      >
                        →
                      </div>
                    )}
                    <p
                      className="font-display text-5xl font-extrabold leading-none"
                      style={{
                        color: step.highlighted
                          ? "rgba(200,169,81,0.25)"
                          : "rgba(200,169,81,0.12)",
                      }}
                    >
                      {step.number}
                    </p>
                    <h3
                      className="mt-4 text-base font-bold"
                      style={
                        step.highlighted
                          ? { color: "var(--brand-gold)" }
                          : undefined
                      }
                    >
                      {step.title}
                    </h3>
                    <p
                      className="mt-2 text-sm leading-relaxed"
                      style={
                        step.highlighted
                          ? { color: "var(--text-primary)" }
                          : { color: "var(--text-secondary)" }
                      }
                    >
                      {step.description}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Product Showcase ── */}
        <section id="shop" className="border-t border-border bg-bg">
          <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
            <div className="mb-16">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">
                ✦ Shop
              </p>
              <AnimatedText
                text="Premium Jerseys"
                as="h2"
                delay={0.1}
                stagger={0.06}
                className="mt-3 text-4xl font-extrabold tracking-[-2px] sm:text-5xl"
              />
              <p className="mt-4 text-lg text-text-secondary">
                Built for SA Teams
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product, i) => (
                <ScrollReveal key={product.title} direction="up" delay={0.08 * i}>
                  <div className="card-base overflow-hidden">
                    <div className="relative flex aspect-[3/4] items-center justify-center bg-gradient-to-br from-bg-elevated to-surface">
                      {product.badge && (
                        <span
                          className={`badge absolute left-3 top-3 ${
                            product.goldBadge
                              ? "badge-gold"
                              : "badge-success"
                          }`}
                        >
                          {product.badge}
                        </span>
                      )}
                      <span className="text-5xl opacity-50" aria-hidden="true">
                        👕
                      </span>
                    </div>
                    <div className="p-5">
                      <p className="text-[11px] font-semibold uppercase tracking-[1px] text-text-tertiary">
                        {product.category}
                      </p>
                      <h3 className="font-display mt-2 text-lg font-bold tracking-[-0.3px]">
                        {product.title}
                      </h3>
                      <p className="mt-2 text-xl font-bold text-brand-gold">
                        {product.price}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {product.sizes.map((size) => (
                          <span
                            key={size}
                            className="rounded-md bg-bg-elevated px-2.5 py-1 text-[11px] font-semibold text-text-secondary"
                          >
                            {size}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="border-t border-border bg-bg-deep">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <div className="font-display flex items-center gap-2.5 text-2xl font-extrabold tracking-[-0.5px]">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-gold to-brand-gold-light text-sm text-text-inverse">
                    ✦
                  </span>
                  Kit<span className="text-brand-gold">Fix</span>
                </div>
                <p className="mt-4 max-w-xs text-sm leading-relaxed text-text-secondary">
                  South Africa&apos;s trusted jersey repair and customisation
                  service. We bring your kit back to life.
                </p>
              </div>
              {Object.entries(footerLinks).map(([heading, links]) => (
                <div key={heading}>
                  <h4 className="text-[11px] font-semibold uppercase tracking-[1px] text-text-tertiary">
                    {heading}
                  </h4>
                  <nav
                    className="mt-5 flex flex-col gap-3"
                    aria-label={heading}
                  >
                    {links.map((item) => (
                      <Link
                        key={item}
                        href="#"
                        className="text-sm text-text-secondary transition-colors hover:text-text-primary"
                      >
                        {item}
                      </Link>
                    ))}
                  </nav>
                </div>
              ))}
            </div>
            <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-sm text-text-tertiary sm:flex-row">
              <span>
                &copy; {new Date().getFullYear()} KitFix. All rights reserved.
              </span>
              <span>Proudly South African 🇿🇦</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
