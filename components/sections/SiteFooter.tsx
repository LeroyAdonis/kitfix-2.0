import Link from "next/link";
import { Mail, MessageCircle, Phone } from "lucide-react";

const WHATSAPP_URL = "https://wa.me/27721234567";

type Column = {
  links: { title: string; url: string }[];
};

const COLUMNS: Column[] = [
  {
    links: [
      { title: "Tear & Seam Repair", url: "#services" },
      { title: "Renumber & Rebadge", url: "#services" },
      { title: "Zips, Cuffs & Collars", url: "#services" },
      { title: "Flat Rates", url: "#pricing" },
      { title: "How it works", url: "#process" },
    ],
  },
  {
    links: [
      { title: "Start a Repair", url: "/repair/new" },
      { title: "My Repairs", url: "/my-jobs" },
      { title: "Sign In", url: "/sign-in" },
      { title: "Admin", url: "/admin" },
    ],
  },
];

const CONTACTS = [
  { label: "WhatsApp", href: WHATSAPP_URL, external: true, icon: MessageCircle },
  { label: "Phone", href: "tel:+27600000000", external: false, icon: Phone },
  { label: "Email", href: "mailto:info@mykitfix.co.za", external: false, icon: Mail },
];

export function SiteFooter({ className = "" }: { className?: string }) {
  return (
    <footer className={`border-t border-[var(--color-pitch-line)]/40 px-6 py-14 md:py-18 ${className}`}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 gap-x-[4vw] gap-y-12 pb-12 md:gap-y-16 md:pb-14 lg:grid-cols-[1fr_0.5fr] lg:gap-y-4">
          <div>
            <div className="mb-8">
              <Link href="/" className="inline-flex items-center gap-3 text-left">
                <div className="w-9 h-9 bg-[var(--color-stitch)] flex items-center justify-center">
                  <span className="font-display text-sm text-[var(--color-ink)]">KF</span>
                </div>
                <span className="font-display text-lg text-[var(--color-thread)] uppercase tracking-wide">
                  KitFix<span className="text-[var(--color-stitch)]">.</span>
                </span>
              </Link>
            </div>

            <div className="mb-8">
              <div className="mb-5">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--color-stitch)] mb-1">
                  Workshop
                </p>
                <p className="text-sm text-[var(--color-thread-dim)] leading-relaxed">
                  Johannesburg · Cape Town
                  <br />
                  Door-to-door courier across South Africa
                </p>
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--color-stitch)] mb-1">
                  Contact
                </p>
                <p className="text-sm text-[var(--color-thread-dim)]">
                  <a href="tel:+27600000000" className="block hover:text-[var(--color-stitch)] transition-colors">060 000 0000</a>
                  <a href="mailto:info@mykitfix.co.za" className="block hover:text-[var(--color-stitch)] transition-colors">info@mykitfix.co.za</a>
                </p>
              </div>
            </div>

            <div className="grid grid-flow-col grid-cols-[max-content] items-start justify-start gap-x-4">
              {CONTACTS.map((contact) => (
                <a
                  key={contact.label}
                  href={contact.href}
                  {...(contact.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  aria-label={contact.label}
                  className="border border-[var(--color-pitch-line)]/50 p-3 text-[var(--color-thread-dim)] transition-colors hover:border-[var(--color-stitch)]/60 hover:text-[var(--color-stitch)]"
                >
                  <contact.icon className="size-5" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 items-start gap-x-6 gap-y-10 md:grid-cols-2 md:gap-x-8 md:gap-y-4">
            {COLUMNS.map((column, index) => (
              <ul key={index}>
                {column.links.map((link) => (
                  <li key={link.title} className="py-2">
                    <Link
                      href={link.url}
                      className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--color-thread-dim)] transition-colors hover:text-[var(--color-stitch)]"
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>

        <div className="h-px w-full bg-[var(--color-pitch-line)]/40" />

        <div className="text-small flex flex-col-reverse items-start justify-between pt-6 pb-4 md:flex-row md:items-center md:pt-8 md:pb-0">
          <p className="mt-8 font-mono text-xs uppercase tracking-[0.14em] text-[var(--color-thread-dim)] md:mt-0">
            © 2026 KitFix — Kit repair &amp; refresh for SA clubs and schools
          </p>
          <ul className="grid grid-flow-row grid-cols-[max-content] justify-center gap-y-4 md:grid-flow-col md:gap-x-8 md:gap-y-0">
            <li>
              <Link href="/sign-in" className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--color-thread-dim)] hover:text-[var(--color-stitch)] transition-colors">
                My Repairs
              </Link>
            </li>
            <li>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--color-thread-dim)] hover:text-[var(--color-stitch)] transition-colors"
              >
                WhatsApp
              </a>
            </li>
            <li>
              <Link href="/admin/login" className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--color-thread-dim)] hover:text-[var(--color-stitch)] transition-colors">
                Admin
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}