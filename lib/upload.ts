import { put, del } from "@vercel/blob";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
export const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

type AllowedMimeType = (typeof ALLOWED_TYPES)[number];

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export interface FileValidationError {
  field: "type" | "size";
  message: string;
}

/**
 * Validate a File for upload eligibility.
 * Returns `null` when valid, or a structured error otherwise.
 */
export function validateUploadFile(file: File): FileValidationError | null {
  if (!ALLOWED_TYPES.includes(file.type as AllowedMimeType)) {
    return {
      field: "type",
      message: `Unsupported file type "${file.type}". Allowed: JPEG, PNG, WebP.`,
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      field: "size",
      message: `File too large (${sizeMB} MB). Maximum allowed: 10 MB.`,
    };
  }

  return null;
}

// ---------------------------------------------------------------------------
// Vercel Blob operations
// ---------------------------------------------------------------------------

/**
 * Upload a photo to Vercel Blob storage.
 * Returns the blob result containing the public URL.
 */
export async function uploadPhoto(file: File | Blob, filename: string) {
  const blob = await put(`kitfix/photos/${filename}`, file, {
    access: "public",
    addRandomSuffix: true,
    contentType: file instanceof File ? file.type : undefined,
  });

  return blob;
}

/**
 * Delete a photo from Vercel Blob storage by its URL.
 */
export async function deletePhoto(url: string) {
  await del(url);
}
