# AI Damage Analysis — Architecture Redesign

> **Status:** Plan (not implementation)
> **Goal:** Fix "This operation was aborted" on NVIDIA Vision API jersey image analysis, ground-up redesign.

---

## Problem Analysis

### Current Architecture (Broken)

```
Step 2 (select photo)                    Step 3 (AI Assessment)
     │                                         │
     ▼                                         ▼
  FileReader.readAsDataURL() ──► data:base64... ──► Server Action ──► NVIDIA API
  (creates 3-7MB data URL)                        │                     │
                                                   │  10s timeout        │  5-10s response
                                                   │  Vercel Hobby cap   │
                                                   ▼                     ▼
                                              ❌ "Operation aborted"   ❌
```

### Root Causes

| # | Problem | Detail | Effect |
|---|---------|--------|--------|
| 1 | **Data URL payload** | 3-7MB base64 string sent through server action | Eats into 10s budget on transfer alone |
| 2 | **Vercel Hobby 10s cap** | Serverless functions hard-capped at 10s, `maxDuration: 30` ignored | Function killed mid-request |
| 3 | **Upload-after-submit** | Photos uploaded to Vercel Blob only on form submit (line 256-272), too late for Step 3 analysis | Can't use fast public URLs for AI |
| 4 | **No temp upload path** | `/api/upload` requires `repairRequestId` which doesn't exist until repair is created | Can't upload before creating repair |

### What We Tried (and Why It Failed)

| Fix | Why It Didn't Work |
|-----|-------------------|
| `maxDuration: 30` | Hobby plan caps at 10s — 30 is ignored by Vercel infra |
| `serverActions.bodySizeLimit: 10mb` | Fixed body limit issue, but the REAL timeout was the NVIDIA API call, not the body |
| `AbortSignal.timeout(25_000)` | Cleaner error message, but 25s > 10s Hobby cap → still aborted before signal fires |

---

## Proposed Architecture

### New Flow

```
Step 2: Select photo
    │
    ├──► Display preview (thumbnails, client-side) ← keep File objects
    │
Step 3: Click "Analyze with AI"
    │
    ├──► POST /api/upload/temp (no repairRequestId needed)
    │    └──► Vercel Blob ← stores to temp folder
    │    └──► Returns public URL (tiny string)
    │
    ├──► analyzeDamageAction(publicUrl) ← MILLISECONDS to receive
    │    └──► fetch(NVIDIA, { image_url: publicUrl })
    │    └──► FULL 10s budget for NVIDIA response ← critical win
    │
    ├──► Display result
    │
Step 5: Submit form
    │
    └──► createRepairAction → creates repair → links blobs to repairPhotos table
```

### Key Changes

**Change 1: New temp upload API** — `POST /api/upload/temp`
- Accepts a file → uploads to Vercel Blob under `temp/` prefix
- Returns `{ url: "https://blob.vercel-storage.com/temp/..." }`
- No `repairRequestId` required — just auth + file
- Optionally: sets a TTL or cleanup cron on temp uploads

**Change 2: DamageAnalyzer uploads before analysis**
- Instead of passing `photoUrls[0]` (data URL) to the server action:
  1. Uploads the **original File** to `/api/upload/temp`
  2. Gets back a public URL
  3. Calls `analyzeDamageAction(publicUrl)` with the public URL

**Change 3: Server action receives public URL (not data URL)**
- Payload is now ~80 bytes instead of 3-7MB
- The full 10s Vercel budget goes to the NVIDIA call, not data transfer
- If it STILL times out, we know it's the NVIDIA model speed, not our architecture

**Change 4: On form submit, migrate temp blobs to permanent location**
- When `createRepairAction` runs, it needs to move temp blobs to permanent records
- Either: re-upload the file from the temp URL, or just insert the URL into `repairPhotos`
- Simplest: just insert the temp URL into `repairPhotos` with the correct `repairRequestId`

---

## Files to Change

### Create:
- `app/api/upload/temp/route.ts` — Temp upload endpoint

### Modify:
- `components/ai/damage-analyzer.tsx` — Upload file first, then pass public URL
- `components/forms/repair-request-form.tsx` — Store uploaded blob URLs + handle temp→permanent migration
- `actions/ai-damage.ts` — Remove `maxDuration`, revert to default 10s (cleaner)
- `next.config.ts` — Revert `serverActions.bodySizeLimit` (no longer needed if no data URLs)
- `types/index.ts` or `types/ai.ts` — Maybe add types for temp upload response

### Potentially remove:
- `hooks/use-upload.ts` ← Evaluate if still needed after refactor

---

## Implementation Plan (Bite-Sized Tasks)

### Task 1: Create temp upload API route

**Objective:** A simple upload endpoint that accepts a file, uploads to Vercel Blob, and returns the public URL. No DB records, no repairRequestId needed.

**File:** `app/api/upload/temp/route.ts`

```
POST /api/upload/temp
  Body: multipart/form-data { file: File }
  Auth: Required (getSession)
  Response: { success: true, url: string } | { error: string }
  Storage: Vercel Blob under temp/{userId}/{uuid}-{filename}
```

**Key design decisions:**
- Reuses `validateUploadFile` and `uploadPhoto` from `@/lib/upload`
- Stores blobs under `temp/{userId}/` prefix so we can clean them later
- No DB insert — just upload + return URL

### Task 2: Update DamageAnalyzer to upload before analyzing

**File:** `components/ai/damage-analyzer.tsx`

Changes:
- Accept `files: File[]` prop instead of (or alongside) `photoUrls: string[]`
- In `handleAnalyze()`:
  1. Upload `files[0]` to `/api/upload/temp`
  2. Get back `{ url }` 
  3. Call `analyzeDamageAction(url)` with public URL
- Still show data-url preview thumbnails (those stay in the form state)

**Edge case:** If upload fails, show a clear error (network vs server)

### Task 3: Update form to pass File objects to DamageAnalyzer

**File:** `components/forms/repair-request-form.tsx`

Changes:
- On step 3, pass `selectedFiles` (the File[] from input) to `DamageAnalyzer`
- On form submit, use the stored Vercel Blob URLs instead of re-uploading from scratch
- If AI analysis was done, the blob URL is already known → just link it

### Task 4: Update server action (clean up)

**File:** `actions/ai-damage.ts`

Changes:
- Revert `maxDuration: 30` (useless on Hobby)
- The `AbortSignal.timeout(25_000)` can stay — if it fires, it means the NVIDIA model is too slow
- Option: Add a lower timeout like `AbortSignal.timeout(9_000)` to fail gracefully before Vercel's 10s kills it

### Task 5: Update form submit to handle temp→permanent migration

**File:** `components/forms/repair-request-form.tsx`

Changes:
- On form submit, after `createRepairAction` succeeds:
  - Take the blob URL from AI analysis (or any pre-uploaded photos)
  - Insert a record in `repairPhotos` table linking to the new `repairId`
  - Use a server action or direct DB insert

---

## Verification Plan

1. **Upload API test:** `curl -X POST -F "file=@test.jpg" http://localhost:3000/api/upload/temp` → expect 200 + blob URL
2. **Step 3 analysis:** Select a photo → click "Analyze" → expect loading state → expect result in <10s
3. **Form submit:** Complete all steps → submit → verify photos linked to repair
4. **Error states:** Upload fails → clear error message; NVIDIA times out → clear error message
5. **E2E:** Run Playwright test for sign-up → create repair → verify AI analysis works

---

## Risks & Tradeoffs

| Risk | Impact | Mitigation |
|------|--------|------------|
| NVIDIA model is just slow (>10s) | Even with public URL, it times out | Switch to faster model (Phi-3-vision, PaliGemma) or use OpenAI vision API |
| Temp blobs accumulate | Storage costs | Add cron job to clean `temp/` blobs older than 24h |
| Upload takes too long (large file) | User waits on Step 3 | Show progress bar; compress/resize client-side before upload |
| Auth on temp upload | User must be signed in to analyze | `authenticatedAction` wrapper on the route — already required |

---

## Stretch Goals (if NVIDIA is still too slow)

If even with public URLs the NVIDIA model takes >10s, we need a fundamentally async approach:

1. **Client-side AI (browser):** Run a small ONNX model in browser via Transformers.js — instant, no server
2. **Webhook callback:** Submit analysis request, get a callback URL, process async, notify user
3. **Pre-computed analysis:** For common jerseys, cache AI assessments by jersey type + damage pattern
4. **Serverless waitUntil:** Vercel's `waitUntil` can continue processing after the response is sent — but still has total timeout limits

---

## Rollback Plan

If the new architecture breaks something:
```bash
# Revert all temp upload changes
git revert HEAD --no-edit
# Re-deploy
npx vercel --prod
```
