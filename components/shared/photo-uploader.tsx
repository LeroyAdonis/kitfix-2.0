"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, X, ImageIcon, Loader2, AlertCircle } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useUpload } from "@/hooks/use-upload";
import {
  ALLOWED_TYPES,
  validateUploadFile,
} from "@/lib/upload";
import { cn } from "@/lib/utils";
import type { RepairPhoto } from "@/lib/db/schema";
import type { PhotoType } from "@/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PhotoUploaderProps {
  repairRequestId: string;
  photoType: PhotoType;
  onUploadComplete?: (photo: RepairPhoto) => void;
  maxPhotos?: number;
  existingPhotos?: RepairPhoto[];
}

interface PreviewFile {
  file: File;
  previewUrl: string;
  id: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PhotoUploader({
  repairRequestId,
  photoType,
  onUploadComplete,
  maxPhotos = 5,
  existingPhotos = [],
}: PhotoUploaderProps) {
  const [previews, setPreviews] = useState<PreviewFile[]>([]);
  const [uploaded, setUploaded] = useState<RepairPhoto[]>(existingPhotos);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const { upload, progress, isUploading, error: uploadError, reset } = useUpload();

  const totalCount = uploaded.length + previews.length;
  const canAddMore = totalCount < maxPhotos;

  // ── File selection ──────────────────────────────────────────────────
  const addFiles = useCallback(
    (files: FileList | File[]) => {
      setValidationError(null);
      const fileArr = Array.from(files);

      const remaining = maxPhotos - uploaded.length - previews.length;
      if (remaining <= 0) {
        setValidationError(`Maximum ${maxPhotos} photos allowed.`);
        return;
      }

      const toAdd = fileArr.slice(0, remaining);

      for (const file of toAdd) {
        const err = validateUploadFile(file);
        if (err) {
          setValidationError(err.message);
          return;
        }
      }

      const newPreviews: PreviewFile[] = toAdd.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
        id: crypto.randomUUID(),
      }));

      setPreviews((prev) => [...prev, ...newPreviews]);
    },
    [maxPhotos, uploaded.length, previews.length],
  );

  const removePreview = useCallback((id: string) => {
    setPreviews((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  }, []);

  const removeUploaded = useCallback((photoId: string) => {
    setUploaded((prev) => prev.filter((p) => p.id !== photoId));
  }, []);

  // ── Upload all staged files ─────────────────────────────────────────
  const handleUploadAll = useCallback(async () => {
    if (previews.length === 0) return;

    // Upload one at a time so progress bar makes sense
    for (const preview of [...previews]) {
      const result = await upload(preview.file, repairRequestId, photoType);

      if (result) {
        setUploaded((prev) => [...prev, result]);
        onUploadComplete?.(result);
        setPreviews((prev) => {
          URL.revokeObjectURL(preview.previewUrl);
          return prev.filter((p) => p.id !== preview.id);
        });
      } else {
        // Stop on first failure so the user can see the error
        break;
      }
    }
  }, [previews, upload, repairRequestId, photoType, onUploadComplete]);

  // ── Drag & Drop handlers ────────────────────────────────────────────
  const onDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (canAddMore) setIsDragOver(true);
    },
    [canAddMore],
  );

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (!canAddMore) return;

      const files = e.dataTransfer.files;
      if (files.length > 0) addFiles(files);
    },
    [canAddMore, addFiles],
  );

  const onBrowseClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const onFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) addFiles(files);
      // Reset so the same file can be re-selected
      e.target.value = "";
    },
    [addFiles],
  );

  const errorMessage = validationError ?? uploadError;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ImageIcon className="size-5" />
          {photoType.charAt(0).toUpperCase() + photoType.slice(1)} Photos
          <span className="text-muted-foreground text-sm font-normal">
            ({uploaded.length}/{maxPhotos})
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Drop zone */}
        {canAddMore && (
          <div
            role="button"
            tabIndex={0}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={onBrowseClick}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onBrowseClick();
            }}
            className={cn(
              "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors cursor-pointer",
              isDragOver
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
            )}
          >
            <Upload className="text-muted-foreground size-8" />
            <p className="text-sm font-medium">
              Drag & drop photos here, or click to browse
            </p>
            <p className="text-muted-foreground text-xs">
              JPEG, PNG, or WebP — max 10 MB each
            </p>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_TYPES.join(",")}
          multiple
          className="hidden"
          onChange={onFileInputChange}
        />

        {/* Error message */}
        {errorMessage && (
          <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
            <AlertCircle className="size-4 shrink-0" />
            <span>{errorMessage}</span>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto size-6"
              onClick={() => {
                setValidationError(null);
                reset();
              }}
              aria-label="Dismiss error"
            >
              <X className="size-3" />
            </Button>
          </div>
        )}

        {/* Preview thumbnails (staged, not yet uploaded) */}
        {previews.length > 0 && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {previews.map((preview) => (
                <div key={preview.id} className="group relative aspect-square">
                  <Image
                    src={preview.previewUrl}
                    alt={preview.file.name}
                    fill
                    className="rounded-md border object-cover"
                    unoptimized // blob URL, not served by Next.js image optimization
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 size-6 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      removePreview(preview.id);
                    }}
                    disabled={isUploading}
                    aria-label={`Remove ${preview.file.name}`}
                  >
                    <X className="size-3" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Upload progress */}
            {isUploading && (
              <div className="space-y-1">
                <Progress value={progress} />
                <p className="text-muted-foreground text-xs text-center">
                  Uploading… {progress}%
                </p>
              </div>
            )}

            {/* Upload button */}
            <Button
              onClick={handleUploadAll}
              disabled={isUploading}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Uploading…
                </>
              ) : (
                <>
                  <Upload className="size-4" />
                  Upload {previews.length}{" "}
                  {previews.length === 1 ? "photo" : "photos"}
                </>
              )}
            </Button>
          </div>
        )}

        {/* Already-uploaded photos */}
        {uploaded.length > 0 && (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
            {uploaded.map((photo) => (
              <div key={photo.id} className="group relative aspect-square">
                <Image
                  src={photo.url}
                  alt={photo.originalFilename}
                  fill
                  className="rounded-md border object-cover"
                  sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 20vw"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 size-6 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeUploaded(photo.id);
                  }}
                  aria-label={`Remove ${photo.originalFilename}`}
                >
                  <X className="size-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
