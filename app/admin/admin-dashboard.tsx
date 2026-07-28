"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";

const COLUMNS = [
  { id: "new" as const, label: "New", color: "bg-blue-500/10 border-blue-500/30 text-blue-400" },
  { id: "in_repair" as const, label: "In Repair", color: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400" },
  { id: "ready" as const, label: "Ready", color: "bg-green-500/10 border-green-500/30 text-green-400" },
  { id: "done" as const, label: "Done", color: "bg-purple-500/10 border-purple-500/30 text-purple-400" },
];

const NEXT_STATUS: Record<string, "in_repair" | "ready" | "done"> = {
  new: "in_repair",
  in_repair: "ready",
  ready: "done",
};

function JobCard({ job }: { job: { _id: string; customerName: string; description: string; status: string; _creationTime: number; quote?: number } }) {
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
      <div className="bg-[#1a1a2e] rounded-lg p-3 border border-[#2b2b44] hover:border-[#00E859]/30 transition-colors cursor-pointer mb-3">
        <div className="flex items-start justify-between mb-1">
          <h3 className="text-sm font-semibold text-white truncate">{job.customerName}</h3>
          <span className="text-[10px] text-gray-500 whitespace-nowrap ml-2">{timeAgo()}</span>
        </div>
        <p className="text-xs text-gray-400 line-clamp-2 mb-2">{job.description}</p>
        {job.quote && (
          <p className="text-xs text-[#00E859] font-medium mb-2">R{(job.quote / 100).toFixed(2)}</p>
        )}
        {nextStatus && (
          <button
            onClick={(e) => {
              e.preventDefault();
              updateStatus({ id: job._id, status: nextStatus });
            }}
            className="text-xs text-gray-400 hover:text-white transition-colors"
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
        <div className="text-gray-500">Loading jobs...</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-4">
      {COLUMNS.map((col) => {
        const columnJobs = jobs.filter((j) => j.status === col.id);
        return (
          <div key={col.id} className={`rounded-xl border p-3 ${col.color}`}>
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-sm font-semibold">{col.label}</h2>
              <span className="text-xs opacity-60">{columnJobs.length}</span>
            </div>
            <div className="space-y-1">
              {columnJobs.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4">No jobs</p>
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
