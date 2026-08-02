# KitFix AI Concierge — Phase 1 Implementation Plan

> **For Hermes:** Use subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Strip the old KitFix codebase down to a clean foundation: landing page + admin login + Kanban board for managing repair jobs.

**Architecture:** Next.js 16 App Router + Convex (real-time DB) + shadcn/ui dark theme. Admin protected by env var password. No authentication system, no e-commerce, no complex pipeline.

**Tech Stack:** Next.js 16, React 19, Convex, Tailwind CSS 4, shadcn/ui (new-york), lucide-react, framer-motion

---

## Global Constraints

- All monetary values in ZAR cents (integers, as before)
- Dates/times in SAST (Africa/Johannesburg, UTC+2)
- Dark theme: `#0A0A0B` background, `#00E859` accent green
- Use `cn()` from shadcn for class merging (clsx + tailwind-merge)
- Path alias `@/` maps to project root
- No server actions or API routes on first pass — Convex mutations handle all writes (avoids the auth proxy complexity)
- Admin password stored as `ADMIN_PASSWORD` env var (bcrypt optional — plain text is fine for MVP single-user)
- All pages are server-rendered where possible; Kanban uses Convex's `useQuery` for real-time

---

### Task 1: Strip the Codebase

**Files:**
- Modify: `package.json` — strip deps
- Delete: Full route groups, actions, lib, components, drizzle/, scripts/, playwright configs, proxy, e2e/, .github/workflows

**Interfaces:**
- Consumes: N/A — first task
- Produces: Clean project skeleton that can boot with `npm run dev`

- [ ] **Step 1: Strip dependencies**

Remove from `package.json`:
```json
// REMOVE these lines (keep next, react, tailwind, shadcn, lucide, framer-motion)
"@gsap/react", "gsap",
"@neondatabase/serverless", "drizzle-orm", "drizzle-kit", "pg",
"@polar-sh/nextjs", "@polar-sh/sdk",
"@vercel/blob",
"bcryptjs", "jose",
"resend",
"@playwright/test",
"@next/swc-wasm-nodejs", "lightningcss-wasm", "enhanced-resolve",
"dotenv",
```

Also remove scripts: `db:*`, `test:*`, `test:e2e`, `postinstall`, `typecheck`

- [ ] **Step 2: Nuke old route groups**

```bash
rm -rf app/\(auth\) app/\(customer\) app/\(admin\) app/\(store\) app/api app/contact app/error.tsx app/loading.tsx app/not-found.tsx app/~offline
```

- [ ] **Step 3: Nuke old modules**

```bash
rm -rf actions/ components/ hooks/ lib/ types/ drizzle/ scripts/ e2e/ e2e-results/ .github/ workflows/ proxy.ts proxy.test.ts
```

- [ ] **Step 4: Delete config files**

```bash
rm -f playwright.config.ts vitest.config.ts vitest.setup.ts drizzle.config.ts .scripts/postinstall.js
```

- [ ] **Step 5: Install fresh deps**

```bash
npm install
```

- [ ] **Step 6: Verify the project boots**

```bash
npm run dev
```
Expected: Next.js starts without errors (even if there are no pages yet).

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "chore: strip old KitFix codebase to clean foundation"
```

---

### Task 2: Set Up Convex

**Files:**
- Create: `convex/schema.ts`
- Create: `convex/jobs.ts` (mutation + query)
- Create: `convex/customers.ts` (mutation + query)
- Create: `convex/auth.ts` (simple config)
- Create: `convex/README.md`

**Interfaces:**
- Consumes: Clean project skeleton from Task 1
- Produces: `convex/` directory with schema, mutations, queries ready for Tasks 4-6

- [ ] **Step 1: Install Convex**

```bash
npm install convex
npx convex dev
```
Follow the CLI prompts to create a new Convex project (or connect existing one).

- [ ] **Step 2: Define schema**

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  jobs: defineTable({
    customerName: v.string(),
    customerPhone: v.string(),
    customerChannel: v.union(v.literal("whatsapp"), v.literal("telegram")),
    description: v.string(),
    damageType: v.optional(v.string()),
    photoUrls: v.array(v.string()),
    quote: v.optional(v.number()),    // ZAR cents
    status: v.union(
      v.literal("new"),
      v.literal("in_repair"),
      v.literal("ready"),
      v.literal("done")
    ),
    adminNotes: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_phone", ["customerPhone"]),
});
```

- [ ] **Step 3: Create seed mutation & queries**

Create basic `convex/jobs.ts`:
```typescript
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Queries
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("jobs").order("desc").collect();
  },
});

export const listByStatus = query({
  args: { status: v.union(v.literal("new"), v.literal("in_repair"), v.literal("ready"), v.literal("done")) },
  handler: async (ctx, args) => {
    return await ctx.db.query("jobs").withIndex("by_status", q => q.eq("status", args.status)).collect();
  },
});

export const get = query({
  args: { id: v.id("jobs") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Mutations
export const create = mutation({
  args: {
    customerName: v.string(),
    customerPhone: v.string(),
    description: v.string(),
    photoUrls: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("jobs", {
      ...args,
      customerChannel: "whatsapp",
      status: "new",
      quote: undefined,
      adminNotes: undefined,
    });
  },
});

export const updateStatus = mutation({
  args: { id: v.id("jobs"), status: v.union(v.literal("new"), v.literal("in_repair"), v.literal("ready"), v.literal("done")) },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const updateNotes = mutation({
  args: { id: v.id("jobs"), notes: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { adminNotes: args.notes });
  },
});
```

- [ ] **Step 4: Verify**

```bash
npx convex dev
```
Expected: Schema syncs, no errors.

- [ ] **Step 5: Seed a test job**

Run a quick seed via Convex dashboard or a seed script.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: add Convex schema with jobs table"
```

---

### Task 3: Admin Login

**Files:**
- Create: `app/admin/login/page.tsx`
- Create: `app/admin/layout.tsx`
- Create: `lib/admin-auth.ts`
- Modify: `.env.local` — add `ADMIN_PASSWORD`

**Interfaces:**
- Consumes: Clean project from Task 1
- Produces: Protected `/admin/*` routes behind env var password

- [ ] **Step 1: Install bcryptjs for password comparison**

```bash
npm install bcryptjs
npm install -D @types/bcryptjs
```

- [ ] **Step 2: Create admin auth utility**

```typescript
// lib/admin-auth.ts
import { cookies } from "next/headers";

const ADMIN_COOKIE = "kitfix_admin";
const SESSION_DURATION = 60 * 60 * 24 * 7; // 7 days

export async function checkAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.has(ADMIN_COOKIE);
}

export async function login(password: string): Promise<boolean> {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;

  const valid = password === adminPassword;
  if (valid) {
    const cookieStore = await cookies();
    cookieStore.set(ADMIN_COOKIE, "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_DURATION,
    });
  }
  return valid;
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
}
```

- [ ] **Step 3: Create login page**

```typescript
// app/admin/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.push("/admin");
    } else {
      setError("Invalid password");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0B]">
      <form onSubmit={handleSubmit} className="bg-[#1a1a2e] p-8 rounded-xl space-y-4 w-80">
        <h1 className="text-xl font-bold text-white">KitFix Admin</h1>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-[#2b2b44] text-white border border-[#333] focus:border-[#00E859] outline-none"
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button type="submit" className="w-full py-2 rounded-lg bg-[#00E859] text-black font-semibold hover:bg-[#00c94d] transition-colors">
          Login
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 4: Create admin layout with auth check**

```typescript
// app/admin/layout.tsx
import { redirect } from "next/navigation";
import { checkAdmin } from "@/lib/admin-auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) redirect("/admin/login");
  return <>{children}</>;
}
```

- [ ] **Step 5: Create login API route**

Create `app/api/admin/login/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { login } from "@/lib/admin-auth";

export async function POST(req: Request) {
  const { password } = await req.json();
  const ok = await login(password);
  if (ok) return NextResponse.json({ success: true });
  return NextResponse.json({ error: "Invalid" }, { status: 401 });
}
```

- [ ] **Step 6: Add ADMIN_PASSWORD to env**

```bash
echo "ADMIN_PASSWORD=kitfix123" >> .env.local
```

- [ ] **Step 7: Verify**

Navigate to `/admin` → should redirect to `/admin/login`.
Enter password → should redirect to `/admin` (even if empty, no 404).

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: add admin login with env var password"
```

---

### Task 4: Landing Page

**Files:**
- Create: `app/page.tsx` (new landing)
- Create: `app/layout.tsx` (root layout with dark theme)
- Create: `app/globals.css`

**Interfaces:**
- Consumes: Clean project from Task 1
- Produces: Public-facing landing page with WhatsApp CTA

- [ ] **Step 1: Root layout**

```typescript
// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KitFix — Jersey Repair Specialists",
  description: "Get your sports jerseys repaired fast. Snap a photo, get a quote on WhatsApp, and we'll fix it.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0A0A0B] text-white antialiased">{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: Global CSS**

```css
/* app/globals.css */
@import "tailwindcss";
```

- [ ] **Step 3: Landing page**

The page should have:
- Hero section: "Your Jersey, Good As New. 🏉" with subtext
- How it works: 3 steps (Snap → Quote → Repair)
- CTA button: "Start on WhatsApp" → opens `https://wa.me/...`
- Pricing section (simple: R150 basic repair, R250 complex)
- Footer with contact info

Keep it clean. Dark background (#0A0A0B), green accent (#00E859), white text. One page, no scrolling complexity. Mobile-first.

- [ ] **Step 4: Verify**

```bash
npm run dev
```
Navigate to `/`. Page renders with hero, how-it-works, pricing, CTA.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add landing page with WhatsApp CTA"
```

---

### Task 5: Kanban Board

**Files:**
- Create: `app/admin/page.tsx` (kanban view)
- Create: `components/kanban/kanban-board.tsx`
- Create: `components/kanban/kanban-column.tsx`
- Create: `components/kanban/job-card.tsx`
- Create: `components/ui/` (shadcn components if needed)

**Interfaces:**
- Consumes: `convex/jobs.ts` (listByStatus, updateStatus mutations)
- Produces: Real-time kanban board at `/admin`

- [ ] **Step 1: Set up Convex provider**

Create `components/providers.tsx`:
```typescript
"use client";
import { ConvexProvider, ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function Providers({ children }: { children: React.ReactNode }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
```

Wrap in root layout (or admin layout).

- [ ] **Step 2: Create Kanban component**

4 columns: New, In Repair, Ready, Done. Each column shows job cards from Convex query.

```typescript
// components/kanban/kanban-board.tsx
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { KanbanColumn } from "./kanban-column";

const COLUMNS = [
  { id: "new", label: "New", color: "#a5d8ff" },
  { id: "in_repair", label: "In Repair", color: "#ffd43b" },
  { id: "ready", label: "Ready", color: "#b2f2bb" },
  { id: "done", label: "Done", color: "#9775fa" },
] as const;

export function KanbanBoard() {
  return (
    <div className="grid grid-cols-4 gap-4 p-6">
      {COLUMNS.map((col) => (
        <KanbanColumn key={col.id} status={col.id} label={col.label} color={col.color} />
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Create column component**

Each column queries `listByStatus` and renders job cards.

- [ ] **Step 4: Create job card component**

Each card shows: customer name, description, photo thumbnail, time since created.
Clicking a card navigates to `/admin/jobs/[id]`.

- [ ] **Step 5: Add status change buttons**

On each card: quick-action buttons to move to next column (New → In Repair etc.) using `updateStatus` mutation.

- [ ] **Step 6: Style it dark**

Dark container backgrounds (`#1a1a2e`), subtle borders, green accent for interactive elements.

- [ ] **Step 7: Verify**

Navigate to `/admin` → see 4 columns. If seed data exists, see cards. Can click to move status.

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: add real-time kanban board with Convex"
```

---

### Task 6: Job Detail View

**Files:**
- Create: `app/admin/jobs/[id]/page.tsx`
- Create: `components/kanban/job-detail.tsx`

**Interfaces:**
- Consumes: `convex/jobs.ts` (get, updateNotes)
- Produces: Detailed job view at `/admin/jobs/[id]`

- [ ] **Step 1: Job detail page**

Displays:
- Customer name & phone
- Damage description
- Photos (if any) — just URLs for now
- Quote (if set)
- Current status (with change button)
- Admin notes (editable textarea)
- Status history (timeline from created → status changes)

- [ ] **Step 2: Status update mutation in detail**

Same `updateStatus` mutation from Task 5, reused here.

- [ ] **Step 3: Notes editing**

Inline editable textarea that saves via `updateNotes` mutation.

- [ ] **Step 4: Back to Kanban link**

Simple "← Back to Board" link at top.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add job detail view with notes and status management"
```

---

## Verification Plan

After all tasks complete:

1. `npm run dev` — boots without errors
2. `/` — landing page renders cleanly
3. `/admin` — redirects to login
4. `/admin/login` — enter admin password → redirects to kanban
5. `/admin` — 4 columns visible, can move cards
6. `/admin/jobs/[id]` — detail view loads, can update notes + status
7. `npm run build` — production build passes

## Notes

- The old components/, lib/, app/* directories are mostly nuked during Task 1, so no leftover technical debt
- Convex replaces both Drizzle/Neon for DB and any server actions for writes
- The env var auth is MVP-only; upgrade path to Better Auth exists when team grows
- All pages use the dark theme (#0A0A0B base, #00E859 accent) consistent with Leroy's brand
