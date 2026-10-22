# DIG-22 — Persist the amount actually charged on payment

**Status:** done, committed on `main` (not pushed — origin/main auto-deploys and
`lib/business.ts` still holds TODO- placeholders).

## What was wrong

`app/api/payments/webhook/route.ts` read only `event.data.reference` and
`event.data.metadata.jobId` from `charge.success` and called
`jobs:markPaid({ jobId, reference })`. The amount Paystack actually charged was
thrown away, so the only amount we held was the *quote* — an assumption that the
charge equalled the quote, not a record of it.

## Schema diff (additive only — existing rows untouched)

```diff
--- a/convex/schema.ts
+++ b/convex/schema.ts
@@ -50,6 +50,12 @@ export default defineSchema({
       v.union(v.literal("unpaid"), v.literal("paid")),
     ),
     paymentReference: v.optional(v.string()),
+    // What Paystack actually charged — our own record, not an assumption from
+    // the quote. Minor units (cents), straight from charge.success data.amount.
+    // Optional + additive: rows paid before this field existed stay valid.
+    paymentAmount: v.optional(v.number()),
+    // ISO currency code from charge.success data.currency (e.g. "ZAR").
+    paymentCurrency: v.optional(v.string()),
     paidAt: v.optional(v.number()),
     status: v.union(
```

Both fields are optional, so no backfill and no rewrite of existing jobs is needed.

## Changes

| File | Change |
|------|--------|
| `convex/schema.ts` | `paymentAmount` (minor units / cents) + `paymentCurrency` (optional) |
| `convex/jobs.ts` | `markPaid` accepts optional `amount` + `currency`; rejects a non-integer or negative amount; idempotent on `(jobId, reference)` — a retry never double-writes and never rewrites a recorded amount, it only backfills amount/currency if they are missing; currency normalised to upper case |
| `app/api/payments/webhook/route.ts` | Passes `event.data.amount` when it is a non-negative integer and `event.data.currency` (normalised) into `jobs:markPaid`. Drops malformed values rather than persisting garbage; omits the keys entirely when absent, so the old argument shape is unchanged |
| `app/api/payments/verify/route.ts` | Same record on the `/pay/complete` path: carries `data.amount` / `data.currency` from the Paystack verify response into `jobs:markPaid` (previously the verify path left the amount unrecorded) |
| `tests/payments-webhook.test.ts` | 8 new tests (7 new cases + retry/consistency), see below |

## Passing assertion that reads the persisted amount back

The money-path tests drive the real `jobs:markPaid` handler against an in-memory
job row (fake Convex `ctx`), so they assert what lands on the row instead of only
the outbound HTTP shape.

```
stderr | ... > rejects a correctly signed body that is not valid JSON
webhook: invalid json SyntaxError: Unexpected token 'o', "not-json" is not valid JSON
    at POST (/root/kitfix-2.0/app/api/payments/webhook/route.ts:31:18)

 ✓ ... > accepts a correctly signed charge.success and runs jobs:markPaid
 ✓ ... > rejects a tampered body and never marks the job paid
 ✓ ... > rejects a body signed with the wrong secret
 ✓ ... > rejects a request with no signature header
 ✓ ... > does not mark a job paid for a correctly signed non-charge event
 ✓ ... > refuses everything when PAYSTACK_SECRET_KEY is unset
 ✓ ... > rejects a correctly signed body that is not valid JSON
 ✓ ... > forwards the charged amount (minor units) and currency from a signed charge.success
 ✓ ... > persists the charged amount on the job row via jobs:markPaid
 ✓ ... > a retried duplicate charge.success leaves a single consistent record
 ✓ ... > a duplicate carrying a different amount never rewrites the recorded charge
 ✓ ... > omits amount/currency when the payload does not carry them (older/verify path)
 ✓ ... > ignores a malformed amount instead of persisting garbage
 ✓ ... > rejects a negative or fractional amount at the mutation boundary
 ✓ ... > rejection paths still never mark a job paid, amount present or not

 Test Files  1 passed (1)
      Tests  15 passed (15)
```

The read-back assertion (`persists the charged amount on the job row via jobs:markPaid`):

```ts
await webhook(webhookRequest(chargeSuccessWithAmount({ amount: 25000, currency: "ZAR" })));
const [args] = markPaidArgs();
const { ctx, row, patches } = fakeCtx({ _id: args.jobId });

await markPaidHandler(ctx, args);

expect(patches).toHaveLength(1);          // exactly one write
expect(row.paymentStatus).toBe("paid");
expect(row.paymentReference).toBe("KF-JOB1234-abc");
expect(row.paymentAmount).toBe(25000);    // ← R250.00, in cents, from Paystack
expect(row.paymentCurrency).toBe("ZAR");
```

## Idempotency

Paystack retries `charge.success`. A retry with the same reference:

- returns `{ ok: true, alreadyPaid: true }`,
- performs **no** second `db.patch` (asserted: `patches` has length 1 after two calls),
- leaves `paidAt` and the recorded `paymentAmount`/`paymentCurrency` untouched —
  a duplicate claiming a different amount (`1 USD` after `25000 ZAR`) cannot
  overwrite the real charge,
- may only backfill amount/currency if the row has none (e.g. a job marked paid by
  an older code path before this field existed).

## Verification

| Check | Result |
|-------|--------|
| `npm test` | `Test Files 1 failed | 2 passed (3)` — only `tests/business-placeholders.test.ts`, the pre-existing by-design placeholder guard (7 missing fields in `lib/business.ts`). All 23 other tests pass. |
| `npx tsc --noEmit` | clean (exit 0) |
| `npx eslint` on the 5 touched files | clean |
| `git push` | **not run** — standing rule: commit, never push |

## Not done (deliberately out of scope)

- No admin UI surfacing of `paymentAmount` yet (the data is now there for the job
  detail page / dispute replies).
- `app/api/payments/initialize/route.ts` still sends `amount: job.quote` to Paystack;
  Paystack expects minor units, so a R250 quote is sent as 250 (R2.50) unless the
  quote is already stored in cents. Separate bug — worth its own issue.
