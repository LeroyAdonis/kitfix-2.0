# Tasks — Paystack Payment on Quote Confirmation (B008)

**Spec:** `.specify/specs/paystack-payments/spec.md`

## Task 1 — Schema
- [ ] Add `paymentStatus` (unpaid|paid), `paymentReference` (string), `paidAt` (number) — all optional — to `jobs` in `convex/schema.ts`

## Task 2 — Convex functions
- [ ] `markPaid` mutation: idempotent (no-op if already paid w/ same ref), patches paid + reference + paidAt
- [ ] `getByPaymentReference` query
- [ ] `confirmQuote` also patches `paymentStatus: "unpaid"`

## Task 3 — API: initialize
- [ ] `app/api/payments/initialize/route.ts` POST: load job, validate confirmed + unpaid + email, call Paystack initialize (cents, ZAR, callback_url → /pay/complete?job=, metadata.jobId), set paymentReference, return authorization_url

## Task 4 — API: webhook
- [ ] `app/api/payments/webhook/route.ts` POST: verify x-paystack-signature HMAC-SHA512 (raw body), handle charge.success → markPaid, always 200 for handled events, 500 on unexpected

## Task 5 — API: verify
- [ ] `app/api/payments/verify/route.ts` GET: `?job=<id>` → { paid: bool } (optionally Paystack verify call)

## Task 6 — Success page
- [ ] `app/pay/complete/page.tsx`: reads ?job, polls verify, Paid → confirmation + link; Processing → refresh button

## Task 7 — Customer UI
- [ ] `app/my-jobs/page.tsx`: "Pay now" gold button (confirmed + unpaid) → initialize → redirect; "Paid ✓" when paid

## Task 8 — Admin UI
- [ ] `app/admin/page.tsx`: PAID badge on cards
- [ ] Admin job detail: PAID/UNPAID chip in Quote panel

## Task 9 — Verification
- [ ] Build exit 0; convex typecheck clean
- [ ] Dev E2E with test keys: confirm → Pay now → Paystack checkout → test card → webhook → Paid ✓; idempotency check
- [ ] `npx convex deploy` prod; Vercel push; prod smoke
