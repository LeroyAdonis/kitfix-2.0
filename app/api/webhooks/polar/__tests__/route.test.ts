import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

vi.mock("@polar-sh/sdk/webhooks", () => {
  class WebhookVerificationError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "WebhookVerificationError";
    }
  }
  return {
    validateEvent: vi.fn(),
    WebhookVerificationError,
  };
});

vi.mock("@/lib/db/queries/payments", () => ({
  getPaymentByCheckoutId: vi.fn(),
  updatePaymentStatus: vi.fn(),
}));

vi.mock("@/lib/db/queries/repairs", () => ({
  updateRepairStatus: vi.fn(),
}));

vi.mock("@/lib/db/queries/notifications", () => ({
  createNotification: vi.fn(),
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

import {
  validateEvent,
  WebhookVerificationError,
} from "@polar-sh/sdk/webhooks";
import {
  getPaymentByCheckoutId,
  updatePaymentStatus,
} from "@/lib/db/queries/payments";
import { updateRepairStatus } from "@/lib/db/queries/repairs";
import { createNotification } from "@/lib/db/queries/notifications";
import { POST } from "../../polar/route";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createMockRequest(
  body: string,
  headers: Record<string, string> = {},
): NextRequest {
  const headerMap = new Headers(headers);
  return {
    text: vi.fn().mockResolvedValue(body),
    headers: headerMap,
  } as unknown as NextRequest;
}

function checkoutUpdatedEvent(
  checkoutId: string,
  status: string,
  orderId?: string,
) {
  return {
    type: "checkout.updated",
    data: {
      id: checkoutId,
      status,
      order_id: orderId,
      metadata: {
        repairRequestId: "repair-1",
        customerId: "user-1",
      },
    },
  } as unknown as ReturnType<typeof validateEvent>;
}

function mockPayment(overrides: Record<string, unknown> = {}) {
  return {
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
    metadata: { repairRequestId: "repair-1", customerId: "user-1" },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as unknown as NonNullable<Awaited<ReturnType<typeof getPaymentByCheckoutId>>>;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();
  process.env.POLAR_WEBHOOK_SECRET = "test-webhook-secret";
});

describe("POST /api/webhooks/polar", () => {
  // ─── Signature validation ────────────────────────────────────────────

  it("returns 500 when POLAR_WEBHOOK_SECRET is not configured", async () => {
    delete process.env.POLAR_WEBHOOK_SECRET;

    const request = createMockRequest("{}");
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("Webhook secret not configured");
  });

  it("returns 403 when signature verification fails", async () => {
    vi.mocked(validateEvent).mockImplementation(() => {
      throw new WebhookVerificationError("Invalid signature");
    });

    const request = createMockRequest(
      JSON.stringify({ type: "checkout.updated", data: {} }),
      { "webhook-id": "test", "webhook-signature": "bad" },
    );
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toBe("Invalid webhook signature");
  });

  it("returns 400 when webhook payload is unparseable", async () => {
    vi.mocked(validateEvent).mockImplementation(() => {
      throw new Error("Unexpected token");
    });

    const request = createMockRequest("not-json");
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Invalid webhook payload");
  });

  // ─── Event routing ───────────────────────────────────────────────────

  it("returns 200 for checkout.created (no-op)", async () => {
    vi.mocked(validateEvent).mockReturnValueOnce({
      type: "checkout.created",
      data: { id: "checkout-1", status: "open" },
    } as unknown as ReturnType<typeof validateEvent>);

    const request = createMockRequest(JSON.stringify({}));
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.received).toBe(true);
    expect(getPaymentByCheckoutId).not.toHaveBeenCalled();
  });

  it("returns 200 for unknown event types (graceful ignore)", async () => {
    vi.mocked(validateEvent).mockReturnValueOnce({
      type: "subscription.created",
      data: { id: "sub-1" },
    } as unknown as ReturnType<typeof validateEvent>);

    const request = createMockRequest(JSON.stringify({}));
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.received).toBe(true);
  });

  // ─── checkout.updated with non-succeeded status ──────────────────────

  it("returns 200 and skips processing for non-succeeded checkout", async () => {
    vi.mocked(validateEvent).mockReturnValueOnce(
      checkoutUpdatedEvent("checkout-1", "pending"),
    );

    const request = createMockRequest(JSON.stringify({}));
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.received).toBe(true);
    expect(getPaymentByCheckoutId).not.toHaveBeenCalled();
  });

  // ─── checkout.updated with succeeded status ──────────────────────────

  it("processes succeeded checkout: updates payment, repair status, and notifies customer", async () => {
    const payment = mockPayment();

    vi.mocked(validateEvent).mockReturnValueOnce(
      checkoutUpdatedEvent("checkout-1", "succeeded", "order-1"),
    );
    vi.mocked(getPaymentByCheckoutId).mockResolvedValueOnce(payment);
    vi.mocked(updatePaymentStatus).mockResolvedValueOnce({
      ...payment,
      status: "completed",
      polarOrderId: "order-1",
      paidAt: new Date(),
    } as unknown as Awaited<ReturnType<typeof updatePaymentStatus>>);
    vi.mocked(updateRepairStatus).mockResolvedValueOnce({
      id: "repair-1",
      customerId: "user-1",
      technicianId: null,
      jerseyDescription: "Test",
      jerseyBrand: null,
      jerseySize: "M",
      damageType: "tear",
      damageDescription: "Torn",
      urgencyLevel: "standard",
      currentStatus: "in_repair",
      estimatedCost: 15000,
      finalCost: null,
      aiDamageAssessment: null,
      adminNotes: null,
      trackingNumber: null,
      shippingAddress: null,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as Awaited<ReturnType<typeof updateRepairStatus>>);
    vi.mocked(createNotification).mockResolvedValueOnce({
      id: "notif-1",
      userId: "user-1",
      type: "payment",
      title: "Payment Confirmed",
      message: "Your payment has been received.",
      repairRequestId: "repair-1",
      isRead: false,
      createdAt: new Date(),
    });

    const request = createMockRequest(JSON.stringify({}));
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.received).toBe(true);

    // Verify payment was updated
    expect(updatePaymentStatus).toHaveBeenCalledWith(
      "pay-1",
      "completed",
      expect.objectContaining({
        polarOrderId: "order-1",
        paidAt: expect.any(Date),
      }),
    );

    // Verify repair status was transitioned to in_repair
    expect(updateRepairStatus).toHaveBeenCalledWith(
      "repair-1",
      "in_repair",
      "user-1",
      expect.stringContaining("Payment confirmed"),
    );

    // Verify customer was notified
    expect(createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        type: "payment",
        title: "Payment Confirmed",
      }),
    );
  });

  it("skips processing when payment not found (logs error)", async () => {
    vi.mocked(validateEvent).mockReturnValueOnce(
      checkoutUpdatedEvent("checkout-unknown", "succeeded"),
    );
    vi.mocked(getPaymentByCheckoutId).mockResolvedValueOnce(null);

    const request = createMockRequest(JSON.stringify({}));
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.received).toBe(true);
    expect(updatePaymentStatus).not.toHaveBeenCalled();
    expect(updateRepairStatus).not.toHaveBeenCalled();
  });

  it("handles idempotency — skips already completed payment", async () => {
    vi.mocked(validateEvent).mockReturnValueOnce(
      checkoutUpdatedEvent("checkout-1", "succeeded"),
    );
    vi.mocked(getPaymentByCheckoutId).mockResolvedValueOnce(
      mockPayment({ status: "completed" }),
    );

    const request = createMockRequest(JSON.stringify({}));
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.received).toBe(true);
    // Should not re-process
    expect(updatePaymentStatus).not.toHaveBeenCalled();
    expect(updateRepairStatus).not.toHaveBeenCalled();
    expect(createNotification).not.toHaveBeenCalled();
  });

  // ─── Error handling ──────────────────────────────────────────────────

  it("returns 200 with error when event processing throws", async () => {
    vi.mocked(validateEvent).mockReturnValueOnce(
      checkoutUpdatedEvent("checkout-1", "succeeded"),
    );
    vi.mocked(getPaymentByCheckoutId).mockRejectedValueOnce(
      new Error("Database connection failed"),
    );

    const request = createMockRequest(JSON.stringify({}));
    const response = await POST(request);
    const body = await response.json();

    // Returns 200 to prevent Polar from retrying
    expect(response.status).toBe(200);
    expect(body.received).toBe(true);
    expect(body.error).toBe("Processing failed");
  });

  it("merges existing metadata when updating payment", async () => {
    const existingMeta = {
      repairRequestId: "repair-1",
      customerId: "user-1",
      polarCheckoutUrl: "https://polar.sh/original",
    };
    const payment = mockPayment({ metadata: existingMeta });

    vi.mocked(validateEvent).mockReturnValueOnce(
      checkoutUpdatedEvent("checkout-1", "succeeded", "order-1"),
    );
    vi.mocked(getPaymentByCheckoutId).mockResolvedValueOnce(payment);
    vi.mocked(updatePaymentStatus).mockResolvedValueOnce({
      ...payment,
      status: "completed",
    } as unknown as Awaited<ReturnType<typeof updatePaymentStatus>>);
    vi.mocked(updateRepairStatus).mockResolvedValueOnce({
      id: "repair-1",
      customerId: "user-1",
      technicianId: null,
      jerseyDescription: "Test",
      jerseyBrand: null,
      jerseySize: "M",
      damageType: "tear",
      damageDescription: "Torn",
      urgencyLevel: "standard",
      currentStatus: "in_repair",
      estimatedCost: 15000,
      finalCost: null,
      aiDamageAssessment: null,
      adminNotes: null,
      trackingNumber: null,
      shippingAddress: null,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as Awaited<ReturnType<typeof updateRepairStatus>>);
    vi.mocked(createNotification).mockResolvedValueOnce({
      id: "notif-1",
      userId: "user-1",
      type: "payment",
      title: "Payment Confirmed",
      message: "Payment confirmed.",
      repairRequestId: "repair-1",
      isRead: false,
      createdAt: new Date(),
    });

    const request = createMockRequest(JSON.stringify({}));
    await POST(request);

    // Verify metadata was merged, not replaced
    expect(updatePaymentStatus).toHaveBeenCalledWith(
      "pay-1",
      "completed",
      expect.objectContaining({
        metadata: expect.objectContaining({
          // Original metadata preserved
          repairRequestId: "repair-1",
          polarCheckoutUrl: "https://polar.sh/original",
          // New metadata added
          polarEvent: "checkout.updated",
          completedAt: expect.any(String),
        }),
      }),
    );
  });
});
