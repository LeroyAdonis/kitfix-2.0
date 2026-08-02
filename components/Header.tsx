"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const NAV_LINKS = [
  { label: "Services", href: "#services" },
  { label: "Process", href: "#process" },
  { label: "Pricing", href: "#pricing" },
];

const WHATSAPP_URL = "https://wa.me/27721234567";

const goldCta =
  "px-5 py-3 bg-[var(--color-stitch)] text-[var(--color-ink)] font-bold text-sm uppercase tracking-wide hover:brightness-110 transition";

const textLink =
  "font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-thread-dim)] hover:text-[var(--color-stitch)] transition-colors";

export default function Header() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const loggedIn = Boolean(session);
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-[var(--color-pitch-line)]/40 bg-[var(--color-pitch-deep)] sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="KitFix home"
            className="flex items-center gap-3 text-left"
            onClick={() => router.push("/")}
          >
            <div className="w-9 h-9 bg-[var(--color-stitch)] flex items-center justify-center">
              <span className="text-[var(--color-ink)] font-display text-sm">KF</span>
            </div>
            <span className="font-display text-lg text-[var(--color-thread)] uppercase tracking-wide">
              KitFix<span className="text-[var(--color-stitch)]">.</span>
            </span>
          </button>
        </div>

        <nav className="hidden md:flex items-center gap-8 font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-thread-dim)]">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-[var(--color-stitch)] transition-colors">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-6">
          <Link href={loggedIn ? "/my-jobs" : "/sign-in"} className={textLink}>
            {loggedIn ? "My Repairs" : "Sign In"}
          </Link>
          <Link href="/repair/new" className={goldCta}>
            Start a Repair
          </Link>
        </div>

        <button
          type="button"
          className="md:hidden text-[var(--color-thread)] text-2xl leading-none"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "×" : "☰"}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-[var(--color-pitch-deep)] border-t border-[var(--color-pitch-line)]/40 px-6 py-6 flex flex-col gap-5">
          <nav className="flex flex-col gap-4 font-mono text-sm uppercase tracking-[0.18em] text-[var(--color-thread-dim)]">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="hover:text-[var(--color-stitch)] transition-colors">
                {l.label}
              </a>
            ))}
          </nav>
          <button onClick={() => setOpen(false)} className="text-left">
            <Link href={loggedIn ? "/my-jobs" : "/sign-in"} className={textLink}>
              {loggedIn ? "My Repairs" : "Sign In"}
            </Link>
          </button>
          <Link href="/repair/new" onClick={() => setOpen(false)} className={`${goldCta} text-center`}>
            Start a Repair
          </Link>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`${textLink} flex items-center gap-2`}
          >
            WhatsApp us
          </a>
        </div>
      )}
    </header>
  );
}