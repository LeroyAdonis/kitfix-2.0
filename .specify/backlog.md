# KitFix — Feature Backlog (Out-of-Scope Loop)

**Rule:** Nothing we spec gets left behind. Every out-of-scope item from any spec lands here with a revisit trigger. A release is not "done" until this file is reviewed and its open items are either (a) scheduled into an upcoming release, or (b) explicitly parked with a reason + date.

**Status legend:** `proposed` → `scheduled` → `shipped` | `parked` (reason + date)

---

## Open Items

### B001 — OAuth / Google sign-in
- **Source:** customer-portal spec (out of scope)
- **Status:** proposed
- **Revisit trigger:** When web submissions account for >20% of new jobs, or when a customer asks for it
- **Effort estimate:** Medium (Better Auth supports it; needs Google OAuth client + env vars)
- **Notes:** Email/password MVP ships first; OAuth reduces sign-up friction later

### B002 — Email verification + password reset
- **Source:** customer-portal spec (out of scope)
- **Status:** proposed
- **Revisit trigger:** When >5% of sign-ups fail due to typo'd emails, or first "I forgot my password" support request
- **Effort estimate:** Medium (needs email provider — Resend/Postmark)
- **Notes:** requireEmailVerification is off for MVP to keep friction low

### B003 — Customer payment / checkout
- **Source:** customer-portal spec (out of scope)
- **Status:** proposed
- **Revisit trigger:** When the repair shop wants to take deposits or prepay — business decision, not technical
- **Effort estimate:** High (payment provider integration + order flow)
- **Notes:** Quote → pay → ship flow would be a full feature spec

### B004 — Customer status timeline UI (rich tracking)
- **Source:** customer-portal spec (basic tracking ships now)
- **Status:** proposed
- **Revisit trigger:** After basic tracking ships and customers use it for 2 weeks — add timeline/milestones then
- **Effort estimate:** Low-Medium (UI-only, statuses already exist)
- **Notes:** Basic status visibility ships in the portal MVP; this is the visual timeline upgrade

### B005 — Public quotes without an account
- **Source:** customer-portal spec (out of scope)
- **Status:** proposed
- **Revisit trigger:** When WhatsApp volume suggests customers want a quick estimate before committing to an account
- **Effort estimate:** Medium (AI analysis is already built; needs anonymous session handling)
- **Notes:** Would let visitors get an instant AI quote before sign-up

### B006 — Multi-language support
- **Source:** customer-portal spec (out of scope)
- **Status:** proposed
- **Revisit trigger:** When a meaningful share of customers are Afrikaans/Zulu/Xhosa speakers (ask in onboarding or via support)
- **Effort estimate:** Medium (i18n framework + translation pass)
- **Notes:** SA context — likely worth it eventually

### B007 — Telegram customer channel
- **Source:** customer-portal spec (out of scope)
- **Status:** parked (2026-08-02) — Telegram is admin-only today; customer channel depends on WhatsApp Business API walkthrough with George (see REMINDER)
- **Revisit trigger:** After ILALI Phase 1 WhatsApp Business API guide is done with George — the same infra can serve KitFix
- **Effort estimate:** Medium-High

---

## Review Log

| Date | Reviewed by | Result |
|------|-------------|--------|
| 2026-08-02 | Ricky (pipeline) | Backlog created from customer-portal spec. B001-B007 captured. No items lost. |

---

## How to Use (for agents)

1. When writing a spec, copy every "Out of Scope" line into this file with a revisit trigger.
2. At the END of every gold-release-pipeline run, review this file (see pipeline "Backlog Sweep" phase).
3. Never delete an item — park it with a reason + date if it's not being scheduled.
4. A feature is "done" when its spec items are shipped AND the backlog review is complete.
