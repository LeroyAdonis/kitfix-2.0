import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { repairPhotos } from "@/lib/db/schema";
import { uploadPhoto, validateUploadFile } from "@/lib/upload";
import type { PhotoType } from "@/types";

const VALID_PHOTO_TYPES: PhotoType[] = ["before", "during", "after"];

export async function POST(request: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────
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
  const repairRequestId = formData.get("repairRequestId");
  const photoType = formData.get("photoType");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Missing or invalid file" },
      { status: 400 },
    );
  }

  if (typeof repairRequestId !== "string" || !repairRequestId.trim()) {
    return NextResponse.json(
      { error: "Missing repairRequestId" },
      { status: 400 },
    );
  }

  if (
    typeof photoType !== "string" ||
    !VALID_PHOTO_TYPES.includes(photoType as PhotoType)
  ) {
    return NextResponse.json(
      { error: `Invalid photoType. Must be one of: ${VALID_PHOTO_TYPES.join(", ")}` },
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

  // ── Upload to Vercel Blob ────────────────────────────────────────────
  try {
    const blob = await uploadPhoto(file, file.name);

    // ── Insert DB record ─────────────────────────────────────────────
    const [photo] = await db
      .insert(repairPhotos)
      .values({
        repairRequestId: repairRequestId.trim(),
        url: blob.url,
        thumbnailUrl: null,
        originalFilename: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        photoType: photoType as PhotoType,
        uploadedBy: session.user.id,
      })
      .returning();

    return NextResponse.json({ success: true, data: photo }, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
