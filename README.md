<div align="center">

# KitFix 2.0

**Jersey Repair Service PWA — Built for South Africa**

[![CI](https://github.com/{owner}/{repo}/actions/workflows/ci.yml/badge.svg)](https://github.com/{owner}/{repo}/actions/workflows/ci.yml)

![Next.js 16](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript)
![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)
![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-PostgreSQL-C5F74F?logo=drizzle)
![PWA](https://img.shields.io/badge/PWA-enabled-5A0FC8)

</div>

---

## Overview

KitFix 2.0 is a progressive web app for submitting, tracking, and managing jersey repair requests. Customers upload photos of damaged jerseys, receive AI-powered damage assessments and cost estimates, pay online, and track their repair through an 11-stage pipeline — all from their phone.

### Key Features

- **Repair Submissions** — Customer repair request submission with AI damage assessment
- **AI Damage Assessment** — Client-side analysis via Puter.js for instant cost estimates
- **Quote Workflow** — Admins send cost quotes with itemised breakdowns; customers accept or decline
- **11-Stage Repair Pipeline** — Full lifecycle tracking from submission through delivery
- **Locker-to-Locker Shipping** — Courier Guy integration with 4 shipping modes (L2L, D2D, D2L, L2D)
- **Admin/Technician Dashboard** — Manage requests, assign technicians, update statuses
- **Photo Upload** — Image uploads with Vercel Blob storage
- **Payments** — Secure checkout powered by Polar.sh
- **Voice Notes** — Pocket-TTS generated audio status updates for customers
- **PWA** — Installable, works offline, mobile-first
- **Email Notifications** — Repair status updates via Resend
- **Role-Based Access Control** — Customer, technician, and admin roles with scoped permissions
- **E-Commerce Store** — Jersey catalogue with personalisation options (under construction)

### South African Context

- **Timezone:** SAST (UTC+2) — all timestamps and scheduling
- **Currency:** ZAR (South African Rand) — all monetary values stored in cents
- **Shipping:** Courier Guy Locker API for pickup and delivery

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, React Server Components) |
| **UI** | [React 19](https://react.dev/), [Tailwind CSS 4](https://tailwindcss.com/) (OKLCH color system), [shadcn/ui](https://ui.shadcn.com/) (new-york style), [Radix UI](https://www.radix-ui.com/) |
| **Animation** | [Framer Motion](https://www.framer.com/motion/) |
| **Auth** | [Better Auth](https://www.better-auth.com/) with custom JWT proxy |
| **Database** | [Neon PostgreSQL](https://neon.tech/) via [Drizzle ORM](https://orm.drizzle.team/) |
| **Payments** | [Polar.sh](https://polar.sh/) |
| **AI** | [Puter.js](https://puter.com/) (client-side damage assessment) |
| **Shipping** | [Courier Guy Locker API](https://www.thecourierguy.co.za/) |
| **Storage** | [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) |
| **Email** | [Resend](https://resend.com/) |
| **Validation** | [Zod 4](https://zod.dev/) |
| **Testing** | [Vitest](https://vitest.dev/), [Playwright](https://playwright.dev/) |

---

## Getting Started

### Prerequisites

- **Node.js 20+** and npm
- A [Neon](https://neon.tech/) PostgreSQL database
- A [Polar.sh](https://polar.sh/) account (for payments)
- A [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) store (for photo uploads)
- A [Courier Guy](https://www.thecourierguy.co.za/) API key (for shipping)

### Installation

```bash
# Clone the repository
git clone https://github.com/{owner}/{repo}.git
cd kitfix-2.0

# Install dependencies (triggers postinstall patch for lightningcss WASM)
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials (see Environment Variables below)

# Push schema to database
npm run db:push

# Seed test data (admin + customer + repair requests + products)
npm run db:seed

# Start the development server
npm run dev
```

The app will be running at [http://localhost:3000](http://localhost:3000).

### Seed Accounts

After running `npm run db:seed`, you can log in with:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@kitfix.co.za` | `KitFix2024!` |
| Customer | `customer@test.co.za` | `Test1234!` |

### Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

| Variable | Description | Required |
| --- | --- | --- |
| `DATABASE_URL` | Neon PostgreSQL connection string | Yes |
| `BETTER_AUTH_SECRET` | Random 32+ character secret for JWT signing | Yes |
| `BETTER_AUTH_URL` | App base URL (`http://localhost:3000` for dev) | Yes |
| `NEXT_PUBLIC_APP_URL` | Public-facing app URL | Yes |
| `POLAR_ACCESS_TOKEN` | Polar.sh personal access token | Yes |
| `POLAR_WEBHOOK_SECRET` | Polar.sh webhook signing secret | Yes |
| `POLAR_PRODUCT_ID` | Polar.sh product ID for repair payments | Yes |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob read/write token | Yes |
| `TCG_API_KEY` | Courier Guy Locker API key | Yes |
| `RESEND_API_KEY` | Resend API key for transactional email | No (emails skipped if missing) |

---

## Project Structure

```
kitfix-2.0/
├── app/                          # Next.js App Router pages & API routes
│   ├── (auth)/                   #   Auth pages (sign-in, sign-up, forgot-password, verify-email)
│   ├── (customer)/               #   Customer portal (dashboard, repairs, payments, profile, notifications)
│   ├── (admin)/                  #   Admin portal (requests, users, technicians, payments, reviews, store)
│   ├── (store)/                  #   E-commerce store (shop, checkout, orders) — UNDER CONSTRUCTION
│   ├── api/                      #   API routes (auth, upload, webhooks/courier, webhooks/polar)
│   ├── contact/                  #   Contact page
│   └── ~offline/                 #   PWA offline fallback
├── actions/                      # Server Actions
│   ├── repairs.ts                #   Create, update, cancel repair requests
│   ├── admin.ts                  #   Assign technicians, update status, set estimates
│   ├── quotes.ts                 #   Quote management with itemised breakdowns
│   ├── payments.ts               #   Polar.sh checkout initiation
│   ├── reviews.ts                #   Submit and respond to reviews
│   ├── notifications.ts          #   Mark notifications as read
│   ├── profile.ts                #   Update user profile
│   ├── cart.ts                   #   Shopping cart operations
│   ├── orders.ts                 #   E-commerce order management
│   ├── ai-damage.ts              #   AI damage assessment
│   ├── ai-extract-repair.ts      #   AI repair data extraction
│   └── admin-store.ts            #   Admin store management
├── components/                   # React components
│   ├── ui/                       #   shadcn/ui primitives (button, card, dialog, etc.)
│   ├── layout/                   #   Navigation, sidebar, header, footer
│   ├── forms/                    #   Multi-step repair request, profile, review forms
│   ├── repair/                   #   Status tracker, photo gallery, damage badges
│   ├── admin/                    #   Dashboard stats, request tables, status updaters
│   ├── ai/                       #   AI damage analyzer & cost estimator
│   ├── motion/                   #   Framer Motion animation components
│   ├── notifications/            #   Notification bell with polling
│   ├── pwa/                      #   Service worker registration
│   └── shared/                   #   Empty states, skeletons, photo uploader
├── lib/                          # Core utilities & business logic
│   ├── db/                       #   Drizzle schema, queries, connection
│   │   ├── schema.ts             #   All table definitions, enums, relations
│   │   ├── index.ts              #   Lazy-initialized Neon client (Proxy wrapper)
│   │   └── queries/              #   Reusable query functions per domain
│   ├── courier/                  #   Courier Guy Locker API client (deep module)
│   ├── shipping/                 #   Locker lookup and rate calculation
│   ├── config/                   #   Pricing configuration (ZAR cents)
│   ├── validators/               #   Zod validation schemas (with tests)
│   ├── auth.ts                   #   Better Auth server config
│   ├── auth-client.ts            #   Client-side auth (useSession hook)
│   ├── auth-jwt.ts               #   JWT creation and verification (jose)
│   ├── auth-utils.ts             #   Server-side auth helpers (getSession, requireAuth, etc.)
│   ├── polar.ts                  #   Polar.sh SDK client
│   ├── upload.ts                 #   Vercel Blob upload helpers
│   ├── email.ts                  #   Resend email client (fire-and-forget)
│   ├── logger.ts                 #   Structured logging (JSON in prod, coloured in dev)
│   ├── env.ts                    #   Lazy env validation via Zod Proxy
│   └── utils.ts                  #   cn(), formatCurrency(), formatDateSAST()
├── hooks/                        # Client-side hooks
├── types/                        # TypeScript type definitions
│   └── index.ts                  #   Re-exports from schema + ActionResult<T>
├── drizzle/                      # Generated Drizzle migrations
├── scripts/                      # Seed script and debug utilities
├── public/                       # Static assets, PWA manifest, service worker
├── docs/                         # Architecture diagrams (.drawio), design docs
└── e2e/                          # Playwright end-to-end tests
```

---

## Commands

### Development

| Command | Description |
| --- | --- |
| `npm run dev` | Start development server (localhost:3000) |
| `npm run build` | Production build |
| `npm start` | Start production server |

### Code Quality

| Command | Description |
| --- | --- |
| `npm run lint` | ESLint (next/core-web-vitals + typescript) |
| `npm run typecheck` | Type-check with `tsc --noEmit` |

### Testing

| Command | Description |
| --- | --- |
| `npm run test` | Run Vitest in watch mode |
| `npm run test:run` | Run Vitest once |
| `npx vitest run path/to/file.test.ts` | Run a single test file |
| `npx vitest run -t "test name"` | Run a single test by name |
| `npm run test:e2e` | Run Playwright E2E tests (requires dev server running) |

### Database

| Command | Description |
| --- | --- |
| `npm run db:generate` | Generate Drizzle migration files |
| `npm run db:migrate` | Apply database migrations |
| `npm run db:push` | Push schema changes directly (dev only) |
| `npm run db:seed` | Seed test data (admin + customer + repairs + products) |
| `npm run db:studio` | Open Drizzle Studio (database GUI) |

---

## Architecture

KitFix follows a **server-first** architecture using Next.js App Router with React Server Components by default. Client components (`'use client'`) are used only where interactivity is required.

### Auth System

Authentication uses **JWT (jose)** with a custom proxy pattern:

1. **Edge middleware** (`proxy.ts`) validates the JWT from the `better-auth.session_token` cookie
2. On success, sets `x-user-id`, `x-user-role`, and `x-session-id` response headers
3. **Server components/actions** read these headers via `getSessionFromHeaders()` (no DB query)
4. For full user data, `getSession()` reads headers and fetches the user row from the database

```
Browser → proxy.ts (JWT verify) → Set headers → Next.js handler → getSessionFromHeaders()
```

**Auth helpers** in `lib/auth-utils.ts`:
- `getSession()` — Full session with DB user row
- `getSessionFromHeaders()` — Lightweight session from proxy headers (no DB query)
- `requireAuth()` — Redirects to `/sign-in` if not authenticated
- `requireRole(roles)` — Redirects if role not in allowed list
- `requireOwnership(ownerId)` — Redirects if not owner or admin

**Server action wrappers** prevent thrown errors:
- `authenticatedAction(fn)` — Requires any authenticated user
- `authenticatedAdminAction(fn)` — Requires admin role
- `authenticatedRoleAction(roles, fn)` — Requires specific role(s)

### Repair Pipeline

Every repair request flows through an 11-stage pipeline:

```
submitted → reviewed → quote_sent → quote_accepted → item_received → in_repair → quality_check → ready_for_shipment → shipped → delivered → cancelled
```

Each transition is recorded in the `statusHistory` table and triggers a notification to the customer.

### Role-Based Access

| Role | Capabilities |
| --- | --- |
| **Customer** | Submit repairs, track status, make payments, leave reviews |
| **Technician** | View assigned repairs, update repair status |
| **Admin** | Full access — manage all requests, users, technicians, payments, quotes |

### Data Model

**17 tables** managed by Drizzle ORM:

**Auth (Better Auth managed):**
- `user`, `session`, `account`, `verification`

**Repair domain:**
- `repairRequests` — Repair orders with 11-stage status, cost, damage info
- `repairPhotos` — Uploaded images (Vercel Blob URLs) with before/during/after classification
- `statusHistory` — Audit trail of every status transition
- `payments` — Polar.sh payment records (linked to repair OR order)
- `reviews` — Customer ratings (1-5) with technician response
- `notifications` — In-app notification records
- `voiceNotes` — Pocket-TTS generated audio status updates

**E-commerce domain (under construction):**
- `products` — Jersey catalogue with pricing in ZAR cents
- `productVariants` — Size-specific stock (S-2XL)
- `personalizationOptions` — Per-product personalisation config
- `cartItems` — Server-side shopping carts
- `orders` — E-commerce orders with shipping details
- `orderItems` — Line items with personalization config

### Monetary Values

All monetary amounts are stored in **ZAR cents** (integers). Display using `formatCurrency()` from `lib/utils.ts`.

```typescript
formatCurrency(89900) // "R 899.00"
formatCurrency(1500)  // "R 15.00"
```

### Date/Time Handling

All dates use **SAST (Africa/Johannesburg, UTC+2)**. Format with `formatDateSAST()` from `lib/utils.ts`.

```typescript
formatDateSAST(new Date()) // "19 Jul 2026, 14:30"
```

---

## Shipping Integration

KitFix integrates with the **Courier Guy Locker API** for locker-to-locker shipping:

- **Locker Lookup** — Find nearby pickup/drop-off lockers
- **Rate Calculation** — Compare shipping rates across 4 modes
- **Shipment Creation** — Generate waybills and tracking numbers
- **Tracking** — Real-time parcel tracking

**Shipping modes:** L2L (Locker-to-Locker, default), D2D (Door-to-Door), D2L (Door-to-Locker), L2D (Locker-to-Door)

**Pricing:** Metro vs non-metro rates for pickup and delivery fees (see `lib/config/pricing.ts`).

---

## Testing

### Unit Tests (Vitest)

Tests are colocated with source code in `__tests__/` directories:

```
lib/validators/__tests__/    # Zod schema validation tests
lib/courier/__tests__/       # Courier API client tests
lib/shipping/__tests__/      # Shipping rate calculation tests
lib/config/__tests__/        # Pricing config tests
actions/__tests__/           # Server action tests
```

The setup file (`vitest.setup.ts`) mocks `next/cache` and `next/headers` globally. Vitest globals are enabled — no need to import `describe`/`it`/`expect`.

### E2E Tests (Playwright)

End-to-end tests live in the `e2e/` directory and use Desktop Chrome only. The dev server must be running before executing E2E tests.

---

## Deployment

KitFix is designed for deployment on **Vercel**.

### Deployment Checklist

1. Set all environment variables in the Vercel dashboard
2. Provision a Neon PostgreSQL database and set `DATABASE_URL`
3. Create a Vercel Blob store and set `BLOB_READ_WRITE_TOKEN`
4. Configure Polar.sh webhooks to point to `https://your-domain.com/api/webhooks/polar`
5. Set `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` to your production URL
6. Set `TCG_API_KEY` for Courier Guy shipping integration
7. Run `npm run db:migrate` against the production database

---

## License

This project is licensed under the [MIT License](./LICENSE).
