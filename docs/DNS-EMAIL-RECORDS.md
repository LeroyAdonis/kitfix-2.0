# mykitfix.co.za — email DNS records (status)

Last checked **17 September 2026** by Ricky. Zone is hosted at **Domains.co.za**
(nameservers `ns1.tld-ns.net`, `ns2.tld-ns.com`, `ns3.tld-ns.net`, `ns4.tld-ns.com`) —
**not** Vercel DNS. Every record below was verified from the server with `dig` / SMTP probes,
not from the registrar panel.

## Status: complete ✅

| Record | Status | Value |
|---|---|---|
| MX | ✅ live | `10 mx.zoho.com` |
| SPF (TXT @) | ✅ live, exactly one record | `v=spf1 include:zoho.com ~all` |
| Zoho domain verification | ✅ live | `zoho-verification=zb70040433.zmverify.zoho.com` |
| **DKIM** | ✅ live | selector **`kitfix`** → `kitfix._domainkey.mykitfix.co.za`, `v=DKIM1; k=rsa; p=…` |
| **DMARC** | ✅ live, exactly one record | `v=DMARC1; p=none; rua=mailto:leroy.adonis@mykitfix.co.za; fo=1` |
| A (apex) | ✅ live | `76.76.21.21` (Vercel) |

All three authentication mechanisms are now present and aligned: mail from `mykitfix.co.za`
authenticates on SPF and DKIM, and DMARC is in monitoring mode.

**Correction to an earlier note in this file:** an initial audit reported DKIM as missing. That
was wrong — it queried only the conventional selectors (`zmail`, `zoho`, `default`, `mail`) and
never queried `kitfix`, the selector actually in use. The record exists and is valid. Lesson for
future audits: enumerate selectors from the sending provider, or query the provider's own panel —
never infer absence of DKIM from the handful of common selector names.

### DKIM key size
The published key is **RSA 1024-bit** (`openssl rsa -pubin -inform DER` → `Public-Key: (1024 bit)`).
That passes DKIM validation at every major provider today (Google and Microsoft both accept
≥1024), so this is **not** a live problem. 2048-bit is the modern recommendation and is what
larger senders publish; Zoho's free tier issues 1024-bit keys. Revisit only if a paid tier is ever
adopted — do not treat this as urgent.

### Mailboxes (verified by SMTP recipient probe against mx.zoho.com)

| Address | Result |
|---|---|
| `leroy.adonis@mykitfix.co.za` | ✅ 250 OK — exists (also the DMARC `rua` target) |
| `info@mykitfix.co.za` | ✅ 250 OK — exists |
| `leroy@mykitfix.co.za` | ❌ 550 user does not exist |
| `george@mykitfix.co.za` | ❌ 550 user does not exist |

`kitfix.co.za` (the old Afrihost domain) publishes **no DNS records at all** — no MX, A or TXT —
so no address on it can receive mail. Never use it customer-facing.

## Still to do

1. **Later: tighten DMARC.** After roughly two weeks of aggregate reports (daily XML attachments
   arriving at `leroy.adonis@mykitfix.co.za`), move to `p=quarantine`, then `p=reject`. Going
   straight to `p=reject` on day one risks blocking legitimate mail that has not been confirmed
   as aligning yet. Bring a report or two to Ricky for a read before tightening.
2. **Live signature test.** Send one message from `leroy.adonis@mykitfix.co.za` to a Gmail
   address and open *Show original* — expect `SPF: PASS`, `DKIM: PASS`, `DMARC: PASS`. The record
   set is verified, but only a real send proves Zoho is signing with this selector in production.
3. **WhatsApp CTA — site is currently pointing at a dead number.** `wa.me/27721234567` is a
   placeholder (confirmed by Leroy), used in nine places:
   `components/Header.tsx`, `components/sections/{SiteFooter,FaqSection,CtaBand,ProcessSection}.tsx`,
   `components/hero/MacrophageHero.tsx` (relume branch), and `app/page.tsx`,
   `components/Header.tsx`, `components/hero/MacrophageHero.tsx` (main). Every "Send photos here"
   link on the live site is dead until a real line is published.
4. **Footer phone number.** Removed as a placeholder on 17 Sept (`app/page.tsx` footer, commit
   `eb06282`). Add the real number — and centralise the number in one place rather than the
   current six duplicated `WHATSAPP_URL` constants, so a future change is one line.
