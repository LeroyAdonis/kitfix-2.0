# Plan — Paystack Payment on Quote Confirmation (B008)

**Spec:** `.specify/specs/paystack-payments/spec.md`
**Date:** 2026-08-02

## Order of work

1. **Schema** — add `paymentStatus`, `paymentReference`, `paidAt` (optional, additive).
2. **Convex** — `markPaid` (idempotent), `getByPaymentReference`; `confirmQuote` sets `paymentStatus: "unpaid"`.
3. **API routes** — `initialize` (creates Paystack txn), `webhook` (HMAC verify → markPaid), `verify` (success page helper).
4. **Pages** — `/pay/complete` success/processing page.
5. **Customer UI** — "Pay now" button in My Repairs when confirmed + unpaid; "Paid ✓" when paid.
6. **Admin UI** — PAID badge on board + detail chip.
7. **Verify** — build, typecheck, dev E2E (needs test keys), convex deploy, Vercel push.

## File map

| File | Change |
|---|---|
| `convex/schema.ts` | + paymentStatus, paymentReference, paidAt |
| `convex/jobs.ts` | + markPaid, getByPaymentReference; confirmQuote sets unpaid |
| `app/api/payments/initialize/route.ts` | NEW — Paystack initialize |
| `app/api/payments/webhook/route.ts` | NEW — HMAC verify + markPaid |
| `app/api/payments/verify/route.ts` | NEW — status helper |
| `app/pay/complete/page.tsx` | NEW — success/processing |
| `app/my-jobs/page.tsx` | Pay now button / Paid ✓ |
| `app/admin/page.tsx` | PAID badge on cards |
| `app/admin/(protected)/jobs/[id]/page.tsx` | PAID/UNPAID chip |
| `.env.local` | PAYSTACK_SECRET_KEY (test) |

## Key decisions

- **Hosted checkout (redirect)** — no client SDK, simplest, works with server routes.
- **Webhook = source of truth** — success page never marks paid; it only reflects state.
- **Idempotent webhook** — Paystack retries ~48h; re-processing must be a no-op.
- **HMAC verification mandatory** — `x-paystack-signature` = HMAC-SHA512(raw body, secret).
- **Cents already correct** — `quote` is cents; ZAR uses cents; do NOT multiply again.
- **paymentReference set at initialize** — webhook matches metadata.jobId (belt + braces).
- **Test mode first** — `sk_test_...`; live switch = env change only.

## Delegation

Implementation → OpenCode agent (single agent; files are tightly coupled around one flow). Assistant: build/typecheck verify, E2E once test keys arrive, commit, convex deploy, push.
