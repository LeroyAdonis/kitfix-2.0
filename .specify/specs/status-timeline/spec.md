# B004 — Customer Status Timeline UI

**Status:** Shipped (2026-08-09 release `20260809-inner-design-backlog`)
**Source:** `.specify/backlog.md` B004

## Problem

Customers only see a status chip (NEW / IN REPAIR / READY / DONE). The repair journey ("we received it → working on it → ready") isn't visible, so customers email/WhatsApp for updates.

## Acceptance Criteria

1. Each job card on `/my-jobs` shows a horizontal 4-step progress line: NEW → IN REPAIR → READY → DONE.
2. Steps at or before the current status are filled (using the existing STATUS_META colors); future steps are dimmed.
3. Current step stands out (filled accent + label), sharp square markers (no rounding), connected by a line.
4. Timeline sits between the description and the meta row (compact, mobile-safe).
5. All existing card content (ref, name, status chip, quote/estimate, tier, started, Pay now) unchanged.
6. No logic changes — UI-only.

## Out of Scope (→ backlog)

- Rich milestone timestamps (when each status changed) — needs a statusHistory array; note for future.
- Email/SMS notifications on status change (B009 infra).

## Implementation Notes

- UI-only, in `app/my-jobs/page.tsx`.
- Helper: map status → step index (`new:0, in_repair:1, ready:2, done:3`); render 4 markers + connector line with `bg-[var(--color-pitch-line)]/30` for the line and per-step fill classes.
- Design tokens per DESIGN.md (Repair Sheet).
