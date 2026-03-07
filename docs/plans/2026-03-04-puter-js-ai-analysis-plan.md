# Puter.js AI Analysis Migration — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace server-side Google Gemini AI with client-side Puter.js for jersey damage analysis — zero API keys required.

**Architecture:** The DamageAnalyzer client component calls `puter.ai.chat()` directly with File objects and a vision-capable model. The server route, Gemini SDK, and Inngest infra are removed entirely.

**Tech Stack:** Puter.js v2 (CDN script already loaded), `claude-sonnet-4-20250514` model, React 19 client component.

**Design Doc:** `docs/plans/2026-03-04-puter-js-ai-analysis-design.md`

---

### Task 1: Remove Inngest infrastructure

Remove Inngest files and dependency. These are only used by the AI route we're replacing.

**Files:**
- Delete: `lib/inngest/client.ts`
- Delete: `lib/inngest/functions.ts`
- Delete: `app/api/inngest/route.ts`
- Modify: `package.json` (remove `inngest` dependency, line 30)

**Step 1: Delete Inngest files**

```bash
Remove-Item lib/inngest/client.ts
Remove-Item lib/inngest/functions.ts
Remove-Item app/api/inngest/route.ts
Remove-Item lib/inngest   # remove empty directory
```

**Step 2: Remove inngest from package.json**

In `package.json`, remove the line:
```json
    "inngest": "^3.52.5",
```

**Step 3: Run `npm install` to update lockfile**

```bash
npm install
```
Expected: lockfile updated, no errors.

**Step 4: Verify typecheck passes**

```bash
npm run typecheck
```
Expected: PASS (no other files import from inngest).

**Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove Inngest infrastructure (unused without server AI route)"
```

---

### Task 2: Remove server-side AI route and Gemini SDK

Remove the `/api/ai/analyze` route and `@google/generative-ai` dependency.

**Files:**
- Delete: `app/api/ai/analyze/route.ts`
- Modify: `package.json` (remove `@google/generative-ai` if present — note: it may only be in lockfile)

**Step 1: Delete the AI route**

```bash
Remove-Item app/api/ai/analyze/route.ts
Remove-Item app/api/ai/analyze   # remove empty directory
Remove-Item app/api/ai           # remove empty directory if empty
```

**Step 2: Check if `@google/generative-ai` is in package.json**

```bash
Select-String -Path package.json -Pattern "google/generative-ai"
```

If found, remove the line. If not found (was only installed as transitive), skip.

**Step 3: Run `npm install` if package.json was changed**

```bash
npm install
```

**Step 4: Verify typecheck passes**

```bash
npm run typecheck
```
Expected: FAIL — `damage-analyzer.tsx` still references `/api/ai/analyze` via fetch. This is expected; Task 3 will fix it.

**Step 5: Verify tests pass**

```bash
npm run test:run
```
Expected: All 213 tests PASS (no tests reference the AI route).

**Step 6: Commit**

```bash
git add -A
git commit -m "chore: remove server-side Gemini AI route and SDK dependency"
```

---

### Task 3: Rewrite DamageAnalyzer to use Puter.js

Replace the fetch-to-server-route pattern with direct client-side Puter.js calls.

**Files:**
- Rewrite: `components/ai/damage-analyzer.tsx`
- Reference (read-only): `types/puter.d.ts`, `types/ai.ts`

**Step 1: Rewrite `components/ai/damage-analyzer.tsx`**

Replace the entire file content with:

```tsx
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

const TIMEOUT_MS = 30_000;
const AI_MODEL = "claude-sonnet-4-20250514";

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
  const isAnalyzing = useRef(false);

  async function handleAnalyze() {
    if (files.length === 0 || isAnalyzing.current) return;
    isAnalyzing.current = true;

    setState("loading");
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

      const response = await window.puter.ai.chat(AI_PROMPT, files[0], {
        model: AI_MODEL,
      });

      if (timedOut) return; // timeout already fired, discard late result

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
      if (timedOut) return;
      const message = err instanceof Error ? err.message : "AI analysis failed unexpectedly.";
      setErrorMessage(message);
      setState("error");
    } finally {
      clearTimeout(timeout);
      isAnalyzing.current = false;
    }
  }

  if (files.length === 0) {
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
```

Key changes from the original:
- Accepts `files: File[]` prop (for Puter.js) alongside `photoUrls` (for display)
- Calls `window.puter.ai.chat()` directly instead of `fetch("/api/ai/analyze")`
- Uses `useRef(isAnalyzing)` to prevent double-clicks
- Timeout uses a `timedOut` flag guard (can't abort Puter.js SDK calls)
- `parseAIResponse` includes regex to extract JSON from surrounding text
- Empty state checks `files.length` instead of `photoUrls.length`

**Step 2: Verify typecheck passes**

```bash
npm run typecheck
```
Expected: May fail on `repair-request-form.tsx` since DamageAnalyzer now requires `files` prop. This is fixed in Task 4.

**Step 3: Commit**

```bash
git add components/ai/damage-analyzer.tsx
git commit -m "feat: rewrite DamageAnalyzer to use client-side Puter.js AI"
```

---

### Task 4: Update RepairRequestForm to pass File objects

Pass the existing `selectedFiles` state to DamageAnalyzer as the `files` prop.

**Files:**
- Modify: `components/forms/repair-request-form.tsx:546-549`

**Step 1: Update DamageAnalyzer usage in Step 3**

Find this block (around line 546):
```tsx
          <DamageAnalyzer
            photoUrls={formData.photoUrls}
            onAnalysisComplete={setAiAssessment}
          />
```

Replace with:
```tsx
          <DamageAnalyzer
            files={selectedFiles}
            photoUrls={formData.photoUrls}
            onAnalysisComplete={setAiAssessment}
          />
```

`selectedFiles` is already in scope (defined at line 104).

**Step 2: Verify typecheck passes**

```bash
npm run typecheck
```
Expected: PASS — all props now match the new interface.

**Step 3: Verify tests pass**

```bash
npm run test:run
```
Expected: All 213 tests PASS.

**Step 4: Commit**

```bash
git add components/forms/repair-request-form.tsx
git commit -m "feat: pass File objects to DamageAnalyzer for Puter.js vision"
```

---

### Task 5: Update Puter.js type declarations

Ensure `types/puter.d.ts` uses `window.puter` pattern and matches actual SDK usage.

**Files:**
- Modify: `types/puter.d.ts`

**Step 1: Check current type declarations match usage**

Current declarations declare `var puter: Puter | undefined` globally. The new code uses `window.puter`. This should work in TypeScript since global vars are properties of `window`.

Verify the existing types cover all used API surface:
- `puter.ai.chat(prompt: string, file: File, options: { model: string })` → returns `Promise<PuterAIChatResponse>` ✓
- `response.message.content: string` ✓

No changes needed if types are sufficient. If `window.puter` isn't recognized by TypeScript, add to the `Window` interface:

```typescript
declare global {
  var puter: Puter | undefined;
  interface Window {
    puter?: Puter;
  }
}
```

**Step 2: Verify typecheck passes**

```bash
npm run typecheck
```
Expected: PASS.

**Step 3: Commit (only if changes were needed)**

```bash
git add types/puter.d.ts
git commit -m "fix: add Window interface for puter.js type declarations"
```

---

### Task 6: Final verification and cleanup

Run full test suite, build, and verify everything works end-to-end.

**Step 1: Run typecheck**

```bash
npm run typecheck
```
Expected: PASS.

**Step 2: Run unit tests**

```bash
npm run test:run
```
Expected: All 213 tests PASS.

**Step 3: Run build**

```bash
npm run build
```
Expected: Build succeeds. The route count may decrease by 2 (removed `/api/ai/analyze` and `/api/inngest`).

**Step 4: Verify no stale references**

```bash
# Check no remaining references to removed files
Select-String -Path (Get-ChildItem -Recurse -Include *.ts,*.tsx -Exclude node_modules) -Pattern "inngest|@google/generative-ai|api/ai/analyze" | Where-Object { $_.Path -notlike "*node_modules*" -and $_.Path -notlike "*plans*" }
```
Expected: No matches (except design doc in docs/plans/).

**Step 5: Squash or final commit if needed**

```bash
git --no-pager log --oneline -6
```

Review the commit history is clean. If all good, the migration is complete.
