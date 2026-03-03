<div align="center">

# ⚽ KitFix 2.0

**Jersey Repair Service — Built for South Africa**

[![CI](https://github.com/{owner}/{repo}/actions/workflows/ci.yml/badge.svg)](https://github.com/{owner}/{repo}/actions/workflows/ci.yml)

![Next.js 16](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript)
![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)
![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-PostgreSQL-C5F74F?logo=drizzle)
![PWA](https://img.shields.io/badge/PWA-enabled-5A0FC8)

</div>

---

## 📋 Overview

KitFix 2.0 is a progressive web app for submitting, tracking, and managing jersey repair requests. Customers upload photos of damaged jerseys, receive AI-powered damage assessments and cost estimates, pay online, and track their repair through a five-stage pipeline — all from their phone.

### Key Features

- **Repair Submissions** — Multi-step form with photo upload and damage description
- **AI Damage Assessment** — Client-side analysis via Puter.js for instant cost estimates
- **Status Tracking** — Real-time 5-stage pipeline: Submitted → Reviewed → In Repair → Quality Check → Shipped
- **Payments** — Secure checkout powered by Polar.sh
- **Admin Dashboard** — Manage requests, assign technicians, update statuses
- **Notifications** — In-app notification system for repair updates
- **PWA** — Installable, works offline, mobile-first

### 🇿🇦 South African Context

- **Timezone:** SAST (UTC+2) — all timestamps and scheduling
- **Currency:** ZAR (South African Rand)
- **Languages:** Supports all 11 official languages

---

## 🛠️ Tech Stack

| Layer | Technology |
| --- | --- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, React Server Components) |
| **UI** | [React 19](https://react.dev/), [Tailwind CSS 4](https://tailwindcss.com/) (OKLCH color system), [shadcn/ui](https://ui.shadcn.com/), [Radix UI](https://www.radix-ui.com/) |
| **Animation** | [Framer Motion](https://www.framer.com/motion/) |
| **Auth** | [Better Auth](https://www.better-auth.com/) (admin plugin, Polar plugin) |
| **Database** | [Neon PostgreSQL](https://neon.tech/) via [Drizzle ORM](https://orm.drizzle.team/) |
| **Payments** | [Polar.sh](https://polar.sh/) |
| **AI** | [Puter.js](https://puter.com/) (client-side damage assessment) |
| **Storage** | [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) |
| **Validation** | [Zod 4](https://zod.dev/) |
| **Testing** | [Vitest](https://vitest.dev/), [Playwright](https://playwright.dev/) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 22+** and npm
- A [Neon](https://neon.tech/) PostgreSQL database
- A [Polar.sh](https://polar.sh/) account (for payments)
- A [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) store (for photo uploads)

### Installation

```bash
# Clone the repository
git clone https://github.com/{owner}/{repo}.git
cd kitfix-2.0

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials (see Environment Variables below)

# Run database migrations
npm run db:migrate

# Start the development server
npm run dev
```

The app will be running at [http://localhost:3000](http://localhost:3000).

### Environment Variables

Copy `.env.example` and fill in the values:

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Random 32+ character secret for session signing |
| `BETTER_AUTH_URL` | App base URL (`http://localhost:3000` for dev) |
| `POLAR_ACCESS_TOKEN` | Polar.sh personal access token |
| `POLAR_WEBHOOK_SECRET` | Polar.sh webhook signing secret |
| `POLAR_PRODUCT_ID` | Polar.sh product ID for repair payments |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob read/write token |
| `NEXT_PUBLIC_APP_URL` | Public-facing app URL |

---

## 📁 Project Structure

```
kitfix-2.0/
├── app/                    # Next.js App Router pages & API routes
│   ├── (auth)/             #   Auth pages (sign-in, sign-up, forgot-password)
│   ├── (customer)/         #   Customer portal (dashboard, repairs, payments, profile)
│   ├── (admin)/            #   Admin portal (requests, users, technicians, payments)
│   ├── api/                #   API routes (auth, upload, webhooks)
│   └── ~offline/           #   PWA offline fallback
├── actions/                # Server Actions (repairs, payments, admin, etc.)
├── components/             # React components
│   ├── ui/                 #   shadcn/ui primitives (button, card, dialog, etc.)
│   ├── layout/             #   Navigation, sidebar, header, footer
│   ├── forms/              #   Repair request, profile, review forms
│   ├── repair/             #   Repair-specific (status tracker, photo gallery)
│   ├── admin/              #   Admin dashboard components
│   ├── ai/                 #   AI damage analyzer & cost estimator
│   ├── motion/             #   Framer Motion animations
│   ├── notifications/      #   Notification bell
│   ├── pwa/                #   Service worker registration
│   └── shared/             #   Empty states, skeletons, uploaders
├── lib/                    # Core utilities & business logic
│   ├── db/                 #   Drizzle schema, queries, connection
│   ├── validators/         #   Zod validation schemas (with tests)
│   ├── auth.ts             #   Better Auth server config
│   ├── auth-client.ts      #   Better Auth client config
│   ├── logger.ts           #   Structured logging
│   ├── polar.ts            #   Polar.sh client
│   └── upload.ts           #   Vercel Blob upload helpers
├── types/                  # TypeScript type definitions
├── drizzle/                # Generated database migrations
├── public/                 # Static assets, PWA manifest, service worker
└── docs/                   # Additional documentation
```

---

## ⌨️ Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Lint with ESLint |
| `npm run typecheck` | Type-check with `tsc --noEmit` |
| `npm run test` | Run tests in watch mode (Vitest) |
| `npm run test:run` | Run tests once |
| `npm run db:generate` | Generate Drizzle migration files |
| `npm run db:migrate` | Apply database migrations |
| `npm run db:push` | Push schema changes directly (dev only) |
| `npm run db:studio` | Open Drizzle Studio (database GUI) |

---

## 🏗️ Architecture

KitFix follows a **server-first** architecture using Next.js App Router with React Server Components by default. Client components (`'use client'`) are used only where interactivity is required.

### Repair Pipeline

Every repair request flows through five stages:

```
Submitted → Reviewed → In Repair → Quality Check → Shipped
```

Each transition is recorded in the `statusHistory` table and triggers a notification to the customer.

### Role-Based Access

| Role | Access |
| --- | --- |
| **Customer** | Submit repairs, track status, make payments, leave reviews |
| **Technician** | View assigned repairs, update repair status |
| **Admin** | Full access — manage all requests, users, technicians, payments |

### Data Model

Core tables managed by Drizzle ORM:

- `user`, `session`, `account`, `verification` — Better Auth managed
- `repairRequests` — Repair orders with status, cost, damage info
- `repairPhotos` — Uploaded images (Vercel Blob URLs)
- `statusHistory` — Audit trail of status transitions
- `payments` — Polar.sh payment records
- `reviews` — Customer repair reviews
- `notifications` — In-app notification records

> 📖 See [ARCHITECTURE_PLAN.md](./ARCHITECTURE_PLAN.md) for the full architecture specification.

---

## 🌐 Deployment

KitFix is designed for deployment on **Vercel**.

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deployment Checklist

1. Set all environment variables in the Vercel dashboard
2. Provision a Neon PostgreSQL database and set `DATABASE_URL`
3. Create a Vercel Blob store and set `BLOB_READ_WRITE_TOKEN`
4. Configure Polar.sh webhooks to point to `https://your-domain.com/api/webhooks/polar`
5. Set `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` to your production URL
6. Run `npm run db:migrate` against the production database

---

## 🧪 Testing

```bash
# Run all tests once
npm run test:run

# Run tests in watch mode
npm run test

# Type-check
npm run typecheck
```

Tests are colocated with source code in `__tests__/` directories (e.g. `lib/validators/__tests__/`).

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).
