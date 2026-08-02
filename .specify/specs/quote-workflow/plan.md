# Plan — Quote Override & Customer Quote Confirmation

**Spec:** `.specify/specs/quote-workflow/spec.md`
**Date:** 2026-08-02

## Order of work

1. **Schema** — add `quoteStatus` field (optional, additive).
2. **Convex mutations** — modify `updateQuote` (reset to estimate), add `confirmQuote`, set `quoteStatus` in create/createWebJob.
3. **Admin UI** — quote panel: status chip + override input in `/admin/jobs/[id]`.
4. **Customer UI** — My Repairs: "Estimate"/"Confirmed" labels + Confirm button.
5. **Verify** — build, convex dev, browser E2E (customer + admin), convex deploy, Vercel push.

## File map

| File | Change |
|---|---|
| `convex/schema.ts` | + `quoteStatus` optional union |
| `convex/jobs.ts` | updateQuote resets status; + confirmQuote; create/createWebJob set "estimate" |
| `app/admin/(protected)/jobs/[id]/page.tsx` | Quote panel: chip + override form |
| `app/my-jobs/page.tsx` | Estimate/Confirmed labels + Confirm quote button |

## Design decisions

- **Cents everywhere** — admin input in Rands, converted `* 100` on save. Display `.toFixed(2)` assumes cents.
- **Override resets to estimate** — a new admin number must be re-confirmed by the customer. No silent change to a "confirmed" quote.
- **Optional field, no migration** — existing jobs render as "Estimate" (undefined → estimate branch). Zero breakage.
- **Reactive update** — Convex `useQuery` re-renders My Repairs after confirm; no router refresh needed.

## Delegation

Implementation → OpenCode agent(s), single agent for all 4 files (small, tight coupling). Assistant: verify build + browser E2E, commit, convex deploy, push.
