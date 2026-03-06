import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Hoisted mock — chainable db mock for direct db access
// ---------------------------------------------------------------------------

const { mocks, mockDb } = vi.hoisted(() => {
  const returning = vi.fn().mockResolvedValue([]);
  const where = vi.fn(() => ({ returning }));
  const set = vi.fn(() => ({ where }));
  return {
    mocks: { returning, where, set },
    mockDb: { update: vi.fn(() => ({ set })) },
  };
});

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import { getSession } from "@/lib/auth-utils";
import { getRepairById, updateRepairStatus } from "@/lib/db/queries/repairs";
import { createNotification } from "@/lib/db/queries/notifications";
import { sendEstimateReadyEmail } from "@/lib/email";
import { sendQuoteAction, acceptQuoteAction, declineQuoteAction } from "../quotes";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Helper: mock session
function mockSession(role = "customer", userId = "user-1", name = "Test") {
  return {
    user: {
      id: userId,
      name,
      email: `${name.toLowerCase()}@test.co.za`,
      role,
      emailVerified: true,
      image: null,
      banned: false,
      banReason: null,
      banExpires: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    session: {
      id: "sess-1",
      userId,
      token: "tok",
      expiresAt: new Date(Date.now() + 86400000),
      ipAddress: null,
      userAgent: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      impersonatedBy: null,
    },
  };
}

// Helper: mock a plain repair row (no relations — for updateRepairStatus return)
function mockRepairRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "repair-1",
    customerId: "cust-1",
    technicianId: null,
    jerseyDescription: "Kaizer Chiefs jersey",
    jerseyBrand: null,
    jerseySize: "M",
    damageType: "tear" as const,
    damageDescription: "Torn sleeve near the crest",
    urgencyLevel: "standard" as const,
    currentStatus: "reviewed" as const,
    estimatedCost: null,
    finalCost: null,
    aiDamageAssessment: null,
    adminNotes: null,
    quoteDeclineReason: null,
    trackingNumber: null,
    shippingAddress: null,
    pickupRequired: false,
    pickupFee: 0,
    deliveryFee: 0,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

// Helper: mock repair with relations (matching getRepairById's return shape)
// Uses type assertion since Drizzle infers one() relations as non-nullable
// even though they can be null at runtime
function mockRepair(overrides: Record<string, unknown> = {}) {
  return {
    ...mockRepairRow(),
    customer: {
      id: "cust-1",
      name: "Thabo",
      email: "thabo@test.co.za",
      emailVerified: true,
      image: null,
      role: "customer" as const,
      banned: false,
      banReason: null,
      banExpires: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    technician: null,
    photos: [],
    statusHistory: [],
    review: null,
    ...overrides,
  } as unknown as NonNullable<Awaited<ReturnType<typeof getRepairById>>>;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();
  mocks.returning.mockResolvedValue([]);
});

// ─── sendQuoteAction ────────────────────────────────────────────────────────

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
    vi.mocked(updateRepairStatus).mockResolvedValueOnce(mockRepairRow({ currentStatus: "quote_sent" }));

    const result = await sendQuoteAction("repair-1", 450, "Standard repair");

    expect(result.success).toBe(true);
    expect(mockDb.update).toHaveBeenCalled();
    expect(mocks.set).toHaveBeenCalledWith(expect.objectContaining({ estimatedCost: 450 }));
    expect(updateRepairStatus).toHaveBeenCalledWith("repair-1", "quote_sent", expect.any(String), expect.any(String));
    expect(createNotification).toHaveBeenCalled();
    expect(sendEstimateReadyEmail).toHaveBeenCalled();
  });
});

// ─── acceptQuoteAction ──────────────────────────────────────────────────────

describe("acceptQuoteAction", () => {
  it("returns error if not authenticated", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(null as unknown as ReturnType<typeof mockSession>);
    const result = await acceptQuoteAction("repair-1");
    expect(result).toEqual({ success: false, error: expect.stringContaining("Auth") });
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
    vi.mocked(updateRepairStatus).mockResolvedValueOnce(mockRepairRow({ currentStatus: "quote_accepted" }));

    const result = await acceptQuoteAction("repair-1");

    expect(result.success).toBe(true);
    expect(updateRepairStatus).toHaveBeenCalledWith("repair-1", "quote_accepted", "cust-1", expect.any(String));
  });
});

// ─── declineQuoteAction ─────────────────────────────────────────────────────

describe("declineQuoteAction", () => {
  it("declines quote and stores reason", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession("customer", "cust-1"));
    vi.mocked(getRepairById).mockResolvedValueOnce(mockRepair({ currentStatus: "quote_sent" }));
    vi.mocked(updateRepairStatus).mockResolvedValueOnce(mockRepairRow({ currentStatus: "reviewed" }));

    const result = await declineQuoteAction("repair-1", "Too expensive for a small tear repair");

    expect(result.success).toBe(true);
    expect(mockDb.update).toHaveBeenCalled();
    expect(mocks.set).toHaveBeenCalledWith(expect.objectContaining({ quoteDeclineReason: expect.any(String) }));
    expect(updateRepairStatus).toHaveBeenCalledWith("repair-1", "reviewed", "cust-1", expect.any(String));
  });
});
