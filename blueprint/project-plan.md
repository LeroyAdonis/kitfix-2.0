# Project Plan

## 1. Problem - What problem are we solving?

South African sports clubs, schools, and individual players accumulate damaged jerseys each season - torn seams, ripped numbers, broken zips, peeling badges. Clubs either replace kits entirely (expensive, wasteful) or live with damaged gear (looks unprofessional on match day). Existing alteration services don't understand sports fabric, heat-press lettering, or the urgency of a Saturday morning fixture.

KitFix solves this by offering a specialised jersey repair and refresh service with a simple workflow: photograph the damage, send it via WhatsApp (or upload via the web portal), receive a fixed flat-rate quote, approve, and get the kit back match-day ready.

## 2. Users - Who is this for?

- **SA sports clubs** (rugby, soccer, cricket) - need bulk kit repairs at season start/end or mid-season damage. Primary B2B target for cold outbound.
- **Schools and universities** - sports departments managing large kit inventories on tight budgets.
- **Individual players** - personal jerseys, supporters' shirts, memorabilia with sentimental value.
- **Leroy (owner)** - manages the business via an admin dashboard, handles quotes, tracks job status, and processes payments.

## 3. Features - What does the MVP need?

- Landing page with hero animation, services overview, pricing tiers, and WhatsApp CTA
- Customer authentication (email/password via Better Auth + Convex)
- Repair job submission with photo upload (max 5 photos), description, optional phone number
- AI-powered damage analysis (NVIDIA vision model) suggesting damage type, repair tier, and price
- Quote management (AI estimate, admin override, customer confirmation)
- Admin dashboard with kanban board for job status tracking (new / in_repair / ready / done)
- Admin job detail view with AI assessment panel, notes, and photo gallery
- Customer job tracking page showing their own jobs and status
- Payment integration (Paystack checkout for confirmed quotes)
- WhatsApp/Telegram concierge path (legacy proxy route for messaging-based intake)
- PWA support (service worker + manifest)
- GSAP-powered hero animation on landing page

## 4. Data - What are we storing?

- **Jobs** - the core entity: customer info, description, photos (Convex file storage), AI analysis results, quote (with history audit trail), status lifecycle, payment status, admin notes, archive flag
- **Users** - Better Auth managed (stored in Convex via `@convex-dev/better-auth` component, outside main schema)
- **Sessions** - Better Auth managed (Convex component)
- **Photos** - Convex file storage, resolved to URLs via `ctx.storage.getUrl`

## 5. Tech - What stack are we using?

- **Frontend:** Next.js 16.2.9 App Router, React 19.2.3, TypeScript 6.0.3, Tailwind CSS v4 (CSS-first config)
- **Backend:** Convex (real-time DB + file storage + serverless functions)
- **Auth:** Better Auth + Convex component (`@convex-dev/better-auth`) for customers; simple cookie auth (`ADMIN_PASSWORD`) for admin
- **AI:** NVIDIA vision API (llama-3.2-90b-vision-instruct) for damage analysis
- **Payments:** Paystack (checkout initialization + webhook verification)
- **Animation:** GSAP 3.15 + ScrollTrigger (hero only); Framer Motion planned but not yet used
- **Fonts:** Archivo Black (display), Space Grotesk (body), IBM Plex Mono (labels/data) via next/font/google
- **Build:** LightningCSS WASM (`CSS_TRANSFORMER_WASM=true` required), ESLint flat config
- **Deploy:** Vercel (auto-deploy on push to main)
- **PWA:** Manual service worker (`public/sw.js`) + manifest.json

## 6. Monetize - How will this make money?

Tiered flat-rate pricing for jersey repair services:

| Tier | Price | Description |
|------|-------|-------------|
| Basic Repair | R150 | Seam tears, loose stitching, small holes (single small repair) |
| Complex Repair | R250 | Larger or multiple issues: peeling print, tear over 5cm, name/number replacement |
| Full Refresh | R400 | Jersey-wide refresh: faded/peeling print across the kit, multiple damage types + deep clean |

Quotes are flat-rate from **R180** minimum (the "from R180" messaging on the landing page).

Additional revenue: B2B bulk contracts with clubs/schools at volume discounts; repeat business from seasonal kit maintenance.

## 7. UI/UX - How should this look and feel?

"Repair Sheet" design language - premium, dark, grounded in the subject (jersey/pitch). Not a generic SaaS template.

- **Palette:** Deep pitch green (`#17351A`) background, pitch green panels, bone white text, stitch gold accent (single accent, no double-accent). Foul red only for errors.
- **Typography:** Archivo Black for headlines, Space Grotesk for body, IBM Plex Mono for labels/data. All loaded via next/font/google.
- **Signature element:** Dashed gold "stitch seam" divider - used as a through-line on every page.
- **Shapes:** Sharp corners everywhere (no rounded cards/CTAs) - the workshop/repair-sheet identity.
- **Structure:** Sections labelled like a repair sheet / job card (KF-01, KF-A, "Job Ref:").
- **Motion:** Single orchestrated GSAP hero animation on landing. Framer Motion planned for UI microinteractions but not yet implemented.
- **Accessibility:** 4.5:1 contrast ratio, 44px min touch targets, `prefers-reduced-motion` respected.

## 8. Deployment - Where and how will this ship?

- **Host:** Vercel (auto-deploy on push to main)
- **URL:** https://kitfix-2-0.vercel.app
- **Build command:** `CSS_TRANSFORMER_WASM=true next build` (via `npm run build`)
- **Start command:** `next start` (via `npm run start`)
- **Env vars:** `NEXT_PUBLIC_CONVEX_URL`, `BETTER_AUTH_SECRET`, `SITE_URL`, `ADMIN_PASSWORD`, NVIDIA API key (for `/api/analyze`), Paystack keys (for `/api/payments/*`)
- **Database:** Convex (managed, no migration commands needed)
- **Convex deploy:** `npx convex deploy` (separate from Vercel deploy)
- **Health check:** No explicit health check endpoint; Vercel handles this via the deployment URL
