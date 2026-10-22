# DIG-17 — test harness + money-path coverage

**Status:** implemented and committed (`08eb638`, `df9cc21`). Control-plane close pending: the
heartbeat run that did this work had no source issue, so Paperclip refused every issue write
(`cross_issue_influence_run_context_required`). The next issue-bound wake should close DIG-17
and paste this file as the evidence comment.

## What was built

| Path | Purpose |
|---|---|
| `vitest.config.ts` | vitest, `@/*` → project root (flat layout, no `src/`) |
| `tests/payments-webhook.test.ts` | Paystack webhook HMAC-SHA512 enforcement (7 tests) |
| `tests/payments-initialize.test.ts` | confirmed-quote guard, so an estimate can never be charged (7 tests) |
| `tests/business-placeholders.test.ts` | placeholder guard on `lib/business.ts` (2 tests, 1 fails by design) |

`npm test` → `vitest run`; `npm test:watch` → `vitest`. Everything runs with no network and no
credentials: Convex and Paystack are both reached through global `fetch`, stubbed per-test with
`vi.stubGlobal("fetch", …)`.

## Result at the time of writing

```
Test Files  1 failed | 2 passed (3)
     Tests  1 failed | 15 passed (16)
```

The single failure is the placeholder guard, by design. It names the fields the owner still owes:

```
⛔ BUSINESS DETAILS ARE STILL PLACEHOLDERS — the site cannot be deployed like this.
7 value(s) must be replaced with the real registered details:
  • phone — is a TODO- placeholder (currently: "TODO-PHONE")
  • phoneE164 — is a TODO- placeholder (currently: "TODO-PHONE-E164")
  • whatsapp — is a TODO- placeholder (currently: "TODO-WHATSAPP")
  • address.street — is a TODO- placeholder (currently: "TODO-STREET")
  • address.suburb — is a TODO- placeholder (currently: "TODO-SUBURB")
  • address.city — is a TODO- placeholder (currently: "TODO-CITY")
  • address.postalCode — is a TODO- placeholder (currently: "TODO-POSTAL")
```

It also flags the invented legacy values (`060 000 0000`, `wa.me/27721234567`) and checks E.164 /
WhatsApp formatting, so restoring the old placeholder text cannot pass either. The guard goes green
with no test change once `lib/business.ts` holds real values.

## Evidence — the tests bite

**(a) Webhook, signature check removed from `app/api/payments/webhook/route.ts`:**

```
× rejects a tampered body and never marks the job paid
× rejects a body signed with the wrong secret
× rejects a request with no signature header
AssertionError: expected 200 to be 401
Tests  3 failed | 4 passed (7)
```

Restored → `Tests  7 passed (7)`, with `sha256sum -c` OK and `git diff` empty for that file.

**(b) Initialize, `quoteStatus !== "confirmed"` guard disabled:**

```
× refuses an estimate: no Paystack checkout is created
× refuses a job with no quoteStatus at all
AssertionError: expected 200 to be 400
Tests  2 failed | 5 passed (7)
```

Restored → hash OK, `git diff` empty.

Both guards also have positive controls so they cannot pass by rejecting everything: a correctly
signed `charge.success` must fire `jobs:markPaid` exactly once with the payload's `jobId` and
`reference`, and a confirmed quote must still produce a checkout and persist the reference.

## Acceptance

- `npm test` — 15 pass; only the placeholder guard fails, naming the missing fields
- `npx tsc --noEmit` — clean
- `npx eslint tests vitest.config.ts` — clean
- No production behaviour changed (`app/`, `convex/`, `lib/`, `components/` untouched)

## Environment traps (also recorded in AGENTS.md)

1. This agent environment exports `NODE_ENV=production`, so npm defaults to `omit=dev` and installs
   **no** `vitest`, `typescript` or `eslint` — `npm test` fails with "command not found". Use
   `npm install --include=dev`.
2. `.npmrc` sets `legacy-peer-deps=true`, so vitest's **required** peer `vite` is never
   auto-installed; `vitest run` dies with `Cannot find package 'vite'`. `vite` is therefore an
   explicit devDependency.
