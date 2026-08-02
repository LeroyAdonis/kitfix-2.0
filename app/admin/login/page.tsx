"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/admin");
    } else {
      setError("Invalid password");
      setLoading(false);
    }
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
            KitFix <span className="text-[var(--color-stitch)]">Admin</span>
          </h1>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-thread-dim)] mt-2">
            Sign in to manage repairs
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="border border-[var(--color-pitch-line)]/50 bg-[var(--color-pitch)]/30 p-6 space-y-4"
        >
          <div>
            <label className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--color-thread-dim)] block mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full px-4 py-2.5 bg-[var(--color-pitch-deep)] text-[var(--color-thread)] border border-[var(--color-pitch-line)]/50 focus:border-[var(--color-stitch)] outline-none transition-colors placeholder:text-[var(--color-thread-dim)]/50 font-body"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-[var(--color-foul)] text-sm flex items-center gap-1 font-mono">
              <span>✕</span> {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-2.5 bg-[var(--color-stitch)] text-[var(--color-ink)] font-bold uppercase tracking-wide hover:brightness-110 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

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
