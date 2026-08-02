"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback, Suspense } from "react";

function PayComplete() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("job");
  const [paid, setPaid] = useState<boolean | null>(null);
  const [error, setError] = useState(false);

  const check = useCallback(async () => {
    if (!jobId) return;
    setError(false);
    try {
      const res = await fetch(`/api/payments/verify?job=${encodeURIComponent(jobId)}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (data?.paid === true) {
        setPaid(true);
      } else {
        setPaid(false);
      }
    } catch {
      setError(true);
    }
  }, [jobId]);

  useEffect(() => {
    check();
  }, [check]);

  return (
    <div className="min-h-screen bg-[var(--color-pitch-deep)] flex items-center justify-center px-4">
      <div className="w-full max-w-md border border-[var(--color-pitch-line)]/50 bg-[var(--color-pitch)]/30 p-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="h-px w-8 bg-[var(--color-stitch)]/60" />
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-stitch)]">
            KitFix
          </p>
          <div className="h-px w-8 bg-[var(--color-stitch)]/60" />
        </div>

        {error ? (
          <>
            <h1 className="font-display text-xl text-[var(--color-thread)] uppercase tracking-wide mb-3">
              Something went wrong
            </h1>
            <p className="font-mono text-xs text-[var(--color-thread-dim)] uppercase tracking-[0.16em] mb-6">
              Could not check your payment status.
            </p>
            <button
              onClick={check}
              className="px-5 py-2 bg-[var(--color-stitch)] text-[var(--color-ink)] text-sm font-bold uppercase tracking-wide hover:brightness-110 transition-colors"
            >
              Refresh
            </button>
          </>
        ) : paid === null ? (
          <>
            <h1 className="font-display text-xl text-[var(--color-thread)] uppercase tracking-wide mb-3">
              Checking your payment
            </h1>
            <p className="font-mono text-xs text-[var(--color-thread-dim)] uppercase tracking-[0.16em]">
              Hang tight...
            </p>
          </>
        ) : paid ? (
          <>
            <h1 className="font-display text-xl text-[#7fb3d5] uppercase tracking-wide mb-3">
              Payment received
            </h1>
            <p className="font-mono text-xs text-[var(--color-thread-dim)] uppercase tracking-[0.16em] mb-6">
              Your repair is confirmed
            </p>
            <Link
              href="/my-jobs"
              className="inline-block px-5 py-2 bg-[var(--color-stitch)] text-[var(--color-ink)] text-sm font-bold uppercase tracking-wide hover:brightness-110 transition-colors"
            >
              Back to My Repairs
            </Link>
          </>
        ) : (
          <>
            <h1 className="font-display text-xl text-[var(--color-thread)] uppercase tracking-wide mb-3">
              We are confirming your payment...
            </h1>
            <p className="font-mono text-xs text-[var(--color-thread-dim)] uppercase tracking-[0.16em] mb-6">
              The webhook usually lands within seconds.
            </p>
            <button
              onClick={check}
              className="px-5 py-2 bg-[var(--color-stitch)] text-[var(--color-ink)] text-sm font-bold uppercase tracking-wide hover:brightness-110 transition-colors"
            >
              Refresh
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function PayCompletePage() {
  return (
    <Suspense fallback={null}>
      <PayComplete />
    </Suspense>
  );
}