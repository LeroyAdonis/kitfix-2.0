import type { Metadata } from "next";
import Link from "next/link";

import Header from "@/components/Header";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { BUSINESS, businessAddressLines } from "@/lib/business";

export const metadata: Metadata = {
  title: "Terms of Service — KitFix",
  description:
    "The terms on which KitFix (Pty) Ltd repairs sports kit: quotes, payment, turnaround, courier and liability.",
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-12">
    <h2 className="font-display text-xl md:text-2xl text-[var(--color-thread)] uppercase tracking-wide mb-4">
      {title}
    </h2>
    <div className="space-y-4 text-[var(--color-thread-dim)] leading-relaxed">{children}</div>
  </section>
);

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--color-pitch-deep)]">
      <Header />

      <main className="max-w-3xl mx-auto px-6 py-16 md:py-24">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--color-stitch)] mb-4">
          Legal · Effective {BUSINESS.policiesEffective}
        </p>
        <h1 className="font-display text-3xl md:text-5xl text-[var(--color-thread)] uppercase leading-tight mb-8">
          Terms of Service
        </h1>

        <div
          className="mb-12 h-px w-full"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to right, var(--color-stitch) 0 8px, transparent 8px 16px)",
          }}
        />

        <Section title="1. Who we are">
          <p>
            KitFix is a trading name of {BUSINESS.legalName}, registration number{" "}
            {BUSINESS.registration}, of {businessAddressLines().join(", ")}. By booking a repair you
            agree to these terms.
          </p>
        </Section>

        <Section title="2. What we do">
          <p>
            We repair, renumber, rebadge and refresh sports kit: tear and seam repair, heat-pressed
            numbering and badges, and replacement of zips, cuffs and collar elastic. We are a repair
            workshop. We are not a laundry, a retailer, or a manufacturer, and we do not sell kits.
          </p>
        </Section>

        <Section title="3. Quotes and pricing">
          <p>
            Every quote is based on the photographs you send and our published rates. A quote is fixed
            once accepted, unless the kit turns out to differ materially from the photographs, in which
            case we contact you with a revised price before doing any work. Quotes are valid for 30
            days and are in South African Rand, inclusive of VAT where applicable &mdash; KitFix is not
            currently VAT-registered, so no VAT is charged.
          </p>
        </Section>

        <Section title="4. Payment">
          <p>
            Payment is taken through Paystack when you accept your quote. Work is scheduled only once
            payment has cleared. We do not store your card details; Paystack processes them under its
            own terms.
          </p>
        </Section>

        <Section title="5. Turnaround">
          <p>
            We aim to complete repairs within the window stated on your quote, counted from the day your
            kit reaches the workshop. Turnaround is an estimate, not a guarantee: courier delays and
            fabric supply can move it. We will tell you if it moves.
          </p>
        </Section>

        <Section title="6. Sending your kit">
          <p>
            You are responsible for packaging your kit suitably for courier. Once a kit is in our
            possession we look after it, and we send it back with a trackable courier. Risk in the kit
            passes to us when it is delivered to the workshop and back to you when it is delivered to
            your address.
          </p>
        </Section>

        <Section title="7. Cancellations and refunds">
          <p>
            Cancellations and refunds are governed by our{" "}
            <Link
              href="/refund-policy"
              className="text-[var(--color-stitch)] underline underline-offset-4"
            >
              Cancellation &amp; Refunds Policy
            </Link>
            , which forms part of these terms.
          </p>
        </Section>

        <Section title="8. Your content">
          <p>
            You keep ownership of the photographs you send us. You give us permission to store and view
            them so we can quote and repair, and to show your repair publicly only if you have agreed in
            writing. We do not sell your data.
          </p>
        </Section>

        <Section title="9. Liability">
          <p>
            We are liable for the repair work we do and for kit that is in our possession. To the extent
            the law allows, our total liability for any claim is limited to the amount you paid for that
            repair. We are not liable for indirect or consequential loss, including the cost of a
            replacement kit or match-day losses. Nothing here limits liability that cannot lawfully be
            limited, including under the Consumer Protection Act 68 of 2008.
          </p>
        </Section>

        <Section title="10. Changes">
          <p>
            We may update these terms. The version that applies to your repair is the one published when
            you paid for it, and the effective date is shown at the top of this page.
          </p>
        </Section>

        <Section title="11. Governing law and contact">
          <p>
            These terms are governed by the laws of the Republic of South Africa. Questions, claims or
            complaints:{" "}
            <a
              href={`mailto:${BUSINESS.email}`}
              className="text-[var(--color-stitch)] underline underline-offset-4"
            >
              {BUSINESS.email}
            </a>{" "}
            or{" "}
            <a
              href={`tel:${BUSINESS.phoneE164}`}
              className="text-[var(--color-stitch)] underline underline-offset-4"
            >
              {BUSINESS.phone}
            </a>
            .
          </p>
        </Section>
      </main>

      <SiteFooter />
    </div>
  );
}
