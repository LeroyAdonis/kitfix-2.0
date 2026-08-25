"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CustomerNav } from "@/components/CustomerNav";
import { useEffect, useState } from "react";

const STATUS_META: Record<string, { label: string; color: string }> = {
  new: { label: "New", color: "text-[var(--color-stitch)] border-[var(--color-stitch)]/50 bg-[var(--color-stitch)]/10" },
  in_repair: { label: "In Repair", color: "text-[#7fb3d5] border-[#7fb3d5]/50 bg-[#7fb3d5]/10" },
  ready: { label: "Ready", color: "text-[var(--color-pitch-line)] border-[var(--color-pitch-line)]/50 bg-[var(--color-pitch-line)]/10" },
  done: { label: "Done", color: "text-[var(--color-thread-dim)] border-[var(--color-thread-dim)]/50 bg-[var(--color-thread-dim)]/10" },
};

const TIMELINE_ORDER = ["new", "in_repair", "ready", "done"] as const;

const TIMELINE_STEP: Record<
  (typeof TIMELINE_ORDER)[number],
  { label: string; fill: string; text: string }
> = {
  new: { label: "New", fill: "bg-[var(--color-stitch)]", text: "text-[var(--color-stitch)]" },
  in_repair: { label: "In Repair", fill: "bg-[#7fb3d5]", text: "text-[#7fb3d5]" },
  ready: { label: "Ready", fill: "bg-[var(--color-pitch-line)]", text: "text-[var(--color-pitch-line)]" },
  done: { label: "Done", fill: "bg-[var(--color-thread-dim)]", text: "text-[var(--color-thread-dim)]" },
};

function timelineCurrentIndex(status: string): number {
  const idx = TIMELINE_ORDER.indexOf(status as (typeof TIMELINE_ORDER)[number]);
  return idx === -1 ? 0 : idx;
}

function JobStatusTimeline({ status }: { status: string }) {
  const currentIdx = timelineCurrentIndex(status);

  return (
    <ol
      role="list"
      aria-label="Repair progress"
      className="flex items-start mt-5 pt-5 border-t border-[var(--color-pitch-line)]/40"
    >
      {TIMELINE_ORDER.map((key, i) => {
        const step = TIMELINE_STEP[key];
        const reached = i <= currentIdx;
        const current = i === currentIdx;
        const marker =
          current
            ? `${step.fill} w-3 h-3`
            : reached
              ? `${step.fill} opacity-60 w-3 h-3`
              : "border border-[var(--color-thread-dim)]/30 w-3 h-3";
        const label =
          current
            ? `${step.text} font-semibold`
            : reached
              ? "text-[var(--color-thread-dim)]"
              : "text-[var(--color-thread-dim)]/40";

        return (
          <li
            key={key}
            aria-current={current ? "step" : undefined}
            className="flex items-start flex-1 last:flex-none"
          >
            <div className="flex flex-col items-start min-w-0">
              <span className={`block ${marker}`} />
              <span
                className={`mt-2 font-mono text-[10px] uppercase tracking-[0.14em] whitespace-nowrap ${label}`}
              >
                {step.label}
              </span>
            </div>
            {i < TIMELINE_ORDER.length - 1 && (
              <div
                className={`flex-1 h-px mt-[6px] mx-2 ${i < currentIdx ? step.fill : "bg-[var(--color-thread-dim)]/20"}`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function PayNowButton({ jobId }: { jobId: string }) {
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    setPaying(true);
    setError(null);
    try {
      const res = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      const data = await res.json();
      if (res.ok && data?.authorization_url) {
        window.location.href = data.authorization_url;
        return;
      }
      setError(data?.error ?? "Payment could not be started");
    } catch {
      setError("Payment could not be started");
    }
    setPaying(false);
  };

  return (
    <div>
      <button
        onClick={handlePay}
        disabled={paying}
        className="px-4 py-2 bg-[var(--color-stitch)] text-[var(--color-ink)] text-sm font-bold uppercase tracking-wide hover:brightness-110 transition-colors disabled:opacity-50"
      >
        {paying ? "Redirecting..." : "Pay now"}
      </button>
      {error && (
        <p className="text-[var(--color-foul)] font-mono text-xs mt-2">{error}</p>
      )}
    </div>
  );
}

export default function MyJobsPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const jobs = useQuery(api.jobs.listByUser);

  useEffect(() => {
    if (!isPending && !session?.session) {
      router.replace("/sign-in");
    }
  }, [isPending, session, router]);

  if (isPending) {
    return (
      <div className="min-h-screen bg-[var(--color-pitch-deep)] flex items-center justify-center">
        <div className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-thread-dim)]">
          Loading...
        </div>
      </div>
    );
  }

  if (!session?.session) {
    return null;
  }

  if (jobs === undefined) {
    return (
      <div className="min-h-screen bg-[var(--color-pitch-deep)] flex items-center justify-center">
        <div className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-thread-dim)]">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-pitch-deep)]">
      <header className="border-b border-[var(--color-pitch-line)]/40 px-4 md:px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--color-thread-dim)] hover:text-[var(--color-stitch)] transition-colors"
            >
              ← Back to Site
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-[var(--color-stitch)] flex items-center justify-center">
              <span className="text-[var(--color-ink)] font-display text-xs">KF</span>
            </div>
            <CustomerNav />
          </div>
        </div>
      </header>

      {/* signature stitch seam */}
      <div
        aria-hidden="true"
        className="h-[4px] w-full"
        style={{
          background:
            "repeating-linear-gradient(90deg, var(--color-stitch) 0 10px, transparent 10px 16px)",
        }}
      />

      <main className="max-w-4xl mx-auto p-4 md:p-6">
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-stitch)] mb-2">
              Repair Tracker
            </p>
            <h1 className="font-display text-2xl md:text-3xl text-[var(--color-thread)] uppercase tracking-wide">
              My Repairs
            </h1>
          </div>
          <Link
            href="/repair/new"
            className="px-4 py-2 bg-[var(--color-stitch)] text-[var(--color-ink)] text-sm font-bold uppercase tracking-wide hover:brightness-110 transition-colors"
          >
            Start a Repair
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div className="border border-[var(--color-pitch-line)]/50 bg-[var(--color-pitch)]/30 p-10 text-center">
            <p className="font-display text-lg text-[var(--color-thread)] uppercase tracking-wide mb-2">
              No repairs yet
            </p>
            <p className="font-mono text-xs text-[var(--color-thread-dim)] uppercase tracking-[0.18em] mb-6">
              No repairs yet — start one
            </p>
            <Link
              href="/repair/new"
              className="inline-block px-5 py-2 bg-[var(--color-stitch)] text-[var(--color-ink)] text-sm font-bold uppercase tracking-wide hover:brightness-110 transition-colors"
            >
              Start a Repair
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => {
              const status = STATUS_META[job.status] ?? STATUS_META.new;
              return (
                <article
                  key={job._id}
                  className="border border-[var(--color-pitch-line)]/50 bg-[var(--color-pitch)]/30 p-5"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-stitch)] mb-1">
                        Job Ref — {job._id.slice(0, 8).toUpperCase()}
                      </p>
                      <h2 className="font-display text-lg text-[var(--color-thread)] uppercase tracking-wide">
                        {job.customerName}
                      </h2>
                    </div>
                    <span
                      className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider border ${status.color}`}
                    >
                      {status.label}
                    </span>
                  </div>

                  <p className="text-[var(--color-thread)] text-sm mb-4">{job.description}</p>

                  <JobStatusTimeline status={job.status} />

                  <div className="flex items-center gap-6 flex-wrap font-mono text-xs text-[var(--color-thread-dim)]">
                    {job.quote != null && (
                      <div>
                        <span className="text-[var(--color-thread-dim)]/60 uppercase tracking-[0.16em] mr-2">
                          {job.quoteStatus === "confirmed" ? "Quote confirmed ✓" : "Estimate — admin to confirm"}
                        </span>
                        <span className="font-display text-base text-[var(--color-stitch)]">
                          R{(job.quote / 100).toFixed(2)}
                        </span>
                        {job.paymentStatus === "paid" && (
                          <span className="font-mono text-xs text-[#7fb3d5] ml-2">
                            Paid ✓
                          </span>
                        )}
                        {job.quoteStatus === "confirmed" && job.paymentStatus !== "paid" && (
                          <div className="mt-3">
                            <PayNowButton jobId={job._id} />
                          </div>
                        )}
                      </div>
                    )}
                    {job.aiAnalysis?.suggestedTier && (
                      <div>
                        <span className="text-[var(--color-thread-dim)]/60 uppercase tracking-[0.16em] mr-2">
                          Tier
                        </span>
                        <span className="text-[var(--color-thread)] capitalize">
                          {job.aiAnalysis.suggestedTier}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="text-[var(--color-thread-dim)]/60 uppercase tracking-[0.16em] mr-2">
                        Started
                      </span>
                      <span className="text-[var(--color-thread)]">
                        {new Date(job._creationTime).toLocaleDateString("en-ZA")}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}