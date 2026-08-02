import StitchHero from "@/components/hero/StitchHero";

const SERVICES = [
  {
    no: "01",
    title: "Tear & Seam Repair",
    desc: "Torn shoulders, split seams and pitch burns repaired with matching thread and reinforced backing. Invisible from a metre away.",
    turn: "Turnaround: 3 days",
  },
  {
    no: "02",
    title: "Renumber & Rebadge",
    desc: "Heat-pressed numbers and badges removed cleanly, replaced with official-style lettering that survives the wash cycle and the season.",
    turn: "Turnaround: 4 days",
  },
  {
    no: "03",
    title: "Zips, Cuffs & Collars",
    desc: "Jacket zips, goalkeeper cuffs and collar elastic replaced to original spec — the parts manufacturers stop making, we keep in stock.",
    turn: "Turnaround: 3 days",
  },
];

const STATS = [
  { big: "850+", cap: "Kits back on the pitch" },
  { big: "120", cap: "Clubs & schools served" },
  { big: "6wk", cap: "Avg. season saved per kit" },
  { big: "R0", cap: "Quoting fee — send photos" },
];

const STEPS = [
  { t: "1 — Photograph the damage", d: "WhatsApp or upload a few clear photos of the tear, number or badge." },
  { t: "2 — Get a fixed quote", d: "Flat-rate pricing. You approve the quote before we touch a thread." },
  { t: "3 — Post or drop the kit", d: "Door-to-door courier or drop-off points in Joburg and Cape Town." },
  { t: "4 — Match-day ready", d: "Repaired kit returned with a stitch-quality checklist signed by the seamster." },
];

function StitchRule() {
  return (
    <div
      aria-hidden="true"
      className="h-[6px] w-full"
      style={{
        background:
          "repeating-linear-gradient(90deg, var(--color-stitch) 0 14px, transparent 14px 22px)",
      }}
    />
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--color-pitch-deep)]">
      {/* Header */}
      <header className="border-b border-[var(--color-pitch-line)]/40 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[var(--color-stitch)] flex items-center justify-center">
              <span className="text-[var(--color-ink)] font-display text-sm">KF</span>
            </div>
            <span className="font-display text-lg text-[var(--color-thread)] uppercase tracking-wide">
              KitFix<span className="text-[var(--color-stitch)]">.</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-thread-dim)]">
            <a href="#services" className="hover:text-[var(--color-stitch)] transition-colors">Services</a>
            <a href="#process" className="hover:text-[var(--color-stitch)] transition-colors">Process</a>
            <a href="#pricing" className="hover:text-[var(--color-stitch)] transition-colors">Pricing</a>
          </nav>
          <a
            href="https://wa.me/27721234567"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 bg-[var(--color-stitch)] text-[var(--color-ink)] font-bold text-sm uppercase tracking-wide hover:brightness-110 transition"
          >
            WhatsApp Us
          </a>
        </div>
      </header>

      <StitchHero />

      <StitchRule />

      {/* Services */}
      <section id="services" className="px-6 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-baseline justify-between mb-10">
            <h2 className="font-display text-3xl md:text-5xl uppercase text-[var(--color-thread)]">
              The Repair Sheet
            </h2>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-thread-dim)]">
              KF-01 — Services
            </span>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {SERVICES.map((s) => (
              <div
                key={s.no}
                className="border border-[var(--color-pitch-line)]/50 bg-[var(--color-pitch)]/30 p-6 flex flex-col transition-colors hover:border-[var(--color-stitch)]/60"
              >
                <span className="font-mono text-xs tracking-[0.2em] text-[var(--color-stitch)] mb-10">
                  {s.no}
                </span>
                <h3 className="font-display text-xl uppercase text-[var(--color-thread)] mb-3">
                  {s.title}
                </h3>
                <p className="text-sm text-[var(--color-thread-dim)] leading-relaxed mb-6">
                  {s.desc}
                </p>
                <span className="mt-auto font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-stitch)]">
                  {s.turn}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <StitchRule />

      {/* Stats */}
      <section className="px-6 py-12">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s) => (
            <div key={s.cap}>
              <div className="font-display text-4xl md:text-5xl text-[var(--color-stitch)]">
                {s.big}
              </div>
              <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--color-thread-dim)]">
                {s.cap}
              </div>
            </div>
          ))}
        </div>
      </section>

      <StitchRule />

      {/* Process */}
      <section id="process" className="px-6 py-16 md:py-24">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_1fr] gap-12">
          <h2 className="font-display text-3xl md:text-5xl uppercase text-[var(--color-thread)] leading-tight">
            From sideline
            <br />
            to service
            <br />
            in four touches.
          </h2>
          <div className="border-l border-[var(--color-pitch-line)]/50 pl-7">
            {STEPS.map((step) => (
              <div key={step.t} className="py-5 border-b border-dashed border-[var(--color-pitch-line)]/40 last:border-b-0">
                <div className="font-display text-base uppercase text-[var(--color-stitch)]">
                  {step.t}
                </div>
                <p className="mt-2 text-sm text-[var(--color-thread-dim)] leading-relaxed">
                  {step.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <StitchRule />

      {/* Pricing */}
      <section id="pricing" className="px-6 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-baseline justify-between mb-10">
            <h2 className="font-display text-3xl md:text-5xl uppercase text-[var(--color-thread)]">
              Flat Rates
            </h2>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-thread-dim)]">
              No hidden fees · pay when it&apos;s done
            </span>
          </div>
          <div className="grid md:grid-cols-3 gap-5 max-w-4xl">
            {[
              { name: "Basic Repair", price: "R150", desc: "Torn seams, loose stitching, small holes" },
              { name: "Complex Repair", price: "R250", desc: "Large tears, number/name replacement, panel repair" },
              { name: "Full Refresh", price: "R400", desc: "Multiple repairs + deep clean. Like new." },
            ].map((tier, i) => (
              <div
                key={tier.name}
                className={`border p-6 flex flex-col ${
                  i === 1
                    ? "border-[var(--color-stitch)]/70 bg-[var(--color-pitch)]/40"
                    : "border-[var(--color-pitch-line)]/50 bg-[var(--color-pitch)]/20"
                }`}
              >
                <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-thread-dim)] mb-4">
                  {tier.name}
                </h3>
                <div className="font-display text-5xl text-[var(--color-stitch)] mb-4">{tier.price}</div>
                <p className="text-sm text-[var(--color-thread-dim)] leading-relaxed">{tier.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <StitchRule />

      {/* CTA */}
      <section className="px-6 py-20 md:py-28 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-4xl md:text-6xl uppercase text-[var(--color-thread)] leading-[0.95] mb-8">
            Don&apos;t bench
            <br />
            that kit.
          </h2>
          <a
            href="https://wa.me/27721234567"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-10 py-5 bg-[var(--color-stitch)] text-[var(--color-ink)] font-bold text-lg uppercase tracking-wide hover:brightness-110 transition"
          >
            Start a Repair →
          </a>
          <p className="mt-6 font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-thread-dim)]">
            Photos in, quote in 60 minutes · flat rate from R180
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--color-pitch-line)]/40 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 font-mono text-xs uppercase tracking-[0.16em] text-[var(--color-thread-dim)]">
          <span>KitFix — Johannesburg · Cape Town</span>
          <span>info@kitfix.co.za · 060 000 0000</span>
        </div>
      </footer>
    </div>
  );
}
