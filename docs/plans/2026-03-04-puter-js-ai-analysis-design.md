# Design: Replace Server-Side Gemini with Client-Side Puter.js for AI Damage Analysis

**Date:** 2026-03-04
**Status:** Approved

## Problem

The AI damage analysis feature hangs because the server-side Google Gemini route (`/api/ai/analyze`) depends on `GOOGLE_GENERATIVE_AI_API_KEY` and `inngest` — neither of which are configured. The user wants zero API key dependencies for development.

## Solution

Replace server-side Gemini with client-side Puter.js. Puter.js provides free AI access (user-pays model) with no API keys, loaded via a `<script>` tag already present in the app.

## Design

### Component Interface

Update `DamageAnalyzer` to accept File objects directly:

```typescript
interface DamageAnalyzerProps {
  files: File[];              // Actual File objects for Puter.js
  photoUrls: string[];       // Base64 data URLs for display
  onAnalysisComplete: (result: AIDamageAssessment) => void;
}
```

`RepairRequestForm` passes `selectedFiles` (already in state) as the `files` prop.

### AI Analysis Logic

1. Check `window.puter` exists (SDK loaded)
2. Call `puter.ai.chat(prompt, files[0], { model: "claude-sonnet-4-20250514" })`
3. Parse `response.message.content` — strip markdown fences, parse JSON
4. Validate JSON has `damageType`, `severity`, `affectedArea`, `repairability`
5. Map to `AIDamageAssessment` type with `confidence: 0.75`
6. Call `onAnalysisComplete(assessment)`

Model: `claude-sonnet-4-20250514` (strong vision + reasoning). Single photo analysis (first file).

### Error Handling

- `window.puter` undefined → "AI service is loading, please wait"
- Puter.js auth popup → handled by SDK automatically
- Model/network error → show error message + retry button
- JSON parse failure → "AI response was not in expected format"
- 30s timeout via setTimeout + state guard

### Files to Remove

- `app/api/ai/analyze/route.ts` — Gemini server route
- `lib/inngest/client.ts` — Inngest client
- `lib/inngest/functions.ts` — Inngest functions
- `app/api/inngest/route.ts` — Inngest serve route
- `inngest` dependency from package.json
- `@google/generative-ai` dependency from package.json

### Files to Modify

- `components/ai/damage-analyzer.tsx` — rewrite to use Puter.js
- `components/forms/repair-request-form.tsx` — pass `files` prop
- `types/puter.d.ts` — update if needed

### Files Unchanged

- `types/ai.ts` — `AIDamageAssessment` type stays the same
- `components/ai/cost-estimator.tsx` — no changes
- `app/layout.tsx` — Puter.js `<Script>` tag already present
