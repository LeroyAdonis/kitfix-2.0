"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";

const STATUS_META: Record<string, { label: string; color: string }> = {
  new: { label: "New", color: "text-[var(--color-stitch)] border-[var(--color-stitch)]/50 bg-[var(--color-stitch)]/10" },
  in_repair: { label: "In Repair", color: "text-[#7fb3d5] border-[#7fb3d5]/50 bg-[#7fb3d5]/10" },
  ready: { label: "Ready", color: "text-[var(--color-pitch-line)] border-[var(--color-pitch-line)]/50 bg-[var(--color-pitch-line)]/10" },
  done: { label: "Done", color: "text-[var(--color-thread-dim)] border-[var(--color-thread-dim)]/50 bg-[var(--color-thread-dim)]/10" },
};

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
      <header className="border-b border-[var(--color-pitch-line)]/40 px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--color-thread-dim)] hover:text-[var(--color-stitch)] transition-colors"
            >
              ← Back to Site
            </Link>
          </div>
          <div className="w-8 h-8 bg-[var(--color-stitch)] flex items-center justify-center">
            <span className="text-[var(--color-ink)] font-display text-xs">KF</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
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

                  <div className="flex items-center gap-6 flex-wrap font-mono text-xs text-[var(--color-thread-dim)]">
                    {job.quote != null && (
                      <div>
                        <span className="text-[var(--color-thread-dim)]/60 uppercase tracking-[0.16em] mr-2">
                          Quote
                        </span>
                        <span className="font-display text-base text-[var(--color-stitch)]">
                          R{(job.quote / 100).toFixed(2)}
                        </span>
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