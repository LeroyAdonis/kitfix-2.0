# B011 — Quote History / Audit Trail

**Status:** Scheduled (2026-08-09 release `20260809-inner-design-backlog`)
**Source:** `.specify/backlog.md` B011

## Problem

Every admin quote override overwrites `jobs.quote` with no record of previous values. The shop can't see how estimates changed over time, and disputes ("you quoted R150, now it's R250") are impossible to resolve from the system.

## Acceptance Criteria

1. Every quote change appends an entry to a `quoteHistory` array on the job: `{ quote (cents), status ("estimate"|"confirmed"), at (epoch ms) }`.
2. Initial AI estimate (on job creation with aiAnalysis) records an entry.
3. Admin override (`updateQuote`) appends the **new** value with status `estimate`.
4. `confirmQuote` appends the confirmed value with status `confirmed`.
5. Admin job detail page shows the history as a simple list (oldest → newest) with Rands formatting, timestamp, and status chip.
6. Existing jobs without `quoteHistory` render an empty state ("No quote changes yet") — no migration needed.

## Out of Scope (→ backlog)

- Customer-facing quote history (B004 timeline covers customer view separately)
- Who made the change (admin identity — cookie auth has no user record; note in backlog if needed)

## Implementation Notes

- Schema: add `quoteHistory: v.optional(v.array(v.object({ quote: v.number(), status: v.union(v.literal("estimate"), v.literal("confirmed")), at: v.number() })))` to jobs table.
- `updateQuote`: read job, append `{ quote: args.quote, status: "estimate", at: Date.now() }` to existing history, patch both `quote` and `quoteHistory`.
- `confirmQuote`: append `{ quote: job.quote, status: "confirmed", at: Date.now() }`.
- `createWebJob` / `create`: if aiAnalysis?.suggestedPrice present, seed `quoteHistory` with `[{ quote: suggestedPrice, status: "estimate", at: Date.now() }]`.
- Admin UI: `/admin/jobs/[id]` — new "Quote History" panel below the quote override form.
- Convex schema change → `npx drizzle`-equivalent: `npx convex dev` syncs dev; `npx convex deploy` for prod. No DB migration (Convex is schemaless document store — push just validates).
