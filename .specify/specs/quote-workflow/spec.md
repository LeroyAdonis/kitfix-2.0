# Spec — Quote Override & Customer Quote Confirmation

**Date:** 2026-08-02
**Status:** Approved
**Feature:** Admin can override the AI-suggested quote; customers see the price as an "estimate" and confirm it once they're happy.

## Problem

1. **Admin cannot adjust the quote.** Jobs get `quote` = AI `suggestedPrice` at creation. The `updateQuote` mutation exists in `convex/jobs.ts` but no admin UI calls it. If the AI under/over-prices (or the customer's description doesn't match the photo), the admin is stuck with the AI number.
2. **Customers see "Quote" as final.** My Repairs labels the price "Quote" with no way to accept or push back. In reality the AI price is an *estimate* until the admin reviews it — and the customer should explicitly confirm before work starts.

## Goals

- Admin can override any job's quote (set a custom R amount) from the job detail page.
- Customer-facing copy says **"Estimate"** until confirmed, then **"Confirmed"**.
- Customer can click **"Confirm quote"** on an estimate (one click, sets `quoteStatus: "confirmed"`).
- Admin override resets `quoteStatus` to `"estimate"` so the customer re-confirms the new number.
- Zero breaking changes to existing jobs (field optional, backfilled "estimate").

## Non-Goals (backlog)

- Payments / deposits on confirm (needs payment provider) → backlog B003.
- Email/SMS notification when admin overrides (needs notification infra).
- Customer "decline / counter-offer" flow (v2 — confirm-only now).
- Quote history/audit trail (adminNotes exists; full history is v2).

## Schema Change (convex/schema.ts)

Add to the `jobs` table:

```ts
// Quote lifecycle: AI sets an estimate at creation; admin may override
// (resets to "estimate"); customer confirms when happy.
quoteStatus: v.optional(
  v.union(v.literal("estimate"), v.literal("confirmed")),
),
```

- Optional + additive → zero migration risk; existing rows just lack the field (treated as `"estimate"` in UI).
- On `create` / `createWebJob`: set `quoteStatus: "estimate"` when a quote is set.

## Convex Functions (convex/jobs.ts)

### Modify `updateQuote` (exists)
- Args unchanged: `{ id, quote }`.
- Behavior: patch `{ quote, quoteStatus: "estimate" }` — an admin override always returns the price to estimate status so the customer re-confirms.

### New `confirmQuote` mutation
```ts
export const confirmQuote = mutation({
  args: { id: v.id("jobs") },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.id);
    if (!job) throw new Error("Job not found");
    if (job.quote == null) throw new Error("No quote to confirm");
    await ctx.db.patch(args.id, { quoteStatus: "confirmed" });
  },
});
```
- No auth gate for now (web jobs are user-linked; admin board is cookie-gated) — consistent with existing mutations. Note in code.

### `create` / `createWebJob`
- Set `quoteStatus: "estimate"` alongside the existing `quote`.

## Admin UI (app/admin/(protected)/jobs/[id]/page.tsx)

In the **Quote panel** (lines ~235-244), add an override control:

- Display current price (existing) + status chip: `ESTIMATE` or `CONFIRMED`.
- **Override form:** a small input (Rands, e.g. "250") + "Update quote" button.
  - Input `type="number"`, `min="0"`, `step="1"`, `placeholder="e.g. 250"`.
  - On submit: `await updateQuote({ id: job._id, quote: Math.round(Number(value) * 100) })` (Rands → cents).
  - Show transient "Quote updated" confirmation (same pattern as notes save).
- Style: match existing panel language — `font-mono text-[10px] uppercase tracking` labels, sharp corners, CSS vars only.
- Status chip colors: ESTIMATE → `text-[var(--color-stitch)] border-[var(--color-stitch)]/40`; CONFIRMED → `text-[#7fb3d5] border-[#7fb3d5]/40`.

## Customer UI (app/my-jobs/page.tsx)

In the quote block (lines ~131-140):

- Label logic:
  - `quoteStatus !== "confirmed"` (incl. undefined): label **"Estimate"**
  - `quoteStatus === "confirmed"`: label **"Confirmed"** (with a small ✓)
- If estimate (and quote != null): render a **"Confirm quote"** button next to the price:
  - Gold outline button (`border border-[var(--color-stitch)] text-[var(--color-stitch)] px-3 py-1.5 font-mono text-xs uppercase tracking-wider hover:bg-[var(--color-stitch)]/10`)
  - On click: `const confirmQuote = useMutation(api.jobs.confirmQuote)` then `await confirmQuote({ id: job._id })`
  - After confirm the row re-renders as "Confirmed ✓" (Convex reactive query picks it up automatically).
- No confirm button when already confirmed.

## Verification

1. `CSS_TRANSFORMER_WASM=true npm run build` → exit 0.
2. Convex dev picks up schema change (watch `npx convex dev` output; no type errors).
3. Browser E2E (dev, logged in as test user):
   - Submit a repair → My Repairs shows **"Estimate R150.00"** + Confirm button.
   - Click Confirm → label flips to **"Confirmed ✓"**, button gone.
4. Admin E2E:
   - `/admin/jobs/[id]` shows the quote + ESTIMATE chip + override input.
   - Set 350 → save → price shows R350.00, chip back to ESTIMATE.
   - Customer's My Repairs now shows Estimate R350.00 + Confirm button again.
5. `npx convex deploy` → prod functions updated.
6. Deploy via git push → Vercel; smoke prod routes.

## Risks / Notes

- `quote` stores **cents** (R150.00 = `15000`). Override input is Rands; multiply by 100. The `.toFixed(2)` formatting already assumes cents.
- Admin cookie auth is MVP (presence check only) — acceptable for now, note in AGENTS.md if touched.
- No email notification on override (non-goal).
