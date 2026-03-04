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

function validateEnum<T extends string>(value: string, allowed: T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
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
    setStatusText("Analyzing jersey damage…");
    setErrorMessage("");

    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      isAnalyzing.current = false;
      setErrorMessage("AI analysis timed out. Please try again.");
      setState("error");
    }, TIMEOUT_MS);

    try {
      if (!window.puter) {
        throw new Error("AI service is still loading. Please wait a moment and try again.");
      }

      // In development, log available models so devs can verify AI_MODEL is valid
      if (process.env.NODE_ENV === "development") {
        const aiService = window.puter.ai as unknown as Record<string, unknown>;
        if (typeof aiService.listModels === "function") {
          (aiService.listModels as () => Promise<unknown>)()
            .then((models) => console.log("[DamageAnalyzer] Available Puter.js models:", models))
            .catch(() => { /* non-critical diagnostic */ });
        }
      }

      // Prefer already-available photo URL (avoids re-uploading the raw File
      // through Puter's SDK, which is the main timeout bottleneck).
      const imageInput: string | File = photoUrls[0] ?? files[0];

      const stream = await window.puter.ai.chat(AI_PROMPT, imageInput, {
        model: AI_MODEL,
        stream: true,
      });

      if (timedOut) return; // timeout already fired, discard late result

      // Accumulate streamed text chunks and show progress once data arrives
      let accumulated = "";
      let receivedFirstChunk = false;
      for await (const chunk of stream) {
        if (timedOut) return;
        accumulated += chunk.text;
        if (!receivedFirstChunk) {
          receivedFirstChunk = true;
          setStatusText("Analyzing… receiving AI response");
        }
      }

      if (timedOut) return;

      const parsed = parseAIResponse(accumulated);
      const assessment: AIDamageAssessment = {
        ...parsed,
        confidence: 0.75,
        rawResponse: accumulated,
      };

      setResult(assessment);
      setState("success");
      onAnalysisComplete(assessment);
    } catch (err) {
      if (timedOut) return;
      const raw = err instanceof Error ? err.message : String(err);
      const isAuthError = /\b(auth|login|sign.?in|permission|unauthorized)\b/i.test(raw);
      const message = isAuthError
        ? "Please sign in to Puter to use AI analysis. A login popup may have appeared behind this window."
        : raw || "AI analysis failed unexpectedly.";
      setErrorMessage(message);
      setState("error");
    } finally {
      clearTimeout(timeout);
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

