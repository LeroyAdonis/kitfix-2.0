import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import Header from "@/components/Header";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { BUSINESS, businessAddressLines } from "@/lib/business";

export const metadata: Metadata = {
  title: "Contact — KitFix",
  description:
    "Reach the KitFix workshop in South Africa: phone, WhatsApp, email and the workshop address. Courier is door-to-door nationwide.",
};

/**
 * Contact page. Paystack's activation review (2026-10-06, ticket 1416876) requires the business
 * contact details to be published and reachable, not buried at the bottom of a page or behind a
 * checkout flow.
 *
 * Every value on this page is read from lib/business.ts. Nothing is hardcoded here: a phone number,
 * street address or mailbox typed into a page is exactly how the earlier placeholder details reached
 * production, and lib/business.ts is the one file to update when the owner supplies the real details.
 */

const WHATSAPP_URL = `https://wa.me/${BUSINESS.whatsapp}`;

const linkClass =
  "text-[var(--color-stitch)] underline underline-offset-4 hover:brightness-110 transition";

const METHODS = [
  {
    label: "Phone",
    value: BUSINESS.phone,
    href: `tel:${BUSINESS.phoneE164}`,
    external: false,
    icon: Phone,
    note: "Call the workshop for anything urgent.",
  },
  {
    label: "WhatsApp",
    value: "Send a message",
    href: WHATSAPP_URL,
    external: true,
    icon: MessageCircle,
    note: "Send photographs of the damage to start a repair.",
  },
  {
    label: "Email",
    value: BUSINESS.email,
    href: `mailto:${BUSINESS.email}`,
    external: false,
    icon: Mail,
    note: "Quotes, invoices, cancellations and complaints.",
  },
] as const;

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[var(--color-pitch-deep)]">
      <Header />

      <main className="max-w-3xl mx-auto px-6 py-16 md:py-24">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--color-stitch)] mb-4">
          Contact · {BUSINESS.name}
        </p>
        <h1 className="font-display text-3xl md:text-5xl text-[var(--color-thread)] uppercase leading-tight mb-8">
          Contact
        </h1>

        <div
          className="mb-12 h-px w-full"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to right, var(--color-stitch) 0 8px, transparent 8px 16px)",
          }}
        />

        <p className="text-[var(--color-thread-dim)] leading-relaxed mb-12">
          A repair starts with a photograph. Send us the damage and we come back with a fixed quote
          before any work begins — nothing is charged until you confirm it. You can also read our{" "}
          <Link href="/refund-policy" className={linkClass}>
            cancellation &amp; refunds policy
          </Link>{" "}
          and our{" "}
          <Link href="/terms" className={linkClass}>
            terms of service
          </Link>
          .
        </p>

        <section className="mb-12" aria-labelledby="contact-methods">
          <h2
            id="contact-methods"
            className="font-display text-xl md:text-2xl text-[var(--color-thread)] uppercase tracking-wide mb-4"
          >
            Reach us
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {METHODS.map((method) => (
              <a
                key={method.label}
                href={method.href}
                {...(method.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="group border border-[var(--color-pitch-line)]/50 p-5 transition-colors hover:border-[var(--color-stitch)]/60"
              >
                <method.icon
                  className="size-5 mb-4 text-[var(--color-stitch)]"
                  aria-hidden="true"
                />
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--color-thread-dim)] mb-1">
                  {method.label}
                </p>
                <p className="break-words text-[var(--color-thread)] transition-colors group-hover:text-[var(--color-stitch)]">
                  {method.value}
                </p>
                <p className="mt-2 text-sm text-[var(--color-thread-dim)] leading-relaxed">
                  {method.note}
                </p>
              </a>
            ))}
          </div>
        </section>

        <section className="mb-12" aria-labelledby="workshop">
          <h2
            id="workshop"
            className="font-display text-xl md:text-2xl text-[var(--color-thread)] uppercase tracking-wide mb-4"
          >
            The workshop
          </h2>
          <div className="border border-[var(--color-pitch-line)]/50 p-5">
            <MapPin className="size-5 mb-4 text-[var(--color-stitch)]" aria-hidden="true" />
            <address className="not-italic text-[var(--color-thread)] leading-relaxed">
              {businessAddressLines().map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
            <p className="mt-4 text-sm text-[var(--color-thread-dim)] leading-relaxed">
              Door-to-door courier across South Africa, both ways: we collect the kit from you and
              return it repaired, so you never have to travel to us.
            </p>
          </div>
        </section>

        <section aria-labelledby="company-details">
          <h2
            id="company-details"
            className="font-display text-xl md:text-2xl text-[var(--color-thread)] uppercase tracking-wide mb-4"
          >
            Company details
          </h2>
          <dl className="grid grid-cols-1 gap-y-3 text-[var(--color-thread-dim)] sm:grid-cols-[max-content_1fr] sm:gap-x-8">
            <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--color-stitch)] sm:pt-1">
              Registered name
            </dt>
            <dd className="text-[var(--color-thread)]">{BUSINESS.legalName}</dd>
            <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--color-stitch)] sm:pt-1">
              Registration
            </dt>
            <dd className="text-[var(--color-thread)]">{BUSINESS.registration}</dd>
          </dl>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
