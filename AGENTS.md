<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# KitFix 2.0 — Agent Guide

## Project Identity

KitFix is a jersey repair service for South African sports clubs and individuals. Snap a photo of the damage, send it via WhatsApp, get a quote, and we fix it.

| Detail | Value |
|--------|-------|
| **URL** | https://kitfix.vercel.app |
| **Stack** | Next.js 16.2.9 App Router, React 19.2.3, TypeScript 6.0.3, Tailwind CSS v4 |
| **Backend** | Convex (real-time DB) — `NEXT_PUBLIC_CONVEX_URL` |
| **Auth** | Simple cookie-based admin (`ADMIN_PASSWORD` env, 7-day session) |
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
| `/` | Static | Landing page with macrophage hero + how-it-works + pricing + CTA |
| `/admin` | Server | Admin dashboard — redirects to `/admin/login` if unauthenticated |
| `/admin/login` | Server | Simple password form → sets `kitfix_admin` cookie |
| `/admin/jobs/[id]` | Dynamic | Job detail view |
| `/api/concierge` | POST | Convex proxy — creates/queries/updates jobs |
| `/api/admin/login` | POST | Validates password → sets cookie |
| `/api/admin/logout` | POST | Deletes cookie |
| `/sign-in`, `/sign-up`, `/forgot-password`, `/verify-email`, `/offline` | Static | Auth pages (placeholder — not wired to real auth) |

### Project Structure (flat — no `src/` directory)

```
kitfix-2.0/
├── app/                    # Next.js App Router
│   ├── page.tsx            # Landing page (header, hero, sections, footer)
│   ├── layout.tsx          # Root layout (dark mode, metadata)
│   ├── globals.css         # @import "tailwindcss"
│   ├── admin/              # Admin routes
│   └── api/                # API routes
├── components/
│   ├── hero/               # GSAP macrophage hero animation
│   │   ├── MacrophageHero.tsx   # Main hero component (178 lines, GSAP + ScrollTrigger)
│   │   ├── JerseySVG.tsx        # Hand-crafted SVG jersey artwork
│   │   ├── ParticleSystem.tsx   # Particle swarm animation
│   │   └── hero-animations.ts   # Tear zones, swarm paths
│   └── providers.tsx       # Convex provider wrapper
├── convex/                 # Convex backend
│   ├── schema.ts           # 1 table: jobs (see below)
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

```
WhatsApp/Telegram → /api/concierge → Convex (jobs table) → Admin Dashboard
                                        ↑
                              convex/jobs.ts (mutations + queries)
```

The app does NOT connect to Convex client-side. All Convex access goes through `/api/concierge` as a server-side proxy. The admin dashboard fetches jobs through this proxy.

## Convex Schema

```typescript
// convex/schema.ts — ONLY table
jobs: defineTable({
  customerName: v.string(),
  customerPhone: v.string(),
  customerChannel: v.union(v.literal("whatsapp"), v.literal("telegram")),
  description: v.string(),
  damageType: v.optional(v.string()),
  photoUrls: v.array(v.string()),
  quote: v.optional(v.number()),          // in Rands
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
```

### Concierge API Actions

`POST /api/concierge` accepts `{ action, ...data }`:

| Action | Type | Purpose |
|--------|------|---------|
| `create-job` | mutation | Create repair job (customerName, customerPhone, description, photoUrls) |
| `get-jobs` | query | List all jobs |
| `get-job` | query | Get single job by ID |
| `update-status` | mutation | Update job status (new/in_repair/ready/done) |

## Auth

Simple cookie-based admin auth — NOT Better Auth.

| Detail | Value |
|--------|-------|
| Cookie name | `kitfix_admin` |
| Duration | 7 days |
| Password | `ADMIN_PASSWORD` env var (plaintext comparison) |
| Check | `checkAdmin()` in `lib/admin-auth.ts` |
| Login | `POST /api/admin/login` calls `login(password)` |
| Logout | `POST /api/admin/logout` calls `logout()` |

> **⚠️ This is MVP auth.** No password hashing, no rate limiting, no 2FA. Upgrade to Better Auth for production.

## Design System

**Full spec:** `DESIGN.md` (171 lines). Read it before any UI work.

### Quick Reference

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#0A0A0B` | Page background |
| Green accent | `#00E859` | Primary CTAs, success, status |
| Gold accent | `#C8A951` | Badges, premium/status elements |
| Surface | `bg-surface` | Card backgrounds |
| Text | `text-content` | Primary text |
| Borders | `border-white/[0.04]` | Subtle borders |
| Font | System stack + `font-display` (headings) | |
| Border radius | `rounded-xl` (cards), `rounded-lg` (buttons) | |
| Touch target | `h-11` (44px) minimum | |

### Double Accent (Green + Gold)
Green = primary actions ("click me"). Gold = status/premium ("this is special"). Intentional, not a mistake.

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
- **Convex is server-only** — client components do NOT connect to Convex directly. Use `/api/concierge`.
- **`ignoreBuildErrors: true`** — type errors won't fail the build, but always run `npx tsc --noEmit` before committing
- **LightningCSS WASM** — `CSS_TRANSFORMER_WASM=true` required for build. `lightningcss-wasm` is in deps.
- **Admin auth is plaintext** — `ADMIN_PASSWORD` compared directly. No hashing. Upgrade before real users.
- **No test runner** — no vitest, jest, or playwright configured. Tests need to be set up.
- **Path alias** — `@/*` maps to `./*` (project root, not `./src/*`)
- **GSAP is client-only** — all GSAP code must be in `"use client"` components. The hero component is the only user.
- **Auth pages are placeholder** — `/sign-in`, `/sign-up`, `/forgot-password`, `/verify-email` exist as static pages but are not wired to real auth. Admin uses simple cookie auth instead.
- **Component export convention** — named exports (not default) for shared components via `components/providers.tsx`
- **AGENTS.md was missing** — this file was created 2026-07-31. Agents before this date had no project context.
