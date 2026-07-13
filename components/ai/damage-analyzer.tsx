"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle, Cpu, Upload } from "lucide-react";
import { analyzeDamageAction } from "@/actions/ai-damage";
import type { AIDamageAssessment } from "@/types/ai";
import { useRouter } from "next/navigation";

type AnalysisState = "idle" | "loading" | "uploading" | "success" | "error";

const SEVERITY_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  minor: "secondary",
  moderate: "default",
  severe: "destructive",
};

interface DamageAnalyzerProps {
  /** Data URLs for displaying preview thumbnails */
  photoUrls: string[];
  /** Original File objects for client-side upload to temp storage */
  files: File[];
  existingAssessment?: AIDamageAssessment | null;
  onAnalysisComplete?: (result: AIDamageAssessment, blobUrl?: string) => void;
}

export function DamageAnalyzer({
  photoUrls,
  files,
  existingAssessment,
  onAnalysisComplete,
}: DamageAnalyzerProps) {
  const [state, setState] = useState<AnalysisState>(existingAssessment ? "success" : "idle");
  const [result, setResult] = useState<AIDamageAssessment | null>(existingAssessment ?? null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const router = useRouter();

  if (photoUrls.length === 0 || files.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Cpu className="h-4 w-4" />
            <p className="text-sm">
              Upload photos first to enable AI damage analysis.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  /**
   * Upload a file to the temp upload endpoint using XMLHttpRequest
   * for progress tracking, then return the public URL.
   */
  function uploadFile(file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(pct);
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const json = JSON.parse(xhr.responseText);
            if (json.success && json.url) {
              resolve(json.url);
            } else {
              reject(new Error(json.error ?? "Upload failed"));
            }
          } catch {
            reject(new Error("Invalid server response"));
          }
        } else {
          let msg = `Upload failed (${xhr.status})`;
          try {
            const json = JSON.parse(xhr.responseText);
            if (json.error) msg = json.error;
          } catch {
            // keep generic
          }
          reject(new Error(msg));
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Network error — check your connection"));
      });

      xhr.addEventListener("abort", () => {
        reject(new Error("Upload was cancelled"));
      });

      const formData = new FormData();
      formData.append("file", file);

      xhr.open("POST", "/api/upload/temp");
      xhr.send(formData);
    });
  }

  async function handleAnalyze() {
    setState("uploading");
    setUploadProgress(0);
    setErrorMessage("");

    try {
      // Step 1: Upload the first file to temp storage
      const blobUrl = await uploadFile(files[0]);

      // Step 2: Call the AI server action with the public URL
      setState("loading");

      const assessment = await analyzeDamageAction(blobUrl);

      if (!assessment.success) {
        setErrorMessage(assessment.error);
        setState("error");
        return;
      }

      setResult(assessment.data);
      setState("success");
      onAnalysisComplete?.(assessment.data, blobUrl);
      router.refresh();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Analysis failed unexpectedly.");
      setState("error");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cpu className="h-5 w-5 text-brand-gold" />
          AI Damage Assessment
          <Badge variant="outline" className="text-[10px] font-normal ml-1">
            NVIDIA
          </Badge>
        </CardTitle>
        <CardDescription>
          Vision AI analyzes your jersey photos to classify damage and estimate repair complexity.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {state === "idle" && (
          <Button
            type="button"
            onClick={handleAnalyze}
            variant="outline"
            className="w-full"
          >
            <Cpu className="mr-2 h-4 w-4" />
            Analyze with NVIDIA Vision
          </Button>
        )}

        {state === "uploading" && (
          <div className="space-y-2 py-4">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Upload className="h-5 w-5 animate-pulse" />
              <span className="text-sm">Uploading photo…</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-center text-xs text-muted-foreground">
              {uploadProgress}%
            </p>
          </div>
        )}

        {state === "loading" && (
          <div className="flex items-center justify-center gap-2 py-6 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Analyzing jersey damage with NVIDIA vision model…</span>
          </div>
        )}

        {state === "error" && (
          <div className="space-y-3">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
            <p className="text-xs text-muted-foreground">
              AI assessment is optional — you can skip this step and continue.
            </p>
            <Button type="button" onClick={handleAnalyze} variant="outline" size="sm">
              Retry
            </Button>
          </div>
        )}

        {state === "success" && result && (
          <div className="space-y-3 rounded-lg border border-brand-gold/20 bg-brand-gold/5 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Damage Type</p>
                <p className="text-sm font-medium capitalize">{result.damageType.replace(/_/g, " ")}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Severity</p>
                <Badge variant={SEVERITY_VARIANT[result.severity] ?? "default"}>
                  {result.severity}
                </Badge>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Affected Area</p>
                <p className="text-sm capitalize">{result.affectedArea}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Repairability</p>
                <p className="text-sm capitalize">{result.repairability}</p>
              </div>
            </div>
            {result.description && (
              <p className="text-sm text-muted-foreground border-t border-brand-gold/10 pt-3">
                {result.description}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Confidence: {Math.round((result.confidence ?? 0.75) * 100)}%
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
