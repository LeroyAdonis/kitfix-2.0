import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-utils";
import { getVoiceNoteById } from "@/lib/db/queries/voice-notes";

/**
 * GET /api/voice/stream/[id]
 *
 * Proxies a voice note audio file from Vercel Blob through the server,
 * adding the BLOB_READ_WRITE_TOKEN authorization header.
 *
 * The Vercel Blob store is private — direct URLs return 403 without the
 * auth header. This endpoint fetches the blob server-side and streams
 * the audio to the client.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // ── Auth ──────────────────────────────────────────────────────────
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // ── Fetch voice note from DB ─────────────────────────────────────
    const note = await getVoiceNoteById(id);
    if (!note) {
      return NextResponse.json(
        { error: "Voice note not found" },
        { status: 404 },
      );
    }

    // ── Verify access ────────────────────────────────────────────────
    const isOwner = note.customerId === session.user.id;
    const isAdmin =
      session.user.role === "admin" || session.user.role === "technician";
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 },
      );
    }

    // ── Fetch blob with auth token ───────────────────────────────────
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: "Blob token not configured" },
        { status: 500 },
      );
    }

    const blobResponse = await fetch(note.audioUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!blobResponse.ok) {
      return NextResponse.json(
        { error: `Blob fetch failed: ${blobResponse.status}` },
        { status: 502 },
      );
    }

    // ── Stream audio to client ───────────────────────────────────────
    // Use the blob response body as a readable stream instead of
    // buffering the full audio in memory
    if (!blobResponse.body) {
      return NextResponse.json(
        { error: "Blob response has no body" },
        { status: 502 },
      );
    }

    return new NextResponse(blobResponse.body, {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Content-Disposition": "inline",
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Stream failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
