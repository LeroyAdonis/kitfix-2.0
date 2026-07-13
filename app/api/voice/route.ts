import { NextRequest, NextResponse } from "next/server";

import { getSession } from "@/lib/auth-utils";
import { getRepairById } from "@/lib/db/queries/repairs";
import { getVoiceNotesByRepair } from "@/lib/db/queries/voice-notes";

// ---------------------------------------------------------------------------
// GET /api/voice?repairId=xxx
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  // ── Auth ────────────────────────────────────────────────────────────
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }

  // ── Parse query params ──────────────────────────────────────────────
  const { searchParams } = new URL(request.url);
  const repairId = searchParams.get("repairId");

  if (!repairId || repairId.trim().length === 0) {
    return NextResponse.json(
      { error: "repairId query parameter is required" },
      { status: 400 },
    );
  }

  // ── Verify repair exists and user has access ────────────────────────
  const repair = await getRepairById(repairId.trim());
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
      { error: "Forbidden" },
      { status: 403 },
    );
  }

  // ── Fetch voice notes ───────────────────────────────────────────────
  const notes = await getVoiceNotesByRepair(repairId.trim());

  return NextResponse.json({ success: true, data: notes });
}

// ---------------------------------------------------------------------------
// POST /api/voice — Generate voice note for a repair status update
// ---------------------------------------------------------------------------

interface TriggerBody {
  repairId: string;
  status?: string;
}

function validateTriggerBody(body: unknown): {
  ok: true; data: TriggerBody
} | { ok: false; error: string } {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Request body must be a JSON object" };
  }
  const obj = body as Record<string, unknown>;

  if (typeof obj.repairId !== "string" || obj.repairId.trim().length === 0) {
    return { ok: false, error: "repairId is required and must be a non-empty string" };
  }

  return {
    ok: true,
    data: {
      repairId: obj.repairId.trim(),
      status: typeof obj.status === "string" ? obj.status : undefined,
    },
  };
}

export async function POST(request: NextRequest) {
  // ── Auth ────────────────────────────────────────────────────────────
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }

  // Only admins/technicians can trigger voice note generation
  if (session.user.role !== "admin" && session.user.role !== "technician") {
    return NextResponse.json(
      { error: "Forbidden: only admins and technicians can trigger voice notes" },
      { status: 403 },
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

  const validation = validateTriggerBody(body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const { repairId, status } = validation.data;

  // ── Verify repair exists ────────────────────────────────────────────
  const repair = await getRepairById(repairId);
  if (!repair) {
    return NextResponse.json(
      { error: "Repair request not found" },
      { status: 404 },
    );
  }

  // ── Build KitFix-branded script ─────────────────────────────────────
  const customerName = repair.customer?.name ?? "there";
  const statusLabel = status ?? repair.currentStatus;
  const friendlyStatus = statusLabel.replace(/_/g, " ");
  const script = `Hi ${customerName}, great news! Your ${repair.jerseyDescription} repair is ${friendlyStatus}. Thanks for trusting KitFix — South Africa's jersey specialists.`;

  // ── Forward to generate endpoint internally ─────────────────────────
  const origin = request.headers.get("host")
    ? `${request.headers.get("x-forwarded-proto") ?? "http"}://${request.headers.get("host")}`
    : "http://localhost:3000";

  const generateUrl = `${origin}/api/voice/generate`;

  try {
    const generateResponse = await fetch(generateUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Forward the auth cookie so the internal generate route can verify
        cookie: request.headers.get("cookie") ?? "",
      },
      body: JSON.stringify({
        text: script,
        repairId,
        status: statusLabel,
      }),
    });

    if (!generateResponse.ok) {
      const errorData = await generateResponse.json().catch(() => null);
      return NextResponse.json(
        {
          error: "Voice generation failed",
          detail: errorData?.error ?? `HTTP ${generateResponse.status}`,
        },
        { status: generateResponse.status },
      );
    }

    const result = await generateResponse.json();
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Internal error";
    return NextResponse.json(
      { error: `Failed to generate voice note: ${message}` },
      { status: 500 },
    );
  }
}
