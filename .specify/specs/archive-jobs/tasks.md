# Tasks — Admin Archive/Delete Repair Jobs

**Spec:** `.specify/specs/archive-jobs/spec.md`

## Task 1 — Schema
- [ ] Add `archivedAt: v.optional(v.number())` to jobs in `convex/schema.ts`

## Task 2 — Convex
- [ ] `archiveJob` mutation: patch `archivedAt: Date.now()`
- [ ] `restoreJob` mutation: patch `archivedAt` removed (undefined/null)
- [ ] Filter `list`, `listByStatus`, `listByUser` → exclude `j.archivedAt`
- [ ] `get` stays unfiltered

## Task 3 — Admin job detail
- [ ] Archive button (two-click confirm, destructive red) when not archived
- [ ] Restore button (gold) + ARCHIVED chip when archived
- [ ] `archivedAt` in job type

## Task 4 — Admin board
- [ ] Defensive ARCHIVED tag on card when `job.archivedAt`

## Task 5 — Verification
- [ ] Build exit 0; convex typecheck clean
- [ ] Dev E2E: create → archive (board hides) → detail still loads + Restore → restore (board shows) → customer hidden/visible
- [ ] `npx convex deploy` prod; Vercel push; prod smoke
