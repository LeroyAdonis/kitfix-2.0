# Tasks — Admin History Tab

**Spec:** `.specify/specs/admin-history-tab/spec.md`

## Task 1 — Convex
- [ ] `listArchived` query in `convex/jobs.ts`: archived jobs (filter `j.archivedAt`), sorted archivedAt desc, resolvePhotoUrls

## Task 2 — Admin dashboard
- [ ] `tab` state (board|history), default board
- [ ] Tab bar UI (BOARD | HISTORY)
- [ ] `useQuery(api.jobs.listArchived)` + `useMutation(api.jobs.restoreJob)`
- [ ] History view: loading, empty state, row list (customer, channel, PAID tag, description, quote, archived date, ARCHIVED tag), Restore button with preventDefault/stopPropagation, rows link to detail
- [ ] Kanban grid wrapped in `tab === "board"` condition (untouched otherwise)

## Task 3 — Verification
- [ ] Build exit 0; convex typecheck clean
- [ ] Dev E2E: archive → history shows row → Restore → back on board; empty state
- [ ] `npx convex deploy` prod; Vercel push; prod smoke
