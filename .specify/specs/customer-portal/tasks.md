# Tasks: Customer Portal — Auth, Photo Upload & AI Damage Analysis

**Plan:** .specify/specs/customer-portal/plan.md
**Spec:** .specify/specs/customer-portal/spec.md

## Phase 1: Auth Foundation
- [ ] T001 Verify scaffold: `convex/convex.config.ts`, `convex/auth.config.ts`, `convex/auth.ts`, `convex/http.ts`, `lib/auth-client.ts`, `lib/auth-server.ts`, `app/api/auth/[...all]/route.ts` — fix any errors
- [ ] T002 [P] Update `types.d.ts` — better-auth module declarations (already drafted)
- [ ] T003 Update `components/providers.tsx` → `ConvexBetterAuthProvider` (already done — verify)
- [ ] T004 Set env vars: `SITE_URL` on Convex (`npx convex env set`), verify `BETTER_AUTH_SECRET` set; on Vercel add `SITE_URL`, `BETTER_AUTH_SECRET` if missing
- [ ] T005 Run `npx convex dev` (background) + `npx convex deploy` to generate component types
- [ ] T006 Verify: `GET /api/auth/session` returns 200; sign-up round trip works

## Phase 2: Schema + Jobs
- [ ] T007 Update `convex/schema.ts` — jobs: customerPhone optional, customerEmail, channel + "web", userId, aiAnalysis object, by_userId index
- [ ] T008 Update `convex/jobs.ts`:
  - [ ] `create` — accept web fields (email, userId, phone optional, aiAnalysis)
  - [ ] `createWebJob` — NEW mutation (channel="web", requires userId)
  - [ ] `generateUploadUrl` — NEW action (Convex storage)
  - [ ] `listByUser` — NEW query (scoped to userId)
  - [ ] `list`/`get` — resolve photo storage IDs → URLs via `ctx.storage.getUrl`
- [ ] T009 Update `app/admin/admin-dashboard.tsx` — show web channel jobs (channel badge), email if no phone
- [ ] T010 Update `app/admin/jobs/[id]/page.tsx` — show customerEmail, channel, AI analysis panel
- [ ] T011 Verify: `npx convex deploy` clean; admin board renders web jobs + AI

## Phase 3: Auth Pages
- [ ] T012 Create `app/sign-in/page.tsx` — email/password, authClient.signIn.email, redirect to /repair/new (Repair Sheet design: pitch bg, gold button, stitch seam, KF mark)
- [ ] T013 Create `app/sign-up/page.tsx` — name/email/password, authClient.signUp.email, redirect to /repair/new
- [ ] T014 Add header nav: "Sign in" / "My Repairs" links based on auth state (landing header)
- [ ] T015 Verify: sign up → lands on /repair/new; sign out works; session persists on refresh

## Phase 4: Repair Submission + AI
- [ ] T016 Create `app/repair/new/page.tsx` — protected (redirect /sign-in if no session)
- [ ] T017 Create `components/forms/RepairRequestForm.tsx`:
  - [ ] Description textarea (required)
  - [ ] Phone (optional)
  - [ ] Photo upload (1–5, via generateUploadUrl + fetch PUT), preview grid, stitch-dashed dropzone
  - [ ] Submit → calls jobs.createWebJob
- [ ] T018 Create `app/api/analyze/route.ts` — NVIDIA vision (`meta/llama-3.2-11b-vision-instruct`), fetch storage URL → base64 → OpenAI-compat call, 8s AbortController, structured JSON return, graceful failure
- [ ] T019 "Match-day assessment" panel — AI result (damageType, description, tier, price) shown + editable before submit
- [ ] T020 Verify: upload → AI assessment → submit → appears on admin board

## Phase 5: Customer Tracking
- [ ] T021 Create `app/my-jobs/page.tsx` — jobs.listByUser, status badges (Repair Sheet styling), job refs
- [ ] T022 Verify: submitted job appears; admin status change reflects

## Phase 6: Pipeline
- [ ] T023 TDD tests: createWebJob requires userId, listByUser scoping, channel default
- [ ] T024 Typecheck + lint + build (CSS_TRANSFORMER_WASM=true)
- [ ] T025 E2E: sign-up → upload → analyze → submit → my-jobs (reins or playwright)
- [ ] T026 Dogfood QA browser click-through
- [ ] T027 Deploy (Vercel), verify prod, Phase 8 Backlog Sweep, tag

## Dependencies
T005 depends on T001-T004. T007 depends on T005. T008 depends on T007. T012/T013 depend on T005. T016 depends on T012/T013. T017 depends on T008, T016. T018 depends on T008 (storage). T019 depends on T017, T018. T021 depends on T008, T016. T023+ depend on all above.

## Parallel Opportunities
T002, T003 parallel. T012, T013 parallel (different pages). T017, T018 parallel (different files).

## MVP Scope
MVP = Phase 1 + 2 + 3 + 4 (auth, web submission, AI). Phase 5 (tracking) + 6 (pipeline hardening) complete before release per gold pipeline.
