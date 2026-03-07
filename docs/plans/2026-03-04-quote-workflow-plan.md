# Quote Workflow Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a quote approval stage to the repair pipeline so admins can send quotes and customers can accept/decline before repair begins.

**Architecture:** Extend the existing `repairStatusEnum` with `quote_sent` and `quote_accepted` stages. Add 3 new server actions (sendQuote, acceptQuote, declineQuote). Add a `quoteDeclineReason` column. Wire up existing notification + email infrastructure.

**Tech Stack:** Drizzle ORM (Neon Postgres), Zod v4 validation, Next.js 16 server actions, shadcn/ui components, Resend email, Better Auth.

**Design doc:** `docs/plans/2026-03-04-quote-workflow-design.md`

---

### Task 1: Schema — Add Quote Statuses and Decline Reason

**Files:**
- Modify: `lib/db/schema.ts:36-42` (repairStatusEnum)
- Modify: `lib/db/schema.ts:134-176` (repairRequests table — add quoteDeclineReason)

**Step 1: Add new enum values**

In `lib/db/schema.ts`, update the `repairStatusEnum`:

```typescript
export const repairStatusEnum = pgEnum("repair_status", [
  "submitted",
  "reviewed",
  "quote_sent",
  "quote_accepted",
  "in_repair",
  "quality_check",
  "shipped",
]);
```

**Step 2: Add `quoteDeclineReason` column to `repairRequests`**

Add after the `adminNotes` column:

```typescript
quoteDeclineReason: text("quote_decline_reason"),
```

**Step 3: Generate migration**

Run: `npm run db:generate`
Expected: New migration file in `drizzle/` directory

**Step 4: Push to database**

Run: `npm run db:push`
Expected: Schema changes applied to Neon Postgres

**Step 5: Verify typecheck**

Run: `npm run typecheck`
Expected: 0 errors (the new enum values and column are automatically inferred by Drizzle)

**Step 6: Commit**

```bash
git add lib/db/schema.ts drizzle/
git commit -m "feat(schema): add quote_sent/quote_accepted statuses and quoteDeclineReason column"
```

---

### Task 2: Validators — Add Quote Zod Schemas

**Files:**
- Modify: `lib/validators/repair.ts` (add quote schemas)

**Step 1: Write the failing test**

Create `lib/validators/__tests__/repair-quote.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { sendQuoteSchema, declineQuoteSchema } from "../repair";

describe("sendQuoteSchema", () => {
  it("accepts valid quote data", () => {
    const result = sendQuoteSchema.safeParse({
      repairId: "repair-123",
      estimatedCost: 450,
      adminNotes: "Standard tear repair",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing repairId", () => {
    const result = sendQuoteSchema.safeParse({ estimatedCost: 450 });
    expect(result.success).toBe(false);
  });

  it("rejects zero or negative cost", () => {
    const result = sendQuoteSchema.safeParse({
      repairId: "repair-123",
      estimatedCost: 0,
    });
    expect(result.success).toBe(false);
  });

  it("allows optional adminNotes", () => {
    const result = sendQuoteSchema.safeParse({
      repairId: "repair-123",
      estimatedCost: 200,
    });
    expect(result.success).toBe(true);
  });
});

describe("declineQuoteSchema", () => {
  it("accepts valid decline data", () => {
    const result = declineQuoteSchema.safeParse({
      repairId: "repair-123",
      reason: "Price is too high for a simple tear",
    });
    expect(result.success).toBe(true);
  });

  it("rejects reason shorter than 10 chars", () => {
    const result = declineQuoteSchema.safeParse({
      repairId: "repair-123",
      reason: "too much",
    });
    expect(result.success).toBe(false);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run lib/validators/__tests__/repair-quote.test.ts`
Expected: FAIL — `sendQuoteSchema` and `declineQuoteSchema` not exported

**Step 3: Write the schemas in `lib/validators/repair.ts`**

Add at end of file:

```typescript
export const sendQuoteSchema = z.object({
  repairId: z.string().min(1, "Repair ID is required"),
  estimatedCost: z.number().int().positive("Estimated cost must be positive"),
  adminNotes: z.string().max(1000).optional(),
});

export const declineQuoteSchema = z.object({
  repairId: z.string().min(1, "Repair ID is required"),
  reason: z.string().min(10, "Please provide at least 10 characters explaining why").max(500),
});

export const acceptQuoteSchema = z.object({
  repairId: z.string().min(1, "Repair ID is required"),
});
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run lib/validators/__tests__/repair-quote.test.ts`
Expected: PASS (all 5 tests)

**Step 5: Commit**

```bash
git add lib/validators/repair.ts lib/validators/__tests__/repair-quote.test.ts
git commit -m "feat(validators): add Zod schemas for quote send/accept/decline"
```

---

### Task 3: Server Actions — Quote Send, Accept, Decline

**Files:**
- Create: `actions/quotes.ts`
- Create: `actions/__tests__/quotes.test.ts`

**Step 1: Write the failing tests**

Create `actions/__tests__/quotes.test.ts`. Follow the exact mock pattern from `actions/__tests__/admin.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

const { mocks, mockDb } = vi.hoisted(() => {
  const returning = vi.fn().mockResolvedValue([]);
  const where = vi.fn(() => ({ returning }));
  const set = vi.fn(() => ({ where }));
  return {
    mocks: { returning, where, set },
    mockDb: { update: vi.fn(() => ({ set })) },
  };
});

vi.mock("@/lib/auth-utils", () => ({ getSession: vi.fn() }));
vi.mock("@/lib/db", () => ({ db: mockDb }));
vi.mock("@/lib/db/queries/repairs", () => ({
  getRepairById: vi.fn(),
  updateRepairStatus: vi.fn(),
}));
vi.mock("@/lib/db/queries/notifications", () => ({
  createNotification: vi.fn(),
}));
vi.mock("@/lib/email", () => ({
  sendEstimateReadyEmail: vi.fn().mockResolvedValue(true),
}));

import { getSession } from "@/lib/auth-utils";
import { getRepairById, updateRepairStatus } from "@/lib/db/queries/repairs";
import { createNotification } from "@/lib/db/queries/notifications";
import { sendEstimateReadyEmail } from "@/lib/email";
import { sendQuoteAction, acceptQuoteAction, declineQuoteAction } from "../quotes";

// Helper: mock session
function mockSession(role: string, userId = "user-1", name = "Test") {
  return {
    user: { id: userId, name, email: `${name.toLowerCase()}@test.co.za`, role, emailVerified: true, createdAt: new Date(), updatedAt: new Date(), image: null },
    session: { id: "sess-1", userId, token: "tok", expiresAt: new Date(Date.now() + 86400000), createdAt: new Date(), updatedAt: new Date(), ipAddress: null, userAgent: null },
  };
}

// Helper: mock repair
function mockRepair(overrides = {}) {
  return {
    id: "repair-1", customerId: "cust-1", currentStatus: "reviewed",
    estimatedCost: null, finalCost: null, adminNotes: null, quoteDeclineReason: null,
    jerseyDescription: "Kaizer Chiefs jersey", damageType: "tear",
    customer: { id: "cust-1", name: "Thabo", email: "thabo@test.co.za" },
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.returning.mockResolvedValue([]);
});

describe("sendQuoteAction", () => {
  it("returns error if not admin", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession("customer"));
    const result = await sendQuoteAction("repair-1", 450);
    expect(result).toEqual({ success: false, error: expect.stringContaining("admin") });
  });

  it("returns error if repair not in reviewed status", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession("admin"));
    vi.mocked(getRepairById).mockResolvedValueOnce(mockRepair({ currentStatus: "submitted" }));
    const result = await sendQuoteAction("repair-1", 450);
    expect(result).toEqual({ success: false, error: expect.stringContaining("reviewed") });
  });

  it("sends quote successfully", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession("admin"));
    vi.mocked(getRepairById).mockResolvedValueOnce(mockRepair({ currentStatus: "reviewed" }));
    vi.mocked(updateRepairStatus).mockResolvedValueOnce(undefined);
    mocks.returning.mockResolvedValueOnce([mockRepair({ currentStatus: "quote_sent", estimatedCost: 450 })]);

    const result = await sendQuoteAction("repair-1", 450, "Standard repair");

    expect(result.success).toBe(true);
    expect(mockDb.update).toHaveBeenCalled();
    expect(mocks.set).toHaveBeenCalledWith(expect.objectContaining({ estimatedCost: 450 }));
    expect(updateRepairStatus).toHaveBeenCalledWith("repair-1", "quote_sent", expect.any(String), expect.any(String));
    expect(createNotification).toHaveBeenCalled();
    expect(sendEstimateReadyEmail).toHaveBeenCalled();
  });
});

describe("acceptQuoteAction", () => {
  it("returns error if not authenticated", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(null as any);
    const result = await acceptQuoteAction("repair-1");
    expect(result).toEqual({ success: false, error: expect.stringContaining("auth") });
  });

  it("returns error if not repair owner", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession("customer", "other-user"));
    vi.mocked(getRepairById).mockResolvedValueOnce(mockRepair({ customerId: "cust-1", currentStatus: "quote_sent" }));
    const result = await acceptQuoteAction("repair-1");
    expect(result).toEqual({ success: false, error: expect.stringContaining("permission") });
  });

  it("accepts quote successfully", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession("customer", "cust-1"));
    vi.mocked(getRepairById).mockResolvedValueOnce(mockRepair({ currentStatus: "quote_sent" }));
    vi.mocked(updateRepairStatus).mockResolvedValueOnce(undefined);

    const result = await acceptQuoteAction("repair-1");

    expect(result.success).toBe(true);
    expect(updateRepairStatus).toHaveBeenCalledWith("repair-1", "quote_accepted", "cust-1", expect.any(String));
  });
});

describe("declineQuoteAction", () => {
  it("declines quote and stores reason", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession("customer", "cust-1"));
    vi.mocked(getRepairById).mockResolvedValueOnce(mockRepair({ currentStatus: "quote_sent" }));
    vi.mocked(updateRepairStatus).mockResolvedValueOnce(undefined);
    mocks.returning.mockResolvedValueOnce([mockRepair({ currentStatus: "reviewed", quoteDeclineReason: "Too expensive" })]);

    const result = await declineQuoteAction("repair-1", "Too expensive for a small tear repair");

    expect(result.success).toBe(true);
    expect(mockDb.update).toHaveBeenCalled();
    expect(mocks.set).toHaveBeenCalledWith(expect.objectContaining({ quoteDeclineReason: expect.any(String) }));
    expect(updateRepairStatus).toHaveBeenCalledWith("repair-1", "reviewed", "cust-1", expect.any(String));
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run actions/__tests__/quotes.test.ts`
Expected: FAIL — `../quotes` module not found

**Step 3: Implement `actions/quotes.ts`**

Create `actions/quotes.ts` with the three server actions:

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { repairRequests } from "@/lib/db/schema";
import { getSession } from "@/lib/auth-utils";
import { getRepairById, updateRepairStatus } from "@/lib/db/queries/repairs";
import { createNotification } from "@/lib/db/queries/notifications";
import { sendEstimateReadyEmail } from "@/lib/email";
import { sendQuoteSchema, acceptQuoteSchema, declineQuoteSchema } from "@/lib/validators/repair";
import { eq } from "drizzle-orm";
import type { ActionResult } from "@/types";

export async function sendQuoteAction(
  repairId: string,
  estimatedCost: number,
  adminNotes?: string,
): Promise<ActionResult<{ repairRequestId: string }>> {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    return { success: false, error: "Only admin users can send quotes." };
  }

  const parsed = sendQuoteSchema.safeParse({ repairId, estimatedCost, adminNotes });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const repair = await getRepairById(repairId);
  if (!repair) {
    return { success: false, error: "Repair request not found." };
  }
  if (repair.currentStatus !== "reviewed") {
    return { success: false, error: "Repair must be in reviewed status to send a quote." };
  }

  // Update estimate + notes on repair
  await db.update(repairRequests).set({
    estimatedCost,
    adminNotes: adminNotes ?? repair.adminNotes,
    quoteDeclineReason: null, // Clear any previous decline reason
  }).where(eq(repairRequests.id, repairId));

  // Transition status
  await updateRepairStatus(repairId, "quote_sent", session.user.id, `Quote sent: R${estimatedCost}`);

  // Notify customer (in-app)
  if (repair.customer) {
    await createNotification({
      userId: repair.customer.id,
      type: "status_update",
      title: "Your repair quote is ready",
      message: `We've quoted R${estimatedCost} for your jersey repair. Please review and accept or request a re-quote.`,
      repairRequestId: repairId,
      isRead: false,
    });

    // Email
    if (repair.customer.email) {
      await sendEstimateReadyEmail(
        repair.customer.email,
        repair.customer.name ?? "Customer",
        repairId,
        estimatedCost,
      );
    }
  }

  revalidatePath(`/admin/requests/${repairId}`);
  revalidatePath("/admin/requests");

  return { success: true, data: { repairRequestId: repairId } };
}

export async function acceptQuoteAction(
  repairId: string,
): Promise<ActionResult<{ repairRequestId: string }>> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Authentication required." };
  }

  const parsed = acceptQuoteSchema.safeParse({ repairId });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const repair = await getRepairById(repairId);
  if (!repair) {
    return { success: false, error: "Repair request not found." };
  }
  if (repair.customerId !== session.user.id && session.user.role !== "admin") {
    return { success: false, error: "You don't have permission to accept this quote." };
  }
  if (repair.currentStatus !== "quote_sent") {
    return { success: false, error: "This repair does not have a pending quote." };
  }

  await updateRepairStatus(repairId, "quote_accepted", session.user.id, "Customer accepted the quote");

  // Notify admin(s)
  await createNotification({
    userId: repair.customerId,
    type: "status_update",
    title: "Quote accepted",
    message: `You accepted the quote of R${repair.estimatedCost} for repair #${repairId.slice(0, 8)}.`,
    repairRequestId: repairId,
    isRead: false,
  });

  revalidatePath(`/repairs/${repairId}`);
  revalidatePath("/repairs");

  return { success: true, data: { repairRequestId: repairId } };
}

export async function declineQuoteAction(
  repairId: string,
  reason: string,
): Promise<ActionResult<{ repairRequestId: string }>> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Authentication required." };
  }

  const parsed = declineQuoteSchema.safeParse({ repairId, reason });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const repair = await getRepairById(repairId);
  if (!repair) {
    return { success: false, error: "Repair request not found." };
  }
  if (repair.customerId !== session.user.id && session.user.role !== "admin") {
    return { success: false, error: "You don't have permission to decline this quote." };
  }
  if (repair.currentStatus !== "quote_sent") {
    return { success: false, error: "This repair does not have a pending quote." };
  }

  // Store decline reason
  await db.update(repairRequests).set({
    quoteDeclineReason: reason,
  }).where(eq(repairRequests.id, repairId));

  // Move back to reviewed
  await updateRepairStatus(repairId, "reviewed", session.user.id, `Customer requested re-quote: ${reason}`);

  // Notify admin
  await createNotification({
    userId: repair.customerId,
    type: "status_update",
    title: "Re-quote requested",
    message: `You requested a re-quote for repair #${repairId.slice(0, 8)}: "${reason}"`,
    repairRequestId: repairId,
    isRead: false,
  });

  revalidatePath(`/repairs/${repairId}`);
  revalidatePath("/repairs");

  return { success: true, data: { repairRequestId: repairId } };
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run actions/__tests__/quotes.test.ts`
Expected: PASS (all 7 tests)

**Step 5: Run full test suite**

Run: `npm run test:run`
Expected: All 213+ tests pass

**Step 6: Commit**

```bash
git add actions/quotes.ts actions/__tests__/quotes.test.ts
git commit -m "feat(actions): add sendQuote, acceptQuote, declineQuote server actions with tests"
```

---

### Task 4: Admin UI — Send Quote Button

**Files:**
- Modify: `app/(admin)/admin/requests/[id]/page.tsx` (add Send Quote section)
- Create: `components/admin/send-quote-form.tsx` (client component with form)

**Step 1: Create the SendQuoteForm component**

Create `components/admin/send-quote-form.tsx`:

A "use client" component that:
- Shows when repair status is `reviewed` (or back from re-quote with `quoteDeclineReason`)
- Displays `quoteDeclineReason` if present (banner showing customer feedback)
- Has a ZAR cost input (number, required, positive)
- Has an admin notes textarea (optional)
- Calls `sendQuoteAction` on submit
- Shows success/error toast
- Uses existing shadcn/ui components: `Button`, `Input`, `Label`, `Textarea`, `Card`

Props: `repairId: string`, `currentEstimate: number | null`, `currentNotes: string | null`, `quoteDeclineReason: string | null`

**Step 2: Add SendQuoteForm to admin detail page**

In `app/(admin)/admin/requests/[id]/page.tsx`, conditionally render `<SendQuoteForm>` when `repair.currentStatus === "reviewed"`.

**Step 3: Verify typecheck**

Run: `npm run typecheck`
Expected: 0 errors

**Step 4: Run tests**

Run: `npm run test:run`
Expected: All tests pass

**Step 5: Commit**

```bash
git add components/admin/send-quote-form.tsx app/(admin)/admin/requests/[id]/page.tsx
git commit -m "feat(admin): add send quote form to repair detail page"
```

---

### Task 5: Customer UI — Quote Review Card

**Files:**
- Modify: `app/(customer)/repairs/[id]/page.tsx` (add quote review section)
- Create: `components/customer/quote-review-card.tsx` (client component)

**Step 1: Create the QuoteReviewCard component**

Create `components/customer/quote-review-card.tsx`:

A "use client" component that:
- Shows when repair status is `quote_sent`
- Displays: jersey description, damage type, admin notes, quoted price (formatted as `R X,XXX` in ZAR)
- "Accept Quote" button → calls `acceptQuoteAction`
- "Request Re-quote" button → opens a modal/dialog with reason textarea → calls `declineQuoteAction`
- Uses existing shadcn/ui components: `Card`, `Button`, `Dialog`, `Textarea`, `Badge`
- Shows loading state with the new `Spinner` component

Props: `repairId: string`, `estimatedCost: number`, `adminNotes: string | null`, `jerseyDescription: string`, `damageType: string`

**Step 2: Add QuoteReviewCard to customer repair detail page**

In `app/(customer)/repairs/[id]/page.tsx`, conditionally render `<QuoteReviewCard>` when `repair.currentStatus === "quote_sent"`.

**Step 3: Verify typecheck**

Run: `npm run typecheck`
Expected: 0 errors

**Step 4: Run tests**

Run: `npm run test:run`
Expected: All tests pass

**Step 5: Commit**

```bash
git add components/customer/quote-review-card.tsx app/(customer)/repairs/[id]/page.tsx
git commit -m "feat(customer): add quote review card with accept/decline flow"
```

---

### Task 6: Update Status Display for New Statuses

**Files:**
- Modify: `components/admin/request-table.tsx:42-48` (status badge variants)
- Modify: Any status display/mapping components that reference the 5-stage pipeline

**Step 1: Find and update all status display mappings**

Search for all places that map repair statuses to labels, colors, or badges. Add entries for `quote_sent` and `quote_accepted`:
- `quote_sent` → label: "Quote Sent", color: amber/warning
- `quote_accepted` → label: "Quote Accepted", color: blue/info

Also check the `StatusUpdater` component used on the admin page — it may have a hardcoded list of valid transitions.

**Step 2: Update the status tracker on the customer page**

If `components/shared/status-tracker.tsx` or similar exists, add the new stages to the visual pipeline.

**Step 3: Verify typecheck**

Run: `npm run typecheck`
Expected: 0 errors

**Step 4: Run tests**

Run: `npm run test:run`
Expected: All tests pass

**Step 5: Commit**

```bash
git add -A
git commit -m "feat(ui): add quote_sent and quote_accepted to all status displays"
```

---

### Task 7: Seed Data — Test Admin + Customer + Repairs

**Files:**
- Create: `scripts/seed.ts`
- Modify: `package.json` (add `db:seed` script)

**Step 1: Create seed script**

Create `scripts/seed.ts` that:
- Uses Better Auth's API or direct DB insert to create:
  - Admin: `admin@kitfix.co.za` / `KitFix2024!` (role: admin)
  - Customer: `customer@test.co.za` / `Test1234!` (role: customer)
- Creates 6 repair requests with different statuses (see design doc)
- Uses `drizzle` DB client directly
- Idempotent: checks if users exist before creating

Include a `package.json` script: `"db:seed": "npx tsx scripts/seed.ts"`

**Step 2: Run seed**

Run: `npm run db:seed`
Expected: Outputs "Seeded 2 users, 6 repair requests"

**Step 3: Verify typecheck**

Run: `npm run typecheck`
Expected: 0 errors

**Step 4: Commit**

```bash
git add scripts/seed.ts package.json
git commit -m "feat(seed): add test admin/customer profiles with repair requests in all quote stages"
```

---

### Task 8: Final Integration Verification

**Step 1: Run full typecheck**

Run: `npm run typecheck`
Expected: 0 errors

**Step 2: Run full test suite**

Run: `npm run test:run`
Expected: All tests pass (213 original + ~12 new quote tests)

**Step 3: Build check**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Final commit (if any fixes needed)**

```bash
git add -A
git commit -m "chore: integration verification for quote workflow"
```
