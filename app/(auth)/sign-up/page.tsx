"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { signUp } from "@/lib/auth-client";
import { AnimatedText, PageTransition } from "@/components/motion";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const errors: Record<string, string> = {};

    if (!name.trim()) {
      errors.name = "Name is required";
    }

    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Invalid email address";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!validate()) return;

    setLoading(true);

    try {
      const result = await signUp({ name, email, password });
      if (result.error) {
        setError(result.error ?? "Sign-up failed. Please try again.");
      } else {
        // Set the session cookie synchronously via JavaScript before redirecting.
        // This avoids the race condition where HTTP Set-Cookie from fetch
        // doesn't commit in time for the subsequent full-page navigation.
        const token = result.data?.token;
        if (token) {
          document.cookie = `better-auth.session_token=${token};path=/;max-age=604800;SameSite=Lax`;
        }
        window.location.href = "/dashboard";
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
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
          <div className="mb-8 text-center">
            {/* Editorial divider */}
            <div className="flex items-center justify-center gap-4 mb-5">
              <div className="h-px w-12 bg-gradient-to-r from-transparent via-green-400/40 to-transparent" />
              <div className="flex size-10 items-center justify-center rounded-full bg-green-400/10">
                <div className="size-2 rounded-full bg-green-400" />
              </div>
              <div className="h-px w-12 bg-gradient-to-l from-transparent via-green-400/40 to-transparent" />
            </div>
            <AnimatedText
              text="Create an account"
              as="h1"
              className="justify-center text-3xl font-bold tracking-tight text-text-primary"
            />
            <p className="mt-2 text-sm text-text-secondary">
              Get started with KitFix jersey repairs
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="rounded-xl border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
                role="alert"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-2">
              <label htmlFor="name" className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
                Full name
              </label>
              <input
                id="name"
                type="text"
                required
                autoComplete="name"
                name="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full rounded-lg border border-white/[0.06] bg-bg-elevated/60 px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary/50 transition-all duration-200 focus:border-green-400/40 focus:outline-none focus:ring-1 focus:ring-green-400/20 ${fieldErrors.name ? "border-destructive/50" : ""}`}
              />
              {fieldErrors.name && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-error"
                >
                  {fieldErrors.name}
                </motion.p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                name="email"
                spellCheck={false}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full rounded-lg border border-white/[0.06] bg-bg-elevated/60 px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary/50 transition-all duration-200 focus:border-green-400/40 focus:outline-none focus:ring-1 focus:ring-green-400/20 ${fieldErrors.email ? "border-destructive/50" : ""}`}
              />
              {fieldErrors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-error"
                >
                  {fieldErrors.email}
                </motion.p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="new-password"
                name="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full rounded-lg border border-white/[0.06] bg-bg-elevated/60 px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary/50 transition-all duration-200 focus:border-green-400/40 focus:outline-none focus:ring-1 focus:ring-green-400/20 ${fieldErrors.password ? "border-destructive/50" : ""}`}
              />
              {fieldErrors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-error"
                >
                  {fieldErrors.password}
                </motion.p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                autoComplete="new-password"
                name="confirmPassword"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full rounded-lg border border-white/[0.06] bg-bg-elevated/60 px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary/50 transition-all duration-200 focus:border-green-400/40 focus:outline-none focus:ring-1 focus:ring-green-400/20 ${fieldErrors.confirmPassword ? "border-destructive/50" : ""}`}
              />
              {fieldErrors.confirmPassword && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-error"
                >
                  {fieldErrors.confirmPassword}
                </motion.p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg border border-green-400/20 bg-green-400/10 px-4 py-2.5 text-sm font-semibold text-green-400 transition-all duration-300 hover:bg-green-400/20 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-text-secondary">
            Already have an account?{" "}
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
