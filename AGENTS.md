<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# KitFix 2.0 — Agent Guide

## Project Identity

KitFix is a jersey repair service for South African sports clubs and individuals. Snap a photo of the damage, send it via WhatsApp, get a quote, and we fix it.

| Detail | Value |
|--------|-------|
| **URL** | https://kitfix-2-0.vercel.app |
| **Stack** | Next.js 16.2.9 App Router, React 19.2.3, TypeScript 6.0.3, Tailwind CSS v4 |
| **Backend** | Convex (real-time DB) — `NEXT_PUBLIC_CONVEX_URL` |
| **Auth** | Customer = Better Auth + Convex (email/password); admin = simple cookie auth (`ADMIN_PASSWORD` env, 7-day session) |
| **Animation** | GSAP 3.15 + ScrollTrigger (hero), Framer Motion (not yet used — planned for UI microinteractions) |
| **PWA** | Manual service worker (`public/sw.js`) + manifest.json |
| **Deploy** | Vercel (auto-deploy on push to main) |
| **Pricing** | R150 Basic / R250 Complex / R400 Full Refresh |

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server (localhost:3000) |
| `CSS_TRANSFORMER_WASM=true npm run build` | Production build (LightningCSS WASM) |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint (flat config: `eslint.config.mjs`) |
| `npx convex dev` | Start Convex dev server (backend) |
| `npx convex deploy` | Deploy Convex functions to production |
| `npx tsc --noEmit` | Type-check |

> **⚠️ Build note:** Always use `CSS_TRANSFORMER_WASM=true` for builds. `lightningcss-wasm` is in deps for this reason. Without it, the build fails on missing native LightningCSS binary.

> **⚠️ TypeScript:** `ignoreBuildErrors: true` is set in next.config.ts. Always run `npx tsc --noEmit` manually before committing.

## Architecture

### Routes

| Route | Type | Purpose |
|-------|------|---------|
| `/` | Static | Landing page — repair-sheet hero + services + pricing + CTA |
| `/sign-in` | Client | Customer email/password sign-in (Better Auth) → `/repair/new` |
| `/sign-up` | Client | Customer account creation (Better Auth) → `/repair/new` |
| `/repair/new` | Client | Protected — repair submission: description, optional phone, photo upload (max 5), AI damage analysis, submit |
| `/my-jobs` | Client | Protected — customer tracking: their jobs + status (new/in_repair/ready/done) |
| `/admin` | Server | Admin dashboard (kanban) — `(protected)` route group, cookie auth |
| `/admin/login` | Server | Simple password form → sets `kitfix_admin` cookie |
| `/admin/jobs/[id]` | Dynamic | Job detail view — incl. AI Assessment panel + customer email/channel |
| `/api/auth/[...all]` | Route | Better Auth proxy → Convex (sign-up/sign-in/session) |
| `/api/analyze` | POST | NVIDIA vision (llama-3.2-90b-vision-instruct) → damage type/tier/price |
| `/api/concierge` | POST | Convex proxy for WhatsApp/Telegram path (legacy) |
| `/api/admin/login` | POST | Validates password → sets cookie |
| `/api/admin/logout` | POST | Deletes cookie |
| `/api/payments/initialize` | POST | Paystack checkout init (confirmed quote → authorization_url) |
| `/api/payments/webhook` | POST | Paystack webhook — HMAC-SHA512 verified → marks job paid |
| `/api/payments/verify` | GET | Payment status helper for `/pay/complete` |
| `/pay/complete` | Client | Post-payment success/processing page |

### Auth (two systems)
- **Customer auth:** Better Auth + Convex component (`@convex-dev/better-auth`) — email/password, sessions in Convex. Files: `convex/auth.ts`, `convex/auth.config.ts`, `convex/http.ts`, `lib/auth-client.ts`, `lib/auth-server.ts`. Env: `BETTER_AUTH_SECRET`, `SITE_URL` (per deployment: dev=localhost, prod=vercel URL).
- **Admin auth:** simple cookie (`kitfix_admin`, `ADMIN_PASSWORD`) — MVP, not Better Auth.

### Photo storage
Convex file storage. Client calls `jobs.generateUploadUrl` (action) → **POST** (not PUT) the file → gets `{storageId}` → stores IDs in `photoStorageIds`. Queries resolve via `ctx.storage.getUrl`. `jobs.getPhotoUrl` query resolves a single ID for the AI route.

### Project Structure (flat — no `src/` directory)

```
kitfix-2.0/
├── app/                    # Next.js App Router
│   ├── page.tsx            # Landing page (header, hero, sections, footer)
│   ├── layout.tsx          # Root layout (dark mode, metadata)
│   ├── globals.css         # @import "tailwindcss"
│   ├── admin/              # Admin routes (cookie auth)
│   │   └── (protected)/    # Admin route group: /admin, /admin/jobs/[id]
│   └── api/                # API routes
├── components/
│   ├── hero/               # GSAP macrophage hero animation
│   │   ├── MacrophageHero.tsx   # Main hero component (178 lines, GSAP + ScrollTrigger)
│   │   ├── JerseySVG.tsx        # Hand-crafted SVG jersey artwork
│   │   ├── ParticleSystem.tsx   # Particle swarm animation
│   │   └── hero-animations.ts   # Tear zones, swarm paths
│   └── providers.tsx       # Convex provider wrapper
├── convex/                 # Convex backend
│   ├── schema.ts           # Main schema: 1 table (jobs); Better Auth tables live in component
│   ├── auth.ts             # Better Auth + Convex component instance, getCurrentUser
│   ├── jobs.ts             # Mutations + queries
│   └── _generated/         # Auto-generated Convex types
├── lib/
│   ├── admin-auth.ts       # Cookie-based auth (checkAdmin, login, logout)
│   └── logger.ts           # Structured logging
├── DESIGN.md               # Complete design system (171 lines)
├── .specify/               # Spec-driven-development artifacts
│   ├── constitution.md     # Build rules (code-review-graph, cn(), GSAP, mobile throttle)
│   └── specs/macrophage-hero/
├── .github/skills/         # 18 agent skills (OpenCode/Claude Code compatible)
├── .hermes/tasks/          # 8 TDD task plans (admin store, checkout, courier, ecommerce, storefront)
├── .hermes/plans/          # Architecture plans
└── docs/plans/             # Historical design plans (6 docs)
```

### Data Flow

Two paths into the `jobs` table:

1. **Web customer portal (direct Convex)** — sign-up/sign-in, `/repair/new`, `/my-jobs`,
   and the admin dashboard connect directly to Convex client-side. Hooks come from
   `convex/react` (`useQuery`/`useMutation`), wired up through `ConvexBetterAuthProvider`
   in `components/providers.tsx`.
2. **WhatsApp/Telegram (legacy, via proxy)** — `WhatsApp/Telegram → /api/concierge → Convex`
   (server-side proxy).

```
Web portal + Admin dashboard ──direct──▶ Convex (jobs table)
                                               ▲
WhatsApp/Telegram → /api/concierge ────────────┤  (legacy proxy)
                                     convex/jobs.ts (mutations + queries)
```

`/api/concierge` is only for the legacy WhatsApp/Telegram path. The web portal and admin
dashboard talk to Convex directly.

## Convex Schema

```typescript
// convex/schema.ts — ONLY table
jobs: defineTable({
  customerName: v.string(),
  customerPhone: v.optional(v.string()),
  customerEmail: v.optional(v.string()),
  customerChannel: v.union(
    v.literal("whatsapp"),
    v.literal("telegram"),
    v.literal("web"),
  ),
  // Better Auth user id (component users table lives outside main schema)
  userId: v.optional(v.string()),
  description: v.string(),
  damageType: v.optional(v.string()),
  // Convex storage IDs; resolve to URLs via ctx.storage.getUrl in queries
  photoStorageIds: v.array(v.id("_storage")),
  // Legacy resolved URLs kept for backward compat with existing admin UI
  photoUrls: v.array(v.string()),
  aiAnalysis: v.optional(
    v.object({
      damageType: v.string(),
      description: v.string(),
      suggestedTier: v.string(),
      suggestedPrice: v.number(),
      confidence: v.number(),
      model: v.string(),
    }),
  ),
  quote: v.optional(v.number()),          // in Rands
  quoteStatus: v.optional(v.union(v.literal("estimate"), v.literal("confirmed"))), // estimate → confirmed; admin override resets to estimate
  status: v.union(                        // new → in_repair → ready → done
    v.literal("new"),
    v.literal("in_repair"),
    v.literal("ready"),
    v.literal("done"),
  ),
  adminNotes: v.optional(v.string()),
})
  .index("by_status", ["status"])
  .index("by_phone", ["customerPhone"])
  .index("by_userId", ["userId"])
```

Web jobs carry `customerChannel: "web"` + `userId`; WhatsApp/Telegram legacy jobs set
`customerChannel` to their channel and may omit `userId`.

### Concierge API Actions

`POST /api/concierge` accepts `{ action, ...data }`:

| Action | Type | Purpose |
|--------|------|---------|
| `create-job` | mutation | Create repair job (customerName, customerPhone, description, photoUrls) |
| `get-jobs` | query | List all jobs |
| `get-job` | query | Get single job by ID |
| `update-status` | mutation | Update job status (new/in_repair/ready/done) |

> **Note:** Web portal jobs bypass `/api/concierge` — they go straight to Convex via the
> client. Concierge serves only the legacy WhatsApp/Telegram path.

## Auth

Two auth systems. **Customer auth is Better Auth + Convex** (`convex/auth.ts`, gets
`getCurrentUser`); **admin auth is simple cookie-based** — NOT Better Auth.

| Detail | Value |
|--------|-------|
| Cookie name | `kitfix_admin` |
| Duration | 7 days |
| Password | `ADMIN_PASSWORD` env var (plaintext comparison) |
| Check | `checkAdmin()` in `lib/admin-auth.ts` |
| Login | `POST /api/admin/login` calls `login(password)` |
| Logout | `POST /api/admin/logout` calls `logout()` |

> **⚠️ This is MVP auth.** No password hashing, no rate limiting, no 2FA. Upgrade to Better Auth for production. (Applies to the admin cookie auth only.)

## Design System

**Full spec:** `DESIGN.md` (171 lines). Read it before any UI work.

### Quick Reference

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

### Signature Element — Stitch Seam
Dashed gold divider (repeating-linear-gradient) used as a through-line section divider. Sharp corners everywhere (no rounded cards/CTAs) — the kit-repair-workshop identity.

### Single Accent (Stitch Gold)
Gold (`stitch`) is the single accent — CTAs AND status. Red (`foul`) only for errors. Intentional; the old green+gold double-accent was replaced.

### Motion Stack
- **GSAP** — scroll-driven hero animation (ScrollTrigger + DrawSVG). CPU-efficient, scroll-linked.
- **Framer Motion** — planned for UI microinteractions (modals, page transitions, hover cards). Not yet implemented.

## Skills (Agent Delegation)

18 skills live in `.github/skills/` for OpenCode/Claude Code agents:

| Category | Skills |
|----------|--------|
| **Core workflow** | brainstorming, executing-plans, subagent-driven-development, test-driven-development |
| **Debugging** | systematic-debugging (6 reference docs) |
| **Next.js** | next-best-practices (16 reference docs), frontend-design |
| **Quality** | verification-before-completion, writing-plans, writing-skills |
| **Browser** | agent-browser (6 reference docs + 3 templates) |
| **Tools** | agent-memory, brand-scraper, competitor-intel, nano-banana, sa-post-generator |
| **Meta** | dispatching-parallel-agents, kanban-tracker, skill-creator, using-git-worktrees, using-superpowers, web-design-guidelines |

## What's NOT Built Yet

These `.hermes/tasks/` plans exist but are NOT implemented:

| Plan | Status |
|------|--------|
| `admin-store-tdd.md` | ❌ Not built |
| `checkout-orders-tdd.md` | ❌ Not built |
| `courier-guy-tdd.md` | ❌ Not built |
| `ecommerce-store-tdd.md` | ❌ Not built |
| `storefront-ui-tdd.md` | ❌ Not built |
| `design-phase1-tokens.md` | ⚠️ Partially (DESIGN.md exists) |
| `design-phase2-pages.md` | ❌ Not built |
| `repair-flow-courier.md` | ❌ Not built |

**Current state:** Single landing page + admin dashboard + Convex jobs table. That's it.

## Pitfalls & Quirks

- **No `src/` directory** — everything is flat under `app/`, `components/`, `lib/`, `convex/`
- **Convex client access** — the web portal + admin dashboard use `convex/react` hooks directly via `ConvexBetterAuthProvider`. `/api/concierge` is only for the legacy WhatsApp/Telegram path.
- **`ignoreBuildErrors: true`** — type errors won't fail the build, but always run `npx tsc --noEmit` before committing
- **LightningCSS WASM** — `CSS_TRANSFORMER_WASM=true` required for build. `lightningcss-wasm` is in deps.
- **Admin auth is plaintext** — `ADMIN_PASSWORD` compared directly. No hashing. Upgrade before real users.
- **No test runner** — no vitest, jest, or playwright configured. Tests need to be set up.
- **Path alias** — `@/*` maps to `./*` (project root, not `./src/*`)
- **GSAP is client-only** — all GSAP code must be in `"use client"` components. The hero component is the only user.
- **Customer auth is live** — `/sign-in` and `/sign-up` are wired to Better Auth + Convex. Admin uses simple cookie auth instead (`kitfix_admin`).
- **Component export convention** — named exports (not default) for shared components via `components/providers.tsx`
- **AGENTS.md was missing** — this file was created 2026-07-31. Agents before this date had no project context.
