# Spec — Admin Archive/Delete Repair Jobs

**Date:** 2026-08-02
**Status:** Approved
**Feature:** Admin can safely archive a repair job — removes it from active views without destroying the record (keeps payment history + audit trail). Archived jobs are hidden from the admin board and customer My Repairs.

## Problem

Admin has no way to remove a job (e.g. spam submissions, duplicates, test jobs, customers who never follow through). Hard-deleting is risky: jobs carry payment status, quote history, photo refs, customer contact. We archive instead — soft delete with full data preservation.

## Context (existing)

- `jobs` table: `status` (new/in_repair/ready/done), `quote`, `quoteStatus`, `paymentStatus`, `paymentReference`, photos, `aiAnalysis`.
- Queries: `list` (admin board, all jobs desc), `listByStatus` (board grouping), `get` (detail), `listByUser` (customer My Repairs, by userId).
- Admin board: `app/admin/admin-dashboard.tsx` — `useQuery(api.jobs.list)`.
- Admin job detail: `app/admin/(protected)/jobs/[id]/page.tsx` — has status/notes/quote/confirm controls.
- Convex mutations in `convex/jobs.ts`.

## Goals

- Admin can **archive** a job from the job detail page (primary) and optionally from the board card.
- Archived jobs:
  - Hidden from admin board (`list`, `listByStatus`).
  - Hidden from customer My Repairs (`listByUser`).
  - Still retrievable via `get` (detail page + APIs) — never hard-deleted.
- Admin can **restore** an archived job (undo).
- Archive is safe: requires no confirmation modal for MVP but the button is clearly destructive-styled (red/dim) with a confirm step (click once → "Confirm archive?" → click again to execute, or a small inline confirm). Choose the inline two-click pattern.
- Archived state is visible on the job detail page (chip "ARCHIVED").

## Non-Goals (backlog)

- Hard delete / purge (we never hard-delete; if needed later, add `purgeJob` with admin-password gate).
- Batch archive / bulk actions.
- Archive history / audit log table (archivedAt timestamp is enough for MVP).
- Customer-facing restore (admin only).

## Schema Change (convex/schema.ts)

Add to `jobs` (all optional, additive — zero migration risk):

```ts
archivedAt: v.optional(v.number()),  // epoch ms when archived; absent = active
```

Use `archivedAt` (timestamp) rather than a boolean — gives us "when" for free and reads naturally (`job.archivedAt ? "archived" : "active"`).

## Convex Functions (convex/jobs.ts)

### New `archiveJob` mutation
```ts
export const archiveJob = mutation({
  args: { id: v.id("jobs") },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.id);
    if (!job) throw new Error("Job not found");
    await ctx.db.patch(args.id, { archivedAt: Date.now() });
  },
});
```

### New `restoreJob` mutation
```ts
export const restoreJob = mutation({
  args: { id: v.id("jobs") },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.id);
    if (!job) throw new Error("Job not found");
    await ctx.db.patch(args.id, { archivedAt: undefined });
  },
});
```

### Modify queries to exclude archived
- `list` (admin board): after collect, `.filter((j) => !j.archivedAt)` OR add to the query filter. Cleanest: filter in JS after collect: `const active = jobs.filter((j) => !j.archivedAt);`
- `listByStatus` (board grouping): same filter.
- `listByUser` (customer My Repairs): same filter — customers should not see archived jobs.
- `get` (detail): NO filter — must return archived jobs so the detail page can show the ARCHIVED chip + Restore button.

## Admin UI

### Job detail page (`app/admin/(protected)/jobs/[id]/page.tsx`)
- Add `archiveJob` + `restoreJob` mutations.
- Near the top controls (status area), add an archive/restore control:
  - If `job.archivedAt` is falsy → **Archive** button (destructive style: `border border-[#C8402C] text-[#C8402C] hover:bg-[#C8402C]/10 font-mono text-xs uppercase tracking-wider px-3 py-1.5`), two-click confirm: first click shows "Confirm archive?" (same button, stronger), second click executes `archiveJob`. Reset after 3s or on blur.
  - If `job.archivedAt` is set → **Restore** button (gold: `border border-[var(--color-stitch)] text-[var(--color-stitch)] hover:bg-[var(--color-stitch)]/10`), single click executes `restoreJob`. Plus an **ARCHIVED** chip (dim red: `text-[#C8402C] border-[#C8402C]/40 font-mono text-[10px] uppercase px-2 py-0.5 border`) near the status chip.
- Add `archivedAt` to the job type in the page's type/interface if it's typed.

### Admin board (`app/admin/admin-dashboard.tsx`)
- Optional but nice: if the card has `job.archivedAt`, render a tiny "ARCHIVED" tag. (The board query already filters them out, so this only matters if `list` is ever unfiltered — include the tag defensively but keep it subtle.)
- NO archive button on the card for MVP (detail page is the archive home). Keeps the card clean.

## Customer UI

- `listByUser` filter means archived jobs simply vanish from My Repairs — no UI change needed. Do NOT show "archived" to customers.

## Verification

1. `CSS_TRANSFORMER_WASM=true npm run build` → exit 0.
2. `npx convex typecheck` → clean.
3. **Dev E2E:**
   - Create a job → appears on admin board.
   - Archive it from detail (two-click confirm) → board count drops, job gone from board.
   - Detail page still loads (get unfiltered) → shows ARCHIVED chip + Restore.
   - Restore → appears on board again.
   - Customer My Repairs (listByUser): archived job hidden, restored job visible.
4. `npx convex deploy` → prod functions.
5. Vercel push → prod smoke.

## Risks / Notes

- `get` MUST stay unfiltered — the detail page needs archived jobs to render Restore. The board/customer queries do the filtering.
- `archivedAt: undefined` in restore — Convex patch with `undefined` removes the field (verify this works; if the type complains, use a nullable `v.optional(v.number())` and patch to `null` instead, then check `!job.archivedAt` still works).
- The two-click confirm is the safety net — an accidental single click never archives.
- Customer payments already recorded remain in DB forever (audit trail preserved).
