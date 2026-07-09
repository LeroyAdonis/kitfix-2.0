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
      const result = await signIn({ email, password });
      if (result.error) {
        setError(result.error ?? "Sign-in failed. Check your credentials.");
      } else {
        const token = result.data?.token;
        if (token) {
          document.cookie = `better-auth.session_token=${token};path=/;max-age=604800;SameSite=Lax`;
        }
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
                className="w-full rounded-lg border border-white/[0.06] bg-bg-elevated/60 px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary/50 transition-all duration-200 focus:border-green-400/40 focus:outline-none focus:ring-1 focus:ring-green-400/20"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-text-tertiary transition-colors hover:text-green-400"
                >
                  Forgot?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                name="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <div className="mt-8 space-y-3 text-center text-sm">
            <p className="text-text-secondary">
              Don&apos;t have an account?{" "}
              <Link
                href="/sign-up"
                className="font-semibold text-green-400 underline-offset-4 transition-colors hover:text-green-400/80 hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
