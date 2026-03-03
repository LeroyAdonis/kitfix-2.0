import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

vi.mock("@/lib/auth-utils", () => ({
  getSession: vi.fn(),
}));

vi.mock("@/lib/db/queries/repairs", () => ({
  getRepairById: vi.fn(),
}));

vi.mock("@/lib/db/queries/reviews", () => ({
  createReview: vi.fn(),
  getReviewByRepair: vi.fn(),
}));

vi.mock("@/lib/db/queries/notifications", () => ({
  createNotification: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import { getSession } from "@/lib/auth-utils";
import { getRepairById } from "@/lib/db/queries/repairs";
import { createReview, getReviewByRepair } from "@/lib/db/queries/reviews";
import { createNotification } from "@/lib/db/queries/notifications";
import { submitReviewAction } from "../reviews";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockSession(role = "customer", userId = "user-1") {
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

function createFormData(data: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(data)) {
    fd.set(key, value);
  }
  return fd;
}

function mockRepair(overrides: Record<string, unknown> = {}) {
  return {
    id: "repair-1",
    customerId: "user-1",
    technicianId: "tech-1",
    jerseyDescription: "Test jersey",
    jerseyBrand: "Nike",
    jerseySize: "M",
    damageType: "tear",
    damageDescription: "Small tear on the sleeve",
    urgencyLevel: "standard",
    currentStatus: "shipped",
    estimatedCost: 15000,
    finalCost: null,
    aiDamageAssessment: null,
    adminNotes: null,
    trackingNumber: null,
    shippingAddress: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as unknown as NonNullable<Awaited<ReturnType<typeof getRepairById>>>;
}

function mockReview(overrides: Record<string, unknown> = {}) {
  return {
    id: "review-1",
    repairRequestId: "repair-1",
    customerId: "user-1",
    rating: 5,
    comment: "Great work!",
    technicianResponse: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as unknown as NonNullable<Awaited<ReturnType<typeof getReviewByRepair>>>;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();
});

describe("submitReviewAction", () => {
  it("returns error when no session exists", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(null);

    const fd = createFormData({
      repairRequestId: "repair-1",
      rating: "5",
      comment: "Great!",
    });
    const result = await submitReviewAction(fd);

    expect(result).toEqual({
      success: false,
      error: "You must be signed in.",
    });
    expect(getRepairById).not.toHaveBeenCalled();
  });

  it("returns validation error for missing repairRequestId", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession());

    const fd = createFormData({ rating: "5" });
    const result = await submitReviewAction(fd);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Validation failed.");
      expect(result.fieldErrors).toBeDefined();
    }
  });

  it("returns validation error for invalid rating (0)", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession());

    const fd = createFormData({
      repairRequestId: "repair-1",
      rating: "0",
    });
    const result = await submitReviewAction(fd);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Validation failed.");
    }
  });

  it("returns validation error for invalid rating (6)", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession());

    const fd = createFormData({
      repairRequestId: "repair-1",
      rating: "6",
    });
    const result = await submitReviewAction(fd);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Validation failed.");
    }
  });

  it("returns error when repair request is not found", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession());
    vi.mocked(getRepairById).mockResolvedValueOnce(null);

    const fd = createFormData({
      repairRequestId: "nonexistent",
      rating: "4",
    });
    const result = await submitReviewAction(fd);

    expect(result).toEqual({
      success: false,
      error: "Repair request not found.",
    });
  });

  it("returns error when user does not own the repair", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession("customer", "user-1"));
    vi.mocked(getRepairById).mockResolvedValueOnce(
      mockRepair({ customerId: "user-other" }),
    );

    const fd = createFormData({
      repairRequestId: "repair-1",
      rating: "4",
    });
    const result = await submitReviewAction(fd);

    expect(result).toEqual({
      success: false,
      error: "You can only review your own repairs.",
    });
  });

  it("returns error when repair is not in shipped status", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession("customer", "user-1"));
    vi.mocked(getRepairById).mockResolvedValueOnce(
      mockRepair({ customerId: "user-1", currentStatus: "in_repair" }),
    );

    const fd = createFormData({
      repairRequestId: "repair-1",
      rating: "4",
    });
    const result = await submitReviewAction(fd);

    expect(result).toEqual({
      success: false,
      error: "You can only review completed (shipped) repairs.",
    });
  });

  it("returns error when a review already exists for this repair", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession("customer", "user-1"));
    vi.mocked(getRepairById).mockResolvedValueOnce(
      mockRepair({ customerId: "user-1", currentStatus: "shipped" }),
    );
    vi.mocked(getReviewByRepair).mockResolvedValueOnce(mockReview());

    const fd = createFormData({
      repairRequestId: "repair-1",
      rating: "4",
    });
    const result = await submitReviewAction(fd);

    expect(result).toEqual({
      success: false,
      error: "A review already exists for this repair.",
    });
  });

  it("creates review and notifies technician on success", async () => {
    const review = mockReview({ rating: 4, comment: "Good job" });

    vi.mocked(getSession).mockResolvedValueOnce(mockSession("customer", "user-1"));
    vi.mocked(getRepairById).mockResolvedValueOnce(
      mockRepair({
        id: "repair-1",
        customerId: "user-1",
        technicianId: "tech-1",
        currentStatus: "shipped",
      }),
    );
    vi.mocked(getReviewByRepair).mockResolvedValueOnce(null);
    vi.mocked(createReview).mockResolvedValueOnce(review);
    vi.mocked(createNotification).mockResolvedValueOnce({
      id: "notif-1",
      userId: "tech-1",
      type: "review_request",
      title: "New Review Received",
      message: "A customer has left a 4-star review on repair #repair-1.",
      repairRequestId: "repair-1",
      isRead: false,
      createdAt: new Date(),
    });

    const fd = createFormData({
      repairRequestId: "repair-1",
      rating: "4",
      comment: "Good job",
    });
    const result = await submitReviewAction(fd);

    expect(result).toEqual({ success: true, data: review });
    expect(createReview).toHaveBeenCalledWith({
      repairRequestId: "repair-1",
      customerId: "user-1",
      rating: 4,
      comment: "Good job",
    });
    expect(createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "tech-1",
        type: "review_request",
      }),
    );
  });

  it("creates review without notification when no technician assigned", async () => {
    const review = mockReview();

    vi.mocked(getSession).mockResolvedValueOnce(mockSession("customer", "user-1"));
    vi.mocked(getRepairById).mockResolvedValueOnce(
      mockRepair({
        customerId: "user-1",
        technicianId: null,
        currentStatus: "shipped",
      }),
    );
    vi.mocked(getReviewByRepair).mockResolvedValueOnce(null);
    vi.mocked(createReview).mockResolvedValueOnce(review);

    const fd = createFormData({
      repairRequestId: "repair-1",
      rating: "5",
    });
    const result = await submitReviewAction(fd);

    expect(result.success).toBe(true);
    expect(createNotification).not.toHaveBeenCalled();
  });

  it("still succeeds when notification to technician fails", async () => {
    const review = mockReview();

    vi.mocked(getSession).mockResolvedValueOnce(mockSession("customer", "user-1"));
    vi.mocked(getRepairById).mockResolvedValueOnce(
      mockRepair({
        customerId: "user-1",
        technicianId: "tech-1",
        currentStatus: "shipped",
      }),
    );
    vi.mocked(getReviewByRepair).mockResolvedValueOnce(null);
    vi.mocked(createReview).mockResolvedValueOnce(review);
    vi.mocked(createNotification).mockRejectedValueOnce(new Error("Notification failed"));

    const fd = createFormData({
      repairRequestId: "repair-1",
      rating: "5",
    });
    const result = await submitReviewAction(fd);

    // Review creation should still succeed despite notification failure
    expect(result.success).toBe(true);
  });
});
