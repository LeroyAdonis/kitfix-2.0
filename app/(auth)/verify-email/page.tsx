"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, XCircle, Mail } from "lucide-react";
import { PageTransition } from "@/components/motion";

type VerificationStatus = "loading" | "success" | "error" | "missing-token";

interface StateConfig {
  icon: typeof Loader2;
  color: string;
  bgClass: string;
  iconClass: string;
  title: string;
  description: string;
  action?: { label: string; href: string };
}

const STATE_CONFIG: Record<VerificationStatus, StateConfig> = {
  loading: {
    icon: Loader2,
    color: "text-green-400",
    bgClass: "bg-green-400/10",
    iconClass: "animate-spin",
    title: "Verifying your email...",
    description: "Please wait while we confirm your email address.",
  },
  success: {
    icon: CheckCircle2,
    color: "text-success",
    bgClass: "bg-success/10",
    iconClass: "",
    title: "Email verified!",
    description: "Your email has been verified. You can now sign in.",
    action: { label: "Sign in", href: "/sign-in" },
  },
  error: {
    icon: XCircle,
    color: "text-destructive",
    bgClass: "bg-destructive/10",
    iconClass: "",
    title: "Verification failed",
    description:
      "The verification link is invalid or has expired. Please request a new one.",
    action: { label: "Back to sign in", href: "/sign-in" },
  },
  "missing-token": {
    icon: Mail,
    color: "text-green-400",
    bgClass: "bg-green-400/10",
    iconClass: "",
    title: "Verify your email",
    description:
      "Check your inbox for a verification link. If you didn't receive one, try signing in and requesting a new link.",
    action: { label: "Sign in", href: "/sign-in" },
  },
};

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<VerificationStatus>(
    token ? "loading" : "missing-token"
  );

  useEffect(() => {
    if (!token) return;

    async function verify() {
      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        setStatus(response.ok ? "success" : "error");
      } catch {
        setStatus("error");
      }
    }

    verify();
  }, [token]);

  return (
    <PageTransition>
      <div className="relative">
        <div className="relative bg-surface border border-white/[0.04] rounded-xl p-8 shadow-xl overflow-hidden">
          <div
            className="pointer-events-none absolute -inset-20 -z-10"
            aria-hidden="true"
            style={{
              background:
                "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(0,232,89,0.06) 0%, transparent 70%)",
            }}
          />
          <AnimatePresence mode="wait">
            <motion.div
              key={status}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="text-center"
            >
              {(() => {
                const config = STATE_CONFIG[status];
                const Icon = config.icon;

                return (
                  <>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                        delay: status === "loading" ? 0 : 0.1,
                      }}
                      className={`mx-auto mb-6 flex size-14 items-center justify-center rounded-full ${config.bgClass}`}
                    >
                      <Icon
                        className={`size-7 ${config.color} ${config.iconClass}`}
                      />
                    </motion.div>

                    <h1 className="text-2xl font-bold tracking-tight text-text-primary">
                      {config.title}
                    </h1>
                    <p className="mt-3 text-sm text-text-secondary">
                      {config.description}
                    </p>

                    {config.action && (
                      <Link
                        href={config.action.href}
                        className="mt-8 inline-flex rounded-lg border border-green-400/20 bg-green-400/10 px-4 py-2.5 text-sm font-semibold text-green-400 transition-all duration-300 hover:bg-green-400/20"
                      >
                        {config.action.label}
                      </Link>
                    )}
                  </>
                );
              })()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
}
