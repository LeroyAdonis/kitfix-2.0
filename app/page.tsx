"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown, Star, Camera, Brain, Zap } from "lucide-react";
import {
  AnimatedText,
  ScrollReveal,
  AnimatedCounter,
} from "@/components/motion";
import { Footer } from "@/components/layout/footer";

const stats = [
  { value: 2500, suffix: "+", label: "Jerseys Repaired" },
  { value: 98, suffix: "%", label: "Satisfaction Rate" },
  { value: 4.9, label: "Rating", hasStar: true },
  { value: 3, suffix: " Days", label: "Turnaround" },
];

const steps = [
  {
    number: "01",
    title: "Describe Damage",
    description: "Snap photos of the damage and tell us what needs fixing — or let our AI analyse it for you.",
  },
  {
    number: "02",
    title: "AI Assessment",
    description: "Our AI engine evaluates the damage and generates a fixed-price quote in seconds.",
    highlighted: true,
  },
  {
    number: "03",
    title: "Expert Repair",
    description: "Our technicians restore your jersey with matching materials and pro techniques.",
  },
  {
    number: "04",
    title: "Track & Receive",
    description: "Real-time tracking from our workshop to your door. Free SA delivery.",
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

const testimonials = [
  {
    quote: "Saved my vintage Kaizer Chiefs jersey. The repair is flawless — you can't even tell it was torn.",
    author: "Thabo M.",
    rating: 5,
    location: "Soweto, Gauteng",
  },
  {
    quote: "Quick turnaround and professional service. Dropped it off Monday, got it back Wednesday. Will definitely use again.",
    author: "Sarah K.",
    rating: 5,
    location: "Cape Town, WC",
  },
  {
    quote: "The AI quote was spot-on. Described the damage, got a price instantly, and the repair was exactly what I needed.",
    author: "Dumisani N.",
    rating: 5,
    location: "Durban, KZN",
  },
];

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
              <span className="gradient-text">
                What Matters
              </span>
            </motion.h1>

            <motion.p
              className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-text-secondary sm:text-xl"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              AI-powered damage assessment. Expert restoration. Free SA delivery.
              From match-day tears to vintage heirlooms — we bring your kit back to life.
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
              <Link href="/repairs/new" className="btn-ghost-gold">
                Get AI Quote
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

        {/* ── AI Smart Repair ── */}
        <section className="border-t border-border bg-bg section-spacious" id="ai-repair">
          <div className="container-sm">
            <div className="mb-16 text-center">
              <motion.p
                className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                ✦ AI Technology
              </motion.p>
              <AnimatedText
                text="Smart Repairs, Instant Quotes"
                as="h2"
                delay={0.1}
                stagger={0.06}
                className="mt-3 text-4xl font-extrabold tracking-[-2px] sm:text-5xl"
              />
              <motion.p
                className="mx-auto mt-4 max-w-2xl text-lg text-text-secondary"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                Describe your jersey&apos;s damage in plain English. Our AI analyzes photos
                and descriptions, identifies the issue, and gives you a fixed-price quote
                in seconds — no waiting, no guesswork.
              </motion.p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  icon: Camera,
                  title: "Snap & Upload",
                  desc: "Take photos of the damage and describe what needs fixing. Works for any jersey type.",
                },
                {
                  icon: Brain,
                  title: "AI Analysis",
                  desc: "Our engine identifies the damage type, assesses severity, and checks material compatibility.",
                },
                {
                  icon: Zap,
                  title: "Instant Quote",
                  desc: "Get a fixed-price quote in seconds. No surprises, no hidden fees — pay only if you approve.",
                },
              ].map((feature, i) => (
                <ScrollReveal key={feature.title} direction="up" delay={0.1 * i}>
                  <div className="card-base p-8 text-center">
                    <div
                      className="mx-auto mb-5 flex size-14 items-center justify-center rounded-xl"
                      style={{
                        background: "rgba(200,169,81,0.1)",
                        color: "var(--brand-gold)",
                      }}
                    >
                      <feature.icon className="size-6" aria-hidden="true" />
                    </div>
                    <h3 className="text-lg font-bold">{feature.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                      {feature.desc}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            <motion.div
              className="mt-12 text-center"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <Link href="/repairs/new" className="btn-primary">
                Try AI Assessment
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ── Stats Bar ── */}
        <section className="border-t border-border bg-bg-deep section-base">
          <div className="container-sm">
            <div className="grid grid-cols-2 gap-y-12 sm:grid-cols-4 sm:gap-8">
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
        <section id="how-it-works" className="border-t border-border bg-bg section-spacious">
          <div className="container-sm">
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
                From sideline to spotlight, in four simple steps
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
        <section id="shop" className="border-t border-border bg-bg-deep section-spacious">
          <div className="container-sm">
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

        {/* ── Testimonials ── */}
        <section className="border-t border-border bg-bg section-spacious">
          <div className="container-sm">
            <div className="mb-16 text-center">
              <motion.p
                className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                ✦ Testimonials
              </motion.p>
              <AnimatedText
                text="What Players Say"
                as="h2"
                delay={0.1}
                stagger={0.06}
                className="mt-3 text-4xl font-extrabold tracking-[-2px] sm:text-5xl"
              />
              <motion.p
                className="mx-auto mt-4 max-w-xl text-lg text-text-secondary"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                Trusted by players and clubs across South Africa
              </motion.p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {testimonials.map((t, i) => (
                <ScrollReveal key={t.author} direction="up" delay={0.1 * i}>
                  <div className="card-base p-8">
                    <div className="mb-4 flex gap-1">
                      {Array.from({ length: t.rating }).map((_, idx) => (
                        <Star
                          key={idx}
                          className="size-4 fill-brand-gold text-brand-gold"
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                    <blockquote className="text-sm leading-relaxed text-text-primary">
                      &ldquo;{t.quote}&rdquo;
                    </blockquote>
                    <div className="mt-6 border-t border-border pt-4">
                      <p className="text-sm font-semibold">{t.author}</p>
                      <p className="text-xs text-text-tertiary">{t.location}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA Section ── */}
        <section className="border-t border-border bg-bg-deep section-spacious">
          <div className="container-sm">
            <div className="relative overflow-hidden rounded-2xl border border-border p-12 text-center sm:p-16">
              <div
                className="pointer-events-none absolute inset-0 -z-10"
                aria-hidden="true"
                style={{
                  background: [
                    "radial-gradient(ellipse 100% 80% at 50% 20%, rgba(200,169,81,0.12) 0%, transparent 60%)",
                    "radial-gradient(ellipse 60% 60% at 80% 80%, rgba(0,119,73,0.06) 0%, transparent 50%)",
                  ].join(", "),
                }}
              />
              <h2 className="font-display text-4xl font-extrabold tracking-[-2px] sm:text-5xl">
                Ready to fix your kit?
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-lg text-text-secondary">
                Join 500+ South African clubs who trust KitFix for their
                jersey repairs and customisation.
              </p>
              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link href="/sign-up" className="btn-primary">
                  Start Your Repair
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <Link href="/shop" className="btn-secondary">
                  Browse Jerseys
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <Footer />
      </main>
    </div>
  );
}
