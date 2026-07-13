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
    mockDb: {
      update: vi.fn(() => ({ set })),
    },
  };
});

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

vi.mock("@/lib/auth-utils", () => {
  const getSession = vi.fn();
  const authenticatedAction = (fn: unknown) => {
    return async (...args: unknown[]) => {
      const session = await getSession();
      if (!session) return { success: false, error: "You must be signed in." };
      return (fn as (...args: unknown[]) => unknown)(session, ...args);
    };
  };
  const authenticatedAdminAction = (fn: unknown) => {
    return async (...args: unknown[]) => {
      const session = await getSession();
      if (!session || session.user.role !== "admin") return { success: false, error: "Unauthorized" };
      return (fn as (...args: unknown[]) => unknown)(session, ...args);
    };
  };
  const authenticatedRoleAction = (roles: string[], fn: unknown) => {
    return async (...args: unknown[]) => {
      const session = await getSession();
      if (!session || !roles.includes(session.user.role)) return { success: false, error: "Unauthorized" };
      return (fn as (...args: unknown[]) => unknown)(session, ...args);
    };
  };
  return { getSession, authenticatedAction, authenticatedAdminAction, authenticatedRoleAction };
});

vi.mock("@/lib/db", () => ({
  db: mockDb,
}));

vi.mock("@/lib/db/queries/repairs", () => ({
  updateRepairStatus: vi.fn(),
  getRepairById: vi.fn(),
}));

vi.mock("@/lib/db/queries/notifications", () => ({
  createNotification: vi.fn(),
}));

vi.mock("@/lib/db/queries/voice-notes", () => ({
  createVoiceNote: vi.fn(),
}));

vi.mock("@vercel/blob", () => ({
  put: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import { getSession } from "@/lib/auth-utils";
import { updateRepairStatus, getRepairById } from "@/lib/db/queries/repairs";
import { createNotification } from "@/lib/db/queries/notifications";
import { createVoiceNote } from "@/lib/db/queries/voice-notes";
import { put } from "@vercel/blob";
import {
  assignTechnicianAction,
  updateRepairStatusAction,
  updateEstimateAction,
  addAdminNotesAction,
  addTrackingNumberAction,
} from "../admin";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockSession(role: "customer" | "admin" | "technician" = "customer", userId = "user-1") {
  return {
    user: {
      id: userId,
      name: "Test User",
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

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();
  // Reset default chain behaviour
  mocks.returning.mockResolvedValue([]);
});

// ─── assignTechnicianAction ──────────────────────────────────────────────────

describe("assignTechnicianAction", () => {
  it("returns Unauthorized when no session exists", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(null);

    const result = await assignTechnicianAction("repair-1", "tech-1");

    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(mockDb.update).not.toHaveBeenCalled();
  });

  it("returns Unauthorized when user is not admin", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession("customer"));

    const result = await assignTechnicianAction("repair-1", "tech-1");

    expect(result).toEqual({ success: false, error: "Unauthorized" });
  });

  it("returns Unauthorized when user is technician (not admin)", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession("technician"));

    const result = await assignTechnicianAction("repair-1", "tech-1");

    expect(result).toEqual({ success: false, error: "Unauthorized" });
  });

  it("assigns technician and creates notification on success", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession("admin"));
    vi.mocked(createNotification).mockResolvedValueOnce({
      id: "notif-1",
      userId: "tech-1",
      type: "assignment",
      title: "New Repair Assigned",
      message: "A new repair request has been assigned to you.",
      repairRequestId: "repair-1",
      isRead: false,
      createdAt: new Date(),
    });

    const result = await assignTechnicianAction("repair-1", "tech-1");

    expect(result).toEqual({
      success: true,
      data: { repairRequestId: "repair-1" },
    });
    expect(mockDb.update).toHaveBeenCalled();
    expect(mocks.set).toHaveBeenCalledWith({ technicianId: "tech-1" });
    expect(createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "tech-1",
        type: "assignment",
      }),
    );
  });

  it("returns error when db update throws", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession("admin"));
    mockDb.update.mockImplementationOnce(() => {
      throw new Error("DB error");
    });

    const result = await assignTechnicianAction("repair-1", "tech-1");

    expect(result).toEqual({
      success: false,
      error: "Failed to assign technician",
    });
  });
});

// ─── updateRepairStatusAction ────────────────────────────────────────────────

describe("updateRepairStatusAction", () => {
  it("returns Unauthorized when no session exists", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(null);

    const result = await updateRepairStatusAction("repair-1", "in_repair");

    expect(result).toEqual({ success: false, error: "Unauthorized" });
  });

  it("returns Unauthorized when user is a customer", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession("customer"));

    const result = await updateRepairStatusAction("repair-1", "in_repair");

    expect(result).toEqual({ success: false, error: "Unauthorized" });
  });

  it("allows admin to update repair status", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession("admin", "admin-1"));
    vi.mocked(updateRepairStatus).mockResolvedValueOnce({
      id: "repair-1",
      customerId: "cust-1",
      technicianId: null,
      jerseyDescription: "Test",
      jerseyBrand: null,
      jerseySize: "M",
      damageType: "tear",
      damageDescription: "Torn sleeve",
      urgencyLevel: "standard",
      currentStatus: "in_repair",
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
      shippingMode: null,
      outboundLockerId: null,
      returnLockerId: null,
      outboundTracking: null,
      returnTracking: null,
      outboundLabelUrl: null,
      returnLabelUrl: null,
      shippingRateCents: null,
      shippingSurchargeCents: null,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(createNotification).mockResolvedValueOnce({
      id: "notif-1",
      userId: "cust-1",
      type: "status_update",
      title: "Repair Status Updated",
      message: "Your repair status has been updated to: in repair",
      repairRequestId: "repair-1",
      isRead: false,
      createdAt: new Date(),
    });

    const result = await updateRepairStatusAction("repair-1", "in_repair", "Starting repair");

    expect(result).toEqual({
      success: true,
      data: { repairRequestId: "repair-1" },
    });
    expect(updateRepairStatus).toHaveBeenCalledWith(
      "repair-1",
      "in_repair",
      "admin-1",
      "Starting repair",
    );
    expect(createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "cust-1",
        type: "status_update",
      }),
    );
  });

  it("allows technician to update repair status", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession("technician", "tech-1"));
    vi.mocked(updateRepairStatus).mockResolvedValueOnce({
      id: "repair-1",
      customerId: "cust-1",
      technicianId: "tech-1",
      jerseyDescription: "Test",
      jerseyBrand: null,
      jerseySize: "M",
      damageType: "tear",
      damageDescription: "Torn sleeve",
      urgencyLevel: "standard",
      currentStatus: "quality_check",
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
      shippingMode: null,
      outboundLockerId: null,
      returnLockerId: null,
      outboundTracking: null,
      returnTracking: null,
      outboundLabelUrl: null,
      returnLabelUrl: null,
      shippingRateCents: null,
      shippingSurchargeCents: null,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(createNotification).mockResolvedValueOnce({
      id: "notif-1",
      userId: "cust-1",
      type: "status_update",
      title: "Repair Status Updated",
      message: "Status updated",
      repairRequestId: "repair-1",
      isRead: false,
      createdAt: new Date(),
    });

    const result = await updateRepairStatusAction("repair-1", "quality_check");

    expect(result.success).toBe(true);
    expect(updateRepairStatus).toHaveBeenCalledWith(
      "repair-1",
      "quality_check",
      "tech-1",
      undefined,
    );
  });

  it("returns error when updateRepairStatus throws", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession("admin"));
    vi.mocked(updateRepairStatus).mockRejectedValueOnce(new Error("Not found"));

    const result = await updateRepairStatusAction("repair-1", "in_repair");

    expect(result).toEqual({
      success: false,
      error: "Failed to update repair status",
    });
  });

  it("triggers voice note with private blob access on quality_check status", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession("admin", "admin-1"));
    vi.mocked(updateRepairStatus).mockResolvedValueOnce({
      id: "repair-1",
      customerId: "cust-1",
      technicianId: null,
      jerseyDescription: "Test",
      jerseyBrand: null,
      jerseySize: "M",
      damageType: "tear",
      damageDescription: "Torn sleeve",
      urgencyLevel: "standard",
      currentStatus: "quality_check",
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
      shippingMode: null,
      outboundLockerId: null,
      returnLockerId: null,
      outboundTracking: null,
      returnTracking: null,
      outboundLabelUrl: null,
      returnLabelUrl: null,
      shippingRateCents: null,
      shippingSurchargeCents: null,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(getRepairById).mockResolvedValueOnce({
      id: "repair-1",
      customerId: "cust-1",
      customer: { id: "cust-1", name: "Thabo", email: "thabo@example.com", role: "customer" },
      jerseyDescription: "Test",
      currentStatus: "quality_check",
    } as NonNullable<Awaited<ReturnType<typeof getRepairById>>>);
    vi.mocked(createNotification).mockResolvedValueOnce({
      id: "notif-1",
      userId: "cust-1",
      type: "status_update",
      title: "Repair Status Updated",
      message: "Status updated",
      repairRequestId: "repair-1",
      isRead: false,
      createdAt: new Date(),
    } as Awaited<ReturnType<typeof createNotification>>);

    const fakeWav = new Blob(["fake-wav"], { type: "audio/wav" });
    const origFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      blob: () => Promise.resolve(fakeWav),
    } as Response);

    vi.mocked(put).mockResolvedValueOnce({
      url: "https://blob.vercel.com/voice-note-123.wav",
    } as Awaited<ReturnType<typeof put>>);

    vi.mocked(createVoiceNote).mockResolvedValueOnce({
      id: "voice-1",
      repairRequestId: "repair-1",
      audioUrl: "https://blob.vercel.com/voice-note-123.wav",
    } as Awaited<ReturnType<typeof createVoiceNote>>);

    const result = await updateRepairStatusAction("repair-1", "quality_check");

    expect(result).toEqual({ success: true, data: { repairRequestId: "repair-1" } });

    expect(vi.mocked(put)).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Blob),
      expect.objectContaining({ access: "private" }),
    );

    globalThis.fetch = origFetch;
  });
});

// ─── updateEstimateAction ────────────────────────────────────────────────────

describe("updateEstimateAction", () => {
  it("returns Unauthorized when no session exists", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(null);

    const result = await updateEstimateAction("repair-1", 15000);

    expect(result).toEqual({ success: false, error: "Unauthorized" });
  });

  it("returns Unauthorized when user is not admin", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession("technician"));

    const result = await updateEstimateAction("repair-1", 15000);

    expect(result).toEqual({ success: false, error: "Unauthorized" });
  });

  it("updates estimate and notifies customer", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession("admin"));
    mocks.returning.mockResolvedValueOnce([{ customerId: "cust-1" }]);
    vi.mocked(createNotification).mockResolvedValueOnce({
      id: "notif-1",
      userId: "cust-1",
      type: "payment",
      title: "Repair Estimate Ready",
      message: "Your repair estimate is ready.",
      repairRequestId: "repair-1",
      isRead: false,
      createdAt: new Date(),
    });

    const result = await updateEstimateAction("repair-1", 15000);

    expect(result).toEqual({
      success: true,
      data: { repairRequestId: "repair-1" },
    });
    expect(mocks.set).toHaveBeenCalledWith({ estimatedCost: 15000 });
    expect(createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "cust-1",
        type: "payment",
        title: "Repair Estimate Ready",
      }),
    );
  });

  it("skips notification when no row is returned", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession("admin"));
    mocks.returning.mockResolvedValueOnce([]);

    const result = await updateEstimateAction("repair-1", 15000);

    expect(result.success).toBe(true);
    expect(createNotification).not.toHaveBeenCalled();
  });

  it("returns error when db update throws", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession("admin"));
    mockDb.update.mockImplementationOnce(() => {
      throw new Error("DB error");
    });

    const result = await updateEstimateAction("repair-1", 15000);

    expect(result).toEqual({
      success: false,
      error: "Failed to update estimate",
    });
  });
});

// ─── addAdminNotesAction ─────────────────────────────────────────────────────

describe("addAdminNotesAction", () => {
  it("returns Unauthorized when no session exists", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(null);

    const result = await addAdminNotesAction("repair-1", "Some notes");

    expect(result).toEqual({ success: false, error: "Unauthorized" });
  });

  it("returns Unauthorized when user is not admin", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession("customer"));

    const result = await addAdminNotesAction("repair-1", "Some notes");

    expect(result).toEqual({ success: false, error: "Unauthorized" });
  });

  it("updates admin notes on success", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession("admin"));

    const result = await addAdminNotesAction("repair-1", "Needs special adhesive");

    expect(result).toEqual({
      success: true,
      data: { repairRequestId: "repair-1" },
    });
    expect(mocks.set).toHaveBeenCalledWith({ adminNotes: "Needs special adhesive" });
  });

  it("returns error when db update throws", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession("admin"));
    mockDb.update.mockImplementationOnce(() => {
      throw new Error("DB error");
    });

    const result = await addAdminNotesAction("repair-1", "Notes");

    expect(result).toEqual({
      success: false,
      error: "Failed to update admin notes",
    });
  });
});

// ─── addTrackingNumberAction ─────────────────────────────────────────────────

describe("addTrackingNumberAction", () => {
  it("returns Unauthorized when no session exists", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(null);

    const result = await addTrackingNumberAction("repair-1", "TRACK123");

    expect(result).toEqual({ success: false, error: "Unauthorized" });
  });

  it("returns Unauthorized when user is not admin", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession("technician"));

    const result = await addTrackingNumberAction("repair-1", "TRACK123");

    expect(result).toEqual({ success: false, error: "Unauthorized" });
  });

  it("adds tracking number and notifies customer", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession("admin"));
    mocks.returning.mockResolvedValueOnce([{ customerId: "cust-1" }]);
    vi.mocked(createNotification).mockResolvedValueOnce({
      id: "notif-1",
      userId: "cust-1",
      type: "status_update",
      title: "Repair Shipped!",
      message: "Your repair has been shipped! Tracking number: TRACK123",
      repairRequestId: "repair-1",
      isRead: false,
      createdAt: new Date(),
    });

    const result = await addTrackingNumberAction("repair-1", "TRACK123");

    expect(result).toEqual({
      success: true,
      data: { repairRequestId: "repair-1" },
    });
    expect(mocks.set).toHaveBeenCalledWith({ trackingNumber: "TRACK123" });
    expect(createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "cust-1",
        type: "status_update",
        message: expect.stringContaining("TRACK123"),
      }),
    );
  });

  it("skips notification when no row is returned", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession("admin"));
    mocks.returning.mockResolvedValueOnce([]);

    const result = await addTrackingNumberAction("repair-1", "TRACK123");

    expect(result.success).toBe(true);
    expect(createNotification).not.toHaveBeenCalled();
  });

  it("returns error when db update throws", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession("admin"));
    mockDb.update.mockImplementationOnce(() => {
      throw new Error("DB error");
    });

    const result = await addTrackingNumberAction("repair-1", "TRACK123");

    expect(result).toEqual({
      success: false,
      error: "Failed to add tracking number",
    });
  });
});
