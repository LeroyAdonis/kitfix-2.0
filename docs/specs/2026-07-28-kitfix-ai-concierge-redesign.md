# KitFix AI Concierge Redesign

> **Date:** 2026-07-28
> **Status:** Approved architecture
> **Excalidraw:** https://excalidraw.com/#json=Na5bwy7ShEE8RT_NQu8-j,Iw8WQ_odhNAesPuRQNxSrw

## Overview

KitFix is being rebuilt as an **AI-first jersey repair service**. The core insight: customers should never need to touch a web app. Instead, they interact with an AI concierge via WhatsApp/Telegram — snap a photo, get an instant quote, confirm, and receive updates until their jersey is ready.

The web app becomes a minimal admin tool for the repair team, and a simple landing page for discovery.

---

## Architecture

### Three-Layer Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   👤 CUSTOMER ZONE                       │
│  WhatsApp / Telegram  →  Upload Photos  →  Status Updates│
│  Simple EFT / PayFast payment                            │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              🧠 AI CONCIERGE LAYER (zahra VPS)           │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────┐      │
│  │ Hermes   │→ │ AI Concierge │→ │ n8n Workflows │      │
│  │ Gateway  │  │ Skill        │  │               │      │
│  └──────────┘  └──────────────┘  └───────┬───────┘      │
│  ┌──────────┐  ┌──────────────┐          │              │
│  │WhatsApp  │  │ AI Tools     │          │              │
│  │Cloud API │  │(Vision, etc) │          │              │
│  └──────────┘  └──────────────┘          │              │
└──────────────────────────────────────────┼──────────────┘
                                           │
                                           ▼
┌─────────────────────────────────────────────────────────┐
│              🛠️ ADMIN LAYER (Vercel)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ Landing Page │  │ Kanban Board │  │ Simple DB    │   │
│  │ (Next.js)    │  │New→Ready→Done│  │Jobs+Customers│   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Customer interface | WhatsApp/Telegram | Zero install, familiar, always-on |
| AI platform | Hermes Gateway + n8n | Existing stack on zahra, no new infra |
| Web app scope | Landing + Kanban only | No e-commerce, no auth proxy, no customer dashboards |
| Database | Convex (preferred) or Drizzle | Minimal schema - just Jobs + Customers |
| Payments | EFT + PayFast link | Keep it simple, no Polar.sh |
| Deployment | Vercel (web app) | Already set up, zero config |
| Repair status | 4 stages (New → In Repair → Ready → Done) | Replaces 11-stage pipeline |

---

## What We're Cutting

| Feature | Reason |
|---------|--------|
| ❌ 11-stage pipeline | Too complex. 4 statuses is enough. |
| ❌ E-commerce store (products, cart, variants) | Customers don't buy jerseys here, they repair them. |
| ❌ Polar.sh payments | Too heavy. EFT/PayFast link is simpler for SA. |
| ❌ Courier Guy locker API | Out of scope for MVP. Manual coordination. |
| ❌ Admin dashboards (users, techs, payments, reviews) | Kanban board + simple job view replaces all. |
| ❌ Customer dashboard (profile, notifications, payments) | All handled via WhatsApp/Telegram concierge. |
| ❌ JWT auth proxy | Admin-only auth. Simple session or password. |
| ❌ Voice notes | Nice-to-have, not core. |
| ❌ PWA Service Worker | Web app is admin-only, doesn't need offline. |
| ❌ Drizzle migrations, Neon DB | If using Convex — schema is managed. |
| ❌ Playwright E2E tests | Out of scope for MVP. |
| ❌ 49KB ARCHITECTURE_PLAN.md | This 2-page spec replaces it. |

---

## Customer Flow (WhatsApp/Telegram)

### Step 1: Initiation
```
Customer: "Hey, my jersey ripped during a match"
AI: "Ah sorry to hear that! 🏉 Can you take a photo of the damage and send it here?"
```

### Step 2: AI Diagnosis & Quote
```
Customer: [sends photo]
AI: [Analyzes via vision AI]
AI: "I can see a torn seam on the shoulder. That's a standard repair — R150.
     Also spotted some loose stitching on the sleeve — I can fix that at no extra cost.
     Ready to proceed? Just say 'yes' and I'll book it in."
```

### Step 3: Booking
```
Customer: "Yes please!"
AI: "Awesome! What name should I put on the job?"
Customer: "Leroy"
AI: "Got it ✅ Job #KF-0042 created. Drop your jersey at our Sandton location
     or I can arrange collection. I'll keep you posted on progress!"
```

### Step 4: Status Updates
```
AI: "🔧 Job #KF-0042 — Your jersey is now IN REPAIR. ETA 3-5 business days."
AI: "✅ Job #KF-0042 — Your repair is complete! Ready for collection.
     View details: [link]"
```

### Step 5: Payment
```
AI: "💰 Your repair of R150 is due. Here's the payment link:
     [PayFast link] or EFT to KitFix, First National Bank, Acc #6234..."
```

---

## Admin Flow (Kanban Web App)

- **Landing page** — Clean, modern page explaining the service with a CTA to WhatsApp
- **Kanban board** — 4 columns: New → In Repair → Ready → Done
- **Job details** — Click a job card to see: customer info, photos, repair notes, status history
- **Status updates** — Admin clicks "Mark as Ready" → AI auto-notifies customer on WhatsApp
- **Simple admin login** — No fancy auth, just a password or magic link

---

## Data Model

```typescript
// Simplified schema — just 2 core tables

interface Job {
  id: string;
  customerId: string;
  description: string;
  damageType: string;       // "torn_seam", "hole", "loose_stitching", etc.
  photoUrls: string[];       // Vercel Blob URLs
  quote: number;             // ZAR cents
  status: "new" | "in_repair" | "ready" | "done";
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Customer {
  id: string;
  name: string;
  phone: string;            // WhatsApp number
  telegramId?: string;      // Telegram chat ID
  preferredChannel: "whatsapp" | "telegram";
  totalJobs: number;
  createdAt: Date;
}
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| AI Brain | Hermes Agent (DeepSeek V4 Flash) |
| Messaging | Hermes Gateway (Telegram) + WhatsApp Cloud API |
| Workflow | n8n on zahra VPS |
| Web App | Next.js 16 + Tailwind + shadcn/ui (dark theme, #00E859) |
| Database | Convex (preferred) or minimal Drizzle |
| File Storage | Vercel Blob (photos) |
| Payments | PayFast link + EFT details |
| Deployment | Vercel (web app) |
| Hosting | VPS zahra (AI layer) |

---

## What Stays from Current KitFix

- ✅ Next.js 16 + App Router setup
- ✅ Tailwind CSS + shadcn/ui components
- ✅ Dark premium theme
- ✅ Vercel deployment config
- ✅ ZAR cents convention
- ✅ South African context (timezone, currency)

---

## MVP Scope

### Phase 1 — Foundation
1. Landing page (clean, modern, WhatsApp CTA)
2. Kanban board (New → In Repair → Ready → Done)
3. Job creation + viewing
4. Simple admin login

### Phase 2 — AI Concierge
5. Hermes Gateway skill for KitFix intake
6. Vision AI for damage diagnosis
7. n8n workflow: intake → quote → book → notify
8. WhatsApp API integration

### Phase 3 — Polish
9. Payment links
10. Photo upload via WhatsApp
11. Status update notifications
12. Customer history

---

## Resolved Decisions

| Question | Decision |
|----------|----------|
| Database | **Convex** — simpler schema, real-time kanban, no migration overhead |
| Admin auth | **Env var password** for MVP → upgrade to Better Auth when team grows |
| WhatsApp API | **WhatsApp Cloud API** (free for SA service conversations) |
| Delivery/Collection | **Phase 3** — Pudo lockers or hyperlocal pickup |

## Open Questions (Future)

1. Collection/delivery method — Pudo vs hyperlocal vs The Courier Guy


---

*This spec replaces the old 49KB ARCHITECTURE_PLAN.md. The goal is simplicity, AI-first experience, and getting out of the customer's way.*
