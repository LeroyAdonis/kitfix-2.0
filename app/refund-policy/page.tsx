import type { Metadata } from "next";
import Link from "next/link";

import Header from "@/components/Header";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { BUSINESS, businessAddressLines } from "@/lib/business";

export const metadata: Metadata = {
  title: "Cancellation & Refunds — KitFix",
  description:
    "How to cancel a KitFix repair, when a refund applies, and how refunds are paid. Required payment-provider policy for KitFix (Pty) Ltd.",
};

/**
 * Cancellations and refunds. This page exists because Paystack's activation review (2026-10-06,
 * ticket 1416876) requires a published cancellation and refunds policy before live payments are
 * enabled. Keep it true: every clause here describes how the service actually runs — quote first,
 * work second, courier both ways.
 */

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-12">
    <h2 className="font-display text-xl md:text-2xl text-[var(--color-thread)] uppercase tracking-wide mb-4">
      {title}
    </h2>
    <div className="space-y-4 text-[var(--color-thread-dim)] leading-relaxed">{children}</div>
  </section>
);

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-[var(--color-pitch-deep)]">
      <Header />

      <main className="max-w-3xl mx-auto px-6 py-16 md:py-24">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--color-stitch)] mb-4">
          Legal · Effective {BUSINESS.policiesEffective}
        </p>
        <h1 className="font-display text-3xl md:text-5xl text-[var(--color-thread)] uppercase leading-tight mb-8">
          Cancellation &amp; Refunds
        </h1>

        <div
          className="mb-12 h-px w-full"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to right, var(--color-stitch) 0 8px, transparent 8px 16px)",
          }}
        />

        <p className="text-[var(--color-thread-dim)] leading-relaxed mb-12">
          This policy applies to every repair booked with {BUSINESS.legalName} (&ldquo;KitFix&rdquo;,
          &ldquo;we&rdquo;), registration number {BUSINESS.registration}, and forms part of our{" "}
          <Link href="/terms" className="text-[var(--color-stitch)] underline underline-offset-4">
            Terms of Service
          </Link>
          . It is written to be read, not to hide anything.
        </p>

        <Section title="1. How payment works">
          <p>
            You send photographs of the damage. We quote you a fixed price before any work starts,
            based on our published rates. Nothing is charged until you confirm that quote. Payment is
            taken through Paystack when you confirm, and the repair is booked into the workshop once
            payment clears.
          </p>
        </Section>

        <Section title="2. Cancelling before work starts">
          <p>
            You may cancel any time before we begin work on your kit and receive a{" "}
            <strong className="text-[var(--color-thread)]">full refund</strong> of the amount paid.
            Email{" "}
            <a
              href={`mailto:${BUSINESS.email}`}
              className="text-[var(--color-stitch)] underline underline-offset-4"
            >
              {BUSINESS.email}
            </a>{" "}
            with your job reference. If the kit has already been collected by our courier, the
            outbound courier cost is not refundable.
          </p>
        </Section>

        <Section title="3. Cancelling after work starts">
          <p>
            Once work has begun, materials and labour are committed and the repair is no longer
            refundable. If you cancel mid-repair we will finish the work already paid for and return
            the kit to you. Where the repair has not been started but the kit is in our possession, we
            will return it at our cost.
          </p>
        </Section>

        <Section title="4. Renumbering and rebadging is irreversible">
          <p>
            Heat-pressed numbers and badges cannot be undone once applied. For renumber and rebadge
            work, the refund window closes at the moment we begin pressing. We confirm the squad list
            with you in writing before we press anything.
          </p>
        </Section>

        <Section title="5. If you are not happy with the work">
          <p>
            Tell us within <strong className="text-[var(--color-thread)]">14 days</strong> of receiving
            your kit. If the fault is in our workmanship &mdash; a seam that reopens, a number lifting,
            a zip we replaced failing &mdash; we redo it at no charge, including courier both ways. If
            we cannot put it right, we refund you in full.
          </p>
          <p>
            This does not cover damage from normal wear after the repair, damage caused by washing
            contrary to the care label, or a repair we told you in writing we could not guarantee
            because the fabric was already failing.
          </p>
        </Section>

        <Section title="6. If a kit cannot be repaired">
          <p>
            Sometimes a kit arrives worse than the photographs suggested. If we cannot achieve the
            repair you paid for, we tell you before starting, and you choose: a full refund, or the
            closest repair we can do at a reduced price. You are never charged for work we did not do.
          </p>
        </Section>

        <Section title="7. How refunds are paid">
          <p>
            Refunds go back to the original payment method through Paystack, in South African Rand,
            within <strong className="text-[var(--color-thread)]">10 business days</strong> of approval.
            Your bank may take a further few days to reflect it. We cannot refund to a different card or
            account.
          </p>
        </Section>

        <Section title="8. Lost or damaged in transit">
          <p>
            Every kit is sent with a trackable courier. If a kit is lost or damaged in transit, tell us
            within 7 days of the dispatch notification and we will open a claim with the courier and
            repair the kit at our cost where it is repairable.
          </p>
        </Section>

        <Section title="9. Contact us">
          <p>For any cancellation, refund or complaint, contact us directly:</p>
          <ul className="space-y-1 mt-2">
            <li>
              Email:{" "}
              <a
                href={`mailto:${BUSINESS.email}`}
                className="text-[var(--color-stitch)] underline underline-offset-4"
              >
                {BUSINESS.email}
              </a>
            </li>
            <li>
              Phone:{" "}
              <a
                href={`tel:${BUSINESS.phoneE164}`}
                className="text-[var(--color-stitch)] underline underline-offset-4"
              >
                {BUSINESS.phone}
              </a>
            </li>
            <li>
              {BUSINESS.legalName}, {businessAddressLines().join(", ")}
            </li>
          </ul>
        </Section>

        <p className="text-sm text-[var(--color-thread-dim)] mt-12">
          This policy does not limit any right you have under the Consumer Protection Act 68 of 2008.
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}
