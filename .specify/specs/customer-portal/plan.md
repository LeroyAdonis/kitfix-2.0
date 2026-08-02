# Implementation Plan: Customer Portal — Auth, Photo Upload & AI Damage Analysis

**Spec:** .specify/specs/customer-portal/spec.md
**Date:** 2026-08-02
**Constitution:** .specify/constitution.md (existing — extend for this feature)

## Technical Context

| Dimension | Decision | Rationale |
|---|---|---|
| Frontend | Next.js 16 App Router (existing) | Already the stack |
| Styling | Tailwind v4 + CSS vars (Repair Sheet tokens) | Existing design language — pitch `#17351A`, thread `#EFE9D8`, stitch `#F2B01E` |
| Database | Convex (existing) | KitFix is pure Convex — no Neon/Drizzle needed |
| Auth | **Better Auth + Convex component** (`@convex-dev/better-auth` v0.12.5, `better-auth` 1.6.25) | Official Convex integration; email/password, sessions stored in Convex; no external DB. Already installed. |
| Photo storage | **Convex file storage** (`generateUploadUrl` + `ctx.storage`) | Built into Convex, no new service. Photos stored as storage IDs; URLs resolved via `getUrl` |
| AI analysis | **NVIDIA NIM vision model** via server route (`app/api/analyze/route.ts`) | Free-tier (matches stack preference). Model: `meta/llama-3.2-11b-vision-instruct` per AGENTS.md (used in Central Hub). Fallback to manual submit if AI fails. |
| Deploy | Vercel auto-deploy on push to main | Existing |

## Constitution Check

Existing constitution is Macrophage-hero-specific (build rules: cn(), GSAP, CSS vars, mobile throttle). Extend with a feature-level note: **"Web channel jobs must follow the same Repair Sheet design language and never bypass admin review — AI quote is a suggestion, admin board is source of truth."** No conflicts with existing rules.

## Research Summary

- **Auth:** Better Auth + Convex component is the official integration (labs.convex.dev/better-auth). Requires `convex.config.ts` (register component), `convex/auth.config.ts`, `convex/auth.ts` (createAuth + getCurrentUser), `convex/http.ts` (registerRoutes), `lib/auth-client.ts` (client), `lib/auth-server.ts` (Next.js server utils), `app/api/auth/[...all]/route.ts` (proxy handler), and providers swapped to `ConvexBetterAuthProvider`. Env: `BETTER_AUTH_SECRET` (set, in .env.local), `SITE_URL` (needs setting), `NEXT_PUBLIC_CONVEX_URL` (set).
- **Photos:** Convex storage — client calls `generateUploadUrl` action → PUTs file → gets storage ID → store IDs on job. Queries resolve IDs → URLs via `ctx.storage.getUrl`.
- **AI:** NVIDIA NIM OpenAI-compatible endpoint `https://integrate.api.nvidia.com/v1/chat/completions` with `meta/llama-3.2-11b-vision-instruct`. Takes image as base64 data URL. Server route fetches the storage URL → base64 → sends to NVIDIA → returns structured JSON (damageType, description, tier, price). AbortController 8s timeout (Vercel Hobby 10s cap). AI failure → graceful fallback (manual submit).
- **Pricing tiers:** Basic R150 / Complex R250 / Full Refresh R400 (existing). AI maps damage → tier.

## Data Model

### Jobs (extended — Convex `jobs` table)

```typescript
jobs: defineTable({
  customerName: v.string(),
  customerPhone: v.optional(v.string()),          // NEW: optional for web
  customerEmail: v.optional(v.string()),          // NEW: email for web channel
  customerChannel: v.union(v.literal("whatsapp"), v.literal("telegram"), v.literal("web")),  // + "web"
  userId: v.optional(v.id("users")),              // NEW: link to BA user (authComponent tables)
  description: v.string(),
  damageType: v.optional(v.string()),
  photoUrls: v.array(v.string()),                 // storage IDs (resolve via getUrl in queries)
  aiAnalysis: v.optional(v.object({               // NEW: AI result
    damageType: v.string(),
    description: v.string(),
    suggestedTier: v.string(),
    suggestedPrice: v.number(),
    confidence: v.number(),
    model: v.string(),
  })),
  quote: v.optional(v.number()),
  status: v.union(v.literal("new"), v.literal("in_repair"), v.literal("ready"), v.literal("done")),
  adminNotes: v.optional(v.string()),
})
  .index("by_status", ["status"])
  .index("by_phone", ["customerPhone"])
  .index("by_userId", ["userId"])                 // NEW: customer tracking
```

### Better Auth tables (auto-created by component)
`users`, `sessions`, `accounts`, `verifications` — managed by `@convex-dev/better-auth`, no manual schema needed.

## API Contracts

### Auth (proxied to Convex)
- `POST /api/auth/sign-up/email` → `{ name, email, password }`
- `POST /api/auth/sign-in/email` → `{ email, password }`
- `POST /api/auth/sign-out`
- `GET /api/auth/session` → current session

### Convex mutations/actions
- `jobs.createWebJob` — mutation: create job with channel="web", userId, photoStorageIds, aiAnalysis
- `jobs.generateUploadUrl` — action: returns upload URL for Convex storage
- `jobs.listByUser` — query: jobs where userId = current user (for tracking)
- `jobs.list` (existing) — include web jobs; resolve photo URLs
- `jobs.get` (existing) — resolve photo URLs

### AI analysis (Next.js route)
- `POST /api/analyze` → `{ photoStorageIds: string[] }` → fetches images from Convex, sends to NVIDIA, returns `{ damageType, description, suggestedTier, suggestedPrice, confidence }`

## Implementation Phases

### Phase 1: Auth Foundation (mostly scaffolded)
**Goal:** Email/password auth works end-to-end.
**Tasks:**
- [ ] Verify existing scaffold: `convex/convex.config.ts`, `convex/auth.config.ts`, `convex/auth.ts`, `convex/http.ts`, `lib/auth-client.ts`, `lib/auth-server.ts`, `app/api/auth/[...all]/route.ts` (already written)
- [ ] Fix `types.d.ts` for better-auth modules (already added)
- [ ] Update `components/providers.tsx` → `ConvexBetterAuthProvider` (already done)
- [ ] Set env: `SITE_URL` on Convex + Vercel; verify `BETTER_AUTH_SECRET`
- [ ] Run `npx convex dev` to generate component types + `npx convex deploy`
- [ ] **Verify:** sign-up/sign-in via curl or browser returns session

### Phase 2: Schema + Jobs
**Goal:** Jobs support web channel, AI analysis, user linkage, photo storage IDs.
**Tasks:**
- [ ] Update `convex/schema.ts` (jobs fields above)
- [ ] Update `convex/jobs.ts`: `create` accepts web fields; add `generateUploadUrl` action; add `listByUser` query; photo URL resolution in `list`/`get`
- [ ] Update admin dashboard + job detail to show web channel + AI analysis + email
- **Verify:** `npx convex deploy` clean; admin board renders web jobs

### Phase 3: Auth Pages (Repair Sheet design)
**Goal:** /sign-in, /sign-up pages.
**Tasks:**
- [ ] `app/sign-in/page.tsx` — email/password form, authClient.signIn.email
- [ ] `app/sign-up/page.tsx` — name/email/password, authClient.signUp.email
- [ ] Shared auth form styles matching admin login (pitch bg, gold button, stitch seam)
- **Verify:** sign up → lands on /repair/new; sign out works

### Phase 4: Repair Submission + AI
**Goal:** Signed-in customer submits photos + description, gets AI analysis.
**Tasks:**
- [ ] `app/repair/new/page.tsx` — protected page (redirect to /sign-in if not authed)
- [ ] `components/forms/RepairRequestForm.tsx` — description + photo upload (max 5), previews, submit
- [ ] `app/api/analyze/route.ts` — NVIDIA vision call (llama-3.2-11b-vision-instruct), 8s AbortController
- [ ] "Match-day assessment" panel — shows AI result (type, description, tier, price) editable before submit
- [ ] `jobs.createWebJob` mutation — stores job with photos + AI analysis
- **Verify:** upload 2 photos → AI returns assessment → submit → appears on admin board

### Phase 5: Customer Tracking
**Goal:** Signed-in customer sees their jobs + status.
**Tasks:**
- [ ] `app/my-jobs/page.tsx` — lists jobs via `jobs.listByUser`, status badges (Repair Sheet styling)
- [ ] Header nav: "My Repairs" link when authed; "Sign in" otherwise
- **Verify:** submit a job → appears in My Repairs → status changes reflect

### Phase 6: Polish + Pipeline
**Goal:** Full gold pipeline passes.
**Tasks:**
- [ ] TDD tests for jobs mutations (web job creation, listByUser scoping)
- [ ] E2E: sign-up → upload → analyze → submit → my-jobs
- [ ] Dogfood QA in browser
- [ ] Deploy + verify + Backlog Sweep

## Quickstart

```bash
cd /root/kitfix-2.0
npm run dev                    # dev server (convex dev in separate terminal)
npx convex dev                 # Convex dev (generates component types)
# Visit http://localhost:3000/sign-up → create account
# Visit http://localhost:3000/repair/new → upload photos → AI analysis → submit
# Visit http://localhost:3000/my-jobs → see job + status
# Admin: http://localhost:3000/admin → see web job with AI analysis
```
