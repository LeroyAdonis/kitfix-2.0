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
      const result = await signUp.email({ name, email, password });
      if (result.error) {
        setError(result.error.message ?? "Sign-up failed. Please try again.");
      } else {
        // Full page load ensures the session cookie is committed before navigation
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
      <div className="card-base bg-surface p-8">
        <div className="mb-8 text-center">
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
            <label htmlFor="name" className="text-sm font-medium leading-none text-text-primary">
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
              className={`input-field w-full ${fieldErrors.name ? "error" : ""}`}
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
            <label htmlFor="email" className="text-sm font-medium leading-none text-text-primary">
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
              className={`input-field w-full ${fieldErrors.email ? "error" : ""}`}
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
            <label htmlFor="password" className="text-sm font-medium leading-none text-text-primary">
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
              className={`input-field w-full ${fieldErrors.password ? "error" : ""}`}
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
            <label htmlFor="confirmPassword" className="text-sm font-medium leading-none text-text-primary">
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
              className={`input-field w-full ${fieldErrors.confirmPassword ? "error" : ""}`}
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
            className="btn-primary w-full"
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
            className="font-medium text-brand-gold underline-offset-4 transition-colors hover:text-brand-gold-light hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </PageTransition>
  );
}
