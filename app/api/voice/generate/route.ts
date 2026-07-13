import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

import { getSession } from "@/lib/auth-utils";
import { getRepairById } from "@/lib/db/queries/repairs";
import { createVoiceNote } from "@/lib/db/queries/voice-notes";

// ---------------------------------------------------------------------------
// TTS Server configuration
// ---------------------------------------------------------------------------

const TTS_SERVER_URL =
  process.env.TTS_SERVER_URL ?? "http://178.238.227.235:8766";

// ---------------------------------------------------------------------------
// Zod validation
// ---------------------------------------------------------------------------

interface GenerateBody {
  text: string;
  repairId: string;
  customerId?: string;
  status?: string;
}

function validateGenerateBody(body: unknown): {
  ok: true; data: GenerateBody
} | { ok: false; error: string } {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Request body must be a JSON object" };
  }
  const obj = body as Record<string, unknown>;

  if (typeof obj.text !== "string" || obj.text.trim().length === 0) {
    return { ok: false, error: "text is required and must be a non-empty string" };
  }
  if (typeof obj.repairId !== "string" || obj.repairId.trim().length === 0) {
    return { ok: false, error: "repairId is required and must be a non-empty string" };
  }

  return {
    ok: true,
    data: {
      text: obj.text.trim(),
      repairId: obj.repairId.trim(),
      customerId: typeof obj.customerId === "string" ? obj.customerId : undefined,
      status: typeof obj.status === "string" ? obj.status : undefined,
    },
  };
}

// ---------------------------------------------------------------------------
// POST /api/voice/generate
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  // ── Auth ────────────────────────────────────────────────────────────
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }

  // ── Parse body ──────────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const validation = validateGenerateBody(body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const { repairId } = validation.data;

  // ── Verify repair exists and user has access ────────────────────────
  const repair = await getRepairById(repairId);
  if (!repair) {
    return NextResponse.json(
      { error: "Repair request not found" },
      { status: 404 },
    );
  }

  const isOwner = repair.customerId === session.user.id;
  const isAdmin = session.user.role === "admin" || session.user.role === "technician";
  if (!isOwner && !isAdmin) {
    return NextResponse.json(
      { error: "Forbidden: you do not have access to this repair" },
      { status: 403 },
    );
  }

  // ── Build KitFix-branded script ─────────────────────────────────────
  const customerName = repair.customer?.name ?? "there";
  const statusLabel = validation.data.status ?? repair.currentStatus;
  const friendlyStatus = statusLabel.replace(/_/g, " ");
  const script = `Hi ${customerName}, great news! Your ${repair.jerseyDescription} repair is ${friendlyStatus}. Thanks for trusting KitFix — South Africa's jersey specialists.`;

  // ── Call TTS server ─────────────────────────────────────────────────
  let ttsResponse: Response;
  try {
    ttsResponse = await fetch(`${TTS_SERVER_URL}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: script, voice: "alba" }),
      signal: AbortSignal.timeout(30_000),
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "TTS server unavailable";
    return NextResponse.json(
      { error: `Failed to reach TTS server: ${message}` },
      { status: 502 },
    );
  }

  if (!ttsResponse.ok) {
    const errorBody = await ttsResponse.text().catch(() => "unknown error");
    return NextResponse.json(
      {
        error: `TTS server returned ${ttsResponse.status}`,
        detail: errorBody,
      },
      { status: 502 },
    );
  }

  // ── Upload audio to Vercel Blob ─────────────────────────────────────
  const audioBlob = await ttsResponse.blob();
  const filename = `voice-notes/${repairId}/${Date.now()}.wav`;

  let blobResult: { url: string };
  try {
    blobResult = await put(filename, audioBlob, {
      access: "public",
      contentType: "audio/wav",
      addRandomSuffix: true,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json(
      { error: `Failed to upload audio: ${message}` },
      { status: 500 },
    );
  }

  // ── Save voice note record to DB ────────────────────────────────────
  try {
    const note = await createVoiceNote({
      repairRequestId: repairId,
      customerId: repair.customerId,
      statusAtGeneration: repair.currentStatus,
      audioUrl: blobResult.url,
      script,
      durationMs: null,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: note.id,
          audioUrl: note.audioUrl,
          script: note.script,
          createdAt: note.createdAt,
        },
      },
      { status: 201 },
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Database error";
    return NextResponse.json(
      { error: `Failed to save voice note: ${message}` },
      { status: 500 },
    );
  }
}
