# Plan — Admin Archive/Delete Repair Jobs

**Spec:** `.specify/specs/archive-jobs/spec.md`
**Date:** 2026-08-02

## Order of work

1. **Schema** — add `archivedAt: v.optional(v.number())` to jobs.
2. **Convex** — `archiveJob` + `restoreJob` mutations; filter `list`, `listByStatus`, `listByUser` to exclude archived; leave `get` unfiltered.
3. **Admin job detail** — Archive button (two-click confirm) / Restore button + ARCHIVED chip.
4. **Admin board** — defensive ARCHIVED tag on card (board already filters).
5. **Verify** — build, typecheck, dev E2E (archive → gone from board; restore → back; customer hidden), convex deploy, Vercel push.

## File map

| File | Change |
|---|---|
| `convex/schema.ts` | + archivedAt |
| `convex/jobs.ts` | + archiveJob, restoreJob; filter list/listByStatus/listByUser |
| `app/admin/(protected)/jobs/[id]/page.tsx` | Archive/Restore + chip |
| `app/admin/admin-dashboard.tsx` | ARCHIVED tag (defensive) |

## Key decisions

- **Archive, never hard-delete** — payment history + audit trail preserved forever.
- **`archivedAt` timestamp** (not boolean) — "when" for free, `!job.archivedAt` reads naturally.
- **`get` stays unfiltered** — detail page must render archived jobs (Restore button).
- **Two-click confirm** on Archive (safety net); single-click Restore.
- **Customer My Repairs hides archived** via listByUser filter — no customer-facing "archived".

## Delegation

Implementation → OpenCode agent (single agent; small, contained change). Assistant: build/typecheck verify, browser E2E, commit, convex deploy, push.
