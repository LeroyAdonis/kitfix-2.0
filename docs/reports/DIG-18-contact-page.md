# DIG-18 — /contact page

**Status:** implemented and committed locally (`1516ec9`), not pushed. This heartbeat was a
workspace-verification run with no source issue, so Paperclip refused every issue write
(`cross_issue_influence_run_context_required`) and this report could not be posted as a comment.
The next issue-bound wake should paste it onto DIG-18 and close the ticket.

`/contact` is built, prerendering as static, and the footer now points at it.

## What changed

- **`app/contact/page.tsx`** (new) — workshop address (every line), email, phone, WhatsApp, the door-to-door courier line, company details, and links to `/refund-policy` and `/terms`. Every value is read from `lib/business.ts`.
- **`components/sections/SiteFooter.tsx`** — the `Contact` column link is now `/contact` instead of `mailto:info@mykitfix.co.za` (which also removes the last hardcoded email literal in that file).

Committed locally as `1516ec9`. Not pushed, not merged, no Vercel command run.

---

INTENT
Publish a reachable contact page so Paystack's activation review (ticket 1416876) can see a real address, phone and email on the site, with the cancellation/refund and terms links a reviewer hunts for — and make `lib/business.ts` the only place those details live, so the owner fills one file and the whole site becomes correct.

ACCEPTANCE
- `/contact` prerenders as static in `npm run build` — **met** (`○ /contact`).
- No literal phone number, address or email in the new file — **met**, grep below.
- `npx tsc --noEmit` clean — **met** (exit 0).

DECISIONS
- **Chose `lib/business.ts` for every value over typing details into the page**, because a hardcoded number is exactly how `060 000 0000` reached production before; one file means one place to fix.
- **Chose the 1px dashed stitch gradient over the 6px `StitchRule` component** for the divider, because `/refund-policy` and `/terms` both use the 1px version and the three info pages should read as one family; `StitchRule` stays the landing-page section divider.
- **Chose a `<dl>` for company details and an `<address>` element for the workshop**, over plain `<p>`s, because it is a real postal address and screen readers announce it correctly.
- **Chose to fix only the footer `Contact` link over also adding `/contact` to the header nav**, because the header nav is anchor links to landing-page sections and rewiring it is a separate design call for you.
- **Committed locally, did not push**, per your standing rule on this ticket.

REJECTED
- Hardcoding the phone, WhatsApp, email or address in the page — recreates the placeholder-to-production path this ticket exists to close.
- A Google Maps embed or shop hours — no verified data; inventing either is the failure mode the owner has already been burned by.
- Leaving the footer as a `mailto:` — the ticket asks for a real page, and a mail client is not reachable for everyone.

OPEN CALLS
1. **`components/Header.tsx:16` still hardcodes `const WHATSAPP_URL = "https://wa.me/27721234567"`** — the placeholder number `lib/business.ts` explicitly warns about. The header CTA therefore still points at a dead number while the footer points at `BUSINESS.whatsapp`. Out of scope here; wants its own ticket. I did not touch it to avoid colliding with the header work in flight.
2. **`lib/business.ts` is still `TODO-`**, so `/contact` currently renders `TODO-PHONE`, `TODO-STREET` and `wa.me/TODO-WHATSAPP` live. The page needs no change when the owner supplies details — it becomes correct automatically.
3. No sitemap or service-worker precache list exists in the repo, so there was no route list to add `/contact` to. Say the word if you want a `sitemap.ts`.

EVIDENCE

```
$ npx tsc --noEmit
tsc exit: 0

$ grep -nE '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}' app/contact/page.tsx
  -> exit 1 (no email literal)
$ grep -nE '\+27|0[0-9]{2}[ -][0-9]{3}[ -][0-9]{4}|[0-9]{3}[ -][0-9]{3}[ -][0-9]{4}' app/contact/page.tsx
  -> exit 1 (no phone literal)
$ grep -nE 'wa\.me/[0-9]' app/contact/page.tsx
  -> exit 1 (no hardcoded WhatsApp number)
$ grep -n 'TODO-' app/contact/page.tsx
  -> exit 1 (no placeholder typed into the page)

$ grep -nE 'BUSINESS\.|businessAddressLines\(\)' app/contact/page.tsx
25:const WHATSAPP_URL = `https://wa.me/${BUSINESS.whatsapp}`;
33:    value: BUSINESS.phone,
34:    href: `tel:${BUSINESS.phoneE164}`,
49:    value: BUSINESS.email,
50:    href: `mailto:${BUSINESS.email}`,
64:          Contact · {BUSINESS.name}
136:              {businessAddressLines().map((line) => (
160:            <dd className="text-[var(--color-thread)]">{BUSINESS.legalName}</dd>
164:            <dd className="text-[var(--color-thread)]">{BUSINESS.registration}</dd>
```

```
$ npm run build
✓ Compiled successfully in 6.2s
  Finished TypeScript in 14.8s
✓ Generating static pages using 5 workers (24/24) in 1052ms
...
├ ○ /contact            <-- Static, prerendered
├ ○ /refund-policy
├ ○ /terms
○  (Static)   prerendered as static content
```

Prerendered HTML actually carries the values through:

```
$ grep -o 'href="tel:[^"]*"' .next/server/app/contact.html
href="tel:TODO-PHONE-E164"
$ grep -o 'href="mailto:[^"]*"' .next/server/app/contact.html
href="mailto:info@mykitfix.co.za"
$ grep -o 'href="https://wa\.me/[^"]*"' .next/server/app/contact.html
href="https://wa.me/TODO-WHATSAPP"
$ grep -o 'href="/contact"[^>]*>[^<]*' .next/server/app/index.html
href="/contact">Contact
```

```
$ npx eslint app/contact/page.tsx components/sections/SiteFooter.tsx
eslint exit: 0

$ npm test
Test Files  1 failed | 2 passed (3)
     Tests  1 failed | 15 passed (16)
  7 value(s) must be replaced with the real registered details:
```
(the 1 failure is the intended `lib/business.ts` placeholder guard from DIG-17 — it is what keeps the `TODO-` values visible rather than forgotten.)

ACCEPTED RISK
- **The page publishes `TODO-` values and nothing technically stops it deploying.** Prerendering correctly means those placeholders are now live-looking HTML. `tests/business-placeholders.test.ts` fails loudly, but a failing test only blocks a deploy if CI runs it — Vercel's build does not run `npm test`. If `/contact` ships before `lib/business.ts` is filled, a Paystack reviewer sees "TODO-PHONE" and "TODO-STREET". Following the standing rule (no push) is what actually prevents that today.
- The header nav anchors (`#services`, `#pricing`, …) resolve to nothing on `/contact`, identically to `/refund-policy` and `/terms`. Left as-is for consistency rather than fixed in one page only.
