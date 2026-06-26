"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { signIn } from "@/lib/auth-client";
import { AnimatedText, PageTransition } from "@/components/motion";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn.email({ email, password });
      if (result.error) {
        setError(result.error.message ?? "Sign-in failed. Check your credentials.");
      } else {
        // Full page load ensures the session cookie is committed before navigation
        window.location.href = callbackUrl;
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
            text="Welcome back"
            as="h1"
            className="justify-center text-3xl font-bold tracking-tight text-text-primary"
          />
          <p className="mt-2 text-sm text-text-secondary">
            Sign in to your KitFix account
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
              className="input-field w-full"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium leading-none text-text-primary">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              name="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <div className="mt-8 space-y-3 text-center text-sm">
          <Link
            href="/forgot-password"
            className="block text-text-secondary transition-colors hover:text-brand-gold"
          >
            Forgot your password?
          </Link>
          <p className="text-text-secondary">
            Don&apos;t have an account?{" "}
            <Link
              href="/sign-up"
              className="font-medium text-brand-gold underline-offset-4 transition-colors hover:text-brand-gold-light hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </PageTransition>
  );
}
