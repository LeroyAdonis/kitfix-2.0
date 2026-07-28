# Tasks: Design Token & Anti-Slop Cleanup

**Plan:** `.specify/specs/design-token-cleanup/plan.md`
**Spec:** `.specify/specs/design-token-cleanup/spec.md`

## Phase 1: CSS Token Rename
- [ ] T001 [P] Rename tokens in `@theme` block in `app/globals.css` — `--color-text-primary` → `--color-content`, `--color-text-secondary` → `--color-content-secondary`, etc.
- [ ] T002 [P] Rename `--color-border` → `--color-border-default` in globals.css
- [ ] T003 Update raw CSS variable references in `:root` and `[data-theme="light"]` sections of globals.css

## Phase 2: TSX Token Class Rename
- [ ] T004 Rename `text-text-primary` → `text-content`, `text-text-secondary` → `text-content-secondary`, `text-text-tertiary` → `text-content-tertiary` across all `.tsx` and `.ts` files in `app/`
- [ ] T005 Rename `bg-bg-deep` → `bg-surface-deep`, `bg-bg-elevated` → `bg-surface-elevated` across all `.tsx` files
- [ ] T006 Rename `text-text-link` → `text-content-link` across all `.tsx` files
- [ ] T007 Rename `text-text-disabled` → `text-content-disabled` if present

## Phase 3: Payment Page Refactor
- [ ] T008 Replace all raw `text-gray-*` / `bg-gray-*` / `border-gray-*` classes in `app/(customer)/repairs/[id]/payment/page.tsx` with design tokens

## Phase 4: global-error.tsx Cleanup
- [ ] T009 Replace inline hex colors in `app/global-error.tsx` with CSS variable references
- [ ] T010 Remove icon-circle pattern from `app/global-error.tsx`

## Phase 5: Landing Page Fix
- [ ] T011 Replace `bg-[#080808]` with `bg-surface-deep` in `app/page.tsx`

## Phase 6: Touch Targets
- [ ] T012 Find and bump `h-10` buttons/links to `h-11` across all pages

## Verify
- [ ] T013 Run `npm run build` and verify clean build

## Dependencies
- T003 depends on T001, T002 (same file, sequential edits)
- T004-T007 depend on T001 (tokens must exist in CSS first, but since Tailwind generates classes at build time, they can logically run in parallel)
- T008 depends on T001 (needs tokens)
- T009-T011 are independent of each other and the CSS rename
- T012 is independent
- T013 is the final verification step

## Parallel Opportunities
T001, T002 can run together (same file, but we'll batch them).
T004-T007 can be batched as one bulk find-replace across all files.
T008, T009, T011, T012 are all independent.

## Execution Strategy
Use a single OpenCode `run` command with a clear multi-task prompt. OpenCode will handle the file edits autonomously.
