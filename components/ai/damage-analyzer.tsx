"use client";

import { useState, useRef } from "react";
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
import { Loader2, Sparkles, AlertTriangle } from "lucide-react";
import type { AIDamageAssessment } from "@/types/ai";

type AnalysisState = "idle" | "loading" | "success" | "error";

const TIMEOUT_MS = 60_000;
// Puter.js model naming: Claude models have NO vendor prefix (e.g. "claude-sonnet-4"),
// while other providers use "vendor/model" format (e.g. "google/gemini-2.5-flash").
const AI_MODEL = "claude-sonnet-4";

const AI_PROMPT = `Analyze this jersey repair photo. Identify:
1. Type of damage (tear, hole, stain, fading, logo_damage, seam_split)
2. Severity (minor, moderate, severe)
3. Affected area (front, back, sleeve, collar, hem)
4. Estimated repairability (easy, moderate, difficult)
Return ONLY a JSON object with keys: damageType, severity, affectedArea, repairability.
No markdown fences, no extra text.`;

const SEVERITY_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  minor: "secondary",
  moderate: "default",
  severe: "destructive",
};

/**
 * Wrap a promise with a timeout using Promise.race.
 * Unlike a flag-based timeout, this actually rejects and unblocks the await
 * when the timer fires — preventing indefinite hangs from Puter.js.
 */
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>;
  return Promise.race([
    promise.finally(() => clearTimeout(timeoutId)),
    new Promise<never>((_, reject) => {
      timeoutId = setTimeout(
        () => reject(new Error(`${label} timed out after ${ms / 1000}s. Please try again.`)),
        ms,
      );
    }),
  ]);
}

/**
 * Ensure the user is authenticated with Puter before making API calls.
 * Must be called from a user-initiated action (click handler) so the
 * browser allows the auth popup.
 */
async function ensurePuterAuth(): Promise<boolean> {
  if (!window.puter) return false;
  try {
    // If already signed in, skip the popup
    if (window.puter.auth.isSignedIn()) return true;
    const user = await withTimeout(
      window.puter.auth.signIn(),
      30_000,
      "Puter authentication",
    );
    return !!user;
  } catch {
    return false;
  }
}

/**
 * Parse Puter.js chat response — handles both plain string and
 * { message: { content: string } } formats returned by different models.
 */
function parsePuterResponse(response: string | { message: { content: string } }): string {
  if (typeof response === "string") return response;
  if (
    response &&
    typeof response === "object" &&
    "message" in response &&
    typeof response.message?.content === "string"
  ) {
    return response.message.content;
  }
  throw new Error("Invalid Puter.js response format");
}

function validateEnum<T extends string>(value: string, allowed: T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

export function selectAnalysisImageInput(files: File[], photoUrls: string[]): File | string | null {
  if (files.length > 0) return files[0];
  if (photoUrls.length > 0) return photoUrls[0];
  return null;
}

function parseAIResponse(raw: string): Omit<AIDamageAssessment, "confidence" | "rawResponse"> {
  const cleaned = raw
    .replace(/```(?:json)?\s*/g, "")
    .replace(/```\s*/g, "")
    .trim();

  // Find the first JSON object in the response
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON object found in AI response");

  const parsed: unknown = JSON.parse(jsonMatch[0]);

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("damageType" in parsed) ||
    !("severity" in parsed) ||
    !("affectedArea" in parsed) ||
    !("repairability" in parsed)
  ) {
    throw new Error("Invalid AI response structure");
  }

  const obj = parsed as Record<string, unknown>;
  return {
    damageType: String(obj.damageType),
    severity: validateEnum(String(obj.severity), ["minor", "moderate", "severe"], "moderate"),
    affectedArea: String(obj.affectedArea),
    repairability: validateEnum(String(obj.repairability), ["easy", "moderate", "difficult"], "moderate"),
  };
}

interface DamageAnalyzerProps {
  files: File[];
  photoUrls: string[];
  onAnalysisComplete: (result: AIDamageAssessment) => void;
}

export function DamageAnalyzer({ files, photoUrls, onAnalysisComplete }: DamageAnalyzerProps) {
  const [state, setState] = useState<AnalysisState>("idle");
  const [result, setResult] = useState<AIDamageAssessment | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [statusText, setStatusText] = useState("Analyzing jersey damage…");
  const isAnalyzing = useRef(false);

  async function handleAnalyze() {
    if ((files.length === 0 && photoUrls.length === 0) || isAnalyzing.current) return;
    isAnalyzing.current = true;

    setState("loading");
    setStatusText("Authenticating with AI service…");
    setErrorMessage("");

    try {
      if (!window.puter) {
        throw new Error("AI service is still loading. Please wait a moment and try again.");
      }

      // Step 1: Authenticate with Puter (user-initiated click, so popup is allowed)
      const authed = await ensurePuterAuth();
      if (!authed) {
        throw new Error(
          "Please sign in to Puter to use AI analysis. If the popup didn't appear, check your popup blocker and try again.",
        );
      }

      setStatusText("Analyzing jersey damage…");

      const imageInput = selectAnalysisImageInput(files, photoUrls);
      if (!imageInput) {
        throw new Error("Please upload a photo before running AI analysis.");
      }

      // Step 2: Call AI with Promise.race timeout (no streaming — simpler and more reliable).
      // The reference implementation avoids streaming because the for-await loop can hang
      // indefinitely even with a flag-based timeout.
      const response = await withTimeout(
        window.puter.ai.chat(AI_PROMPT, imageInput, { model: AI_MODEL }),
        TIMEOUT_MS,
        "AI analysis",
      );

      // Step 3: Parse response — Puter may return string or { message: { content } }
      const rawText = parsePuterResponse(response);
      const parsed = parseAIResponse(rawText);
      const assessment: AIDamageAssessment = {
        ...parsed,
        confidence: 0.75,
        rawResponse: rawText,
      };

      setResult(assessment);
      setState("success");
      onAnalysisComplete(assessment);
    } catch (err) {
      const raw = err instanceof Error ? err.message : String(err);
      const isAuthError = /\b(auth|login|sign.?in|permission|unauthorized|popup)\b/i.test(raw);
      const message = isAuthError
        ? "Please sign in to Puter to use AI analysis. A login popup may have appeared behind this window."
        : raw || "AI analysis failed unexpectedly.";
      setErrorMessage(message);
      setState("error");
    } finally {
      isAnalyzing.current = false;
    }
  }

  if (files.length === 0 && photoUrls.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            <p className="text-sm">
              Upload photos in the previous step to enable AI damage analysis.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          AI Damage Assessment
        </CardTitle>
        <CardDescription>
          Let AI analyze your jersey photos to estimate damage and repair complexity.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {state === "idle" && (
          <Button type="button" onClick={handleAnalyze} variant="outline" className="w-full">
            <Sparkles className="mr-2 h-4 w-4" />
            Try AI Assessment
          </Button>
        )}

        {state === "loading" && (
          <div className="flex items-center justify-center gap-2 py-6 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">{statusText}</span>
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
          <div className="space-y-3 rounded-lg border p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Damage Type</p>
                <p className="text-sm capitalize">{result.damageType.replace(/_/g, " ")}</p>
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
            <p className="text-xs text-muted-foreground">
              Confidence: {Math.round(result.confidence * 100)}%
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
