import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-utils";
import { put } from "@vercel/blob";
import { validateUploadFile } from "@/lib/upload";
import { randomUUID } from "node:crypto";

/**
 * POST /api/upload/temp
 *
 * Upload a photo to Vercel Blob without requiring a repairRequestId.
 * The blob is stored under `kitfix/temp/{userId}/{uuid}-{filename}`
 * so it can be cleaned up later if never linked to a repair.
 *
 * Used by the AI Damage Analyzer on Step 3 of the repair form,
 * BEFORE the repair request is created.
 *
 * Response: { success: true, url: string } | { error: string }
 */
export async function POST(request: NextRequest) {
  // ── Auth ─────────────────────────────────────────────────────────────
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }

  // ── Parse form data ──────────────────────────────────────────────────
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid form data" },
      { status: 400 },
    );
  }

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Missing or invalid file" },
      { status: 400 },
    );
  }

  // ── Validate file ────────────────────────────────────────────────────
  const validationError = validateUploadFile(file);
  if (validationError) {
    return NextResponse.json(
      { error: validationError.message },
      { status: 400 },
    );
  }

  // ── Upload to Vercel Blob (temp path) ────────────────────────────────
  try {
    const uniqueId = randomUUID().slice(0, 8);
    const blobPath = `kitfix/temp/${session.user.id}/${uniqueId}-${file.name}`;

    const blob = await put(blobPath, file, {
      access: "public",
      addRandomSuffix: true,
    });

    return NextResponse.json(
      { success: true, url: blob.url },
      { status: 201 },
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
