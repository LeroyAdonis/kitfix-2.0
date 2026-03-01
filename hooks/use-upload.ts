"use client";

import { useCallback, useRef, useState } from "react";
import type { RepairPhoto } from "@/lib/db/schema";
import type { PhotoType } from "@/types";

interface UploadState {
  /** Upload progress 0–100 */
  progress: number;
  /** Whether an upload is in flight */
  isUploading: boolean;
  /** Last error message, if any */
  error: string | null;
}

interface UseUploadReturn extends UploadState {
  /** Upload a single file and return the created photo record. */
  upload: (
    file: File,
    repairRequestId: string,
    photoType: PhotoType,
  ) => Promise<RepairPhoto | null>;
  /** Reset error / progress state. */
  reset: () => void;
}

/**
 * Hook for uploading photos with XMLHttpRequest-based progress tracking.
 */
export function useUpload(): UseUploadReturn {
  const [state, setState] = useState<UploadState>({
    progress: 0,
    isUploading: false,
    error: null,
  });

  // Keep a ref to the current XHR so we can abort on unmount
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const upload = useCallback(
    async (
      file: File,
      repairRequestId: string,
      photoType: PhotoType,
    ): Promise<RepairPhoto | null> => {
      setState({ progress: 0, isUploading: true, error: null });

      return new Promise<RepairPhoto | null>((resolve) => {
        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;

        // Track upload progress
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100);
            setState((prev) => ({ ...prev, progress: pct }));
          }
        });

        xhr.addEventListener("load", () => {
          xhrRef.current = null;

          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const json = JSON.parse(xhr.responseText) as {
                success: boolean;
                data: RepairPhoto;
                error?: string;
              };

              if (json.success) {
                setState({ progress: 100, isUploading: false, error: null });
                resolve(json.data);
                return;
              }

              setState({
                progress: 0,
                isUploading: false,
                error: json.error ?? "Upload failed",
              });
              resolve(null);
            } catch {
              setState({
                progress: 0,
                isUploading: false,
                error: "Invalid server response",
              });
              resolve(null);
            }
          } else {
            let errorMsg = `Upload failed (${xhr.status})`;
            try {
              const json = JSON.parse(xhr.responseText) as { error?: string };
              if (json.error) errorMsg = json.error;
            } catch {
              // keep the generic error
            }
            setState({ progress: 0, isUploading: false, error: errorMsg });
            resolve(null);
          }
        });

        xhr.addEventListener("error", () => {
          xhrRef.current = null;
          setState({
            progress: 0,
            isUploading: false,
            error: "Network error — check your connection",
          });
          resolve(null);
        });

        xhr.addEventListener("abort", () => {
          xhrRef.current = null;
          setState({ progress: 0, isUploading: false, error: null });
          resolve(null);
        });

        const formData = new FormData();
        formData.append("file", file);
        formData.append("repairRequestId", repairRequestId);
        formData.append("photoType", photoType);

        xhr.open("POST", "/api/upload");
        xhr.send(formData);
      });
    },
    [],
  );

  const reset = useCallback(() => {
    if (xhrRef.current) {
      xhrRef.current.abort();
      xhrRef.current = null;
    }
    setState({ progress: 0, isUploading: false, error: null });
  }, []);

  return { ...state, upload, reset };
}
