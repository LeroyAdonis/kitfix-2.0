/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Hoisted mock — chainable db mock
// ---------------------------------------------------------------------------

const { mocks, mockDb } = vi.hoisted(() => {
  const returning = vi.fn().mockResolvedValue([]);
  const values = vi.fn(() => ({ returning }));
  const insert = vi.fn(() => ({ values }));

  const whereDelete = vi.fn().mockResolvedValue(undefined);
  const deleteFn = vi.fn(() => ({ where: whereDelete }));

  const whereUpdate = vi.fn().mockResolvedValue(undefined);
  const setChain = vi.fn(() => ({ where: whereUpdate }));
  const update = vi.fn(() => ({ set: setChain }));

  const selectData = vi.fn().mockResolvedValue([]);
  const whereFn = vi.fn(function () {
    const d = selectData();
    const r = Object.assign(d, { limit: vi.fn(() => d) });
    return r;
  });
  const fromFn = vi.fn(() => ({ where: whereFn }));
  const select = vi.fn(() => ({ from: fromFn }));

  return {
    mocks: { returning, values, insert, selectData, whereFn, whereUpdate, whereDelete },
    mockDb: { insert, select, update, delete: deleteFn },
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

vi.mock("@/lib/db/queries/products", () => ({
  checkStock: vi.fn(),
  decrementStock: vi.fn(),
  getProductById: vi.fn(),
}));

const { createCheckoutMock } = vi.hoisted(() => {
  const createCheckoutMock = vi.fn();
  return { createCheckoutMock };
});

vi.mock("@/lib/polar", () => ({
  polar: {
    checkouts: {
      create: createCheckoutMock,
    },
  },
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import { getSession } from "@/lib/auth-utils";
import { checkStock, decrementStock, getProductById } from "@/lib/db/queries/products";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockSession(_role: "customer" | "admin" | "technician" = "customer", userId = "user-1") {
  return {
    user: {
      id: userId,
      name: "Test User",
      email: "test@example.com",
      role: "customer" as const,
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
   
  } as any;
}

function mockCartItem(overrides: Record<string, unknown> = {}) {
  return {
    id: "cart-1",
    userId: "user-1",
    productId: "product-1",
    variantId: "variant-1",
    quantity: 2,
    personalization: { name: "John", number: "10" },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();
  mocks.returning.mockResolvedValue([]);
  mocks.selectData.mockResolvedValue([]);
  process.env.POLAR_PRODUCT_ID = "test-product-id";
  process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
});

describe("createOrderFromCart", () => {
  it("creates order with correct items and totals", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession());
    // Cart items
    mocks.selectData.mockResolvedValueOnce([mockCartItem()]);
    // Product for price
    vi.mocked(getProductById).mockResolvedValue({ id: "product-1", basePrice: 50000 } as any);
    vi.mocked(checkStock).mockResolvedValue(true);
    // Order created
    mocks.returning.mockResolvedValueOnce([{
      id: "order-1",
      userId: "user-1",
      status: "pending",
      totalCents: 100000,
      shippingCents: 0,
      grandTotalCents: 100000,
      shippingAddress: null,
      polarCheckoutId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }]);
    // Order items created
    mocks.returning.mockResolvedValueOnce([{
      id: "oi-1",
      orderId: "order-1",
      productId: "product-1",
      variantId: "variant-1",
      quantity: 2,
      unitPriceCents: 50000,
      personalization: { name: "John", number: "10" },
    }]);

    const { createOrderFromCart } = await import("../orders");

    const result = await createOrderFromCart();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe("order-1");
      expect(result.data.totalCents).toBe(100000);
      expect(result.data.grandTotalCents).toBe(100000);
      expect(result.data.items).toHaveLength(1);
      expect(result.data.items[0].unitPriceCents).toBe(50000);
      expect(result.data.items[0].quantity).toBe(2);
    }
  });

  it("decrements stock for each variant", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession());
    mocks.selectData.mockResolvedValueOnce([mockCartItem()]);
    vi.mocked(getProductById).mockResolvedValue({ id: "product-1", basePrice: 50000 } as any);
    vi.mocked(checkStock).mockResolvedValue(true);
    mocks.returning.mockResolvedValueOnce([{
      id: "order-1",
      userId: "user-1",
      status: "pending",
      totalCents: 100000,
      shippingCents: 0,
      grandTotalCents: 100000,
    }]);
    mocks.returning.mockResolvedValueOnce([{
      id: "oi-1",
      orderId: "order-1",
      productId: "product-1",
      variantId: "variant-1",
      quantity: 2,
      unitPriceCents: 50000,
    }]);

    const { createOrderFromCart } = await import("../orders");

    await createOrderFromCart();

    expect(decrementStock).toHaveBeenCalledWith("variant-1", 2);
  });

  it("clears cart after order creation", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession());
    mocks.selectData.mockResolvedValueOnce([mockCartItem()]);
    vi.mocked(getProductById).mockResolvedValue({ id: "product-1", basePrice: 50000 } as any);
    vi.mocked(checkStock).mockResolvedValue(true);
    mocks.returning.mockResolvedValueOnce([{
      id: "order-1",
      userId: "user-1",
      status: "pending",
      totalCents: 100000,
      shippingCents: 0,
      grandTotalCents: 100000,
    }]);
    mocks.returning.mockResolvedValueOnce([{
      id: "oi-1",
      orderId: "order-1",
      productId: "product-1",
      variantId: "variant-1",
      quantity: 2,
      unitPriceCents: 50000,
    }]);

    const { createOrderFromCart } = await import("../orders");

    await createOrderFromCart();

    expect(mocks.whereDelete).toHaveBeenCalled();
  });

  it("returns error when cart is empty", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession());
    mocks.selectData.mockResolvedValueOnce([]);

    const { createOrderFromCart } = await import("../orders");

    const result = await createOrderFromCart();

    expect(result).toEqual({
      success: false,
      error: "Your cart is empty.",
    });
  });

  it("returns error when not signed in", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(null);

    const { createOrderFromCart } = await import("../orders");

    const result = await createOrderFromCart();

    expect(result).toEqual({
      success: false,
      error: "You must be signed in.",
    });
  });
});

describe("getOrders", () => {
  it("returns orders for current user", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession());

    const { getOrders } = await import("../orders");

    const result = await getOrders();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(Array.isArray(result.data)).toBe(true);
    }
  });
});

describe("getOrderById", () => {
  it("returns order with correct ownership", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession());
    // getOrderById returns from db query with items
    mocks.selectData.mockResolvedValueOnce([{
      id: "order-1",
      userId: "user-1",
      status: "pending",
      totalCents: 100000,
      shippingCents: 0,
      grandTotalCents: 100000,
      shippingAddress: null,
      createdAt: new Date(),
    }]);

    const { getOrderById } = await import("../orders");

    const result = await getOrderById("order-1");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe("order-1");
    }
  });

  it("returns error for another user's order", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession("customer", "user-2"));
    mocks.selectData.mockResolvedValueOnce([]);

    const { getOrderById } = await import("../orders");

    const result = await getOrderById("order-1");

    expect(result).toEqual({
      success: false,
      error: "Order not found.",
    });
  });
});

describe("initiateOrderCheckout", () => {
  it("creates Polar checkout session", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession());
    mocks.selectData.mockResolvedValueOnce([{
      id: "order-1",
      userId: "user-1",
      status: "pending",
      totalCents: 100000,
      shippingCents: 0,
      grandTotalCents: 100000,
      shippingAddress: null,
      createdAt: new Date(),
    }]);
    // Returning from order update
    mocks.returning.mockResolvedValueOnce([{
      id: "order-1",
      polarCheckoutId: "pol-checkout-1",
    }]);

    const mockCheckoutUrl = "https://checkout.polar.sh/cs_test_abc123";
    createCheckoutMock.mockResolvedValueOnce({
      id: "pol-checkout-1",
      url: mockCheckoutUrl,
    } as never);

    const { initiateOrderCheckout } = await import("../orders");

    const result = await initiateOrderCheckout("order-1");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.checkoutUrl).toBe(mockCheckoutUrl);
    }
    expect(createCheckoutMock).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          orderId: "order-1",
        }),
      }),
    );
  });
});
