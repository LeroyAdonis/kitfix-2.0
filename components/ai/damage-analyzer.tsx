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
import { Loader2, Sparkles, AlertTriangle } from "lucide-react";
import type { AIDamageAssessment } from "@/types/ai";

const AI_PROMPT = `Analyze this jersey repair photo. Identify:
1. Type of damage (tear, hole, stain, fading, logo damage, seam split)
2. Severity (minor, moderate, severe)
3. Affected area (front, back, sleeve, collar, hem)
4. Estimated repairability (easy, moderate, difficult)
Return as JSON with keys: damageType, severity, affectedArea, repairability.
Only return the JSON object, no markdown fences or extra text.`;

type AnalysisState = "idle" | "loading" | "success" | "error";

const SEVERITY_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  minor: "secondary",
  moderate: "default",
  severe: "destructive",
};

interface DamageAnalyzerProps {
  photoUrls: string[];
  onAnalysisComplete: (result: AIDamageAssessment) => void;
}

function parseAIResponse(raw: string): Omit<AIDamageAssessment, "confidence" | "rawResponse"> {
  // Strip markdown code fences if present
  const cleaned = raw.replace(/```(?:json)?\s*/g, "").replace(/```\s*/g, "").trim();
  const parsed: unknown = JSON.parse(cleaned);

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

function validateEnum<T extends string>(value: string, allowed: T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

export function DamageAnalyzer({ photoUrls, onAnalysisComplete }: DamageAnalyzerProps) {
  const [state, setState] = useState<AnalysisState>("idle");
  const [result, setResult] = useState<AIDamageAssessment | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  async function handleAnalyze() {
    if (photoUrls.length === 0) return;

    setState("loading");
    setErrorMessage("");

    try {
      if (typeof globalThis.puter === "undefined") {
        throw new Error("AI service is not available. Please try again later.");
      }

      const imageArg = photoUrls.length === 1 ? photoUrls[0] : photoUrls;
      const response = await globalThis.puter.ai.chat(AI_PROMPT, imageArg, {
        model: "gpt-4o",
        temperature: 0.2,
      });

      const rawContent = response.message.content;
      const parsed = parseAIResponse(rawContent);

      const assessment: AIDamageAssessment = {
        ...parsed,
        confidence: 0.75,
        rawResponse: rawContent,
      };

      setResult(assessment);
      setState("success");
      onAnalysisComplete(assessment);
    } catch (err) {
      const message = err instanceof Error ? err.message : "AI analysis failed unexpectedly.";
      setErrorMessage(message);
      setState("error");
    }
  }

  if (photoUrls.length === 0) {
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
            <span className="text-sm">Analyzing jersey damage…</span>
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

