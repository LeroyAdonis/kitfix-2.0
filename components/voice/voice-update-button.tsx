"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Pause, Play, Volume2, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface VoiceNote {
  id: string;
  audioUrl: string;
  script: string;
  statusAtGeneration: string;
  createdAt: string;
}

interface VoiceUpdateButtonProps {
  repairId: string;
  customerName?: string;
  jerseyDescription?: string;
  /** Current status label (for display in script) */
  currentStatus?: string;
  /** If true, auto-fetch voice notes on mount */
  autoFetch?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function VoiceUpdateButton({
  repairId,
  currentStatus,
  autoFetch = true,
}: VoiceUpdateButtonProps) {
  const [notes, setNotes] = useState<VoiceNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ── Fetch voice notes ──────────────────────────────────────────────

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/voice?repairId=${encodeURIComponent(repairId)}`);
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error ?? `HTTP ${res.status}`);
      }
      const json = await res.json();
      setNotes(json.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load voice notes");
    } finally {
      setLoading(false);
    }
  }, [repairId]);

  useEffect(() => {
    if (autoFetch) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchNotes();
    }
  }, [autoFetch, fetchNotes]);

  // ── Generate voice note ────────────────────────────────────────────

  const generateVoiceNote = useCallback(async () => {
    setGenerating(true);
    setError(null);
    try {
      const script = buildScript({
        currentStatus: currentStatus ?? "in progress",
      });

      const res = await fetch("/api/voice/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: script,
          repairId,
          status: currentStatus,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error ?? `HTTP ${res.status}`);
      }

      // Refresh the list of voice notes
      await fetchNotes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate voice note");
    } finally {
      setGenerating(false);
    }
  }, [repairId, currentStatus, fetchNotes]);

  // ── Audio playback ─────────────────────────────────────────────────

  const togglePlay = useCallback(
    (note: VoiceNote) => {
      if (playingId === note.id) {
        // Pause current
        audioRef.current?.pause();
        setPlayingId(null);
      } else {
        // Stop any current playback
        audioRef.current?.pause();

        const audio = new Audio(note.audioUrl);
        audio.onended = () => setPlayingId(null);
        audio.onerror = () => {
          setPlayingId(null);
          setError("Failed to play audio");
        };
        audio.play().catch(() => {
          setError("Failed to play audio — user interaction may be required");
          setPlayingId(null);
        });

        audioRef.current = audio;
        setPlayingId(note.id);
      }
    },
    [playingId],
  );

  // ── Cleanup on unmount ─────────────────────────────────────────────

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <div className="rounded-xl border border-white/[0.04] bg-surface p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="h-px w-6 bg-green-400/40" />
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-green-400/80">
          Voice Updates
        </h2>
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Generate button */}
      <Button
        onClick={generateVoiceNote}
        disabled={generating}
        variant="outline"
        size="sm"
        className="mb-4 gap-2"
      >
        {generating ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Volume2 className="h-3.5 w-3.5" />
            Get Voice Update
          </>
        )}
      </Button>

      {/* Voice notes list */}
      {loading && notes.length === 0 && (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-text-tertiary" />
        </div>
      )}

      {!loading && notes.length === 0 && !error && (
        <p className="text-xs text-text-tertiary">
          No voice updates yet. Click the button above to generate one.
        </p>
      )}

      {notes.length > 0 && (
        <div className="space-y-2">
          {notes.map((note) => (
            <div
              key={note.id}
              className={cn(
                "flex items-center gap-3 rounded-lg border p-3 transition-colors",
                "border-white/[0.06] hover:border-white/[0.12]",
              )}
            >
              <button
                onClick={() => togglePlay(note)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500/20 text-green-400 transition-colors hover:bg-green-500/30"
                aria-label={playingId === note.id ? "Pause" : "Play"}
              >
                {playingId === note.id ? (
                  <Pause className="h-3.5 w-3.5" />
                ) : (
                  <Play className="h-3.5 w-3.5 ml-0.5" />
                )}
              </button>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs text-text-primary">
                  {note.script}
                </p>
                <p className="mt-0.5 text-[10px] text-text-tertiary">
                  {formatTimestamp(note.createdAt)} &middot; Status:{" "}
                  {note.statusAtGeneration.replace(/_/g, " ")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildScript({
  currentStatus,
}: {
  currentStatus: string;
}): string {
  const friendlyStatus = currentStatus.replace(/_/g, " ");
  return `Hi there, great news! Your jersey repair is ${friendlyStatus}. Thanks for trusting KitFix — South Africa's jersey specialists.`;
}

function formatTimestamp(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
