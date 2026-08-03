"use client";

import { useRef, useState } from "react";
import { useAction, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { authClient } from "@/lib/auth-client";

type PhotoUpload = {
  storageId: string;
  previewUrl: string;
};

type AiAnalysis = {
  damageType: string;
  description: string;
  suggestedTier: string;
  suggestedPrice: number;
  confidence: number;
  model?: string;
};

const MAX_PHOTOS = 5;

export function RepairRequestForm() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const generateUploadUrl = useAction(api.jobs.generateUploadUrl);
  const createWebJob = useMutation(api.jobs.createWebJob);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [photos, setPhotos] = useState<PhotoUpload[]>([]);
  const [uploading, setUploading] = useState(false);
  const [photoError, setPhotoError] = useState("");

  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState("");
  const [analysis, setAnalysis] = useState<AiAnalysis | null>(null);
  const [editableDescription, setEditableDescription] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleFiles = async (files: File[] | null) => {
    if (!files || files.length === 0) return;
    if (photos.length + files.length > MAX_PHOTOS) {
      setPhotoError(`Maximum ${MAX_PHOTOS} photos.`);
      return;
    }

    setPhotoError("");
    setUploading(true);
    try {
      const uploaded: PhotoUpload[] = [];
      for (const file of files) {
        const uploadUrl = await generateUploadUrl();
        const putRes = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": "application/octet-stream" },
          body: file,
        });
        if (!putRes.ok) throw new Error("Upload failed");
        const uploadJson = (await putRes.json()) as { storageId?: string };
        const storageId = uploadJson.storageId ?? String(uploadJson);
        uploaded.push({
          storageId,
          previewUrl: URL.createObjectURL(file),
        });
      }
      setPhotos((prev) => [...prev, ...uploaded]);
    } catch {
      setPhotoError("Photo upload failed. Try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removePhoto = (storageId: string) => {
    const target = photos.find((p) => p.storageId === storageId);
    if (target) URL.revokeObjectURL(target.previewUrl);
    setPhotos((prev) => prev.filter((p) => p.storageId !== storageId));
    setPhotoError("");
  };

  const handleAnalyze = async () => {
    if (photos.length === 0) {
      setPhotoError("Add at least one photo to analyze.");
      return;
    }
    setAnalyzing(true);
    setAnalyzeError("");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photoStorageIds: photos.map((p) => p.storageId as Id<"_storage">),
          description: description.trim(),
        }),
      });
      if (!res.ok) throw new Error("analysis_failed");
      const data = (await res.json()) as AiAnalysis;
      setAnalysis(data);
      setEditableDescription(data.description);
    } catch {
      setAnalysis(null);
      setAnalyzeError(
        "We couldn't read that photo automatically. You can still submit manually below.",
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    if (photos.length === 0) {
      setPhotoError("Add at least one photo.");
      return;
    }
    if (!description.trim()) {
      setSubmitError("Add a description of the damage.");
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    try {
      await createWebJob({
        customerName: session?.user?.name || "Customer",
        customerPhone: phone.trim() || undefined,
        description: description.trim(),
        photoStorageIds: photos.map((p) => p.storageId as Id<"_storage">),
        aiAnalysis: analysis
          ? {
              damageType: analysis.damageType,
              description: editableDescription.trim() || analysis.description,
              suggestedTier: analysis.suggestedTier,
              suggestedPrice: analysis.suggestedPrice,
              confidence: analysis.confidence,
              model: analysis.model ?? "nvidia",
            }
          : undefined,
      });
      router.push("/my-jobs");
    } catch {
      setSubmitError("Something went wrong uploading your request. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (cents: number) => `R${(cents / 100).toFixed(0)}`;

  return (
    <div className="space-y-8">
      <section className="border border-[var(--color-pitch-line)]/50 bg-[var(--color-pitch)]/30 p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-px w-5 bg-[var(--color-stitch)]/60" />
          <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-stitch)]">
            Damage Description
          </h2>
        </div>
        <label htmlFor="damage-description" className="sr-only">
          Describe the damage
        </label>
        <textarea
          id="damage-description"
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Seam split down the left side and a number starting to peel..."
          className="w-full h-32 px-4 py-3 bg-[var(--color-pitch-deep)] text-[var(--color-thread)] border border-[var(--color-pitch-line)]/50 focus:border-[var(--color-stitch)] outline-none resize-none text-sm placeholder:text-[var(--color-thread-dim)]/50 font-body"
        />
      </section>

      <section className="border border-[var(--color-pitch-line)]/50 bg-[var(--color-pitch)]/30 p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-px w-5 bg-[var(--color-stitch)]/60" />
          <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-stitch)]">
            Phone (optional)
          </h2>
        </div>
        <label htmlFor="customer-phone" className="sr-only">
          Phone number
        </label>
        <input
          id="customer-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="e.g. 082 123 4567"
          className="w-full h-11 px-4 bg-[var(--color-pitch-deep)] text-[var(--color-thread)] border border-[var(--color-pitch-line)]/50 focus:border-[var(--color-stitch)] outline-none text-sm placeholder:text-[var(--color-thread-dim)]/50 font-body"
        />
      </section>

      <section className="border border-[var(--color-pitch-line)]/50 bg-[var(--color-pitch)]/30 p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-px w-5 bg-[var(--color-stitch)]/60" />
          <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-stitch)]">
            Photos
          </h2>
          <span className="font-mono text-[10px] text-[var(--color-thread-dim)]">
            {photos.length}/{MAX_PHOTOS}
          </span>
        </div>

        {photos.length >= 1 && (
          <p className="flex items-center gap-2 mb-3 font-mono text-xs text-[var(--color-stitch)]">
            <span className="h-px w-4 bg-[var(--color-stitch)]/60" />
            {photos.length === 1 && "Just getting off the bench! We need more."}
            {photos.length === 2 && "Picking up the pace, getting better."}
            {photos.length === 3 && "Perfect lineup! Spot on."}
            {photos.length === 4 && "Almost a full squad. One more for the perfect kit!"}
            {photos.length === 5 && "Full squad out. This kit is ready for the match."}
          </p>
        )}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full min-h-24 flex items-center justify-center border-2 border-dashed border-[var(--color-stitch)]/50 hover:border-[var(--color-stitch)] bg-transparent transition-colors text-[var(--color-thread-dim)] hover:text-[var(--color-stitch)] font-mono text-xs uppercase tracking-[0.18em] py-6"
        >
          {uploading ? "Uploading..." : "Add photos — up to 5"}
        </button>

        {photos.length === 1 && (
          <p className="flex items-center gap-2 mt-3 font-mono text-[10px] text-[var(--color-thread-dim)]">
            <span className="h-px w-4 bg-[var(--color-stitch)]/60" />
            Tip: add a close-up of the damage for a sharper AI quote.
          </p>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(Array.from(e.target.files ?? []))}
        />

        {photos.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mt-4">
            {photos.map((photo) => (
              <div
                key={photo.storageId}
                className="relative border border-[var(--color-pitch-line)]/40"
              >
                <img
                  src={photo.previewUrl}
                  alt="Damage preview"
                  className="w-full h-24 object-cover bg-[var(--color-pitch-deep)]"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(photo.storageId)}
                  className="absolute top-0 right-0 w-5 h-5 flex items-center justify-center bg-[var(--color-foul)] text-[var(--color-thread)] text-xs font-mono hover:brightness-110 transition-colors"
                  aria-label="Remove photo"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        {photoError && (
          <p className="mt-2 font-mono text-xs text-[var(--color-foul)]">{photoError}</p>
        )}
      </section>

      <section className="flex items-center justify-between flex-wrap gap-3">
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={analyzing || photos.length === 0}
          className="px-5 h-11 bg-[var(--color-stitch)] text-[var(--color-ink)] text-sm font-bold uppercase tracking-wide hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {analyzing ? "Assessing…" : "Analyze Damage"}
        </button>
        {analyzeError && (
          <p className="font-mono text-xs text-[var(--color-foul)]">{analyzeError}</p>
        )}
      </section>

      {analysis && (
        <section className="border border-[var(--color-stitch)]/40 bg-[var(--color-pitch)]/30 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-px w-5 bg-[var(--color-stitch)]/60" />
            <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-stitch)]">
              Match-day Assessment
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <p className="font-mono text-[10px] text-[var(--color-thread-dim)] uppercase tracking-[0.18em] mb-1">
                Damage Type
              </p>
              <p className="text-sm text-[var(--color-thread)] capitalize">
                {analysis.damageType.replace("_", " ")}
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] text-[var(--color-thread-dim)] uppercase tracking-[0.18em] mb-1">
                Suggested Tier
              </p>
              <p className="text-sm text-[var(--color-thread)]">{analysis.suggestedTier}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] text-[var(--color-thread-dim)] uppercase tracking-[0.18em] mb-1">
                Suggested Price
              </p>
              <p className="font-display text-xl text-[var(--color-stitch)]">
                {formatPrice(analysis.suggestedPrice)}
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] text-[var(--color-thread-dim)] uppercase tracking-[0.18em] mb-1">
                Confidence
              </p>
              <p className="text-sm text-[var(--color-thread)]">
                {Math.round(analysis.confidence * 100)}%
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <div className="h-px w-5 bg-[var(--color-stitch)]/60" />
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-thread-dim)]">
              Description — editable
            </p>
          </div>
          <label htmlFor="ai-description" className="sr-only">
            AI description (editable)
          </label>
          <textarea
            id="ai-description"
            value={editableDescription}
            onChange={(e) => setEditableDescription(e.target.value)}
            className="w-full h-24 px-4 py-3 bg-[var(--color-pitch-deep)] text-[var(--color-thread)] border border-[var(--color-pitch-line)]/50 focus:border-[var(--color-stitch)] outline-none resize-none text-sm font-body"
          />
        </section>
      )}

      <div className="border-t border-[var(--color-pitch-line)]/40 pt-6">
        {submitError && (
          <p className="mb-3 font-mono text-xs text-[var(--color-foul)]">{submitError}</p>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full h-12 bg-[var(--color-stitch)] text-[var(--color-ink)] font-bold uppercase tracking-wide disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition-colors"
        >
          {submitting ? "Submitting…" : "Submit for Repair"}
        </button>
        <p className="mt-3 font-mono text-[10px] text-[var(--color-thread-dim)] uppercase tracking-[0.18em] text-center">
          Price is an estimate — the workshop confirms the final quote.
        </p>
      </div>
    </div>
  );
}