# Spec — Paystack Payment on Quote Confirmation (B008)

**Date:** 2026-08-02
**Status:** Approved
**Feature:** After the admin confirms a quote, the customer can pay online via Paystack (hosted checkout). Payment marks the job as paid.

## Problem

The quote workflow ends at "Quote confirmed ✓" — the customer sees a confirmed price but **cannot pay**. Payment happens offline (manual EFT/WhatsApp). This spec wires Paystack so the customer can pay the confirmed quote online, and the job is automatically marked paid.

## Context (existing)

- `jobs.quote` stores **cents** (R150.00 = `15000`).
- `jobs.quoteStatus`: `"estimate"` | `"confirmed"` — admin confirms, customer never clicks.
- `jobs.customerEmail` exists for web jobs (Better Auth user email).
- Convex is the DB; Next.js App Router API routes exist (`/api/analyze`, `/api/concierge`, `/api/auth/[...all]`).
- My Repairs (`app/my-jobs/page.tsx`) shows the confirmed quote.

## Goals

- Customer sees a **"Pay now"** button on a confirmed quote in My Repairs.
- Click → Paystack hosted checkout (redirect flow, no client SDK needed).
- Paystack webhook → job marked **paid** (source of truth).
- Customer returns to a success/status page; job shows **"Paid ✓"** in My Repairs.
- Admin sees a **PAID** badge on the job (board + detail).
- Works in **test mode** first (Paystack test keys, test cards); live switch = env change only.
- Idempotent webhook handling (Paystack retries — no double-marking, no errors).

## Non-Goals (backlog)

- Deposits / partial payment (full-amount only for now).
- Refunds / chargebacks (Paystack dashboard handles manually).
- Subscriptions / recurring.
- Payment history table (paymentStatus + reference on the job is enough for MVP).

## Dependencies

- **Paystack test keys** (Leroy provides): `PAYSTACK_SECRET_KEY` (`sk_test_...`). Sign up free at paystack.com → Settings → API Keys → Test. Test mode works immediately, no KYC.
- Optional `PAYSTACK_PUBLIC_KEY` (`pk_test_...`) — only needed if we later add the inline popup; **not required** for hosted checkout.

## Money & Currency

- Amount sent to Paystack = `quote` (already cents). **Paystack ZAR uses cents** — no conversion needed. `currency: "ZAR"`.
- Fee math (2.9% + R1.50) is Paystack's problem; we always store the full quote as the amount charged. No fee handling in our code.

## Schema Change (convex/schema.ts)

Add to `jobs`:

```ts
paymentStatus: v.optional(
  v.union(v.literal("unpaid"), v.literal("paid")),
),
paymentReference: v.optional(v.string()),  // Paystack txn reference (or verify ref)
paidAt: v.optional(v.number()),            // epoch ms
```

- Additive + optional → zero migration risk; existing rows simply show as unpaid.
- When the admin confirms a quote, ALSO set `paymentStatus: "unpaid"` (in `updateQuote` when quoteStatus → "confirmed", and in `confirmQuote`).

## Convex Functions (convex/jobs.ts)

### Modify `confirmQuote`
- After patching `quoteStatus: "confirmed"`, also patch `paymentStatus: "unpaid"` (a freshly confirmed quote is payable).

### New `markPaid` mutation (called by webhook route — but Convex mutations run client-side too; gate by making the webhook route call it server-side only)
```ts
export const markPaid = mutation({
  args: {
    jobId: v.id("jobs"),
    reference: v.string(),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) throw new Error("Job not found");
    // Idempotent: if already paid with same ref, no-op success
    if (job.paymentStatus === "paid" && job.paymentReference === args.reference) {
      return { ok: true, alreadyPaid: true };
    }
    await ctx.db.patch(args.jobId, {
      paymentStatus: "paid",
      paymentReference: args.reference,
      paidAt: Date.now(),
    });
    return { ok: true, alreadyPaid: false };
  },
});
```
- Idempotency is key: Paystack retries webhooks; re-processing must not error or double-write.

### New `getByPaymentReference` query (optional but useful for the success page)
```ts
export const getByPaymentReference = query({
  args: { reference: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("jobs")
      .filter((q) => q.eq(q.field("paymentReference"), args.reference))
      .first();
  },
});
```

## API Routes (Next.js)

### `app/api/payments/initialize/route.ts` (POST)
- Body: `{ jobId: string }`.
- Load job from Convex (query `jobs.get`). Validate:
  - `job.quoteStatus === "confirmed"` — only confirmed quotes are payable.
  - `job.paymentStatus !== "paid"` — no double-pay.
  - `job.customerEmail` exists (web jobs have it).
- Call Paystack:
```ts
const res = await fetch("https://api.paystack.co/transaction/initialize", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email: job.customerEmail,
    amount: job.quote,                       // cents — correct for ZAR
    currency: "ZAR",
    reference: `KF-${job._id.slice(0, 8).toUpperCase()}-${Date.now().toString(36)}`,
    callback_url: `${process.env.SITE_URL}/pay/complete?job=${job._id}`,
    metadata: { jobId: job._id },
  }),
});
```
- Return `{ authorization_url, reference }` from Paystack's `data`.
- Store the reference on the job (`paymentReference`) BEFORE redirect so the webhook/success page can match it — but keep `paymentStatus: "unpaid"` until the webhook fires.
- Error handling: missing env → 500 "payments not configured"; non-200 from Paystack → 502.

### `app/api/payments/webhook/route.ts` (POST) — Paystack calls this
- **Security (mandatory):** verify `x-paystack-signature` header = HMAC-SHA512 of the raw request body, keyed with `PAYSTACK_SECRET_KEY`. Reject (401) if mismatch.
- Parse `event`:
  - `charge.success`: body has `data.reference` + `data.metadata.jobId`. Call `markPaid({ jobId, reference })`.
  - Other events: return 200 OK (acknowledge, ignore).
- **Always return 200** for handled events (even if the job is already paid — idempotent). Return 500 only on unexpected errors so Paystack retries.
- Use `await req.text()` then `JSON.parse` (NEVER `req.json()` before computing the HMAC — you need the raw body).

### `app/api/payments/verify/route.ts` (GET) — success page helper
- Params: `?job=<jobId>`.
- Look up job; if `paymentStatus === "paid"` return `{ paid: true }`; else optionally call Paystack `GET /transaction/verify/:reference` and return the status. The success page uses this to show "Paid ✓" or "Processing…".

## Pages

### `app/pay/complete/page.tsx` (client)
- Reads `?job=<jobId>` from the URL.
- Calls `/api/payments/verify?job=<jobId>` on mount.
- Paid → "Payment received — your repair is confirmed" + link back to My Repairs.
- Unpaid/processing → "We're confirming your payment…" with a refresh button (webhook usually lands within seconds).
- Style: Repair Sheet tokens, sharp corners, gold accents, font-mono labels.

## Customer UI (app/my-jobs/page.tsx)

In the quote block, after the price:

- If `quoteStatus === "confirmed"` AND `paymentStatus !== "paid"`:
  - Gold **"Pay now"** button → `POST /api/payments/initialize` with `{ jobId }` → `window.location.href = authorization_url` (redirect to Paystack).
  - Show "Pay now" even if `paymentReference` exists (payment initiated but not completed).
- If `paymentStatus === "paid"`:
  - Show **"Paid ✓"** (blue `#7fb3d5`) next to the confirmed quote, no button.
- Else (estimate): no button (existing behavior).

## Admin UI

- **Admin dashboard** (`app/admin/page.tsx`): job cards show a small **PAID** badge (blue) when `paymentStatus === "paid"`.
- **Job detail** (`app/admin/(protected)/jobs/[id]/page.tsx`): in the Quote panel, show `PAID` (blue) or `UNPAID` (dim) chip when the quote is confirmed.

## Env Vars

| Var | Where | Value |
|---|---|---|
| `PAYSTACK_SECRET_KEY` | Vercel prod + `.env.local` (dev) | `sk_test_...` (Leroy provides) |

## Verification

1. `CSS_TRANSFORMER_WASM=true npm run build` → exit 0.
2. Convex typecheck + dev picks up schema.
3. **Dev E2E (needs test keys):**
   - Admin confirms a quote on a web job → My Repairs shows "Pay now".
   - Click → redirects to `paystack.com` hosted checkout (test).
   - Use Paystack test card `4084 0840 8408 4081` (any future expiry, any CVV).
   - Webhook fires → job `paymentStatus: "paid"`, `paymentReference` set.
   - My Repairs shows "Paid ✓"; admin board shows PAID badge.
4. **Idempotency:** resend the same webhook event → still 200, no change.
5. `npx convex deploy` → prod functions.
6. Vercel push → prod smoke (`/api/payments/initialize` without keys → clean 500; with keys → real test).

## Risks / Notes

- **Test keys required before E2E** — implementation can proceed + build-verify without them; E2E waits on Leroy's `sk_test_...`.
- Webhook is the source of truth; the success page only reflects state (never marks paid itself).
- `paymentReference` is set at initialize; webhook matches metadata.jobId (belt + braces).
- Cents: `quote` is already cents; do NOT multiply by 100 again.
- Paystack retries webhooks for ~48h — idempotency is non-negotiable.
