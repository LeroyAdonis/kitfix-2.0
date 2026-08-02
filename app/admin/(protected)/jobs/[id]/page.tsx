"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const STATUS_OPTIONS = [
  { value: "new" as const, label: "New", color: "text-[var(--color-stitch)]", active: "border-[var(--color-stitch)]/60 bg-[var(--color-stitch)]/10" },
  { value: "in_repair" as const, label: "In Repair", color: "text-[#7fb3d5]", active: "border-[#7fb3d5]/60 bg-[#7fb3d5]/10" },
  { value: "ready" as const, label: "Ready", color: "text-[var(--color-pitch-line)]", active: "border-[var(--color-pitch-line)]/60 bg-[var(--color-pitch-line)]/10" },
  { value: "done" as const, label: "Done", color: "text-[var(--color-thread-dim)]", active: "border-[var(--color-thread-dim)]/60 bg-[var(--color-thread-dim)]/10" },
];

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const job = useQuery(api.jobs.get, { id: id as any });
  const updateStatus = useMutation(api.jobs.updateStatus);
  const updateNotes = useMutation(api.jobs.updateNotes);
  const updateQuote = useMutation(api.jobs.updateQuote);
  const confirmQuote = useMutation(api.jobs.confirmQuote);
  const archiveJob = useMutation(api.jobs.archiveJob);
  const restoreJob = useMutation(api.jobs.restoreJob);
  const [notes, setNotes] = useState("");
  const [notesSaved, setNotesSaved] = useState(false);
  const [quoteInput, setQuoteInput] = useState("");
  const [quoteSaved, setQuoteSaved] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const archiveResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (archiveResetTimer.current) clearTimeout(archiveResetTimer.current);
    };
  }, []);

  if (job === undefined) {
    return (
      <div className="min-h-screen bg-[var(--color-pitch-deep)] flex items-center justify-center">
        <div className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-thread-dim)]">
          Loading...
        </div>
      </div>
    );
  }

  if (job === null) {
    return (
      <div className="min-h-screen bg-[var(--color-pitch-deep)] flex items-center justify-center">
        <div className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-thread-dim)]">
          Job not found
        </div>
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

  const handleArchiveClick = async () => {
    if (!confirmArchive) {
      setConfirmArchive(true);
      if (archiveResetTimer.current) clearTimeout(archiveResetTimer.current);
      archiveResetTimer.current = setTimeout(() => setConfirmArchive(false), 3000);
      return;
    }
    if (archiveResetTimer.current) clearTimeout(archiveResetTimer.current);
    setConfirmArchive(false);
    await archiveJob({ id: job._id });
  };

  const handleRestore = async () => {
    await restoreJob({ id: job._id });
  };

  const handleOverrideQuote = async () => {
    const rands = Number(quoteInput);
    if (!isFinite(rands) || rands <= 0) return;
    await updateQuote({ id: job._id, quote: Math.round(rands * 100) });
    setQuoteInput("");
    setQuoteSaved(true);
    setTimeout(() => setQuoteSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[var(--color-pitch-deep)]">
      <header className="border-b border-[var(--color-pitch-line)]/40 px-4 md:px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--color-thread-dim)] hover:text-[var(--color-stitch)] transition-colors"
            >
              ← Back to Board
            </Link>
          </div>
          <div className="w-8 h-8 bg-[var(--color-stitch)] flex items-center justify-center">
            <span className="text-[var(--color-ink)] font-display text-xs">KF</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-stitch)] mb-2">
              Job Ref — {job._id.slice(0, 8).toUpperCase()}
            </p>
            <h1 className="font-display text-2xl md:text-3xl text-[var(--color-thread)] uppercase tracking-wide mb-1">
              {job.customerName}
            </h1>
            <p className="font-mono text-xs text-[var(--color-thread-dim)]">
              {job.customerPhone ? `${job.customerPhone} · ` : ""}
              {job.customerEmail ? `${job.customerEmail} · ` : ""}
              {job.customerChannel}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {job.archivedAt && (
              <span className="text-[#C8402C] border-[#C8402C]/40 font-mono text-[10px] uppercase px-2 py-0.5 border">
                Archived
              </span>
            )}
            {STATUS_OPTIONS.map((opt) => {
              const isActive = job.status === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => handleStatusChange(opt.value)}
                  className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors border ${
                    isActive
                      ? `${opt.active} ${opt.color} border`
                      : "border-[var(--color-pitch-line)]/40 text-[var(--color-thread-dim)] hover:border-[var(--color-thread-dim)]"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
            {job.archivedAt ? (
              <button
                onClick={handleRestore}
                className="border border-[var(--color-stitch)] text-[var(--color-stitch)] hover:bg-[var(--color-stitch)]/10 font-mono text-xs uppercase tracking-wider px-3 py-1.5"
              >
                Restore
              </button>
            ) : (
              <button
                onClick={handleArchiveClick}
                className={`font-mono text-xs uppercase tracking-wider px-3 py-1.5 border transition-colors ${
                  confirmArchive
                    ? "bg-[#C8402C] text-[var(--color-thread)] border-[#C8402C]"
                    : "border-[#C8402C] text-[#C8402C] hover:bg-[#C8402C]/10"
                }`}
              >
                {confirmArchive ? "Confirm archive?" : "Archive"}
              </button>
            )}
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Job info */}
          <div className="col-span-1 lg:col-span-2 space-y-6">
            <section className="border border-[var(--color-pitch-line)]/50 bg-[var(--color-pitch)]/30 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px w-5 bg-[var(--color-stitch)]/60" />
                <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-stitch)]">
                  Description
                </h2>
              </div>
              <p className="text-[var(--color-thread)]">{job.description}</p>
            </section>

            {job.photoUrls.length > 0 && (
              <section className="border border-[var(--color-pitch-line)]/50 bg-[var(--color-pitch)]/30 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px w-5 bg-[var(--color-stitch)]/60" />
                  <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-stitch)]">
                    Photos
                  </h2>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {job.photoUrls.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`Photo ${i + 1}`}
                      className="w-full h-48 object-cover bg-[var(--color-pitch-deep)] border border-[var(--color-pitch-line)]/40"
                    />
                  ))}
                </div>
              </section>
            )}

            <section className="border border-[var(--color-pitch-line)]/50 bg-[var(--color-pitch)]/30 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px w-5 bg-[var(--color-stitch)]/60" />
                <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-stitch)]">
                  Admin Notes
                </h2>
              </div>
              <textarea
                defaultValue={job.adminNotes || ""}
                onChange={(e) => { setNotes(e.target.value); setNotesSaved(false); }}
                placeholder="Add repair notes..."
                className="w-full h-32 px-4 py-3 bg-[var(--color-pitch-deep)] text-[var(--color-thread)] border border-[var(--color-pitch-line)]/50 focus:border-[var(--color-stitch)] outline-none resize-none text-sm placeholder:text-[var(--color-thread-dim)]/50 font-body"
              />
              <div className="flex items-center justify-end mt-2 gap-2">
                {notesSaved && (
                  <span className="font-mono text-xs text-[var(--color-pitch-line)]">Saved!</span>
                )}
                <button
                  onClick={handleSaveNotes}
                  className="px-4 py-1.5 bg-[var(--color-stitch)] text-[var(--color-ink)] text-sm font-bold uppercase tracking-wide hover:brightness-110 transition-colors"
                >
                  Save Notes
                </button>
              </div>
            </section>
          </div>

          {/* Right: Sidebar */}
          <div className="space-y-4">
            {job.aiAnalysis && (
              <div className="border border-[var(--color-stitch)]/40 bg-[var(--color-pitch)]/30 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px w-5 bg-[var(--color-stitch)]/60" />
                  <h3 className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-stitch)]">
                    AI Assessment
                  </h3>
                </div>
                <div className="space-y-3">
                  {job.aiAnalysis.damageType && (
                    <div>
                      <p className="font-mono text-[10px] text-[var(--color-thread-dim)] uppercase tracking-[0.16em] mb-0.5">
                        Damage Type
                      </p>
                      <p className="text-sm text-[var(--color-thread)] capitalize">
                        {job.aiAnalysis.damageType.replace("_", " ")}
                      </p>
                    </div>
                  )}
                  {job.aiAnalysis.description && (
                    <div>
                      <p className="font-mono text-[10px] text-[var(--color-thread-dim)] uppercase tracking-[0.16em] mb-0.5">
                        Description
                      </p>
                      <p className="text-sm text-[var(--color-thread)]">
                        {job.aiAnalysis.description}
                      </p>
                    </div>
                  )}
                  {job.aiAnalysis.suggestedTier && (
                    <div>
                      <p className="font-mono text-[10px] text-[var(--color-thread-dim)] uppercase tracking-[0.16em] mb-0.5">
                        Suggested Tier
                      </p>
                      <p className="text-sm text-[var(--color-thread)] capitalize">
                        {job.aiAnalysis.suggestedTier}
                      </p>
                    </div>
                  )}
                  {job.aiAnalysis.suggestedPrice != null && (
                    <div>
                      <p className="font-mono text-[10px] text-[var(--color-thread-dim)] uppercase tracking-[0.16em] mb-0.5">
                        Suggested Price
                      </p>
                      <p className="font-display text-lg text-[var(--color-stitch)]">
                        R{(job.aiAnalysis.suggestedPrice / 100).toFixed(2)}
                      </p>
                    </div>
                  )}
                  {job.aiAnalysis.confidence != null && (
                    <div>
                      <p className="font-mono text-[10px] text-[var(--color-thread-dim)] uppercase tracking-[0.16em] mb-0.5">
                        Confidence
                      </p>
                      <p className="text-sm text-[var(--color-thread)]">
                        {Math.round(job.aiAnalysis.confidence * 100)}%
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {job.quote && (
              <div className="border border-[var(--color-stitch)]/40 bg-[var(--color-pitch)]/30 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-mono text-[10px] text-[var(--color-thread-dim)] uppercase tracking-[0.18em]">
                    Quote
                  </h3>
                  <span
                    className={`font-mono text-[10px] uppercase px-2 py-0.5 border ${
                      job.quoteStatus === "confirmed"
                        ? "text-[#7fb3d5] border-[#7fb3d5]/40"
                        : "text-[var(--color-stitch)] border-[var(--color-stitch)]/40"
                    }`}
                  >
                    {job.quoteStatus === "confirmed" ? "Confirmed" : "Estimate"}
                  </span>
                  {job.quoteStatus === "confirmed" && (
                    <span
                      className={`font-mono text-[10px] uppercase px-2 py-0.5 border ${
                        job.paymentStatus === "paid"
                          ? "text-[#7fb3d5] border-[#7fb3d5]/40"
                          : "text-[var(--color-thread-dim)]/60 border-[var(--color-thread-dim)]/40"
                      }`}
                    >
                      {job.paymentStatus === "paid" ? "PAID" : "UNPAID"}
                    </span>
                  )}
                </div>
                <p className="font-display text-2xl text-[var(--color-stitch)]">
                  R{(job.quote / 100).toFixed(2)}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="e.g. 250"
                    value={quoteInput}
                    onChange={(e) => setQuoteInput(e.target.value)}
                    className="bg-[var(--color-pitch-deep)] border border-[var(--color-pitch-line)]/50 text-[var(--color-thread)] px-3 py-2 font-mono text-sm w-32 focus:border-[var(--color-stitch)] outline-none"
                  />
                  <button
                    onClick={handleOverrideQuote}
                    className="px-4 py-2 bg-[var(--color-stitch)] text-[var(--color-ink)] font-mono text-xs uppercase tracking-wider hover:brightness-110"
                  >
                    Update quote
                  </button>
                  {quoteSaved && (
                    <span className="text-[var(--color-stitch)] font-mono text-xs">Quote updated</span>
                  )}
                </div>
                <div className="mt-3">
                  {job.quoteStatus !== "confirmed" && job.quote != null ? (
                    <button
                      onClick={() => confirmQuote({ id: job._id })}
                      className="px-4 py-2 bg-[var(--color-stitch)] text-[var(--color-ink)] font-mono text-xs uppercase tracking-wider hover:brightness-110"
                    >
                      Confirm quote
                    </button>
                  ) : (
                    <span className="font-mono text-xs text-[#7fb3d5]">Confirmed ✓</span>
                  )}
                </div>
              </div>
            )}

            <div className="border border-[var(--color-pitch-line)]/50 bg-[var(--color-pitch)]/30 p-4">
              <h3 className="font-mono text-[10px] text-[var(--color-thread-dim)] uppercase tracking-[0.18em] mb-1">
                Created
              </h3>
              <p className="text-sm text-[var(--color-thread)]">
                {new Date(job._creationTime).toLocaleDateString("en-ZA")}
              </p>
            </div>

            {job.damageType && (
              <div className="border border-[var(--color-pitch-line)]/50 bg-[var(--color-pitch)]/30 p-4">
                <h3 className="font-mono text-[10px] text-[var(--color-thread-dim)] uppercase tracking-[0.18em] mb-1">
                  Damage Type
                </h3>
                <p className="text-sm text-[var(--color-thread)] capitalize">
                  {job.damageType.replace("_", " ")}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
