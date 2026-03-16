import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Hoisted mock — chainable db mock (for db.select admin query)
// ---------------------------------------------------------------------------

const { mocks, mockDb } = vi.hoisted(() => {
  const selectWhere = vi.fn().mockResolvedValue([]);
  const from = vi.fn(() => ({ where: selectWhere }));

  return {
    mocks: { selectWhere, from },
    mockDb: {
      select: vi.fn(() => ({ from })),
    },
  };
});

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

vi.mock("@/lib/auth-utils", () => ({
  getSession: vi.fn(),
  requireAuth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: mockDb,
}));

vi.mock("@/lib/db/queries/repairs", () => ({
  getRepairById: vi.fn(),
}));

vi.mock("@/lib/db/queries/payments", () => ({
  getPaymentsByRepair: vi.fn(),
  createPayment: vi.fn(),
}));

vi.mock("@/lib/db/queries/notifications", () => ({
  createNotification: vi.fn(),
}));

vi.mock("@/lib/polar", () => ({
  polar: {
    checkouts: {
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import { requireAuth } from "@/lib/auth-utils";
import { getRepairById } from "@/lib/db/queries/repairs";
import { getPaymentsByRepair, createPayment } from "@/lib/db/queries/payments";
import { createNotification } from "@/lib/db/queries/notifications";
import { polar } from "@/lib/polar";
import { initiateCheckout } from "../payments";

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
    currentStatus: "quote_accepted",
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

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();
  mocks.selectWhere.mockResolvedValue([]);
  // Set POLAR_PRODUCT_ID env var for tests
  process.env.POLAR_PRODUCT_ID = "prod-test-123";
  process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
});

describe("initiateCheckout", () => {
  it("returns error when user is not authenticated", async () => {
    vi.mocked(requireAuth).mockRejectedValueOnce(new Error("NEXT_REDIRECT"));

    const result = await initiateCheckout("repair-1");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("unexpected error");
    }
  });

  it("returns error when repair is not found", async () => {
    vi.mocked(requireAuth).mockResolvedValueOnce(mockSession());
    vi.mocked(getRepairById).mockResolvedValueOnce(null);

    const result = await initiateCheckout("nonexistent");

    expect(result).toEqual({
      success: false,
      error: "Repair request not found.",
    });
  });

  it("returns error when customer does not own the repair", async () => {
    vi.mocked(requireAuth).mockResolvedValueOnce(mockSession("customer", "user-1"));
    vi.mocked(getRepairById).mockResolvedValueOnce(
      mockRepair({ customerId: "user-other" }),
    );

    const result = await initiateCheckout("repair-1");

    expect(result).toEqual({
      success: false,
      error: "You do not have access to this repair request.",
    });
  });

  it("allows admin to checkout for any repair", async () => {
    vi.mocked(requireAuth).mockResolvedValueOnce(mockSession("admin", "admin-1"));
    vi.mocked(getRepairById).mockResolvedValueOnce(
      mockRepair({ customerId: "user-other", currentStatus: "quote_accepted", estimatedCost: 15000 }),
    );
    vi.mocked(getPaymentsByRepair).mockResolvedValueOnce([]);
    vi.mocked(polar.checkouts.create).mockResolvedValueOnce({
      id: "checkout-1",
      url: "https://polar.sh/checkout/123",
    } as unknown as Awaited<ReturnType<typeof polar.checkouts.create>>);
    vi.mocked(createPayment).mockResolvedValueOnce({
      id: "pay-1",
      repairRequestId: "repair-1",
      customerId: "admin-1",
      polarCheckoutId: "checkout-1",
      polarOrderId: null,
      amount: 15000,
      currency: "usd",
      status: "pending",
      paidAt: null,
      refundedAt: null,
      metadata: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await initiateCheckout("repair-1");

    expect(result.success).toBe(true);
  });

  it("returns error when repair status is not quote_accepted", async () => {
    vi.mocked(requireAuth).mockResolvedValueOnce(mockSession("customer", "user-1"));
    vi.mocked(getRepairById).mockResolvedValueOnce(
      mockRepair({ customerId: "user-1", currentStatus: "submitted" }),
    );

    const result = await initiateCheckout("repair-1");

    expect(result).toEqual({
      success: false,
      error: "Payment is only available after you have accepted the repair quote.",
    });
  });

  it("returns error when repair status is reviewed (quote not yet accepted)", async () => {
    vi.mocked(requireAuth).mockResolvedValueOnce(mockSession("customer", "user-1"));
    vi.mocked(getRepairById).mockResolvedValueOnce(
      mockRepair({ customerId: "user-1", currentStatus: "reviewed" }),
    );

    const result = await initiateCheckout("repair-1");

    expect(result).toEqual({
      success: false,
      error: "Payment is only available after you have accepted the repair quote.",
    });
  });

  it("returns error when repair status is quote_sent (quote not yet accepted)", async () => {
    vi.mocked(requireAuth).mockResolvedValueOnce(mockSession("customer", "user-1"));
    vi.mocked(getRepairById).mockResolvedValueOnce(
      mockRepair({ customerId: "user-1", currentStatus: "quote_sent" }),
    );

    const result = await initiateCheckout("repair-1");

    expect(result).toEqual({
      success: false,
      error: "Payment is only available after you have accepted the repair quote.",
    });
  });

  it("returns error when no estimated cost is set", async () => {
    vi.mocked(requireAuth).mockResolvedValueOnce(mockSession("customer", "user-1"));
    vi.mocked(getRepairById).mockResolvedValueOnce(
      mockRepair({ customerId: "user-1", currentStatus: "quote_accepted", estimatedCost: null }),
    );

    const result = await initiateCheckout("repair-1");

    expect(result).toEqual({
      success: false,
      error: "No cost estimate has been set for this repair yet.",
    });
  });

  it("returns error when estimated cost is zero", async () => {
    vi.mocked(requireAuth).mockResolvedValueOnce(mockSession("customer", "user-1"));
    vi.mocked(getRepairById).mockResolvedValueOnce(
      mockRepair({ customerId: "user-1", currentStatus: "quote_accepted", estimatedCost: 0 }),
    );

    const result = await initiateCheckout("repair-1");

    expect(result).toEqual({
      success: false,
      error: "No cost estimate has been set for this repair yet.",
    });
  });

  it("returns error when repair already has a completed payment", async () => {
    vi.mocked(requireAuth).mockResolvedValueOnce(mockSession("customer", "user-1"));
    vi.mocked(getRepairById).mockResolvedValueOnce(
      mockRepair({ customerId: "user-1", currentStatus: "quote_accepted", estimatedCost: 15000 }),
    );
    vi.mocked(getPaymentsByRepair).mockResolvedValueOnce([
      {
        id: "pay-existing",
        repairRequestId: "repair-1",
        customerId: "user-1",
        polarCheckoutId: "checkout-old",
        polarOrderId: "order-old",
        amount: 15000,
        currency: "usd",
        status: "completed",
        paidAt: new Date(),
        refundedAt: null,
        metadata: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const result = await initiateCheckout("repair-1");

    expect(result).toEqual({
      success: false,
      error: "This repair has already been paid for.",
    });
  });

  it("allows checkout when existing payment is pending (not completed)", async () => {
    vi.mocked(requireAuth).mockResolvedValueOnce(mockSession("customer", "user-1"));
    vi.mocked(getRepairById).mockResolvedValueOnce(
      mockRepair({ customerId: "user-1", currentStatus: "quote_accepted", estimatedCost: 15000 }),
    );
    vi.mocked(getPaymentsByRepair).mockResolvedValueOnce([
      {
        id: "pay-pending",
        repairRequestId: "repair-1",
        customerId: "user-1",
        polarCheckoutId: "checkout-pending",
        polarOrderId: null,
        amount: 15000,
        currency: "usd",
        status: "pending",
        paidAt: null,
        refundedAt: null,
        metadata: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    vi.mocked(polar.checkouts.create).mockResolvedValueOnce({
      id: "checkout-2",
      url: "https://polar.sh/checkout/456",
    } as unknown as Awaited<ReturnType<typeof polar.checkouts.create>>);
    vi.mocked(createPayment).mockResolvedValueOnce({
      id: "pay-2",
      repairRequestId: "repair-1",
      customerId: "user-1",
      polarCheckoutId: "checkout-2",
      polarOrderId: null,
      amount: 15000,
      currency: "usd",
      status: "pending",
      paidAt: null,
      refundedAt: null,
      metadata: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await initiateCheckout("repair-1");

    expect(result.success).toBe(true);
  });

  it("returns error when POLAR_PRODUCT_ID is not configured", async () => {
    delete process.env.POLAR_PRODUCT_ID;

    vi.mocked(requireAuth).mockResolvedValueOnce(mockSession("customer", "user-1"));
    vi.mocked(getRepairById).mockResolvedValueOnce(
      mockRepair({ customerId: "user-1", currentStatus: "quote_accepted", estimatedCost: 15000 }),
    );
    vi.mocked(getPaymentsByRepair).mockResolvedValueOnce([]);

    const result = await initiateCheckout("repair-1");

    expect(result).toEqual({
      success: false,
      error: "Payment system is not configured. Please contact support.",
    });
  });

  it("creates checkout session and payment record on success", async () => {
    vi.mocked(requireAuth).mockResolvedValueOnce(mockSession("customer", "user-1"));
    vi.mocked(getRepairById).mockResolvedValueOnce(
      mockRepair({ customerId: "user-1", currentStatus: "quote_accepted", estimatedCost: 25000 }),
    );
    vi.mocked(getPaymentsByRepair).mockResolvedValueOnce([]);
    vi.mocked(polar.checkouts.create).mockResolvedValueOnce({
      id: "checkout-new",
      url: "https://polar.sh/checkout/new",
    } as unknown as Awaited<ReturnType<typeof polar.checkouts.create>>);
    vi.mocked(createPayment).mockResolvedValueOnce({
      id: "pay-new",
      repairRequestId: "repair-1",
      customerId: "user-1",
      polarCheckoutId: "checkout-new",
      polarOrderId: null,
      amount: 25000,
      currency: "usd",
      status: "pending",
      paidAt: null,
      refundedAt: null,
      metadata: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await initiateCheckout("repair-1");

    expect(result).toEqual({
      success: true,
      data: { checkoutUrl: "https://polar.sh/checkout/new" },
    });
    expect(polar.checkouts.create).toHaveBeenCalledWith({
      products: ["prod-test-123"],
      successUrl: "http://localhost:3000/repairs/repair-1?payment=success",
      metadata: {
        repairRequestId: "repair-1",
        customerId: "user-1",
        totalCost: "25000",
        depositAmount: "12500",
        paymentMilestone: "deposit",
      },
    });
    expect(createPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        repairRequestId: "repair-1",
        customerId: "user-1",
        polarCheckoutId: "checkout-new",
        amount: 12500,
        currency: "usd",
        status: "pending",
      }),
    );
  });

  it("notifies admin users after checkout initiation", async () => {
    vi.mocked(requireAuth).mockResolvedValueOnce(mockSession("customer", "user-1"));
    vi.mocked(getRepairById).mockResolvedValueOnce(
      mockRepair({ customerId: "user-1", currentStatus: "quote_accepted", estimatedCost: 15000 }),
    );
    vi.mocked(getPaymentsByRepair).mockResolvedValueOnce([]);
    vi.mocked(polar.checkouts.create).mockResolvedValueOnce({
      id: "checkout-1",
      url: "https://polar.sh/checkout/1",
    } as unknown as Awaited<ReturnType<typeof polar.checkouts.create>>);
    vi.mocked(createPayment).mockResolvedValueOnce({
      id: "pay-1",
      repairRequestId: "repair-1",
      customerId: "user-1",
      polarCheckoutId: "checkout-1",
      polarOrderId: null,
      amount: 15000,
      currency: "usd",
      status: "pending",
      paidAt: null,
      refundedAt: null,
      metadata: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    // Admin query returns admins
    mocks.selectWhere.mockResolvedValueOnce([{ id: "admin-1" }]);
    vi.mocked(createNotification).mockResolvedValue({
      id: "notif-1",
      userId: "admin-1",
      type: "payment",
      title: "Payment Initiated",
      message: "A customer has initiated payment.",
      repairRequestId: "repair-1",
      isRead: false,
      createdAt: new Date(),
    });

    const result = await initiateCheckout("repair-1");

    expect(result.success).toBe(true);
    expect(createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "admin-1",
        type: "payment",
      }),
    );
  });

  it("returns error when Polar checkout creation fails", async () => {
    vi.mocked(requireAuth).mockResolvedValueOnce(mockSession("customer", "user-1"));
    vi.mocked(getRepairById).mockResolvedValueOnce(
      mockRepair({ customerId: "user-1", currentStatus: "quote_accepted", estimatedCost: 15000 }),
    );
    vi.mocked(getPaymentsByRepair).mockResolvedValueOnce([]);
    vi.mocked(polar.checkouts.create).mockRejectedValueOnce(
      new Error("Polar API error"),
    );

    const result = await initiateCheckout("repair-1");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("unexpected error");
    }
  });
});
