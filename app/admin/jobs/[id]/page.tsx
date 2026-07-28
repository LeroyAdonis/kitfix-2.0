"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

const STATUS_OPTIONS = [
  { value: "new" as const, label: "New", color: "text-blue-400" },
  { value: "in_repair" as const, label: "In Repair", color: "text-yellow-400" },
  { value: "ready" as const, label: "Ready", color: "text-green-400" },
  { value: "done" as const, label: "Done", color: "text-purple-400" },
];

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const job = useQuery(api.jobs.get, { id: id as any });
  const updateStatus = useMutation(api.jobs.updateStatus);
  const updateNotes = useMutation(api.jobs.updateNotes);
  const [notes, setNotes] = useState("");
  const [notesSaved, setNotesSaved] = useState(false);

  if (job === undefined) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (job === null) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
        <div className="text-gray-500">Job not found</div>
      </div>
    );
  }

  const handleSaveNotes = async () => {
    await updateNotes({ id: job._id, notes });
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2000);
  };

  const handleStatusChange = async (status: typeof job.status) => {
    await updateStatus({ id: job._id, status });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B]">
      <header className="border-b border-[#1a1a2e] px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-gray-400 hover:text-white transition-colors text-sm">
              ← Back to Board
            </Link>
          </div>
          <div className="w-7 h-7 rounded-md bg-[#00E859] flex items-center justify-center">
            <span className="text-black font-bold text-xs">KF</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">{job.customerName}</h1>
            <p className="text-sm text-gray-400">{job.customerPhone} · {job.customerChannel}</p>
          </div>
          <div className="flex items-center gap-2">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleStatusChange(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  job.status === opt.value
                    ? "bg-[#2b2b44] text-white border border-[#00E859]/50"
                    : "bg-[#1a1a2e] text-gray-500 border border-[#2b2b44] hover:border-gray-600"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left: Job info */}
          <div className="col-span-2 space-y-6">
            <section className="bg-[#1a1a2e] rounded-xl p-5 border border-[#2b2b44]">
              <h2 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Description</h2>
              <p className="text-white">{job.description}</p>
            </section>

            {job.photoUrls.length > 0 && (
              <section className="bg-[#1a1a2e] rounded-xl p-5 border border-[#2b2b44]">
                <h2 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Photos</h2>
                <div className="grid grid-cols-2 gap-3">
                  {job.photoUrls.map((url, i) => (
                    <img key={i} src={url} alt={`Photo ${i + 1}`} className="rounded-lg w-full h-48 object-cover bg-[#0A0A0B]" />
                  ))}
                </div>
              </section>
            )}

            <section className="bg-[#1a1a2e] rounded-xl p-5 border border-[#2b2b44]">
              <h2 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Admin Notes</h2>
              <textarea
                defaultValue={job.adminNotes || ""}
                onChange={(e) => { setNotes(e.target.value); setNotesSaved(false); }}
                placeholder="Add repair notes..."
                className="w-full h-32 px-4 py-3 rounded-lg bg-[#2b2b44] text-white border border-[#333] focus:border-[#00E859] outline-none resize-none text-sm placeholder:text-gray-500"
              />
              <div className="flex items-center justify-end mt-2 gap-2">
                {notesSaved && <span className="text-xs text-green-400">Saved!</span>}
                <button
                  onClick={handleSaveNotes}
                  className="px-4 py-1.5 bg-[#00E859] text-black text-sm font-medium rounded-lg hover:bg-[#00c94d] transition-colors"
                >
                  Save Notes
                </button>
              </div>
            </section>
          </div>

          {/* Right: Sidebar */}
          <div className="space-y-4">
            {job.quote && (
              <div className="bg-[#1a1a2e] rounded-xl p-4 border border-[#2b2b44]">
                <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-1">Quote</h3>
                <p className="text-xl font-bold text-[#00E859]">R{(job.quote / 100).toFixed(2)}</p>
              </div>
            )}

            <div className="bg-[#1a1a2e] rounded-xl p-4 border border-[#2b2b44]">
              <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-1">Created</h3>
              <p className="text-sm text-white">{new Date(job._creationTime).toLocaleDateString("en-ZA")}</p>
            </div>

            {job.damageType && (
              <div className="bg-[#1a1a2e] rounded-xl p-4 border border-[#2b2b44]">
                <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-1">Damage Type</h3>
                <p className="text-sm text-white capitalize">{job.damageType.replace("_", " ")}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
