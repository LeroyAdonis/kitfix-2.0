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
        <div className="card-base bg-surface p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="mx-auto mb-6 flex size-14 items-center justify-center rounded-full bg-brand-gold/20"
          >
            <Mail className="size-7 text-brand-gold" />
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
            className="btn-primary mt-8 inline-flex"
          >
            Back to sign in
          </Link>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="card-base bg-surface p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-brand-gold/10">
            <Mail className="size-6 text-brand-gold" />
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
            <label htmlFor="email" className="text-sm font-medium leading-none text-text-primary">
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
              className="input-field w-full"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
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
            className="font-medium text-brand-gold underline-offset-4 transition-colors hover:text-brand-gold-light hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </PageTransition>
  );
}
