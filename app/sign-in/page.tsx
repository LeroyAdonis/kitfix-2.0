"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await authClient.signIn.email({ email, password });

    if (error) {
      setError(error.message ?? "Invalid email or password");
      setLoading(false);
      return;
    }

    router.push("/repair/new");
  }

  return (
    <div className="min-h-screen bg-[var(--color-pitch-deep)] lg:grid lg:grid-cols-2">
      {/* Left: full-bleed jersey photo panel (desktop only) */}
      <div
        aria-hidden="true"
        className="hidden lg:flex relative min-h-screen overflow-hidden"
      >
        <img
          src="/hero-repair-square.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(15,28,16,0.55) 0%, rgba(23,53,26,0.35) 45%, rgba(23,53,26,0.92) 100%)",
          }}
        />
        <div className="relative z-10 flex flex-col justify-end p-10 w-full">
          <div className="w-12 h-12 bg-[var(--color-stitch)] flex items-center justify-center mb-5">
            <span className="text-[var(--color-ink)] font-display text-lg">KF</span>
          </div>
          <h2 className="font-display text-4xl text-[var(--color-thread)] uppercase tracking-wide leading-tight">
            Kit Repaired.
            <br />
            Kit <span className="text-[var(--color-stitch)]">Refreshed.</span>
          </h2>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-thread-dim)] mt-4 max-w-sm">
            Drop your kit on the bench — we&apos;ll read the damage, quote it, and stitch it back to match-day ready.
          </p>
          <div
            className="mt-8 h-[4px] w-40"
            style={{
              background:
                "repeating-linear-gradient(90deg, var(--color-stitch) 0 10px, transparent 10px 16px)",
            }}
          />
        </div>
      </div>

      {/* Right: form */}
      <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
        {/* pitch circle watermark */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-48 -left-48 w-[560px] h-[560px] rounded-full border border-[var(--color-pitch-line)]/25"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 -left-40 w-[480px] h-[480px] rounded-full border border-[var(--color-pitch-line)]/15"
        />

        <div className="relative w-full max-w-sm">
          <div className="mb-8">
            <div className="lg:hidden w-12 h-12 bg-[var(--color-stitch)] flex items-center justify-center mb-4">
              <span className="text-[var(--color-ink)] font-display text-lg">KF</span>
            </div>
            <h1 className="font-display text-2xl text-[var(--color-thread)] uppercase tracking-wide">
              KitFix <span className="text-[var(--color-stitch)]">Sign In</span>
            </h1>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-thread-dim)] mt-2">
              Drop your kit on the bench
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="border border-[var(--color-pitch-line)]/50 bg-[var(--color-pitch)]/30 p-6 space-y-4"
          >
            <div>
              <label className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--color-thread-dim)] block mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full px-4 py-2.5 bg-[var(--color-pitch-deep)] text-[var(--color-thread)] border border-[var(--color-pitch-line)]/50 focus:border-[var(--color-stitch)] outline-none transition-colors placeholder:text-[var(--color-thread-dim)]/50 font-body"
                autoFocus
              />
            </div>

            <div>
              <label className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--color-thread-dim)] block mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                className="w-full px-4 py-2.5 bg-[var(--color-pitch-deep)] text-[var(--color-thread)] border border-[var(--color-pitch-line)]/50 focus:border-[var(--color-stitch)] outline-none transition-colors placeholder:text-[var(--color-thread-dim)]/50 font-body"
              />
            </div>

            {error && (
              <p className="text-[var(--color-foul)] text-sm flex items-center gap-1 font-mono">
                <span>✕</span> {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-2.5 bg-[var(--color-stitch)] text-[var(--color-ink)] font-bold uppercase tracking-wide hover:brightness-110 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--color-thread-dim)] mt-6 text-center">
            New around here?{" "}
            <Link href="/sign-up" className="text-[var(--color-stitch)] hover:underline">
              Create account
            </Link>
          </p>

          {/* signature stitch seam */}
          <div
            aria-hidden="true"
            className="mt-8 h-[4px] w-full"
            style={{
              background:
                "repeating-linear-gradient(90deg, var(--color-stitch) 0 10px, transparent 10px 16px)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
