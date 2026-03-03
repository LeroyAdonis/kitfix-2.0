# KitFix 2.0 — Copilot Instructions

## What is this?

KitFix 2.0 is a jersey repair service PWA. Customers submit repair requests with photos, track orders through a 5-stage pipeline (submitted → reviewed → in_repair → quality_check → shipped), and pay via Polar.sh. Admins and technicians manage work via a dashboard. AI damage assessment runs client-side via Puter.js.

## Stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript 5
- **Auth:** Better Auth with Drizzle adapter + admin plugin (email/password)
- **Database:** Neon Postgres via `@neondatabase/serverless`, Drizzle ORM
- **Payments:** Polar.sh (checkout + webhook)
- **Storage:** Vercel Blob (photo uploads)
- **AI:** Puter.js (client-side vision, loaded via `<Script>` tag)
- **UI:** shadcn/ui (new-york style), Tailwind CSS v4, Radix UI, Framer Motion
- **Validation:** Zod v4

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build (clean .next first if ENOENT pages-manifest.json)
npm run lint         # ESLint (next/core-web-vitals + typescript)
npm run typecheck    # tsc --noEmit
npm run test:run     # Run all tests (vitest)
npx vitest run path/to/file.test.ts          # Run a single test file
npx vitest run -t "test name"                # Run a single test by name
npm run db:generate  # Generate Drizzle migrations
npm run db:push      # Push schema to database
npm run db:studio    # Open Drizzle Studio
```

## Architecture

### Route groups

The app uses Next.js route groups for role-based layouts:

- `(auth)/` — Sign-in, sign-up, forgot-password, verify-email (split-panel layout, no auth required)
- `(customer)/` — Dashboard, repairs, payments, profile, notifications (requires auth via `requireAuth()`)
- `(admin)/admin/` — Admin dashboard with sidebar (requires admin role via `requireRole(["admin"])`)

Both `(customer)` and `(admin)` layouts export `dynamic = "force-dynamic"` to prevent static prerendering.

### Auth pattern

- **Server-side:** Use helpers from `lib/auth-utils.ts`: `getSession()`, `requireAuth()`, `requireRole(roles)`, `requireOwnership(ownerId)`. These read headers and redirect on failure.
- **Client-side:** Use `useAuth()` hook from `hooks/use-auth.ts`, which wraps Better Auth's `useSession()`.
- **API route:** Auth is mounted as a catch-all at `app/api/auth/[...all]/route.ts` via `toNextJsHandler(auth)`.

### Data layer

- **Schema:** `lib/db/schema.ts` — All Drizzle table definitions, enums, relations, and inferred types (`User`, `RepairRequest`, etc.)
- **Queries:** `lib/db/queries/` — Reusable query functions (repairs, payments, notifications, reviews). Always filter soft-deleted records with `isNull(deletedAt)`.
- **Validators:** `lib/validators/` — Zod schemas for form validation (repair, profile, review)
- **Server actions:** `actions/` — `"use server"` functions that validate input via Zod, check auth, call query functions, and return `ActionResult<T>`.
- **DB client:** `lib/db/index.ts` — Lazy-initialized Neon client via Proxy (never fails at import time).

### Server action return type

All server actions return `ActionResult<T>`:

```typescript
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };
```

### Environment variables

Validated lazily via Zod in `lib/env.ts`. Validation is skipped when `SKIP_ENV_VALIDATION=1` or `NODE_ENV=test`. Required vars: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `POLAR_ACCESS_TOKEN`, `POLAR_WEBHOOK_SECRET`, `POLAR_PRODUCT_ID`, `BLOB_READ_WRITE_TOKEN`, `NEXT_PUBLIC_APP_URL`.

## Conventions

### Path alias

Use `@/` for all imports (maps to project root): `import { db } from "@/lib/db"`.

### Monetary values

All monetary amounts are stored in **cents** (integers). Display using `formatCurrency()` from `lib/utils.ts`, which formats as ZAR (South African Rand).

### Dates/times

Format dates with `formatDateSAST()` from `lib/utils.ts` — uses `Africa/Johannesburg` timezone (UTC+2, no DST).

### CSS class merging

Use `cn()` from `lib/utils.ts` (clsx + tailwind-merge) for conditional Tailwind classes.

### Logging

Use `logger` from `lib/logger.ts` instead of raw `console.*` calls. Outputs JSON in production, coloured human-readable format in dev.

### Unused variables

Prefix with underscore (`_variable`) to suppress ESLint warnings.

### Test structure

Tests live in `__tests__/` directories adjacent to the code they test. The setup file (`vitest.setup.ts`) mocks `next/cache` and `next/headers` globally. Vitest globals are enabled — no need to import `describe`/`it`/`expect`.

### Motion components

Reusable animation components live in `components/motion/` (AnimatedText, ScrollReveal, MagneticButton, etc.). Use Framer Motion for animations.

### Design system

The color palette uses oklch: Electric Blue (primary), Vivid Violet (secondary), Hot Coral (accent). Base radius is `1rem`. shadcn/ui uses the `new-york` style variant.
