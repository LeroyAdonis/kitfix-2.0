# KitFix 2.0 - Project Overview

> Jersey repair service for South African sports clubs and individuals — snap a photo, get a quote, get it fixed.

## Problem

South African sports clubs, schools, and individual players accumulate damaged jerseys each season. Clubs either replace entire kits (expensive, wasteful) or live with damaged gear (looks unprofessional on match day). Existing alteration services don't understand sports fabric, heat-press lettering, or the urgency of a Saturday morning fixture. KitFix solves this with a specialised jersey repair and refresh service: photograph the damage, send it via WhatsApp or web portal, receive a flat-rate quote, approve, and get the kit back match-day ready.

## Users

- **SA sports clubs** (rugby, soccer, cricket) — bulk kit repairs at season start/end or mid-season damage. Primary B2B target.
- **Schools and universities** — sports departments managing large kit inventories on tight budgets.
- **Individual players** — personal jerseys, supporters' shirts, memorabilia with sentimental value.
- **Leroy (owner)** — manages the business via the admin dashboard, handles quotes, tracks job status, processes payments. Admin access tier (cookie auth).

Access tiers: anonymous (landing page) → signed-in customer (Better Auth + Convex) → admin (cookie auth).

## Features

### Shipped (MVP)

1. **Landing page** - Hero with GSAP macrophage animation, services overview, pricing tiers, stats, how-it-works steps, WhatsApp CTA, footer.
2. **Customer auth** - Email/password sign-in and sign-up via Better Auth + Convex component. Protected routes for submission and tracking.
3. **Repair job submission** - `/repair/new`: description, optional phone, photo upload (max 5, Convex file storage), AI damage analysis (NVIDIA vision), submit job.
4. **Customer job tracking** - `/my-jobs`: list of user's own jobs with status (new / in_repair / ready / done).
5. **Admin dashboard** - `/admin`: kanban board with job columns by status, cookie-based auth.
6. **Admin job detail** - `/admin/jobs/[id]`: AI assessment panel, customer info, photo gallery, status management, admin notes.
7. **Quote management** - AI estimate at job creation, admin override (resets to estimate), customer confirmation, quote history audit trail.
8. **Payment integration** - Paystack checkout (initialize, webhook with HMAC-SHA512 verification, verify), post-payment page.
9. **WhatsApp/Telegram concierge** - `/api/concierge` server-side proxy for legacy messaging path (create-job, get-jobs, get-job, update-status).
10. **PWA** - Manual service worker (`public/sw.js`) + manifest.json for installability.
11. **Design system** - "Repair Sheet" language: pitch green palette, stitch gold accent (single accent), Archivo Black / Space Grotesk / IBM Plex Mono, dashed gold stitch seam divider, sharp corners everywhere.

### Roadmap (Post-MVP)

12. **Admin store** - Product/inventory management for the admin dashboard.
13. **Checkout & orders flow** - End-to-end checkout experience for repair services.
14. **Courier integration** - SA courier service integration for kit pickup and delivery.
15. **Ecommerce storefront** - Browseable product/service catalog with cart.
16. **Storefront UI pages** - Additional pages for the ecommerce storefront.
17. **Design phase 2 pages** - Pricing details, about, contact pages.
18. **Repair-flow courier** - End-to-end repair flow including courier pickup/dropoff scheduling.

## Data model

### Jobs (core entity)

- `_id` (id) — Convex document ID
- `customerName` (string) — customer name
- `customerPhone` (optional string) — phone number (for WhatsApp path or web submissions)
- `customerEmail` (optional string) — email (for web customers)
- `customerChannel` (union: "whatsapp" | "telegram" | "web") — intake channel
- `userId` (optional string) — Better Auth user ID (web portal customers only)
- `description` (string) — customer's damage description
- `damageType` (optional string) — AI-classified damage type
- `photoStorageIds` (array of id("_storage")) — Convex file storage IDs, resolved to URLs via `ctx.storage.getUrl`
- `photoUrls` (array of string) — legacy resolved URLs for backward compat
- `aiAnalysis` (optional object) — AI assessment: `{ damageType, description, suggestedTier, suggestedPrice, confidence, model }`
- `quote` (optional number) — quoted price in Rands
- `quoteStatus` (optional union: "estimate" | "confirmed") — estimate from AI, admin override resets to estimate
- `status` (union: "new" | "in_repair" | "ready" | "done") — lifecycle status
- `adminNotes` (optional string) — internal admin notes
- Indexes: `by_status`, `by_phone`, `by_userId`

> Jobs is the only table. Schema shape is locked — changes here ripple across the admin dashboard, customer tracking, AI analysis, and payment flows.

### Users / Sessions (managed externally)

Better Auth + Convex component (`@convex-dev/better-auth`) manages user accounts and sessions in its own tables, outside the main schema. The `jobs.userId` field links jobs to their owning user.

### Photos

Convex file storage. Client calls `jobs.generateUploadUrl` (action) → POST file → gets `{storageId}` → stored in `photoStorageIds`. Queries resolve via `ctx.storage.getUrl`.

## Tech stack

- **Next.js 16.2.9 App Router** — frontend framework, SSR/SSG, API routes, route groups
- **React 19.2.3** — UI library
- **TypeScript 6.0.3** — type safety (`ignoreBuildErrors` removed; `npx tsc --noEmit` required pre-commit)
- **Tailwind CSS v4** — styling via CSS-first config, LightningCSS WASM
- **Convex** — real-time database, file storage, serverless functions (queries/mutations/actions)
- **Better Auth + Convex component** — customer email/password authentication (`@convex-dev/better-auth`)
- **NVIDIA vision API** — llama-3.2-90b-vision-instruct for AI damage analysis (`/api/analyze`)
- **Paystack** — payment checkout, webhook verification (HMAC-SHA512), payment status
- **GSAP 3.15 + ScrollTrigger** — hero animation only (CPU-efficient, scroll-linked)
- **Framer Motion** — planned for UI microinteractions (not yet used)
- **PWA** — manual service worker + manifest.json

### Design tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--color-pitch-deep` | `#17351A` | Page background |
| `--color-pitch` | `#24572A` | Panels, secondary surfaces |
| `--color-pitch-line` | `#2E6B35` | Borders, hover-green, "ready" status |
| `--color-thread` | `#EFE9D8` | Primary text (bone/thread white) |
| `--color-thread-dim` | `#C4BCA8` | Secondary text, muted labels |
| `--color-stitch` | `#F2B01E` | Accent — CTAs, signature seam, "new" status |
| `--color-foul` | `#C8402C` | Errors, destructive (used sparingly) |
| `--color-ink` | `#0F1C10` | Text on gold (dark green-black) |
| Font display | `Archivo Black` | Headlines, hero, stat numbers |
| Font body | `Space Grotesk` | Paragraphs, body copy |
| Font mono | `IBM Plex Mono` | Labels, refs, data, footer |

### Pricing (live)

| Tier | Price | Description |
|------|-------|-------------|
| Basic Repair | R150 | Seam tears, loose stitching, small holes |
| Complex Repair | R250 | Larger/multiple issues, peeling print, name/number replacement |
| Full Refresh | R400 | Jersey-wide refresh: faded/peeling print, multiple damage types + deep clean |

Quotes are flat-rate from **R180** minimum.

## Monetization

Tiered flat-rate pricing for jersey repair (R150 Basic / R250 Complex / R400 Full Refresh). Additional revenue from B2B bulk contracts with clubs/schools at volume discounts, and repeat business from seasonal kit maintenance.

## UI/UX

"Repair Sheet" design language — premium, dark, grounded in the subject (jersey/pitch). Sharp corners, dashed gold stitch seam divider, single accent (stitch gold). Foul red only for errors.

### Routes

| Route | Type | Purpose |
|-------|------|---------|
| `/` | Static | Landing page — hero, services, pricing, stats, how-it-works, CTA, footer |
| `/sign-in` | Client | Customer email/password sign-in (Better Auth) → `/repair/new` |
| `/sign-up` | Client | Customer account creation (Better Auth) → `/repair/new` |
| `/repair/new` | Client | Protected — repair submission: description, phone, photos, AI analysis, submit |
| `/my-jobs` | Client | Protected — customer tracking: their jobs + status |
| `/admin` | Server | Admin kanban dashboard — `(protected)` route group, cookie auth |
| `/admin/login` | Server | Admin password form → sets `kitfix_admin` cookie |
| `/admin/jobs/[id]` | Dynamic | Job detail: AI assessment panel, customer info, photos, status, notes |
| `/api/auth/[...all]` | Route | Better Auth proxy → Convex |
| `/api/analyze` | POST | NVIDIA vision → damage type/tier/price |
| `/api/concierge` | POST | Convex proxy for WhatsApp/Telegram path |
| `/api/admin/login` | POST | Validates password → sets cookie |
| `/api/admin/logout` | POST | Deletes cookie |
| `/api/payments/initialize` | POST | Paystack checkout init → authorization_url |
| `/api/payments/webhook` | POST | Paystack webhook — HMAC-SHA512 verified → marks job paid |
| `/api/payments/verify` | GET | Payment status helper |
| `/pay/complete` | Client | Post-payment success/processing page |

## Deployment

- **Host:** Vercel (auto-deploy on push to main)
- **URL:** https://kitfix-2-0.vercel.app
- **Build command:** `CSS_TRANSFORMER_WASM=true next build` (via `npm run build` with `lightningcss-wasm` in deps)
- **Start command:** `next start` (via `npm run start`)
- **Convex deploy:** `npx convex deploy` (separate from Vercel deploy)
- **Database:** Convex (managed, no migration commands needed)
- **Env vars:** `NEXT_PUBLIC_CONVEX_URL`, `BETTER_AUTH_SECRET`, `SITE_URL`, `ADMIN_PASSWORD`, NVIDIA API key, Paystack keys (public + secret + webhook secret)
- **Type check:** `npx tsc --noEmit` (required pre-commit — `ignoreBuildErrors` was removed from next.config.ts)
- **Lint:** `npm run lint` (ESLint flat config)

## Open questions

> None — both plans are consistent and the build plan is fully trackable. Ready for `/feature`.
