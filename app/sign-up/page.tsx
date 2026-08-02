"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await authClient.signUp.email({ name, email, password });

    if (error) {
      setError(error.message ?? "Could not create account");
      setLoading(false);
      return;
    }

    router.push("/repair/new");
  }

  return (
    <div className="min-h-screen bg-[var(--color-pitch-deep)] flex items-center justify-center px-4 relative overflow-hidden">
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
          <div className="w-12 h-12 bg-[var(--color-stitch)] flex items-center justify-center mb-4">
            <span className="text-[var(--color-ink)] font-display text-lg">KF</span>
          </div>
          <h1 className="font-display text-2xl text-[var(--color-thread)] uppercase tracking-wide">
            KitFix <span className="text-[var(--color-stitch)]">Sign Up</span>
          </h1>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-thread-dim)] mt-2">
            Open your repair ticket
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="border border-[var(--color-pitch-line)]/50 bg-[var(--color-pitch)]/30 p-6 space-y-4"
        >
          <div>
            <label className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--color-thread-dim)] block mb-2">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
              className="w-full px-4 py-2.5 bg-[var(--color-pitch-deep)] text-[var(--color-thread)] border border-[var(--color-pitch-line)]/50 focus:border-[var(--color-stitch)] outline-none transition-colors placeholder:text-[var(--color-thread-dim)]/50 font-body"
              autoFocus
            />
          </div>

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
              placeholder="Create a password"
              autoComplete="new-password"
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
            disabled={loading || !name || !email || !password}
            className="w-full py-2.5 bg-[var(--color-stitch)] text-[var(--color-ink)] font-bold uppercase tracking-wide hover:brightness-110 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--color-thread-dim)] mt-6 text-center">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-[var(--color-stitch)] hover:underline">
            Sign in
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
  );
}