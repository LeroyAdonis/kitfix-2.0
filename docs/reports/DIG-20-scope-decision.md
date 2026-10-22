# DIG-20 — Scope decision: cut the ecommerce storefront, defer the courier API

**Status:** decided and committed locally, not pushed. The only file changed is
`blueprint/build-plan.md` (plus this report). No application code was touched.

## The decision

| Item | Disposition |
|------|-------------|
| 15. Ecommerce storefront | **CUT** — KitFix repairs kit, it does not sell products. A catalogue + cart is a second business. |
| 16. Storefront UI pages | **CUT** — exists only to serve 15. |
| 14. Courier integration | **DEFERRED** — booked by hand at launch volume. |
| 18. Repair-flow courier | **DEFERRED** — same reason; 18 is the repair-flow shape of 14. |
| 13. Checkout & orders flow | **KEPT** — the webhook loses one field the business needs (see below). |

Reopen trigger for 14/18, recorded in the plan: sustained volume above ~20 live jobs/week, **or** a
handful of jobs/month lost or delayed waiting on a pickup. Until one is measured, they stay deferred.

## What the payment webhook actually persists

Read `app/api/payments/webhook/route.ts` and `convex/jobs.ts` end to end. The webhook reads exactly
two fields off the Paystack payload — `event.data.reference` and `event.data.metadata.jobId` — and
calls `jobs:markPaid` with `{ jobId, reference }`. Everything else in `charge.success` is discarded.

`markPaid` writes three fields on the job:

| Question | Persisted? | Where from |
|----------|-----------|------------|
| Who paid | **yes, indirectly** | the job row itself (`userId` / `customerEmail` / `customerName`), reached via `metadata.jobId` |
| Which Paystack reference | **yes** | `setPaymentReference` at initialize, re-set by `markPaid` |
| When | **yes, approximately** | `paidAt: Date.now()` — Convex server time at webhook receipt, *not* Paystack's `paid_at` |
| **How much** | **NO** | nothing writes an amount. The only amount on the job is `quote`, which is mutable |

That last row is the reason 13 stays alive. The amount actually charged can only be inferred from
`jobs.quote` as it stands *now*, and `updateQuote` (`convex/jobs.ts:200`) patches `quote` and resets
`quoteStatus` to `"estimate"` with **no `paymentStatus` guard** — the only `paymentStatus` reads in
the whole backend are the idempotency check inside `markPaid` and the pre-flight in
`/api/payments/initialize`. So an admin override after payment silently rewrites the record of what
the customer paid. Amount, and Paystack's own `paid_at`, are the two losses.

Two smaller observations, recorded but not acted on:

- The webhook swallows `markPaid` failures (try/catch + `res.ok` logged only) and always returns
  `{received: true}` 200, so a lost write is invisible to Paystack and there is no retry.
- `paidAt` is receipt time, not payment time. Wrong by seconds normally; wrong by hours if the
  webhook is redelivered late after the first attempt failed.

## What I did not do

No schema change, no webhook change, no backfill. The ticket asked for the decision record and one
proven statement about current persistence; the `13` gap is a follow-up, not this ticket's edit.
