# Tasks — Quote Override & Customer Quote Confirmation

**Spec:** `.specify/specs/quote-workflow/spec.md`

## Task 1 — Schema
- [ ] Add `quoteStatus: v.optional(v.union(v.literal("estimate"), v.literal("confirmed")))` to `jobs` table in `convex/schema.ts`

## Task 2 — Convex functions
- [ ] `updateQuote`: also patch `quoteStatus: "estimate"`
- [ ] Add `confirmQuote` mutation (throws if no quote)
- [ ] `create` + `createWebJob`: set `quoteStatus: "estimate"` when quote set

## Task 3 — Admin override UI
- [ ] Quote panel in `app/admin/(protected)/jobs/[id]/page.tsx`: status chip (ESTIMATE/CONFIRMED)
- [ ] Override input (Rands) + "Update quote" button → `updateQuote({ id, quote: rands*100 })`
- [ ] Transient "Quote updated" confirmation

## Task 4 — Customer UI
- [ ] `app/my-jobs/page.tsx`: label = "Estimate" (default) / "Confirmed ✓" when confirmed
- [ ] "Confirm quote" button when estimate → `confirmQuote({ id })`

## Task 5 — Verification
- [ ] Build exit 0
- [ ] Convex dev typecheck clean
- [ ] Browser: customer sees Estimate → Confirm → Confirmed ✓
- [ ] Browser: admin override → R350 → chip back to ESTIMATE → customer sees new estimate
- [ ] `npx convex deploy` prod
- [ ] Git push → Vercel deploy → prod smoke
