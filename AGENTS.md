<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Quick Start

1. Copy `.env.example` to `.env.local` and fill in values
2. `npm run dev` — start dev server
3. `npm run db:push` — push schema to Neon DB
4. `npm run db:seed` — populate with test data

## Dev Commands

```bash
npm run dev              # Start dev server (http://localhost:3000)
npm run build            # Production build
npm run typecheck        # Type check with tsc --noEmit
npm run test             # Run Vitest (watch mode)
npm run test:run         # Run Vitest once
npm run test:e2e         # Run Playwright E2E tests
npm run lint             # ESLint
npm run db:generate      # Generate Drizzle migration
npm run db:migrate       # Apply migrations
npm run db:push          # Push schema directly (dev only)
npm run db:seed          # Seed test data (admin + customer + repairs)
npm run db:studio        # Open Drizzle Studio
```

## Project Structure

```
kitfix-2.0/
├── app/                    # Next.js App Router
│   ├── (auth)/             #   Auth pages (sign-in, sign-up, forgot-password, verify-email)
│   ├── (customer)/         #   Customer portal (dashboard, repairs, payments, profile, notifications)
│   ├── (admin)/            #   Admin dashboard (requests, users, technicians, payments, reviews, store)
│   ├── (store)/            #   E-commerce store (products, cart, checkout, orders)
│   ├── api/                #   API routes (auth, upload, webhooks/courier, webhooks/polar)
│   └── ~offline/           #   PWA offline fallback
├── actions/                # Server Actions (repairs, admin, payments, reviews, notifications, profile, products, cart, orders)
├── components/             # React components
│   ├── ui/                 #   shadcn/ui primitives
│   ├── admin/              #   Admin dashboard components
│   ├── customer/           #   Customer-facing components
│   ├── forms/              #   Multi-step forms
│   ├── repair/             #   Repair-specific components
│   ├── ai/                 #   AI damage analyzer & cost estimator
│   ├── motion/             #   Framer Motion animations
│   ├── layout/             #   Navigation, sidebar, header, footer
│   ├── notifications/      #   Notification bell
│   └── shared/             #   Photo uploader, loading skeletons, empty states
├── lib/                    # Core utilities & business logic
│   ├── db/                 #   Drizzle schema, queries, connection
│   │   └── queries/        #   Reusable query functions (repairs, payments, reviews, notifications)
│   ├── validators/         #   Zod validation schemas
│   ├── courier/            #   Courier Guy Locker API client (deep module)
│   ├── config/             #   Pricing configuration (ZAR cents, metro/non-metro fees)
│   ├── auth.ts             #   Better Auth server config
│   ├── auth-client.ts      #   Better Auth client config
│   ├── polar.ts            #   Polar.sh SDK client
│   ├── upload.ts           #   Vercel Blob upload helpers
│   ├── email.ts            #   Resend email client
│   └── logger.ts           #   Structured logging
├── hooks/                  # Client-side hooks
├── types/                  # TypeScript type definitions
├── drizzle/                # Generated Drizzle migrations
├── public/                 # Static assets, PWA manifest, service worker
└── docs/                   # Architecture diagrams (.drawio), design docs
```

## Architecture

**Framework:** Next.js 16 App Router with React Server Components by default. Client components (`'use client'`) only where interactivity is required.

**Database:** Neon PostgreSQL via Drizzle ORM. Money stored in ZAR cents (integers, avoid floats).

**Auth:** Better Auth with Drizzle adapter, admin plugin, Polar plugin. Server-side session checks in layouts + server actions.

**Payments:** Polar.sh — one-time dynamic pricing per repair/order. Webhooks for payment confirmation.

**Shipping:** Courier Guy Locker API — 4 modes (L2L default, D2D, D2L, L2D). Deep module at `lib/courier/client.ts`.

**Storage:** Vercel Blob for photo uploads.

**Email:** Resend for transactional emails.

## Database Schema (16 Tables)

### Better Auth Managed
- `user` — core user with `role` column (customer/technician/admin)
- `session`, `account`, `verification` — Better Auth standard

### Repair Domain
- `repairRequests` — 7-stage pipeline (submitted→reviewed→quote_sent→quote_accepted→in_repair→quality_check→shipped)
- `repairPhotos` — before/during/after photo records (Vercel Blob URLs)
- `statusHistory` — audit trail of every status change
- `payments` — Polar.sh payment records (linked to repair OR order via FKs)
- `reviews` — customer ratings (1-5) with technician response
- `notifications` — in-app notification records

### E-Commerce Domain (UNDER CONSTRUCTION)
- `products` — jersey catalog with pricing in ZAR cents
- `productVariants` — size-specific stock (XS-3XL, Kids)
- `personalizationOptions` — per-product personalization config
- `cartItems` — server-side shopping carts
- `orders` — e-commerce orders with shipping details
- `orderItems` — line items with personalization config

## Courier Guy Locker API

**Base:** `https://wqvdmjybt6.execute-api.af-south-1.amazonaws.com/`
**Auth:** API key in header (env: `TCG_API_KEY`)
**Deep module:** `lib/courier/client.ts` — small interface hiding HTTP calls, caching, webhook handling

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/lockers` | All locker locations |
| POST | `/rates` | Shipping rates (L2L/D2D/D2L/L2D) |
| POST | `/shipments` | Create shipment |
| GET | `/shipments/:id/label` | Waybill PDF |
| GET | `/tracking/parcel/:barcode` | Track parcel |
| PUT | `/shipments/:id/cancel` | Cancel shipment |

**L2L (Locker to Locker)** is the default shipping mode — customer drops at nearest locker, collects from chosen locker.

## Engineering Workflow — Matt Pocock + gstack (Gold Standard)

This project follows **Matt Pocock's skills methodology** combined with **Garry Tan's gstack** — 73 skills total for structured, composable AI agent workflows. **Load any with the skill name in Telegram.**

### Matt Pocock Skills (19)

| Skill | Use |
|---|---|
| `setup-matt-pocock-skills` | **Run first per repo** — configures issue tracker, triage labels, domain docs |
| `tdd` | Red-green-refactor test-driven development |
| `diagnosing-bugs` | Structured bug diagnosis loop |
| `to-prd` | Turn conversation into PRD |
| `to-issues` | Break PRD into vertical-slice issues |
| `triage` | Move issues through state machine |
| `prototype` | Build throwaway prototype to validate designs |
| `improve-codebase-architecture` | Architecture scan + visual report + drill into deep modules |
| `codebase-design` | Design deep modules with shared vocabulary |
| `domain-modeling` | Sharpen domain model in CONTEXT.md |
| `implement` | Guided implementation from issues |
| `ask-matt` | Router — what skill fits? |

### gstack (54)

#### Plan
| Skill | Use |
|---|---|
| `office-hours` | **Start here** — reframes product idea before building |
| `plan-ceo-review` | CEO-level review: find the 10-star product |
| `plan-eng-review` | Lock architecture, data flow, edge cases, tests |
| `plan-design-review` | Rate each design dimension 0-10 |
| `autoplan` | One command: CEO → design → eng → DX review |
| `spec` | Turn vague intent into precise spec, file GitHub issue |

#### Build + Review
| Skill | Use |
|---|---|
| `review` | Pre-landing PR review — bugs that pass CI but break in prod |
| `investigate` | Systematic root-cause debugging |
| `qa` | Open real browser, find bugs, fix, re-verify |
| `qa-only` | QA report only — no code changes |
| `cso` | OWASP Top 10 + STRIDE security audit |
| `ship` | Run tests, review, push, open PR |
| `land-and-deploy` | Merge PR, wait for CI, deploy, verify production |
| `canary` | Post-deploy monitoring loop |
| `design-review` | Live-site visual audit + fix loop |
| `design-consultation` | Build complete design system from scratch |
| `health` | Code quality dashboard (types, lint, tests, dead code) |
| `retro` | Weekly retro with per-person breakdowns |
| `context-save` / `context-restore` | Save/resume working context across sessions |
| `browse` | Headless browser for web inspections |

#### Diagram
| Skill | Use |
|---|---|
| `diagram` | Turn English descriptions into architecture/flow diagrams |
| Architecture diagram | See `docs/kitfix-architecture.drawio` — use drawio-skill to generate |

### Quick Start on This Repo

1. `skill office-hours` — Describe what you're building
2. `skill setup-matt-pocock-skills` — Configure per-repo agent setup
3. `skill autoplan` — CEO → design → eng → DX review in one shot
4. Build with `skill tdd` or `skill implement`
5. `skill review` before landing
6. `skill qa` on staging URL
7. `skill ship` or `skill land-and-deploy`
8. For architecture diagrams: use drawio-skill (Agents365-ai/drawio-skill) to generate `.drawio` files in `docs/`
