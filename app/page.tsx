import Link from "next/link";
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
} from "lucide-react";

const features = [
  {
    icon: Layers,
    title: "5-Stage Repair Pipeline",
    description:
      "From intake to delivery, every repair follows our proven five-stage process for consistent, quality results.",
  },
  {
    icon: Sparkles,
    title: "AI Damage Assessment",
    description:
      "Upload a photo and our AI instantly analyzes damage severity, repair complexity, and estimated turnaround.",
  },
  {
    icon: Camera,
    title: "Photo Tracking",
    description:
      "Visual documentation at every stage. See your jersey's transformation from damaged to restored.",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description:
      "Pay with confidence through encrypted processing. No hidden fees, fully transparent pricing.",
  },
  {
    icon: Bell,
    title: "Real-Time Notifications",
    description:
      "Instant updates at every stage of your repair. Never wonder about your jersey's status again.",
  },
  {
    icon: Shield,
    title: "Quality Guarantee",
    description:
      "Every repair is backed by our satisfaction guarantee. We stand behind our craftsmanship, always.",
  },
];

const stats = [
  { value: "500+", label: "Jerseys Repaired" },
  { value: "98%", label: "Satisfaction Rate" },
  { value: "24h", label: "Avg. Turnaround" },
  { value: "4.9", label: "Customer Rating", icon: Star },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* ── Navigation ── */}
      <nav
        className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md"
        aria-label="Main navigation"
      >
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-foreground"
            aria-label="KitFix home"
          >
            <Scissors className="size-[18px]" />
            <span className="text-[15px] font-semibold tracking-tight">
              KitFix
            </span>
          </Link>
          <Link
            href="/sign-in"
            className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative isolate overflow-hidden border-b">
        {/* Subtle grid backdrop */}
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-40" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,var(--background)_100%)]" />
        </div>

        <div className="mx-auto max-w-5xl px-6 pb-20 pt-24 sm:pb-28 sm:pt-32 lg:pb-36 lg:pt-40">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              <Wrench className="size-3" />
              Professional Jersey Repair
            </div>

            <h1 className="text-[2.5rem] font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.5rem]">
              Your Kit, Restored
              <br />
              <span className="text-muted-foreground">to Perfection.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
              Expert jersey repair powered by AI damage assessment, real-time
              photo tracking, and a transparent five-stage pipeline.
            </p>

            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/sign-up"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-7 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 sm:w-auto"
              >
                Get Started
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/sign-in"
                className="inline-flex h-11 w-full items-center justify-center rounded-lg border bg-background px-7 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground sm:w-auto"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>

        {/* Stitch-line divider */}
        <div className="absolute bottom-0 left-0 right-0" aria-hidden="true">
          <div className="mx-auto max-w-xs border-t border-dashed border-muted-foreground/20" />
        </div>
      </section>

      {/* ── Features ── */}
      <section className="border-b">
        <div className="mx-auto max-w-5xl px-6 py-20 sm:py-28">
          <div className="mx-auto max-w-lg text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              How It Works
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              Built for Quality,{" "}
              <span className="text-muted-foreground">Designed for Trust</span>
            </h2>
          </div>

          <div className="mt-14 grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="flex flex-col gap-3 bg-background p-7 sm:p-8"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
                    <feature.icon className="size-[18px]" />
                  </div>
                  <span className="font-mono text-[11px] tabular-nums text-muted-foreground/50">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="text-[15px] font-semibold leading-snug">
                  {feature.title}
                </h3>
                <p className="text-[13px] leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Social Proof ── */}
      <section className="border-b bg-muted/40">
        <div className="mx-auto max-w-5xl px-6 py-14 sm:py-16">
          <div className="grid grid-cols-2 gap-y-8 sm:grid-cols-4 sm:gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="flex items-center justify-center gap-1 text-3xl font-bold tracking-tight sm:text-4xl">
                  {stat.value}
                  {stat.icon && (
                    <stat.icon
                      className="size-5 fill-current text-foreground/70"
                      aria-hidden="true"
                    />
                  )}
                </p>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-b">
        <div className="mx-auto max-w-5xl px-6 py-20 sm:py-28">
          <div className="mx-auto max-w-md text-center">
            <Scissors
              className="mx-auto mb-5 size-7 text-muted-foreground/40"
              aria-hidden="true"
            />
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Ready to Restore Your Jersey?
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              Submit your repair request in minutes. We handle the rest.
            </p>
            <Link
              href="/sign-up"
              className="mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-7 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              Get Started — It&apos;s Free
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer>
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
            <Scissors className="size-3.5" aria-hidden="true" />
            <span>&copy; {new Date().getFullYear()} KitFix</span>
          </div>
          <nav
            className="flex gap-6 text-[13px] text-muted-foreground"
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
      </footer>
    </div>
  );
}

