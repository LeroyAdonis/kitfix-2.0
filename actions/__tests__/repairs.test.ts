import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Hoisted mock — chainable db mock for direct db access
// ---------------------------------------------------------------------------

const { mocks, mockDb } = vi.hoisted(() => {
  const returning = vi.fn().mockResolvedValue([]);
  const where = vi.fn(() => ({ returning }));
  const set = vi.fn(() => ({ where }));
  const selectWhere = vi.fn().mockResolvedValue([]);
  const from = vi.fn(() => ({ where: selectWhere }));

  return {
    mocks: { returning, where, set, selectWhere, from },
    mockDb: {
      update: vi.fn(() => ({ set })),
      select: vi.fn(() => ({ from })),
    },
  };
});

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

vi.mock("@/lib/auth-utils", () => ({
  getSession: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: mockDb,
}));

vi.mock("@/lib/db/queries/repairs", () => ({
  createRepair: vi.fn(),
  getRepairById: vi.fn(),
}));

vi.mock("@/lib/db/queries/notifications", () => ({
  createNotification: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import { getSession } from "@/lib/auth-utils";
import { createRepair, getRepairById } from "@/lib/db/queries/repairs";
import { createNotification } from "@/lib/db/queries/notifications";
import { createRepairAction, cancelRepairAction } from "../repairs";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockSession(role = "customer", userId = "user-1", name = "Test User") {
  return {
    user: {
      id: userId,
      name,
      email: "test@example.com",
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
      token: "test-token",
      expiresAt: new Date(Date.now() + 86400000),
      ipAddress: null,
      userAgent: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      impersonatedBy: null,
    },
  };
}

function validRepairFormData(overrides: Record<string, string> = {}): FormData {
  const fd = new FormData();
  const defaults: Record<string, string> = {
    jerseyDescription: "Kaizer Chiefs home jersey 2023 season",
    jerseyBrand: "Nike",
    jerseySize: "L",
    damageType: "tear",
    damageDescription: "There is a 5cm tear along the right sleeve near the shoulder area",
    urgencyLevel: "standard",
    street: "123 Main Road Sandton",
    city: "Johannesburg",
    province: "Gauteng",
    postalCode: "2196",
    country: "South Africa",
    ...overrides,
  };
  for (const [key, value] of Object.entries(defaults)) {
    fd.set(key, value);
  }
  return fd;
}

function mockRepairResult(overrides: Record<string, unknown> = {}) {
  return {
    id: "repair-1",
    customerId: "user-1",
    technicianId: null,
    jerseyDescription: "Kaizer Chiefs home jersey 2023 season",
    jerseyBrand: "Nike",
    jerseySize: "L",
    damageType: "tear",
    damageDescription: "There is a 5cm tear along the right sleeve near the shoulder area",
    urgencyLevel: "standard",
    currentStatus: "submitted",
    estimatedCost: null,
    finalCost: null,
    aiDamageAssessment: null,
    adminNotes: null,
    trackingNumber: null,
    shippingAddress: {
      street: "123 Main Road Sandton",
      city: "Johannesburg",
      province: "Gauteng",
      postalCode: "2196",
      country: "South Africa",
    },
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as unknown as NonNullable<Awaited<ReturnType<typeof getRepairById>>>;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();
  mocks.returning.mockResolvedValue([]);
  mocks.selectWhere.mockResolvedValue([]);
});

// ─── createRepairAction ──────────────────────────────────────────────────────

describe("createRepairAction", () => {
  it("returns error when no session exists", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(null);

    const result = await createRepairAction(validRepairFormData());

    expect(result).toEqual({
      success: false,
      error: "You must be signed in to submit a repair request.",
    });
    expect(createRepair).not.toHaveBeenCalled();
  });

  it("returns validation error for description too short", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession());

    const fd = validRepairFormData({ jerseyDescription: "Short" }); // min 10 chars
    const result = await createRepairAction(fd);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Validation failed.");
      expect(result.fieldErrors).toBeDefined();
      expect(result.fieldErrors!["jerseyDescription"]).toBeDefined();
    }
  });

  it("returns validation error for missing damage description", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession());

    const fd = validRepairFormData({ damageDescription: "Too short" }); // min 20 chars
    const result = await createRepairAction(fd);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Validation failed.");
      expect(result.fieldErrors!["damageDescription"]).toBeDefined();
    }
  });

  it("returns validation error for invalid jersey size", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession());

    const fd = validRepairFormData({ jerseySize: "XXXL" }); // not in enum
    const result = await createRepairAction(fd);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Validation failed.");
    }
  });

  it("returns validation error for invalid damage type", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession());

    const fd = validRepairFormData({ damageType: "explosion" }); // not in enum
    const result = await createRepairAction(fd);

    expect(result.success).toBe(false);
  });

  it("returns validation error for missing shipping address fields", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession());

    const fd = validRepairFormData({ street: "", city: "" });
    const result = await createRepairAction(fd);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Validation failed.");
      expect(result.fieldErrors).toBeDefined();
    }
  });

  it("creates repair request on valid input", async () => {
    const repair = mockRepairResult();
    vi.mocked(getSession).mockResolvedValueOnce(mockSession("customer", "user-1", "Thabo"));
    vi.mocked(createRepair).mockResolvedValueOnce(repair);
    // Admin notification query returns no admins
    mocks.selectWhere.mockResolvedValueOnce([]);

    const result = await createRepairAction(validRepairFormData());

    expect(result).toEqual({ success: true, data: repair });
    expect(createRepair).toHaveBeenCalledWith(
      expect.objectContaining({
        customerId: "user-1",
        jerseyDescription: "Kaizer Chiefs home jersey 2023 season",
        damageType: "tear",
        jerseySize: "L",
      }),
    );
  });

  it("notifies admin users about new repair", async () => {
    const repair = mockRepairResult({ id: "repair-new" });
    vi.mocked(getSession).mockResolvedValueOnce(mockSession("customer", "user-1", "Thabo"));
    vi.mocked(createRepair).mockResolvedValueOnce(repair);
    // Return admins from db.select query
    mocks.selectWhere.mockResolvedValueOnce([
      { id: "admin-1" },
      { id: "admin-2" },
    ]);
    vi.mocked(createNotification).mockResolvedValue({
      id: "notif-1",
      userId: "admin-1",
      type: "system",
      title: "New Repair Request",
      message: "New repair request from Thabo.",
      repairRequestId: "repair-new",
      isRead: false,
      createdAt: new Date(),
    });

    const result = await createRepairAction(validRepairFormData());

    expect(result.success).toBe(true);
    expect(createNotification).toHaveBeenCalledTimes(2);
    expect(createNotification).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "admin-1", type: "system" }),
    );
    expect(createNotification).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "admin-2", type: "system" }),
    );
  });

  it("still succeeds when admin notification fails", async () => {
    const repair = mockRepairResult();
    vi.mocked(getSession).mockResolvedValueOnce(mockSession("customer", "user-1", "Sipho"));
    vi.mocked(createRepair).mockResolvedValueOnce(repair);
    mocks.selectWhere.mockRejectedValueOnce(new Error("DB error"));

    const result = await createRepairAction(validRepairFormData());

    // Notification failure should not block repair creation
    expect(result.success).toBe(true);
  });

  it("parses valid AI damage assessment from form data", async () => {
    const repair = mockRepairResult();
    vi.mocked(getSession).mockResolvedValueOnce(mockSession());
    vi.mocked(createRepair).mockResolvedValueOnce(repair);
    mocks.selectWhere.mockResolvedValueOnce([]);

    const fd = validRepairFormData();
    fd.set(
      "aiDamageAssessment",
      JSON.stringify({
        damageType: "tear",
        severity: "moderate",
        affectedArea: "sleeve",
        repairability: "easy",
        confidence: 0.85,
      }),
    );

    await createRepairAction(fd);

    expect(createRepair).toHaveBeenCalledWith(
      expect.objectContaining({
        aiDamageAssessment: expect.objectContaining({
          damageType: "tear",
          severity: "moderate",
        }),
      }),
    );
  });

  it("ignores invalid AI damage assessment JSON", async () => {
    const repair = mockRepairResult();
    vi.mocked(getSession).mockResolvedValueOnce(mockSession());
    vi.mocked(createRepair).mockResolvedValueOnce(repair);
    mocks.selectWhere.mockResolvedValueOnce([]);

    const fd = validRepairFormData();
    fd.set("aiDamageAssessment", "not-valid-json");

    await createRepairAction(fd);

    // Should be called without aiDamageAssessment field
    expect(createRepair).toHaveBeenCalledWith(
      expect.not.objectContaining({
        aiDamageAssessment: expect.anything(),
      }),
    );
  });
});

// ─── cancelRepairAction ──────────────────────────────────────────────────────

describe("cancelRepairAction", () => {
  it("returns error when no session exists", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(null);

    const result = await cancelRepairAction("repair-1");

    expect(result).toEqual({
      success: false,
      error: "You must be signed in.",
    });
  });

  it("returns error when repair is not found", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession());
    vi.mocked(getRepairById).mockResolvedValueOnce(null);

    const result = await cancelRepairAction("nonexistent");

    expect(result).toEqual({
      success: false,
      error: "Repair request not found.",
    });
  });

  it("returns error when user does not own the repair and is not admin", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession("customer", "user-1"));
    vi.mocked(getRepairById).mockResolvedValueOnce(
      mockRepairResult({ customerId: "user-other", currentStatus: "submitted" }),
    );

    const result = await cancelRepairAction("repair-1");

    expect(result).toEqual({
      success: false,
      error: "You do not have permission to cancel this repair.",
    });
  });

  it("returns error when repair is not in submitted status", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession("customer", "user-1"));
    vi.mocked(getRepairById).mockResolvedValueOnce(
      mockRepairResult({ customerId: "user-1", currentStatus: "in_repair" }),
    );

    const result = await cancelRepairAction("repair-1");

    expect(result).toEqual({
      success: false,
      error: "Only submitted repairs can be cancelled.",
    });
  });

  it("cancels repair (soft-deletes) when user is the owner", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession("customer", "user-1"));
    vi.mocked(getRepairById).mockResolvedValueOnce(
      mockRepairResult({ customerId: "user-1", currentStatus: "submitted" }),
    );

    const result = await cancelRepairAction("repair-1");

    expect(result).toEqual({ success: true, data: null });
    expect(mockDb.update).toHaveBeenCalled();
    expect(mocks.set).toHaveBeenCalledWith(
      expect.objectContaining({ deletedAt: expect.any(Date) }),
    );
  });

  it("allows admin to cancel any repair", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession("admin", "admin-1"));
    vi.mocked(getRepairById).mockResolvedValueOnce(
      mockRepairResult({ customerId: "user-other", currentStatus: "submitted" }),
    );

    const result = await cancelRepairAction("repair-1");

    expect(result).toEqual({ success: true, data: null });
  });
});
