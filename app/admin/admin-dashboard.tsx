"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
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

function JobCard({ job }: { job: { _id: string; customerName: string; description: string; status: string; _creationTime: number; quote?: number; customerChannel?: string; customerEmail?: string } }) {
  const updateStatus = useMutation(api.jobs.updateStatus);
  const nextStatus = NEXT_STATUS[job.status];

  const timeAgo = () => {
    const diff = Date.now() - job._creationTime;
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
          {job.customerEmail && (
            <span className="text-[10px] text-[var(--color-thread-dim)] truncate font-mono">
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
  const jobs = useQuery(api.jobs.list);
  const createJob = useMutation(api.jobs.create);

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
    <div className="grid grid-cols-4 gap-4">
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
  );
}
