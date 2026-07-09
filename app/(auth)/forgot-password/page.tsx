"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, Mail } from "lucide-react";
import { PageTransition } from "@/components/motion";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/forget-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, redirectTo: "/reset-password" }),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        setSubmitted(true);
      }
    } catch {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <PageTransition>
        <div className="relative">
          <div className="relative bg-surface border border-white/[0.04] rounded-xl p-8 text-center shadow-xl overflow-hidden">
            <div
              className="pointer-events-none absolute -inset-20 -z-10"
              aria-hidden="true"
              style={{
                background:
                  "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(0,232,89,0.06) 0%, transparent 70%)",
              }}
            />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="mx-auto mb-6 flex size-14 items-center justify-center rounded-full bg-green-400/10"
            >
              <Mail className="size-7 text-green-400" />
            </motion.div>

            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              Check your email
            </h1>
            <p className="mt-3 text-sm text-text-secondary">
              If an account exists for <strong className="text-text-primary">{email}</strong>,
              we&apos;ve sent a password reset link.
            </p>

            <Link
              href="/sign-in"
              className="mt-8 inline-flex rounded-lg border border-green-400/20 bg-green-400/10 px-4 py-2.5 text-sm font-semibold text-green-400 transition-all duration-300 hover:bg-green-400/20"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="relative">
        {/* Editorial card */}
        <div className="relative bg-surface border border-white/[0.04] rounded-xl p-8 shadow-xl overflow-hidden">
          {/* Green glow */}
          <div
            className="pointer-events-none absolute -inset-20 -z-10"
            aria-hidden="true"
            style={{
              background:
                "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(0,232,89,0.06) 0%, transparent 70%)",
            }}
          />
          <div className="mb-6 text-center">
            {/* Editorial divider */}
            <div className="flex items-center justify-center gap-4 mb-5">
              <div className="h-px w-12 bg-gradient-to-r from-transparent via-green-400/40 to-transparent" />
              <div className="flex size-10 items-center justify-center rounded-full bg-green-400/10">
                <div className="size-2 rounded-full bg-green-400" />
              </div>
              <div className="h-px w-12 bg-gradient-to-l from-transparent via-green-400/40 to-transparent" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              Forgot your password?
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              Enter your email and we&apos;ll send a reset link
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
                role="alert"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-white/[0.06] bg-bg-elevated/60 px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary/50 transition-all duration-200 focus:border-green-400/40 focus:outline-none focus:ring-1 focus:ring-green-400/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg border border-green-400/20 bg-green-400/10 px-4 py-2.5 text-sm font-semibold text-green-400 transition-all duration-300 hover:bg-green-400/20 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Sending...
                </>
              ) : (
                "Send reset link"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-text-secondary">
            Remember your password?{" "}
            <Link
              href="/sign-in"
              className="font-semibold text-green-400 underline-offset-4 transition-colors hover:text-green-400/80 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </PageTransition>
  );
}
