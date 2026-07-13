import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { repairPhotos } from "@/lib/db/schema";
import type { PhotoType } from "@/types";

const VALID_PHOTO_TYPES: PhotoType[] = ["before", "during", "after"];

/**
 * POST /api/upload/link
 *
 * Links a pre-uploaded blob URL to a repair request by inserting
 * a record into the repairPhotos table. Used when the AI damage
 * analyzer uploaded a photo to temp storage before the repair was created.
 *
 * Body: { url, repairRequestId, photoType, originalFilename?, mimeType?, sizeBytes? }
 * Auth: Required
 */
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const url = body.url as string | undefined;
  const repairRequestId = body.repairRequestId as string | undefined;
  const photoType = body.photoType as string | undefined;
  const originalFilename = body.originalFilename as string | undefined;
  const mimeType = body.mimeType as string | undefined;
  const sizeBytes = body.sizeBytes as number | undefined;

  if (typeof url !== "string" || !url.trim()) {
    return NextResponse.json(
      { error: "Missing or invalid url" },
      { status: 400 },
    );
  }

  if (typeof repairRequestId !== "string" || !repairRequestId.trim()) {
    return NextResponse.json(
      { error: "Missing or invalid repairRequestId" },
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

  try {
    const [photo] = await db
      .insert(repairPhotos)
      .values({
        repairRequestId: repairRequestId.trim(),
        url: url.trim(),
        thumbnailUrl: null,
        originalFilename: originalFilename ?? url.split("/").pop() ?? "photo.jpg",
        mimeType: mimeType ?? "image/jpeg",
        sizeBytes: sizeBytes ?? 0,
        photoType: photoType as PhotoType,
        uploadedBy: session.user.id,
      })
      .returning();

    return NextResponse.json({ success: true, data: photo }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to link photo";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
