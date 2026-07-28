# KitFix — AI Jersey Repair Concierge 🇿🇦

South Africa's simplest jersey repair service. Customers message on WhatsApp/Telegram, AI handles intake, and the admin manages jobs on a clean Kanban board.

## Architecture

```
Customer (Telegram/WhatsApp)
    ↓
🧠 AI Concierge (Hermes Agent Skill)
    → Vision AI analyzes damage
    → Generates quote
    → Creates job in Convex DB
    ↓
🖥️ Web App (Next.js + Convex)
    → Landing page with WhatsApp CTA
    → Admin login (env var password)
    → Real-time Kanban (New → In Repair → Ready → Done)
    → Job detail view
```

## Stack

| Layer | Tech |
|---|---|
| AI Brain | Hermes Agent (kitfix-concierge skill) |
| Messaging | Telegram (via Hermes Gateway) + WhatsApp Cloud API |
| Web App | Next.js 16 + Tailwind CSS 4 |
| Database | Convex (real-time) |
| Styling | Dark theme (#0A0A0B base, #00E859 accent) |
| Deploy | Vercel |

## Quick Start

```bash
npm install
npx convex dev      # Interactive — creates Convex project
npm run dev         # http://localhost:3000
```

## What We Cut

- ❌ 11-stage pipeline → **4 kanban columns**
- ❌ 50+ pages → **6 pages**
- ❌ JWT auth proxy → **1 env var password**
- ❌ Polar.sh, Courier Guy, GSAP, PWA, voice notes
- ❌ 49KB architecture plan → **2-page spec**

## Phase 2 Progress

- [x] Landing page with WhatsApp CTA
- [x] Admin login (env var password)
- [x] Kanban board (New → In Repair → Ready → Done)
- [x] Job detail view with notes
- [x] Convex schema + mutations/queries
- [x] API bridge (`/api/concierge`)
- [x] `kitfix-concierge` Hermes skill
- [ ] WhatsApp Cloud API setup (needs Meta Business)
- [ ] n8n notification workflows
- [ ] Delivery/collection logic

## Files

| File | What |
|---|---|
| `app/page.tsx` | Landing page |
| `app/admin/` | Admin area (login, kanban, job detail) |
| `app/api/concierge/` | API bridge for Hermes skill |
| `convex/` | Convex schema, mutations, queries |
| `lib/admin-auth.ts` | Env var password auth |
| `components/providers.tsx` | Convex provider |
