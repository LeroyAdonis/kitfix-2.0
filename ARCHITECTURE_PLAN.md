# KitFix 2.0 — Complete Architecture Plan

> Jersey Repair Service PWA — Next.js App Router, Better Auth, Neon/Drizzle, Polar.sh, Puter.js

---

## Summary

KitFix 2.0 is a greenfield Progressive Web App where customers submit jersey repair requests with photos, track order status through a 5-stage pipeline, and pay via Polar.sh. Admins and technicians manage incoming work via a dashboard. AI (Puter.js) provides client-side damage assessment and cost estimation. The stack is Next.js App Router + Better Auth (with Drizzle adapter and admin/polar plugins) + Neon Postgres + Polar.sh payments + Puter.js AI. This plan covers all 9 architectural areas with concrete recommendations, verified API patterns, and flagged open questions.

---

## 1. Database Schema

### Recommendation

Use a single `users` table extended by Better Auth's core tables (`user`, `session`, `account`, `verification`), plus application-specific tables. Better Auth manages `user`, `session`, `account`, and `verification` — we extend with a `role` column on the user table and add application tables.

#### Core Tables (Better Auth Managed)

Better Auth with Drizzle adapter auto-generates these:
- **user** — `id`, `name`, `email`, `emailVerified`, `image`, `role`, `banned`, `banReason`, `banExpires`, `createdAt`, `updatedAt`
- **session** — `id`, `userId`, `token`, `expiresAt`, `ipAddress`, `userAgent`
- **account** — `id`, `userId`, `providerId`, `providerAccountId`, `accessToken`, `refreshToken`, `expiresAt`
- **verification** — `id`, `identifier`, `token`, `expiresAt`

#### Application Tables

```
repairRequests
├── id: text (cuid2, PK)
├── customerId: text (FK → user.id)
├── technicianId: text (FK → user.id, nullable)
├── jerseyDescription: text (team name, player, size, material)
├── jerseyBrand: text (nullable)
├── jerseySize: varchar(10)
├── damageType: enum('tear', 'hole', 'stain', 'fading', 'logo_damage', 'seam_split', 'other')
├── damageDescription: text
├── urgencyLevel: enum('standard', 'rush', 'emergency')
├── currentStatus: enum('submitted','reviewed','in_repair','quality_check','shipped')
├── estimatedCost: integer (cents, nullable — set after review)
├── finalCost: integer (cents, nullable)
├── aiDamageAssessment: jsonb (nullable — Puter.js result)
├── adminNotes: text (nullable)
├── trackingNumber: varchar(100) (nullable)
├── shippingAddress: jsonb
├── deletedAt: timestamp (nullable — soft delete)
├── createdAt: timestamp (defaultNow)
├── updatedAt: timestamp ($onUpdate)

repairPhotos
├── id: text (cuid2, PK)
├── repairRequestId: text (FK → repairRequests.id, CASCADE)
├── url: text (stored URL)
├── thumbnailUrl: text (nullable)
├── originalFilename: text
├── mimeType: varchar(50)
├── sizeBytes: integer
├── photoType: enum('before', 'during', 'after')
├── uploadedBy: text (FK → user.id)
├── createdAt: timestamp (defaultNow)

statusHistory
├── id: text (cuid2, PK)
├── repairRequestId: text (FK → repairRequests.id, CASCADE)
├── fromStatus: enum (nullable — null for initial creation)
├── toStatus: enum
├── changedBy: text (FK → user.id)
├── notes: text (nullable)
├── createdAt: timestamp (defaultNow)

payments
├── id: text (cuid2, PK)
├── repairRequestId: text (FK → repairRequests.id)
├── customerId: text (FK → user.id)
├── polarCheckoutId: text (unique)
├── polarOrderId: text (nullable, unique — set by webhook)
├── amount: integer (cents)
├── currency: varchar(3) (default 'usd')
├── status: enum('pending', 'completed', 'failed', 'refunded')
├── paidAt: timestamp (nullable)
├── refundedAt: timestamp (nullable)
├── metadata: jsonb (nullable)
├── createdAt: timestamp (defaultNow)
├── updatedAt: timestamp ($onUpdate)

reviews
├── id: text (cuid2, PK)
├── repairRequestId: text (FK → repairRequests.id, UNIQUE)
├── customerId: text (FK → user.id)
├── rating: integer (1-5, CHECK constraint)
├── comment: text (nullable)
├── technicianResponse: text (nullable)
├── createdAt: timestamp (defaultNow)
├── updatedAt: timestamp ($onUpdate)

notifications
├── id: text (cuid2, PK)
├── userId: text (FK → user.id)
├── type: enum('status_update', 'payment', 'review_request', 'assignment', 'system')
├── title: text
├── message: text
├── repairRequestId: text (FK, nullable)
├── isRead: boolean (default false)
├── createdAt: timestamp (defaultNow)
```

#### Indexes

- `repairRequests`: idx on `customerId`, `technicianId`, `currentStatus`, `createdAt`
- `repairPhotos`: idx on `repairRequestId`
- `statusHistory`: idx on `repairRequestId`, `createdAt`
- `payments`: idx on `repairRequestId`, `polarCheckoutId`, `polarOrderId`
- `reviews`: unique idx on `repairRequestId`
- `notifications`: idx on `userId` + `isRead`, `createdAt`

### Tradeoff Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Roles | Single `role` column on user table with enum (`customer`, `admin`, `technician`) | Better Auth's admin plugin expects a `role` field on the user. 3 roles is too few to warrant a join table. |
| Photos | Dedicated `repairPhotos` table (not polymorphic) | Photos always belong to repair requests. Dedicated table gives clean FK, simple queries, and type safety for `photoType`. |
| Audit trail | Separate `statusHistory` table | Full history with who/when/notes. Denormalized `currentStatus` on `repairRequests` for fast reads. |
| Soft deletes | `deletedAt` on `repairRequests` only | Repair requests have financial/legal implications. Other tables use cascade deletes. |
| Money | Stored in cents as integers | Avoids floating-point precision issues. |
| IDs | `cuid2` text IDs | URL-safe, collision-resistant, no sequential leaking. Better Auth uses its own ID generation for its tables. |

### Open Questions

1. **🔴 Photo storage backend**: Where do uploaded photos go? Options: (a) Vercel Blob, (b) Cloudflare R2, (c) AWS S3, (d) Uploadthing. **Recommendation: Vercel Blob** — simplest with Next.js, generous free tier. If self-hosting, use Cloudflare R2.
2. **Shipping address structure**: Should `shippingAddress` be structured (separate columns) or JSONB? **Recommendation: JSONB** — simpler for MVP, can normalize later if needed for search/reporting.

### Risks/Edge Cases

- Better Auth's `@better-auth/cli generate` may scaffold tables with slightly different column names. Run the CLI first, then extend the generated schema.
- The `damageType` enum may need extension. Use a Drizzle `pgEnum` so new values can be added via migrations.
- `estimatedCost` vs `finalCost` discrepancy — business logic must handle cases where final cost differs from estimate (triggers customer notification).

---

## 2. Project Structure

### Recommendation

```
kitfix-2.0/
├── app/
│   ├── layout.tsx                    # Root layout (providers, fonts, metadata)
│   ├── page.tsx                      # Landing page (public)
│   ├── loading.tsx                   # Global loading
│   ├── error.tsx                     # Global error boundary
│   ├── not-found.tsx                 # 404 page
│   ├── global-error.tsx              # Fatal error UI
│   ├── ~offline/
│   │   └── page.tsx                  # PWA offline fallback
│   │
│   ├── (auth)/                       # Route group: auth pages
│   │   ├── layout.tsx                # Centered card layout
│   │   ├── sign-in/page.tsx
│   │   ├── sign-up/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── verify-email/page.tsx
│   │
│   ├── (customer)/                   # Route group: customer-facing
│   │   ├── layout.tsx                # Customer layout (nav, sidebar)
│   │   ├── dashboard/page.tsx        # Customer home — active orders
│   │   ├── repairs/
│   │   │   ├── page.tsx              # List my repairs
│   │   │   ├── new/page.tsx          # Submit new repair request
│   │   │   └── [id]/
│   │   │       ├── page.tsx          # Repair detail + status tracker
│   │   │       └── review/page.tsx   # Leave a review
│   │   ├── payments/
│   │   │   └── page.tsx              # Payment history
│   │   ├── profile/
│   │   │   └── page.tsx              # Profile settings
│   │   └── notifications/
│   │       └── page.tsx              # Notification center
│   │
│   ├── (admin)/                      # Route group: admin/tech dashboard
│   │   ├── layout.tsx                # Admin layout (sidebar nav)
│   │   ├── admin/
│   │   │   ├── page.tsx              # Admin dashboard (stats, overview)
│   │   │   ├── requests/
│   │   │   │   ├── page.tsx          # All repair requests (filterable table)
│   │   │   │   └── [id]/page.tsx     # Admin repair detail (edit, assign, status)
│   │   │   ├── users/
│   │   │   │   └── page.tsx          # User management
│   │   │   ├── technicians/
│   │   │   │   └── page.tsx          # Technician management + assignment
│   │   │   ├── payments/
│   │   │   │   └── page.tsx          # Payment overview
│   │   │   └── reviews/
│   │   │       └── page.tsx          # Review moderation
│   │
│   └── api/
│       ├── auth/[...all]/route.ts    # Better Auth catch-all handler
│       ├── webhooks/
│       │   └── polar/route.ts        # Polar.sh webhook handler
│       └── upload/route.ts           # Photo upload endpoint
│
├── components/
│   ├── ui/                           # Primitive UI components (shadcn/ui)
│   ├── forms/
│   │   ├── repair-request-form.tsx   # Multi-step repair submission form
│   │   ├── review-form.tsx
│   │   └── profile-form.tsx
│   ├── repair/
│   │   ├── status-tracker.tsx        # Visual order pipeline
│   │   ├── repair-card.tsx           # Repair summary card
│   │   ├── photo-gallery.tsx         # Before/during/after photos
│   │   └── damage-type-badge.tsx
│   ├── admin/
│   │   ├── request-table.tsx         # Admin request listing table
│   │   ├── stats-cards.tsx           # Dashboard KPI cards
│   │   ├── status-updater.tsx        # Status change form
│   │   └── technician-assignment.tsx
│   ├── ai/
│   │   ├── damage-analyzer.tsx       # Puter.js damage assessment
│   │   └── cost-estimator.tsx        # AI cost estimation
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── customer-nav.tsx
│   │   ├── admin-sidebar.tsx
│   │   ├── footer.tsx
│   │   └── mobile-nav.tsx
│   ├── notifications/
│   │   └── notification-bell.tsx
│   └── shared/
│       ├── photo-uploader.tsx        # Drag-and-drop photo upload
│       ├── loading-skeleton.tsx
│       └── empty-state.tsx
│
├── lib/
│   ├── auth.ts                       # Better Auth server config
│   ├── auth-client.ts                # Better Auth client instance
│   ├── db/
│   │   ├── index.ts                  # Drizzle + Neon connection
│   │   ├── schema.ts                 # All Drizzle table definitions
│   │   └── queries/                  # Reusable query functions
│   │       ├── repairs.ts
│   │       ├── payments.ts
│   │       ├── reviews.ts
│   │       └── notifications.ts
│   ├── polar.ts                      # Polar.sh client instance
│   ├── upload.ts                     # File upload utilities
│   ├── validators/                   # Zod schemas
│   │   ├── repair.ts
│   │   ├── review.ts
│   │   └── profile.ts
│   └── utils.ts                      # General utilities (cn, formatCurrency, etc.)
│
├── actions/                          # Server Actions
│   ├── repairs.ts                    # createRepair, updateRepair, cancelRepair
│   ├── admin.ts                      # assignTechnician, updateStatus, updateEstimate
│   ├── reviews.ts                    # submitReview
│   ├── payments.ts                   # initiateCheckout
│   ├── notifications.ts             # markAsRead, markAllRead
│   └── profile.ts                    # updateProfile
│
├── hooks/                            # Client-side hooks
│   ├── use-auth.ts                   # Auth state convenience hook
│   ├── use-notifications.ts          # Notification polling/subscription
│   └── use-upload.ts                 # Upload progress tracking
│
├── types/                            # TypeScript types
│   └── index.ts                      # Shared type definitions + Drizzle infers
│
├── middleware.ts                     # Route protection middleware
├── drizzle.config.ts                 # Drizzle Kit configuration
├── next.config.mjs                   # Next.js + PWA config
├── tailwind.config.ts
├── public/
│   ├── manifest.json                 # PWA manifest
│   ├── sw.js                         # Service worker (generated)
│   ├── icons/                        # PWA icons (192, 512, maskable)
│   └── images/                       # Static images
├── drizzle/                          # Generated migrations
├── .env.local                        # Environment variables
└── package.json
```

### Server vs. Client Component Boundaries

| Layer | Component Type | Rationale |
|-------|---------------|-----------|
| `page.tsx` files | **Server** | Data fetching, auth checks, pass data down |
| `layout.tsx` files | **Server** | Structural, minimal state |
| `forms/*` | **Client** (`'use client'`) | User interaction, form state, validation |
| `components/repair/status-tracker.tsx` | **Server** | Static display of status pipeline |
| `components/ai/*` | **Client** (`'use client'`) | Puter.js runs client-side |
| `components/shared/photo-uploader.tsx` | **Client** (`'use client'`) | Drag-drop, upload progress |
| `components/admin/request-table.tsx` | **Client** (`'use client'`) | Sorting, filtering, pagination |
| `components/notifications/*` | **Client** (`'use client'`) | Polling, real-time updates |

### Open Questions

1. **🟡 Component library**: Use shadcn/ui? **Recommendation: Yes** — it's the de facto standard for Next.js + Tailwind. Copy-paste components, full control.

### Risks/Edge Cases

- Route groups `(auth)`, `(customer)`, `(admin)` do NOT affect URLs. The actual URL paths are determined by folder names inside them.
- The `(admin)` layout must enforce role checks server-side, not just middleware — middleware can be bypassed.

---

## 3. Core API Surface

### Recommendation

Prefer **Server Actions** for all mutations from the Next.js UI. Use **Route Handlers** only for: (a) Better Auth catch-all, (b) webhooks from external services, (c) file uploads. Use **Server Components** for reads.

### Auth Routes (Better Auth Managed)

Better Auth's catch-all at `app/api/auth/[...all]/route.ts` handles:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/sign-up/email` | POST | Email/password registration |
| `/api/auth/sign-in/email` | POST | Email/password login |
| `/api/auth/sign-out` | POST | Sign out, revoke session |
| `/api/auth/session` | GET | Get current session |
| `/api/auth/forgot-password` | POST | Send reset email |
| `/api/auth/reset-password` | POST | Reset password with token |
| `/api/auth/verify-email` | POST | Email verification |

### Server Actions (Internal Mutations)

| Action | File | Auth Required | Roles | Description |
|--------|------|---------------|-------|-------------|
| `createRepairRequest` | `actions/repairs.ts` | ✅ | customer | Create new repair with photos |
| `updateRepairRequest` | `actions/repairs.ts` | ✅ | customer (own) | Edit before review |
| `cancelRepairRequest` | `actions/repairs.ts` | ✅ | customer (own), admin | Cancel request |
| `assignTechnician` | `actions/admin.ts` | ✅ | admin | Assign tech to request |
| `updateRequestStatus` | `actions/admin.ts` | ✅ | admin, technician | Move through pipeline |
| `updateEstimate` | `actions/admin.ts` | ✅ | admin | Set/update cost estimate |
| `addAdminNotes` | `actions/admin.ts` | ✅ | admin, technician | Internal notes |
| `addTrackingNumber` | `actions/admin.ts` | ✅ | admin | Set shipping tracking |
| `initiateCheckout` | `actions/payments.ts` | ✅ | customer | Create Polar checkout session |
| `submitReview` | `actions/reviews.ts` | ✅ | customer | Rate completed repair |
| `respondToReview` | `actions/reviews.ts` | ✅ | admin, technician | Technician response |
| `updateProfile` | `actions/profile.ts` | ✅ | any | Update name, address |
| `markNotificationRead` | `actions/notifications.ts` | ✅ | any | Mark single notification read |
| `markAllNotificationsRead` | `actions/notifications.ts` | ✅ | any | Mark all notifications read |

### Route Handlers (External/Upload)

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `api/auth/[...all]` | GET, POST | N/A | Better Auth handler |
| `api/webhooks/polar` | POST | Webhook secret | Polar payment webhooks |
| `api/upload` | POST | ✅ Session | Photo upload (multipart/form-data) |

### Server Action Request/Response Patterns

All server actions should follow this pattern:
```typescript
// Return type for all actions
type ActionResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }

// Every action:
// 1. Validates session via auth.api.getSession()
// 2. Validates input via Zod schema
// 3. Checks authorization (role + ownership)
// 4. Performs DB operation
// 5. Calls revalidatePath() for affected routes
// 6. Returns ActionResult
```

### Open Questions

1. **🟡 Real-time notifications**: Polling vs. SSE vs. WebSockets? **Recommendation: Polling** (every 30s) for MVP. SSE is better but adds complexity. WebSockets are overkill for this use case.

### Risks/Edge Cases

- Server Actions are POST-only; for read-heavy dashboards with filtering, Server Components with `searchParams` are preferred.
- The upload route handler needs size limits (e.g., 5MB per photo, max 5 photos per request).
- Polar webhooks must verify signature before processing. Use `@polar-sh/nextjs` `Webhooks()` helper.
- Rate limiting on public auth routes — Better Auth has built-in rate limiting config.

---

## 4. Feature Implementation

### 4.1 Repair Request Flow

**Components:**
- `RepairRequestForm` (client) — Multi-step form: (1) Jersey details, (2) Damage info + photos, (3) Urgency + shipping, (4) AI assessment + review
- `PhotoUploader` (client) — Drag-and-drop with preview, upload progress
- `DamageAnalyzer` (client) — Puter.js integration for AI assessment

**Data Strategy:**
- Form state: React `useState` + `useActionState` (React 19)
- Photos uploaded via API route during form fill (before submit)
- Final submission via `createRepairRequest` server action
- `revalidatePath('/repairs')` after creation

**Flow:**
1. Customer fills multi-step form
2. Photos uploaded in step 2 → stored, URLs returned
3. (Optional) Step 4: AI analyzes photos client-side via Puter.js
4. Customer submits → server action creates `repairRequest` + `repairPhotos` + initial `statusHistory`
5. Customer gets notification, redirected to `/repairs/[id]`

**Edge Cases:**
- Abandoned uploads: orphaned photo files if form never submitted. **Solution:** Cron job or 24h TTL on unlinked uploads.
- Network failure during multi-step: Save draft in localStorage, restore on reload.
- Photo validation: Check file type, size on both client and server.

### 4.2 Order Status Tracking

**Components:**
- `StatusTracker` (server) — Visual pipeline showing 5 stages with active state
- `StatusHistory` (server) — Timeline of all status changes
- `RepairDetailPage` (server) — Full repair info with status, photos, payment status

**Data Strategy:**
- Server Component fetches repair + status history + photos in parallel via `Promise.all`
- Customer sees read-only view
- Admin/tech sees with `StatusUpdater` (client) for changing status

**Edge Cases:**
- Status can only move forward in the pipeline (enforce in server action)
- Exception: admin can move backward for corrections (with mandatory notes)
- Shipped status requires tracking number

### 4.3 Admin Dashboard

**Components:**
- `StatsCards` (server) — KPIs: pending requests, in-progress, revenue today
- `RequestTable` (client) — Filterable, sortable table with status/date/urgency filters
- `TechnicianAssignment` (client) — Dropdown to assign/reassign
- `StatusUpdater` (client) — Status change with required notes

**Data Strategy:**
- `page.tsx` fetches aggregate stats + initial request list as Server Component
- Table filtering/sorting uses `searchParams` (URL-based state for shareability)
- Mutations via server actions, revalidate after each change

**Edge Cases:**
- Concurrent edits: Two admins updating same request. Use optimistic locking with `updatedAt` check.
- Bulk operations: Select multiple requests, bulk assign/status change.

### 4.4 Photo Upload

**Components:**
- `PhotoUploader` (client) — Accepts jpg/png/webp, max 5MB, max 5 files
- Preview thumbnails, remove before submit
- Progress bar per file

**Data Strategy:**
- Upload via `POST /api/upload` (route handler, not server action — needs streaming)
- Server validates: file type, size, dimensions
- Stores in chosen blob storage (Vercel Blob recommended)
- Returns `{ url, thumbnailUrl, id }` for form to track

**Edge Cases:**
- HEIC/HEIF from iPhones — convert or reject with clear message
- Very large images — server-side resize for thumbnails
- Upload failures — retry logic on client, idempotent upload

### 4.5 Notifications

**Components:**
- `NotificationBell` (client) — Badge count, dropdown list
- `NotificationCenter` (server page + client interaction)

**Data Strategy:**
- Notifications created server-side during status changes, payment events
- Bell polls `/api/notifications/unread-count` OR uses server action on interval
- Mark-as-read via server action

**Triggers (created by server-side logic):**
| Event | Recipient | Message |
|-------|-----------|---------|
| Request submitted | admin | "New repair request from {name}" |
| Status change | customer | "Your repair is now: {status}" |
| Technician assigned | technician | "You've been assigned request #{id}" |
| Estimate set | customer | "Your repair estimate: ${amount}" |
| Payment received | admin | "Payment received for #{id}" |
| Review submitted | technician | "New review on request #{id}" |

---

## 5. AI Integration (Puter.js)

### Research Findings

Puter.js is a **client-side** JavaScript library that provides AI capabilities (chat, vision, OCR, image generation) without requiring API keys or backend infrastructure. Key facts:
- Runs entirely in the browser via `<script src="https://js.puter.com/v2/">` or npm `puter`
- Uses a "user-pays" model — end users authenticate with Puter.com (popup prompt if not logged in)
- Supports 500+ models including GPT-4o, Claude, Gemini for vision tasks
- `puter.ai.chat()` accepts image URLs for visual analysis
- No server-side usage — purely client-side

### Recommendation

#### Where AI Fits

1. **Damage Assessment** (primary use case)
   - **When:** Step 4 of repair request form, after photos are uploaded
   - **Component:** `DamageAnalyzer` (client)
   - **How:** Call `puter.ai.chat()` with uploaded photo URLs + prompt asking to identify damage type, severity, affected area
   - **Output:** Structured JSON stored in `aiDamageAssessment` column
   - **Prompt template:**
     ```
     Analyze this jersey repair photo. Identify:
     1. Type of damage (tear, hole, stain, fading, logo damage, seam split)
     2. Severity (minor, moderate, severe)
     3. Affected area (front, back, sleeve, collar, hem)
     4. Estimated repairability (easy, moderate, difficult)
     Return as JSON.
     ```

2. **Cost Estimation** (secondary)
   - **When:** After AI assessment, show customer a preliminary estimate range
   - **Component:** `CostEstimator` (client)
   - **How:** Use AI assessment + damage type + urgency to suggest a price range
   - **Note:** This is an *estimate only* — admin sets the real price

3. **Support Chat / FAQ** (nice-to-have, Phase 2)
   - A simple chatbot using `puter.ai.chat()` to answer FAQs
   - Can be added later without architectural changes

#### Integration Pattern

```
PhotoUploader → photos uploaded → DamageAnalyzer runs Puter.js analysis
                                         ↓
                               Display results to customer
                                         ↓
                              Customer reviews + submits form
                                         ↓
                        AI assessment saved in repairRequest.aiDamageAssessment
```

#### Fallback Behavior

- **If Puter.js is unavailable** (user not logged in, network issue, API down):
  - Show "AI assessment unavailable" message
  - Skip assessment step, make it optional
  - Customer manually describes damage (they already do this anyway)
  - Admin manually assesses from photos during review
- **Never block form submission on AI availability**

### Open Questions

1. **🔴 Puter.js user authentication UX**: Puter.js prompts users to log into puter.com if not authenticated. This is a friction point. **Recommendation:** Make AI assessment fully optional and clearly explain the value ("Get an instant estimate!"). If the popup is too disruptive, consider wrapping in a "Try AI Assessment" button rather than auto-triggering.
2. **🟡 Model selection**: Which vision model to use? GPT-4o is best for vision but costs more (user-pays). **Recommendation:** Default to `gpt-4o-mini` for cost efficiency, allow configuration.

### Risks/Edge Cases

- Puter.js popup for unauthenticated users may be confusing — needs clear UX messaging
- AI results may be inaccurate — always display as "AI Suggestion" with disclaimer
- Rate limiting on Puter.js side is outside our control
- Privacy: user photos are sent to third-party AI service — need consent in ToS

---

## 6. PWA Configuration

### Recommendation

Use **`next-pwa`** package (Workbox-based) for service worker generation. Manual service worker management is too complex for the gains.

#### Web Manifest (`public/manifest.json`)

```json
{
  "name": "KitFix - Jersey Repair Service",
  "short_name": "KitFix",
  "description": "Professional jersey repair service — submit, track, and pay for repairs",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "background_color": "#ffffff",
  "theme_color": "#1e40af",
  "categories": ["shopping", "lifestyle"],
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
    { "src": "/icons/icon-512-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

#### Next.js Config (`next.config.mjs`)

```javascript
import withPWAInit from 'next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  scope: '/',
  runtimeCaching: [
    // Cache static assets aggressively
    { urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/, handler: 'CacheFirst',
      options: { cacheName: 'images', expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 3600 } } },
    // Cache fonts
    { urlPattern: /\.(?:woff|woff2|ttf|otf)$/, handler: 'CacheFirst',
      options: { cacheName: 'fonts', expiration: { maxEntries: 10, maxAgeSeconds: 365 * 24 * 3600 } } },
    // API calls: network first, fall back to cache
    { urlPattern: /^\/api\//, handler: 'NetworkFirst',
      options: { cacheName: 'api-cache', expiration: { maxEntries: 50, maxAgeSeconds: 3600 } } },
    // Pages: stale-while-revalidate
    { urlPattern: /\/_next\//, handler: 'StaleWhileRevalidate',
      options: { cacheName: 'next-cache' } },
  ],
});

export default withPWA({
  reactStrictMode: true,
  // ... other Next.js config
});
```

#### Offline Strategy

| Feature | Offline Behavior | Strategy |
|---------|-----------------|----------|
| Landing page | ✅ Cached | Cache-first |
| Viewing existing repairs | ⚠️ Last-cached version | Stale-while-revalidate |
| Submitting new repair | ❌ Requires network | Show offline message |
| Photo upload | ❌ Requires network | Queue locally, upload on reconnect (Phase 2) |
| Payment | ❌ Requires network | Show offline message |
| AI assessment | ❌ Requires network | Skip gracefully |
| Auth | ❌ Requires network | Show offline message |

#### Offline Fallback Page (`app/~offline/page.tsx`)

Simple branded page: "You're offline. KitFix requires an internet connection for most features. Your data is safe — reconnect to continue."

#### Installability Requirements

- Valid manifest.json ✅
- Service worker registered ✅
- HTTPS (production) ✅
- At least one 192x192 and one 512x512 icon ✅

### Open Questions

1. **🟡 Offline photo queue**: Should we implement offline photo queuing (save to IndexedDB, upload when back online)? **Recommendation:** Phase 2 feature. MVP requires network for submissions.

### Risks/Edge Cases

- Service worker caching can cause stale content after deployments. Use cache versioning.
- Middleware files (`manifest.json`, `sw.js`) must be excluded from middleware matcher.
- `next-pwa` may conflict with some App Router features — test thoroughly.

---

## 7. Auth and Authorization

### Recommendation

Use Better Auth with **Drizzle adapter** + **admin plugin** + **polar plugin**. The admin plugin provides role management, user banning, and impersonation. The Polar plugin auto-creates customers on signup.

#### Server Config (`lib/auth.ts`)

```typescript
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { polar, checkout, portal, webhooks } from "@polar-sh/better-auth";
import { nextCookies } from "better-auth/next-js";
import { db } from "./db";
import * as schema from "./db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  plugins: [
    admin({ defaultRole: "customer" }),
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      use: [
        checkout({ products: [...], successUrl: "/repairs/{CHECKOUT_ID}/success" }),
        webhooks({ secret: process.env.POLAR_WEBHOOK_SECRET!, onOrderPaid: ... }),
      ],
    }),
  ],
  session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
  user: { additionalFields: { role: { type: "string", defaultValue: "customer" } } },
});
```

#### Client Config (`lib/auth-client.ts`)

```typescript
import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import { polarClient } from "@polar-sh/better-auth";

export const authClient = createAuthClient({
  plugins: [adminClient(), polarClient()],
});
```

#### Middleware Route Protection (`middleware.ts`)

```typescript
// Protect routes at the edge
// Pattern: allow public routes, redirect unauthenticated to sign-in
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/repairs/:path*',
    '/admin/:path*',
    '/profile/:path*',
    '/notifications/:path*',
    '/payments/:path*',
  ],
};
```

**Important:** Middleware only checks session existence. Role-based checks happen in layouts/pages/actions.

#### Role-Based Access Control Matrix

| Resource | Customer | Technician | Admin |
|----------|----------|------------|-------|
| Create repair request | ✅ Own | ❌ | ✅ (on behalf) |
| View repair requests | ✅ Own | ✅ Assigned | ✅ All |
| Update repair status | ❌ | ✅ Assigned | ✅ All |
| Cancel repair | ✅ Own (before review) | ❌ | ✅ All |
| Assign technician | ❌ | ❌ | ✅ |
| Set estimate/price | ❌ | ❌ | ✅ |
| Upload photos | ✅ Own (before) | ✅ Assigned (during/after) | ✅ All |
| Initiate payment | ✅ Own | ❌ | ❌ |
| View payment info | ✅ Own | ❌ | ✅ All |
| Submit review | ✅ Own (completed) | ❌ | ❌ |
| Respond to review | ❌ | ✅ Own | ✅ |
| Manage users | ❌ | ❌ | ✅ |
| Ban/unban users | ❌ | ❌ | ✅ |
| Impersonate users | ❌ | ❌ | ✅ |
| View admin dashboard | ❌ | ⚠️ Limited | ✅ |

#### Authorization Enforcement Pattern

```typescript
// In every server action / server component:
async function requireRole(roles: string[]) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  if (!roles.includes(session.user.role)) throw new Error("Forbidden");
  return session;
}

// In admin layout.tsx (server component):
export default async function AdminLayout({ children }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !['admin', 'technician'].includes(session.user.role)) {
    redirect('/sign-in');
  }
  return <AdminShell>{children}</AdminShell>;
}
```

### Open Questions

1. **🟡 Social auth providers**: Enable Google/GitHub sign-in? **Recommendation:** Google only for MVP — most accessible for general consumers.
2. **🟡 Email verification**: Required before first repair submission? **Recommendation:** Yes — prevents spam and ensures contact for shipping.

### Risks/Edge Cases

- Better Auth's admin plugin stores `role` on the user table. Changing roles requires either admin action or migration.
- Session expiry during form fill: auto-save draft, prompt re-login, restore.
- Technician self-registration: should techs self-register or be admin-created? **Recommendation:** Admin-created only.

---

## 8. Payment Flow

### Recommendation

Use **Polar.sh** via the **`@polar-sh/better-auth`** plugin for seamless checkout. Payments happen **after admin review and estimate**, not at submission time.

#### Payment Pipeline

```
Customer submits repair request (no payment yet)
         ↓
Admin reviews, sets estimate
         ↓
Customer notified: "Your estimate is $X. Pay to proceed."
         ↓
Customer clicks "Pay" → Server Action creates Polar checkout session
         ↓
Customer redirected to Polar checkout page
         ↓
Customer pays → Polar sends webhook → our handler updates payment + status
         ↓
Status moves from "reviewed" → "in_repair"
```

#### Checkout Flow Implementation

1. **Admin sets estimate** → `updateEstimate` server action:
   - Sets `repairRequests.estimatedCost`
   - Creates notification for customer
   - Status remains "reviewed"

2. **Customer initiates payment** → `initiateCheckout` server action:
   ```typescript
   // Create Polar checkout session
   const checkout = await polarClient.checkouts.create({
     products: [REPAIR_SERVICE_PRODUCT_ID], // Generic repair product
     amount: repairRequest.estimatedCost,    // Dynamic pricing
     successUrl: `${BASE_URL}/repairs/${id}/payment-success?session={CHECKOUT_SESSION_ID}`,
     customerEmail: session.user.email,
     metadata: { repairRequestId: id, userId: session.user.id },
   });
   // Save to payments table
   await db.insert(payments).values({
     repairRequestId: id,
     customerId: session.user.id,
     polarCheckoutId: checkout.id,
     amount: repairRequest.estimatedCost,
     status: 'pending',
   });
   // Return checkout URL for redirect
   return { success: true, data: { checkoutUrl: checkout.url } };
   ```

3. **Polar webhook handler** (`api/webhooks/polar/route.ts`):
   ```typescript
   // Using @polar-sh/nextjs Webhooks helper
   export const POST = Webhooks({
     webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
     onOrderPaid: async (payload) => {
       const { repairRequestId } = payload.metadata;
       await db.update(payments)
         .set({ status: 'completed', polarOrderId: payload.orderId, paidAt: new Date() })
         .where(eq(payments.polarCheckoutId, payload.checkoutId));
       await db.update(repairRequests)
         .set({ currentStatus: 'in_repair' })
         .where(eq(repairRequests.id, repairRequestId));
       // Create status history entry
       // Send notification to customer + admin
     },
   });
   ```

#### Pricing Model

**Recommendation:** One-time dynamic payments (not subscriptions).

Create a single "Jersey Repair Service" product in Polar dashboard with flexible pricing. Each checkout session sets the amount dynamically based on the admin's estimate.

| Urgency | Price Modifier |
|---------|---------------|
| Standard | Base price |
| Rush | +50% |
| Emergency | +100% |

#### Refund Flow

1. Admin initiates refund via admin dashboard
2. Server action calls Polar refund API
3. Webhook confirms refund
4. Payment status → `refunded`, notification sent

### Open Questions

1. **🔴 Dynamic pricing support**: Does Polar.sh support dynamic pricing per checkout (setting arbitrary amounts)? If not, pre-create price tiers. **Recommendation:** Research shows Polar supports `amountType: "fixed"` with custom `priceAmount` per checkout. Verify in sandbox.
2. **🟡 Payment timing**: Should customers pay upfront (at estimate) or after repair? **Recommendation:** Pay at estimate (before repair begins). This reduces no-shows and funds operations.
3. **🟡 Partial payments / deposits**: Accept a deposit then remainder? **Recommendation:** Full payment at estimate for MVP. Deposits add complexity.

### Risks/Edge Cases

- **Webhook replay/duplication**: Use `polarOrderId` uniqueness constraint. Check idempotency before processing.
- **Price change after payment**: If admin adjusts price post-payment, need a supplementary charge or partial refund flow.
- **Abandoned checkouts**: Customer clicks pay but doesn't complete. Track `pending` payments, send reminders.
- **Currency**: Default to USD. Multi-currency is a Phase 2 concern.
- **Webhook endpoint security**: Verify Polar signature on every webhook. Never trust raw POST body.

---

## 9. Build Execution Strategy

### Recommendation

Structure work into **10 discrete work packages** across **4 parallel workstreams**. Use git worktrees for concurrent development.

#### Dependency Graph

```
WP1: Project Scaffolding (foundation — must be first)
 ├── WP2: Database Schema + Drizzle Setup
 ├── WP3: Auth Setup (Better Auth)
 │    ├── WP4: Customer UI (pages + forms)
 │    ├── WP5: Admin Dashboard UI
 │    ├── WP6: Photo Upload System
 │    ├── WP7: Payment Integration (Polar.sh)
 │    └── WP8: Notification System
 ├── WP9: AI Integration (Puter.js)  ← independent, needs only WP6
 └── WP10: PWA Configuration         ← independent, needs only WP1
```

#### Work Packages

| WP | Name | Dependencies | Parallelizable With | Est. Effort |
|----|------|-------------|---------------------|-------------|
| **WP1** | Project Scaffolding | None | — | Small |
| **WP2** | Database Schema | WP1 | WP3, WP10 | Medium |
| **WP3** | Auth System | WP1 | WP2, WP10 | Medium |
| **WP4** | Customer UI | WP2, WP3 | WP5, WP6, WP7, WP8, WP9 | Large |
| **WP5** | Admin Dashboard | WP2, WP3 | WP4, WP6, WP7, WP8, WP9 | Large |
| **WP6** | Photo Upload | WP2, WP3 | WP4, WP5, WP7, WP8, WP9 | Medium |
| **WP7** | Payment System | WP2, WP3 | WP4, WP5, WP6, WP8, WP9 | Medium |
| **WP8** | Notification System | WP2, WP3 | WP4, WP5, WP6, WP7, WP9 | Small |
| **WP9** | AI Integration | WP6 | WP4, WP5, WP7, WP8 | Medium |
| **WP10** | PWA Config | WP1 | WP2, WP3 | Small |

#### Detailed Work Package Specs

**WP1: Project Scaffolding**
- `npx create-next-app@latest` with TypeScript, Tailwind, App Router
- Install all dependencies (drizzle-orm, better-auth, @polar-sh/sdk, @polar-sh/better-auth, next-pwa, zod, etc.)
- Configure `tailwind.config.ts`, `tsconfig.json`
- Set up shadcn/ui (`npx shadcn@latest init`)
- Create directory structure (all folders, placeholder files)
- Configure `.env.local` template
- Set up `drizzle.config.ts`
- Configure `next.config.mjs` (base, no PWA yet)

**WP2: Database Schema + Drizzle Setup**
- Define all tables in `lib/db/schema.ts` using Drizzle pgTable
- Define enums with `pgEnum`
- Set up `lib/db/index.ts` with Neon serverless connection
- Run `npx @better-auth/cli generate` to scaffold auth tables
- Generate initial migration
- Create query helpers in `lib/db/queries/`
- Add seed script for development data

**WP3: Auth System**
- Configure `lib/auth.ts` with Better Auth + Drizzle adapter + admin plugin
- Configure `lib/auth-client.ts` with client plugins
- Create `app/api/auth/[...all]/route.ts`
- Create `middleware.ts` with route protection
- Build auth pages: sign-in, sign-up, forgot-password, verify-email
- Create `(auth)/layout.tsx` centered card layout
- Create role-checking utilities (`requireRole`, `requireOwnership`)
- Add admin/technician role seeding

**WP4: Customer UI**
- Build `(customer)/layout.tsx` with navigation
- Build customer dashboard page (active orders summary)
- Build multi-step repair request form
- Build repair list page with filtering
- Build repair detail page with status tracker
- Build review submission page
- Build payment history page
- Build profile settings page
- Create all associated server actions in `actions/repairs.ts`
- Create Zod validators in `lib/validators/`

**WP5: Admin Dashboard**
- Build `(admin)/layout.tsx` with sidebar navigation
- Build admin dashboard with stats cards
- Build request management table (filterable, sortable)
- Build admin repair detail page (status updater, assign tech, set estimate)
- Build user management page
- Build technician management page
- Build payment overview page
- Build review moderation page
- Create all associated server actions in `actions/admin.ts`

**WP6: Photo Upload System**
- Set up blob storage client (Vercel Blob or chosen provider)
- Create `app/api/upload/route.ts` with validation
- Build `PhotoUploader` client component (drag-drop, preview, progress)
- Build `PhotoGallery` component (before/during/after tabs)
- Handle image resizing for thumbnails
- Implement upload size/type validation

**WP7: Payment System**
- Configure Polar.sh client in `lib/polar.ts`
- Set up `@polar-sh/better-auth` plugin with checkout config
- Create `initiateCheckout` server action
- Create `app/api/webhooks/polar/route.ts` webhook handler
- Build payment success/failure pages
- Handle payment status in repair detail view
- Create payment history queries

**WP8: Notification System**
- Create notification creation helpers (called from other server actions)
- Build `NotificationBell` component with unread count
- Build notification list page
- Create `markAsRead` / `markAllRead` server actions
- Integrate notification triggers into status change, payment, review flows

**WP9: AI Integration**
- Add Puter.js script to layout or load dynamically
- Build `DamageAnalyzer` component with photo analysis
- Build `CostEstimator` component
- Create prompt templates for damage assessment
- Handle loading states, errors, and Puter auth popup
- Make AI step optional in repair form flow
- Store AI results in `aiDamageAssessment` column

**WP10: PWA Configuration**
- Configure `next-pwa` in `next.config.mjs`
- Create `public/manifest.json`
- Generate PWA icons (192, 512, maskable)
- Create offline fallback page (`app/~offline/page.tsx`)
- Configure service worker caching strategies
- Add metadata in root layout for PWA
- Test installability with Lighthouse

#### Execution Order (4 Phases)

```
Phase 1 (Sequential — Foundation):
  → WP1: Project Scaffolding

Phase 2 (Parallel — Core Infrastructure):
  → WP2: Database Schema    |  WP3: Auth System  |  WP10: PWA Config

Phase 3 (Parallel — Features):
  → WP4: Customer UI  |  WP5: Admin Dashboard  |  WP6: Photo Upload  |  WP7: Payment System

Phase 4 (Parallel — Enhancements):
  → WP8: Notifications  |  WP9: AI Integration
```

#### Git Worktree Structure

```
kitfix-2.0/                    # main branch — WP1 scaffolding
kitfix-2.0-wt/
├── wt-schema/                 # feature/database-schema (WP2)
├── wt-auth/                   # feature/auth-system (WP3)
├── wt-pwa/                    # feature/pwa-config (WP10)
├── wt-customer-ui/            # feature/customer-ui (WP4)
├── wt-admin/                  # feature/admin-dashboard (WP5)
├── wt-upload/                 # feature/photo-upload (WP6)
├── wt-payments/               # feature/payment-system (WP7)
├── wt-notifications/          # feature/notifications (WP8)
└── wt-ai/                     # feature/ai-integration (WP9)
```

#### Subagent Dispatch Map

For Copilot CLI parallel agents:

| Agent | Work Package | Agent Type | Notes |
|-------|-------------|------------|-------|
| Agent 1 | WP1 | `coder` | Must complete before others start |
| Agent 2 | WP2 | `coder` | After WP1 merges to main |
| Agent 3 | WP3 | `coder` | After WP1, parallel with WP2 |
| Agent 4 | WP10 | `fast-coder` | After WP1, parallel with WP2/3 |
| Agent 5 | WP4 | `coder` | After WP2+WP3 merge |
| Agent 6 | WP5 | `coder` | After WP2+WP3 merge, parallel with Agent 5 |
| Agent 7 | WP6 | `coder` | After WP2+WP3 merge, parallel with 5/6 |
| Agent 8 | WP7 | `coder` | After WP2+WP3 merge, parallel with 5/6/7 |
| Agent 9 | WP8 | `fast-coder` | After WP2+WP3, can start with 5-8 |
| Agent 10 | WP9 | `coder` | After WP6 (needs upload), parallel with others |

### Risks/Edge Cases

- **Merge conflicts**: WP2 and WP3 both touch `lib/db/schema.ts`. Merge WP2 first, then WP3 rebases.
- **Shared types**: All WPs depend on types from schema. Merge WP2 early so types are available.
- **Environment variables**: Each worktree needs its own `.env.local` or symlink to shared one.
- **Testing**: No testing strategy defined yet. Add Vitest + Playwright in WP1 scaffolding, write tests within each WP.

---

## Appendix: Technology Versions & Dependencies

```json
{
  "dependencies": {
    "next": "^15.x",
    "react": "^19.x",
    "react-dom": "^19.x",
    "better-auth": "^1.x",
    "@polar-sh/sdk": "latest",
    "@polar-sh/better-auth": "latest",
    "@polar-sh/nextjs": "latest",
    "drizzle-orm": "^0.38.x",
    "@neondatabase/serverless": "^0.10.x",
    "next-pwa": "^5.x",
    "zod": "^3.x",
    "@vercel/blob": "^0.x",
    "lucide-react": "latest",
    "tailwindcss": "^4.x",
    "class-variance-authority": "latest",
    "clsx": "latest",
    "tailwind-merge": "latest"
  },
  "devDependencies": {
    "drizzle-kit": "^0.30.x",
    "typescript": "^5.x",
    "@types/node": "^22.x",
    "@types/react": "^19.x",
    "vitest": "^3.x",
    "@playwright/test": "^1.x",
    "dotenv": "^16.x"
  }
}
```

## Appendix: Environment Variables

```env
# Database
DATABASE_URL=postgres://...@ep-xxx.neon.tech/kitfix

# Better Auth
BETTER_AUTH_SECRET=your-secret-here
BETTER_AUTH_URL=http://localhost:3000

# Polar.sh
POLAR_ACCESS_TOKEN=your-polar-token
POLAR_WEBHOOK_SECRET=your-webhook-secret
POLAR_PRODUCT_ID=your-product-id

# Storage (Vercel Blob)
BLOB_READ_WRITE_TOKEN=your-blob-token

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Consolidated Open Questions

| # | Priority | Question | Recommendation |
|---|----------|----------|----------------|
| 1 | 🔴 High | Photo storage backend? | Vercel Blob (simplest with Next.js) |
| 2 | 🔴 High | Polar.sh dynamic pricing per checkout? | Verify in sandbox — API docs suggest yes |
| 3 | 🔴 High | Puter.js auth popup UX impact? | Make AI assessment optional, behind explicit button |
| 4 | 🟡 Medium | Social auth providers? | Google only for MVP |
| 5 | 🟡 Medium | Email verification required? | Yes — before first repair submission |
| 6 | 🟡 Medium | Real-time notifications? | Polling (30s) for MVP |
| 7 | 🟡 Medium | Offline photo queuing? | Phase 2 |
| 8 | 🟡 Medium | Component library? | shadcn/ui |
| 9 | 🟡 Medium | Payment timing? | Pay at estimate, before repair begins |
| 10 | 🟡 Medium | AI vision model? | gpt-4o-mini for cost efficiency |
| 11 | 🟢 Low | Technician self-registration? | Admin-created only |
| 12 | 🟢 Low | Partial payments/deposits? | Full payment for MVP |
