# Plan — Admin History Tab

**Spec:** `.specify/specs/admin-history-tab/spec.md`
**Date:** 2026-08-02

## Order of work

1. **Convex** — `listArchived` query (archived jobs, archivedAt desc, resolvePhotoUrls).
2. **Admin UI** — BOARD/HISTORY tab bar + history list view + Restore per row (in `app/admin/admin-dashboard.tsx`).
3. **Verify** — build, typecheck, dev E2E (archive → history shows → restore → back on board), convex deploy, Vercel push.

## File map

| File | Change |
|---|---|
| `convex/jobs.ts` | + listArchived query |
| `app/admin/admin-dashboard.tsx` | + tab state, tab bar, history view, restoreJob mutation |

## Key decisions

- **Two-tab view** (`board` | `history`), default board — no new route.
- **Restore from history row** — one-click, preventDefault/stopPropagation inside the Link row.
- **Row links to existing job detail** — which already renders archived jobs + Restore.
- **archivedAt desc** ordering (most recently archived first).
- Empty state + responsive stacking.

## Delegation

Implementation → OpenCode agent (single agent). Assistant: build/typecheck verify, browser E2E, commit, convex deploy, push.
