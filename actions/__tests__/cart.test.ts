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

  // Each call to whereFn creates a fresh promise that resolves to the selectData value
  const selectData = vi.fn().mockResolvedValue([]);
  // whereFn creates a promise AND attaches .limit() that returns the same promise
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
  getActiveProducts: vi.fn(),
  getProductBySlug: vi.fn(),
  getProductVariants: vi.fn(),
  getProductById: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import { getSession } from "@/lib/auth-utils";
import { checkStock, getProductById } from "@/lib/db/queries/products";
import { addToCart } from "../cart";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockSession(_role: "customer" | "admin" | "technician" = "customer", userId = "user-1") {
  return {
    user: {
      id: userId,
      name: "Test User",
      email: "test@example.com",
      role: "customer",
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

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();
  mocks.returning.mockResolvedValue([]);
  mocks.selectData.mockResolvedValue([]);
});

describe("addToCart", () => {
  it("adds item with correct quantity", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession());
    vi.mocked(getProductById).mockResolvedValueOnce({ id: "product-1", isActive: true } as any);
    vi.mocked(checkStock).mockResolvedValueOnce(true);
    mocks.returning.mockResolvedValueOnce([
      {
        id: "cart-1",
        userId: "user-1",
        productId: "product-1",
        variantId: "variant-1",
        quantity: 2,
        personalization: { name: "John", number: "10" },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const result = await addToCart({
      productId: "product-1",
      variantId: "variant-1",
      quantity: 2,
      personalization: { name: "John", number: "10" },
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.quantity).toBe(2);
      expect(result.data.productId).toBe("product-1");
      expect(result.data.variantId).toBe("variant-1");
      expect(result.data.personalization).toEqual({ name: "John", number: "10" });
    }
    expect(mocks.insert).toHaveBeenCalled();
    expect(mocks.values).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        productId: "product-1",
        variantId: "variant-1",
        quantity: 2,
      }),
    );
  });

  it("increments quantity for same variant and personalization combo", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession());
    vi.mocked(getProductById).mockResolvedValueOnce({ id: "product-1", isActive: true } as any);
    vi.mocked(checkStock).mockResolvedValueOnce(true);
    // Existing cart item with same combo
    mocks.selectData.mockResolvedValueOnce([
      { id: "cart-1", quantity: 1 },
    ]);
    // Return updated item after increment
    mocks.selectData.mockResolvedValueOnce([
      { id: "cart-1", productId: "product-1", variantId: "variant-1", quantity: 2, personalization: { name: "John", number: "10" } },
    ]);

    const result = await addToCart({
      productId: "product-1",
      variantId: "variant-1",
      quantity: 1,
      personalization: { name: "John", number: "10" },
    });

    expect(result.success).toBe(true);
    // Should update existing, not insert new
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("returns error when stock insufficient", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession());
    vi.mocked(getProductById).mockResolvedValueOnce({ id: "product-1", isActive: true } as any);
    vi.mocked(checkStock).mockResolvedValueOnce(false);

    const result = await addToCart({
      productId: "product-1",
      variantId: "variant-1",
      quantity: 99,
      personalization: {},
    });

    expect(result).toEqual({
      success: false,
      error: "Insufficient stock.",
    });
  });

  it("returns error when product is inactive", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession());
    // Product not in active list means inactive
    vi.mocked(checkStock).mockResolvedValueOnce(true);

    const result = await addToCart({
      productId: "inactive-product",
      variantId: "variant-1",
      quantity: 1,
      personalization: {},
    });

    expect(result).toEqual({
      success: false,
      error: "Product is not available.",
    });
  });
});

describe("updateCartItem", () => {
  it("updates quantity", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession());
    mocks.selectData.mockResolvedValueOnce([
      { id: "cart-1", userId: "user-1", productId: "product-1", variantId: "variant-1", quantity: 1, personalization: null },
    ]);

    const { updateCartItem } = await import("../cart");

    const result = await updateCartItem("cart-1", 3);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.quantity).toBe(3);
    }
  });

  it("removes item when quantity is 0", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession());
    mocks.selectData.mockResolvedValueOnce([
      { id: "cart-1", userId: "user-1" },
    ]);

    const { updateCartItem } = await import("../cart");

    const result = await updateCartItem("cart-1", 0);

    expect(result.success).toBe(true);
    expect(mocks.whereDelete).toHaveBeenCalled();
  });
});

describe("removeFromCart", () => {
  it("deletes cart item", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession());
    mocks.selectData.mockResolvedValueOnce([
      { id: "cart-1", userId: "user-1" },
    ]);

    const { removeFromCart } = await import("../cart");

    const result = await removeFromCart("cart-1");

    expect(result.success).toBe(true);
    expect(mocks.whereDelete).toHaveBeenCalled();
  });
});

describe("getCart", () => {
  it("returns items with product names and unit prices", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession());
    mocks.selectData.mockResolvedValueOnce([
      {
        id: "cart-1",
        userId: "user-1",
        productId: "product-1",
        variantId: "variant-1",
        quantity: 2,
        personalization: { name: "John" },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const { getCart } = await import("../cart");

    const result = await getCart();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.items).toHaveLength(1);
      expect(result.data.items[0].productId).toBe("product-1");
      expect(result.data.items[0].quantity).toBe(2);
    }
  });
});

describe("getCartTotal", () => {
  it("calculates totals correctly", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession());
    mocks.selectData.mockResolvedValueOnce([
      {
        id: "cart-1",
        userId: "user-1",
        productId: "product-1",
        variantId: "variant-1",
        quantity: 2,
        personalization: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    vi.mocked(getProductById).mockResolvedValueOnce({ id: "product-1", basePrice: 50000, isActive: true } as any);

    const { getCartTotal } = await import("../cart");

    const result = await getCartTotal();

    expect(result.success).toBe(true);
    if (result.success) {
      // 2 * 50000 = 100000 cents
      expect(result.data.itemTotal).toBe(100000);
      expect(result.data.shippingTotal).toBe(0);
      expect(result.data.grandTotal).toBe(100000);
    }
  });
});

describe("addToCart (auth)", () => {
  it("returns error when user is not signed in", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(null);

    const result = await addToCart({
      productId: "product-1",
      variantId: "variant-1",
      quantity: 1,
    });

    expect(result).toEqual({
      success: false,
      error: "You must be signed in.",
    });
  });
});
