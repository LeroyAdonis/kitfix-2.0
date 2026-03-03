"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Wrench,
  Camera,
  CreditCard,
  Bell,
  Shield,
  Sparkles,
  ArrowRight,
  Scissors,
  Layers,
  Star,
  ChevronDown,
  Upload,
  Search,
  Truck,
} from "lucide-react";
import {
  AnimatedText,
  ScrollReveal,
  MagneticButton,
  AnimatedCounter,
  FloatingShapes,
  CustomCursor,
  GradientText,
  GlassmorphismNav,
} from "@/components/motion";

/* ─── Data ─── */

const features = [
  {
    icon: Layers,
    title: "5-Stage Repair Pipeline",
    description:
      "From intake to delivery, every repair follows our proven five-stage process for consistent, quality results.",
    wide: true,
  },
  {
    icon: Sparkles,
    title: "AI Damage Assessment",
    description:
      "Upload a photo and our AI instantly analyzes damage severity, repair complexity, and estimated turnaround.",
    wide: false,
  },
  {
    icon: Camera,
    title: "Photo Tracking",
    description:
      "Visual documentation at every stage. See your jersey's transformation from damaged to restored.",
    wide: false,
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description:
      "Pay with confidence through encrypted processing. No hidden fees, fully transparent pricing.",
    wide: false,
  },
  {
    icon: Bell,
    title: "Real-Time Notifications",
    description:
      "Instant updates at every stage of your repair. Never wonder about your jersey's status again.",
    wide: false,
  },
  {
    icon: Shield,
    title: "Quality Guarantee",
    description:
      "Every repair is backed by our satisfaction guarantee. We stand behind our craftsmanship, always.",
    wide: true,
  },
];

const stats = [
  { value: 500, suffix: "+", label: "Jerseys Repaired" },
  { value: 98, suffix: "%", label: "Satisfaction Rate" },
  { value: 24, suffix: "h", label: "Avg. Turnaround" },
  { value: 4.9, suffix: "", label: "Customer Rating", showStar: true },
];

const steps = [
  {
    icon: Upload,
    title: "Submit Your Jersey",
    description:
      "Upload photos of the damage and tell us about your jersey. Our AI instantly assesses repair complexity.",
  },
  {
    icon: Search,
    title: "We Assess & Repair",
    description:
      "Our experts review the AI assessment, confirm the repair plan, and get to work restoring your kit.",
  },
  {
    icon: Truck,
    title: "Track & Receive",
    description:
      "Follow every stage with real-time photo updates. Your restored jersey ships back to you, good as new.",
  },
];

/* ─── Page ─── */

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <CustomCursor />
      <GlassmorphismNav />
      <main id="main-content">

      {/* ── Hero ── */}
      <section className="relative isolate flex min-h-screen flex-col items-center justify-center overflow-hidden">
        {/* Animated gradient mesh background */}
        <div
          className="pointer-events-none absolute inset-0 -z-20 animate-[gradient-mesh_12s_ease-in-out_infinite]"
          aria-hidden="true"
          style={{
            background: [
              "radial-gradient(ellipse 80% 60% at 20% 40%, oklch(0.65 0.22 260 / 0.15), transparent)",
              "radial-gradient(ellipse 60% 80% at 80% 30%, oklch(0.55 0.22 290 / 0.12), transparent)",
              "radial-gradient(ellipse 70% 50% at 60% 80%, oklch(0.65 0.20 25 / 0.10), transparent)",
              "radial-gradient(ellipse 50% 70% at 30% 70%, oklch(0.65 0.22 260 / 0.08), transparent)",
            ].join(", "),
          }}
        />

        {/* Dot grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-30"
          aria-hidden="true"
          style={{
            backgroundImage:
              "radial-gradient(circle, oklch(0.50 0.03 260 / 0.3) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Floating shapes behind content */}
        <FloatingShapes count={8} className="-z-10" />

        {/* Hero content */}
        <div className="mx-auto max-w-4xl px-6 pt-24 pb-16 text-center">
          {/* Badge */}
          <motion.div
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground backdrop-blur-sm"
            initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Wrench className="size-3.5" aria-hidden="true" />
            Professional Jersey Repair
          </motion.div>

          {/* Headline */}
          <AnimatedText
            text="We Fix What Matters"
            as="h1"
            delay={0.5}
            stagger={0.08}
            className="justify-center text-5xl font-bold leading-[1.05] tracking-tight [text-wrap:balance] sm:text-6xl lg:text-7xl"
          />

          {/* Subheadline */}
          <motion.p
            className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
          >
            Expert jersey repair powered by{" "}
            <GradientText>AI damage assessment</GradientText>, real-time photo
            tracking, and a transparent five-stage pipeline.
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.4 }}
          >
            <Link href="/sign-up">
              <MagneticButton
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl px-8 text-sm font-semibold text-primary-foreground shadow-lg transition-shadow hover:shadow-[var(--glow-primary)] sm:w-auto"
                style={{ background: "var(--gradient-primary)" }}
              >
                Get Started
                <ArrowRight className="size-4" aria-hidden="true" />
              </MagneticButton>
            </Link>

            <Link
              href="/sign-in"
              className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-border/60 bg-background/60 px-8 text-sm font-medium backdrop-blur-sm transition-colors hover:bg-muted sm:w-auto"
            >
              Sign In
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.6 }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <ChevronDown className="size-5 text-muted-foreground/50" aria-hidden="true" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="border-b border-border/40">
        <div className="mx-auto max-w-5xl px-6 py-24 sm:py-32">
          <div className="mx-auto max-w-lg text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              How It Works
            </p>
            <AnimatedText
              text="Three Simple Steps"
              as="h2"
              delay={0.1}
              stagger={0.06}
              className="mt-3 justify-center text-3xl font-bold tracking-tight [text-wrap:balance] sm:text-4xl"
            />
          </div>

          <div className="relative mt-16 grid gap-8 md:grid-cols-3 md:gap-0">
            {/* Connecting line — horizontal on desktop, vertical on mobile */}
            <div
              className="pointer-events-none absolute left-8 top-[72px] hidden h-px w-[calc(100%-64px)] border-t-2 border-dashed border-border/60 md:block"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute left-8 top-[72px] h-[calc(100%-72px)] border-l-2 border-dashed border-border/60 md:hidden"
              aria-hidden="true"
            />

            {steps.map((step, i) => (
              <ScrollReveal
                key={step.title}
                direction="up"
                delay={0.15 * i}
                className="relative md:px-6"
              >
                <div className="flex flex-col items-center text-center">
                  {/* Number + icon */}
                  <div className="relative mb-6">
                    <div
                      className="flex size-16 items-center justify-center rounded-2xl text-primary-foreground shadow-lg"
                      style={{ background: "var(--gradient-primary)" }}
                    >
                      <step.icon className="size-7" aria-hidden="true" />
                    </div>
                    <span className="absolute -right-2 -top-2 flex size-7 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground shadow-sm">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Bento Grid ── */}
      <section id="features" className="border-b border-border/40">
        <div className="mx-auto max-w-5xl px-6 py-24 sm:py-32">
          <div className="mx-auto max-w-lg text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Features
            </p>
            <AnimatedText
              text="Everything You Need"
              as="h2"
              delay={0.1}
              stagger={0.06}
              className="mt-3 justify-center text-3xl font-bold tracking-tight [text-wrap:balance] sm:text-4xl"
            />
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <ScrollReveal
                key={feature.title}
                direction="up"
                delay={0.08 * i}
                className={feature.wide ? "sm:col-span-2 lg:col-span-1" : ""}
              >
                <div className="group relative h-full rounded-2xl border border-border/60 bg-card p-7 transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                  {/* Left accent line on hover */}
                  <div className="absolute left-0 top-4 bottom-4 w-0.5 rounded-full bg-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  <div className="mb-4 flex size-12 items-center justify-center rounded-xl text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
                    <feature.icon className="size-5" aria-hidden="true" />
                  </div>

                  <h3 className="text-base font-semibold leading-snug">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section
        className="relative overflow-hidden"
        style={{ background: "var(--gradient-primary)" }}
      >
        <div className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
          <div className="grid grid-cols-2 gap-y-10 sm:grid-cols-4 sm:gap-8">
            {stats.map((stat) => (
              <ScrollReveal key={stat.label} direction="up" delay={0.1}>
                <div className="text-center">
                  <p className="flex items-center justify-center gap-1 text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl">
                    <AnimatedCounter
                      value={stat.value}
                      suffix={stat.suffix}
                      duration={2.5}
                      className="tabular-nums"
                    />
                    {stat.showStar && (
                      <Star
                        className="size-6 fill-current text-primary-foreground/70"
                        aria-hidden="true"
                      />
                    )}
                  </p>
                  <p className="mt-2 text-sm font-medium text-primary-foreground/70">
                    {stat.label}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-b border-border/40">
        <div className="mx-auto max-w-5xl px-6 py-24 sm:py-32">
          <ScrollReveal direction="up">
            <div className="mx-auto max-w-lg text-center">
              <Scissors
                className="mx-auto mb-6 size-8 text-muted-foreground/40"
                aria-hidden="true"
              />
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                <GradientText as="span">
                  Ready to Restore Your Jersey?
                </GradientText>
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                Submit your repair request in minutes. We handle the rest.
              </p>
              <div className="mt-8">
                <Link href="/sign-up">
                  <MagneticButton
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl px-8 text-sm font-semibold text-primary-foreground shadow-lg transition-shadow hover:shadow-[var(--glow-primary)]"
                    style={{ background: "var(--gradient-cta)" }}
                  >
                    Get Started — It&apos;s Free
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </MagneticButton>
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer>
        <ScrollReveal direction="up" delay={0.1}>
          <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 py-10 sm:flex-row">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Scissors className="size-4" aria-hidden="true" />
              <span>&copy; {new Date().getFullYear()} KitFix</span>
            </div>
            <nav
              className="flex gap-6 text-sm text-muted-foreground"
              aria-label="Footer navigation"
            >
              <Link
                href="/sign-in"
                className="transition-colors hover:text-foreground"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="transition-colors hover:text-foreground"
              >
                Get Started
              </Link>
            </nav>
          </div>
        </ScrollReveal>
      </footer>
      </main>
    </div>
  );
}

