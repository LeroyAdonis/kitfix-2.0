# Spec — Admin History Tab (view archived repairs)

**Date:** 2026-08-02
**Status:** Approved
**Feature:** A History tab in the admin dashboard showing archived repair jobs — the archive feature (already shipped) hides jobs from the board but currently has no way to view them. This adds the missing view + restore entry point.

## Problem

Admin can archive jobs (soft delete) but there is **no UI to see what's archived** — they just vanish. If an admin archives the wrong job, or wants to review old records, they're stuck. The job detail page can restore a specific job (if you know its URL), but there's no list.

## Context (existing, shipped)

- `jobs.archivedAt: v.optional(v.number())` — epoch ms when archived; absent = active.
- Queries filter archived: `list`, `listByStatus`, `listByUser` all exclude `j.archivedAt`. `get` is unfiltered.
- Mutations: `archiveJob` (two-click confirm in UI), `restoreJob`.
- Admin dashboard: `app/admin/admin-dashboard.tsx` — `AdminDashboard` component, kanban grid (responsive), `useQuery(api.jobs.list)`, `useMutation(api.jobs.create)`.
- Admin job detail: `app/admin/(protected)/jobs/[id]/page.tsx` — Restore button + ARCHIVED chip.
- Design tokens: CSS vars `--color-pitch`, `--color-thread`, `--color-thread-dim`, `--color-stitch`, `--color-pitch-line`; red `#C8402C`; blue `#7fb3d5`; fonts: font-display / font-mono; sharp corners.

## Goals

- Admin dashboard gets a **tab bar**: `BOARD` | `HISTORY` (default BOARD).
- HISTORY tab lists all archived jobs, most-recently-archived first, with:
  - Customer name, channel, description (clamped), quote (R), payment status (PAID/UNPAID), archived date, original status at archive time.
  - A **Restore** button per row (one-click, restores to the board; job returns with its original status).
  - Clicking a row opens the existing job detail page (which already handles archived jobs + Restore).
- History is responsive (stacks on mobile, table-ish on desktop).

## Non-Goals (backlog)

- Hard delete / purge from history (never hard-delete).
- Filter/search/sort controls in history (MVP: one list, newest first).
- Pagination (archive volumes are tiny for a jersey repair shop).
- "Who archived it" audit (no admin identity exists in the system).

## Convex (convex/jobs.ts)

### New `listArchived` query
```ts
export const listArchived = query({
  args: {},
  handler: async (ctx) => {
    const jobs = await ctx.db.query("jobs").order("desc").collect();
    const archived = jobs.filter((j) => j.archivedAt);
    return Promise.all(archived.map((job) => resolvePhotoUrls(ctx, job)));
  },
});
```
- Order by `_creationTime` desc is fine (archivedAt ≈ creation for most); if you prefer archivedAt desc, sort in JS: `archived.sort((a, b) => (b.archivedAt ?? 0) - (a.archivedAt ?? 0))`. Use archivedAt desc — it's what "recently archived" means.

## Admin UI (app/admin/admin-dashboard.tsx)

### Tab bar
- Add `const [tab, setTab] = useState<"board" | "history">("board");`
- Render a tab row above the kanban grid:
```tsx
<div className="flex items-center gap-1 mb-6 border-b border-[var(--color-pitch-line)]/40">
  {(["board", "history"] as const).map((t) => (
    <button
      key={t}
      onClick={() => setTab(t)}
      className={`px-4 py-2 font-mono text-xs uppercase tracking-[0.18em] transition-colors border-b-2 -mb-px ${
        tab === t
          ? "text-[var(--color-stitch)] border-[var(--color-stitch)]"
          : "text-[var(--color-thread-dim)] border-transparent hover:text-[var(--color-thread)]"
      }`}
    >
      {t}
    </button>
  ))}
</div>
```
- When `tab === "board"` → render the existing kanban grid exactly as-is.
- When `tab === "history"` → render the History view (below).

### History view
- `const archivedJobs = useQuery(api.jobs.listArchived);`
- Loading: reuse the "Loading jobs..." pattern (`jobs === undefined` style check; use `archivedJobs === undefined`).
- Empty state: centered `font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-thread-dim)]` — "No archived repairs".
- List: `<div className="space-y-3">` of rows. Each row is a Link to `/admin/jobs/{id}`:
```tsx
<Link key={job._id} href={`/admin/jobs/${job._id}`} className="block border border-[var(--color-pitch-line)]/50 bg-[var(--color-pitch)]/15 p-4 hover:border-[var(--color-stitch)]/50 transition-colors">
  <div className="flex items-start justify-between gap-4 flex-wrap">
    <div>
      <div className="flex items-center gap-2">
        <h3 className="font-display text-sm text-[var(--color-thread)] uppercase tracking-wide">{job.customerName}</h3>
        <span className="font-mono text-[9px] uppercase tracking-widest px-1.5 py-0.5 border text-[var(--color-thread-dim)] border-[var(--color-pitch-line)]/40">{job.customerChannel ?? "whatsapp"}</span>
        {job.paymentStatus === "paid" && <span className="font-mono text-[9px] uppercase tracking-widest px-1.5 py-0.5 border text-[#7fb3d5] border-[#7fb3d5]/40">Paid</span>}
      </div>
      <p className="text-xs text-[var(--color-thread-dim)] line-clamp-2 mt-1">{job.description}</p>
      <div className="flex items-center gap-4 mt-2 font-mono text-[10px] text-[var(--color-thread-dim)] uppercase tracking-[0.14em] flex-wrap">
        {job.quote ? <span className="text-[var(--color-stitch)]">R{(job.quote / 100).toFixed(2)}</span> : <span>No quote</span>}
        <span>Archived {new Date(job.archivedAt ?? Date.now()).toLocaleDateString("en-ZA")}</span>
        <span className="text-[#C8402C]">Archived</span>
      </div>
    </div>
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); restoreJob({ id: job._id }); }}
      className="border border-[var(--color-stitch)] text-[var(--color-stitch)] px-3 py-1.5 font-mono text-xs uppercase tracking-wider hover:bg-[var(--color-stitch)]/10"
    >
      Restore
    </button>
  </div>
</Link>
```
- `const restoreJob = useMutation(api.jobs.restoreJob);` (add next to createJob).
- Note: the row itself is a Link to the detail page; the Restore button must `preventDefault` + `stopPropagation` so clicking it doesn't navigate.
- JobCard type: add `archivedAt?: number` if the JobCard interface needs it (already added in the previous feature — verify).

## Verification

1. `CSS_TRANSFORMER_WASM=true npm run build` → exit 0.
2. `npx convex typecheck` → clean.
3. **Dev E2E:**
   - Board loads with BOARD/HISTORY tabs, BOARD active.
   - Archive a job (from detail page) → switch to HISTORY → job appears with ARCHIVED tag + Restore.
   - Click Restore on the row → job vanishes from history and reappears on the board (switch tabs to confirm).
   - Empty state shows when no archived jobs.
4. `npx convex deploy` → prod functions.
5. Vercel push → prod smoke.

## Risks / Notes

- `restoreJob` already exists — the History tab is mostly UI + `listArchived` query.
- Link + nested button: the Restore button inside a Link needs preventDefault/stopPropagation (spec'd above) — verify in browser.
- Keep the kanban grid untouched — wrap it in the `tab === "board"` condition, don't restyle it.
