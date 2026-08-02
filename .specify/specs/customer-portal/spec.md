# Feature Spec: Customer Portal — Auth, Photo Upload & AI Damage Analysis

**Date:** 2026-08-02
**Constitution:** .specify/constitution.md
**Status:** Draft (needs clarification)
**Related:** gold-release-pipeline (Feature release — full pipeline)

---

## Vision Statement

KitFix currently only accepts repairs through WhatsApp, and the WhatsApp number is a placeholder. A customer who lands on the site should be able to create an account, describe their damage, upload photos, and get an AI-assisted assessment of what's wrong and roughly what it'll cost — all without leaving the site. The experience should feel like dropping a kit at a pro workshop: show us the damage, we read it, we tell you what it needs and what it costs. The admin board stays the single source of truth for jobs; web-submitted jobs flow into the same board as WhatsApp ones.

---

## User Scenarios

### Scenario 1: The web-first customer
**As a** customer who doesn't want to use WhatsApp
**I want to** create an account and submit a repair request with photos
**So that** I can get a quote and track my repair without messaging anyone

**Acceptance criteria:**
- [ ] Customer can sign up with name + email + password from any page on the site
- [ ] Customer can sign in / sign out
- [ ] Signed-in customer can start a repair request
- [ ] Repair request requires: damage description + at least one photo
- [ ] Submitted request appears on the admin board as a "new" job with the customer's email/name

### Scenario 2: The AI-assisted assessment
**As a** customer uploading a damaged jersey photo
**I want to** get an automatic read on the damage type and a price estimate
**So that** I know immediately whether it's worth repairing

**Acceptance criteria:**
- [ ] After uploading photos, the system analyzes at least the first photo
- [ ] Analysis returns: damage type (tear/hole/stain/fading/logo_damage/seam_split/other), a short description, and a suggested repair tier (Basic/Complex/Full Refresh) mapped to a Rand price
- [ ] AI result is shown to the customer for review BEFORE final submission
- [ ] AI result is stored with the job for the admin to see
- [ ] If AI analysis fails (API down, timeout), the customer can still submit manually with a note

### Scenario 3: The admin
**As a** KitFix admin
**I want to** see web-submitted jobs alongside WhatsApp jobs on the same board
**So that** I don't miss requests from either channel

**Acceptance criteria:**
- [ ] Admin board shows jobs from all channels
- [ ] Job detail shows customer email + channel ("web") for web jobs
- [ ] Job detail shows the AI analysis (damage type, description, suggested tier/price) if present

### Scenario 4: The tracking customer
**As a** customer who submitted via web
**I want to** see my submitted jobs and their current status
**So that** I know if my kit is in repair, ready, or done without calling

**Acceptance criteria:**
- [ ] Signed-in customer can view their own submitted jobs (not others')
- [ ] Each job shows current status (new / in repair / ready / done)
- [ ] Status updates from the admin board reflect for the customer

---

## Functional Requirements

### FR-1: Email/password authentication
- Customer accounts with email + password
- Sign-up, sign-in, sign-out
- Session persists across refreshes (cookie-based)
- Password never stored in plaintext

### FR-2: Repair submission form (web channel)
- Signed-in customers can submit: name, phone (optional), damage description, photos
- Photo upload with preview before submit
- At least 1 photo required; max ~5 photos
- Submission creates a job with `customerChannel = "web"`

### FR-3: AI damage analysis
- On photo upload, analyze damage from the photo(s)
- Extract: damage type, description, suggested tier → price in Rands
- Result editable by customer before submit (they can adjust the description)
- Stored on the job record for admin visibility

### FR-4: Admin integration
- Admin board unchanged in flow — web jobs appear as "new"
- Job detail page shows web channel metadata + AI analysis

---

## Non-Functional Requirements

### NFR-1: Performance
- Sign-up/sign-in round trip < 3s
- AI analysis returns within ~10s (show a clear loading state; timeout gracefully)

### NFR-2: Security
- Passwords hashed (never plaintext)
- Auth session cookie httpOnly + secure in production
- Photo uploads validated (type/size) server-side where possible
- No secrets in client code

### NFR-3: Accessibility
- Keyboard navigable forms, visible focus, labels on all inputs
- Error messages readable (not just color)
- `prefers-reduced-motion` respected

### NFR-4: Design consistency
- Matches the "Repair Sheet" design language (pitch green, stitch gold, mono labels, sharp corners) — see DESIGN.md
- Forms styled like workshop job tickets

---

## Key Entities

- **Users** (customers): name, email, password (hashed), createdAt
- **Jobs** (existing): + customerEmail, + channel "web", + AI analysis fields (damageType, aiDescription, suggestedTier, suggestedPrice)
- **Photos**: uploaded images associated with a job

---

## Visual/UX Direction

The forms should feel like filling out a workshop job ticket at a jersey repair shop:
- Same pitch-deep background, bone thread text, gold stitch accents
- Form cards styled like the admin job cards — bordered panels with mono labels ("JOB REF — NEW REQUEST")
- Photo upload area styled like a "drop the kit on the bench" zone — dashed stitch border, gold accent on hover
- AI analysis appears as a "Match-day assessment" panel: damage type, description, suggested tier, price — with a stitch-seam divider
- Buttons: gold filled ("Submit for Repair"), sharp corners
- Auth pages reuse the login-page pattern already built (KF mark, pitch-circle watermark, stitch seam)

---

## Assumptions

- Email/password only for MVP — no OAuth/Google sign-in yet (can add later)
- No email verification in MVP (requireEmailVerification: false) — keep friction low
- No password reset flow in MVP (can add later)
- Photo storage uses the app's existing backend (Convex) rather than a new service
- AI model: free-tier NVIDIA vision model (consistent with stack preference); the `ai-smart-repair-form` skill documents Mistral reliability on Vercel — final model choice in the plan
- The WhatsApp flow stays as-is (this adds a parallel web channel, doesn't replace WhatsApp)

## Out of Scope

- Google/Apple OAuth sign-in
- Email verification + password reset emails
- Customer-facing job tracking dashboard (status timeline per job) — later spec
- Payment / checkout integration
- Public quotes without an account
- AI analysis of photos beyond damage classification (e.g. no color-matching, no fabric-type detection)
- Multi-language support
- Telegram customer channel (admin-only channel today)

---

## Spec Quality Checklist
- [x] No implementation details (frameworks/APIs omitted — auth stack chosen in plan, not spec)
- [x] Focused on user value and business needs
- [x] All mandatory sections completed
- [x] Clarification markers below — to resolve in clarify phase
- [x] Requirements testable
- [x] Scope bounded (7 out-of-scope items)
- [x] Visual/UX direction concrete

## Needs Clarification — RESOLVED

1. ~~Should sign-up require phone?~~ **RESOLVED (2026-08-02):** Email + password required. Phone is optional (collected in the repair form, not the auth form).
2. ~~AI suggest price?~~ **RESOLVED (2026-08-02):** AI suggests damage type AND price tier (auto-quote to Basic R150 / Complex R250 / Full Refresh R400). Admin can adjust on the board.
3. ~~Customer tracking?~~ **RESOLVED (2026-08-02):** Yes — basic tracking. Customer sees job status after submitting (their submitted jobs with current status). Full status timeline UI is a later refinement, but status visibility ships now.
