"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import Link from "next/link";

const COLUMNS = [
  {
    id: "new" as const,
    label: "New",
    ref: "KF-A",
    color: "text-[var(--color-stitch)]",
    border: "border-[var(--color-stitch)]/40",
  },
  {
    id: "in_repair" as const,
    label: "In Repair",
    ref: "KF-B",
    color: "text-[#7fb3d5]",
    border: "border-[#7fb3d5]/40",
  },
  {
    id: "ready" as const,
    label: "Ready",
    ref: "KF-C",
    color: "text-[var(--color-pitch-line)]",
    border: "border-[var(--color-pitch-line)]/50",
  },
  {
    id: "done" as const,
    label: "Done",
    ref: "KF-D",
    color: "text-[var(--color-thread-dim)]",
    border: "border-[var(--color-thread-dim)]/40",
  },
];

const NEXT_STATUS: Record<string, "in_repair" | "ready" | "done"> = {
  new: "in_repair",
  in_repair: "ready",
  ready: "done",
};

function JobCard({ job }: { job: Doc<"jobs"> }) {
  const updateStatus = useMutation(api.jobs.updateStatus);
  const nextStatus = NEXT_STATUS[job.status];
  // Tick once a minute so relative timestamps stay fresh without reading
  // Date.now() during render (react-hooks/purity).
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  const timeAgo = () => {
    const diff = now - job._creationTime;
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <Link href={`/admin/jobs/${job._id}`} className="block">
      <div className="bg-[var(--color-pitch)]/30 border border-[var(--color-pitch-line)]/40 p-3 hover:border-[var(--color-stitch)]/50 transition-colors cursor-pointer mb-3">
        <div className="flex items-start justify-between mb-1">
          <h3 className="text-sm font-semibold text-[var(--color-thread)] truncate font-body">
            {job.customerName}
          </h3>
          <span className="text-[10px] text-[var(--color-thread-dim)] whitespace-nowrap ml-2 font-mono">
            {timeAgo()}
          </span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`font-mono text-[9px] uppercase tracking-widest px-1.5 py-0.5 border ${
              job.customerChannel === "web"
                ? "text-[var(--color-stitch)] border-[var(--color-stitch)]/40"
                : "text-[var(--color-thread-dim)] border-[var(--color-pitch-line)]/40"
            }`}
          >
            {job.customerChannel ?? "whatsapp"}
          </span>
          {job.archivedAt && (
            <span className="text-[9px] text-[#C8402C] border-[#C8402C]/40 px-1.5 py-0.5 border font-mono uppercase tracking-widest">
              Archived
            </span>
          )}
          {job.paymentStatus === "paid" && (
            <span className="font-mono text-[10px] uppercase px-2 py-0.5 border text-[#7fb3d5] border-[#7fb3d5]/40">
              PAID
            </span>
          )}
          {job.customerEmail && (
            <span className="text-[10px] text-[var(--color-thread-dim)] truncate max-w-[120px] sm:max-w-none font-mono">
              {job.customerEmail}
            </span>
          )}
        </div>
        <p className="text-xs text-[var(--color-thread-dim)] line-clamp-2 mb-2">{job.description}</p>
        {job.quote && (
          <p className="text-xs text-[var(--color-stitch)] font-medium mb-2 font-mono">
            R{(job.quote / 100).toFixed(2)}
          </p>
        )}
        {nextStatus && (
          <button
            onClick={(e) => {
              e.preventDefault();
              updateStatus({ id: job._id, status: nextStatus });
            }}
            className="text-xs text-[var(--color-thread-dim)] hover:text-[var(--color-stitch)] transition-colors font-mono uppercase tracking-wider"
          >
            Move to {nextStatus.replace("_", " ")} →
          </button>
        )}
      </div>
    </Link>
  );
}

export function AdminDashboard() {
  const [tab, setTab] = useState<"board" | "history">("board");
  const jobs = useQuery(api.jobs.list);
  const createJob = useMutation(api.jobs.create);
  const archivedJobs = useQuery(api.jobs.listArchived);
  const restoreJob = useMutation(api.jobs.restoreJob);

  if (jobs === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-thread-dim)]">
          Loading jobs...
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-1 mb-6 border-b border-[var(--color-pitch-line)]/40">
        {(["board", "history"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 font-mono text-xs uppercase tracking-[0.18em] transition-colors border-b-2 -mb-px ${
              tab === t
                ? "text-[var(--color-stitch)] border-[var(--color-stitch)]"
                : "text-[var(--color-thread-dim)] border-transparent hover:text-[var(--color-thread)]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "board" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {COLUMNS.map((col) => {
            const columnJobs = jobs.filter((j) => j.status === col.id);
            return (
              <div key={col.id} className={`border-t-2 ${col.border} bg-[var(--color-pitch)]/15 p-3`}>
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-baseline gap-2">
                    <h2 className={`text-xs font-semibold uppercase tracking-[0.18em] font-mono ${col.color}`}>
                      {col.label}
                    </h2>
                    <span className="font-mono text-[10px] text-[var(--color-thread-dim)]">{col.ref}</span>
                  </div>
                  <span className="text-xs text-[var(--color-thread-dim)] font-mono">{columnJobs.length}</span>
                </div>
                <div className="space-y-1">
                  {columnJobs.length === 0 ? (
                    <p className="text-xs text-[var(--color-thread-dim)] text-center py-4 font-mono">
                      No jobs
                    </p>
                  ) : (
                    columnJobs.map((job) => <JobCard key={job._id} job={job} />)
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "history" && (
        <div>
          {archivedJobs === undefined ? (
            <div className="flex items-center justify-center h-64">
              <div className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-thread-dim)]">
                Loading jobs...
              </div>
            </div>
          ) : archivedJobs.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-thread-dim)]">
                No archived repairs
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {archivedJobs.map((job) => (
                <Link
                  key={job._id}
                  href={`/admin/jobs/${job._id}`}
                  className="block border border-[var(--color-pitch-line)]/50 bg-[var(--color-pitch)]/15 p-4 hover:border-[var(--color-stitch)]/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-sm text-[var(--color-thread)] uppercase tracking-wide">{job.customerName}</h3>
                        <span className="font-mono text-[9px] uppercase tracking-widest px-1.5 py-0.5 border text-[var(--color-thread-dim)] border-[var(--color-pitch-line)]/40">{job.customerChannel ?? "whatsapp"}</span>
                        {job.paymentStatus === "paid" && <span className="font-mono text-[9px] uppercase tracking-widest px-1.5 py-0.5 border text-[#7fb3d5] border-[#7fb3d5]/40">Paid</span>}
                      </div>
                      <p className="text-xs text-[var(--color-thread-dim)] line-clamp-2 mt-1">{job.description}</p>
                      <div className="flex items-center gap-4 mt-2 font-mono text-[10px] text-[var(--color-thread-dim)] uppercase tracking-[0.14em] flex-wrap">
                        {job.quote ? <span className="text-[var(--color-stitch)]">R{(job.quote / 100).toFixed(2)}</span> : <span>No quote</span>}
                        <span>Archived {job.archivedAt ? new Date(job.archivedAt).toLocaleDateString("en-ZA") : ""}</span>
                        <span className="text-[#C8402C]">Archived</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); restoreJob({ id: job._id }); }}
                      className="border border-[var(--color-stitch)] text-[var(--color-stitch)] px-3 py-1.5 font-mono text-xs uppercase tracking-wider hover:bg-[var(--color-stitch)]/10"
                    >
                      Restore
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
