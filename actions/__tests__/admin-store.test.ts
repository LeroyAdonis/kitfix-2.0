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

  const queryChain: Record<string, unknown> = {
    innerJoin: vi.fn(() => queryChain),
    orderBy: vi.fn(() => queryChain),
    limit: vi.fn(() => queryChain),
    then: vi.fn(function (resolve: (v: unknown) => unknown) {
      return resolve(selectData());
    }),
  };
  const whereFn = vi.fn(() => queryChain);
  queryChain.where = whereFn;

  const fromFn = vi.fn(() => queryChain);
  const select = vi.fn(() => ({ from: fromFn }));

  return {
    mocks: { returning, values, insert, selectData, whereFn, whereUpdate, whereDelete, setChain, queryChain },
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

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import { getSession } from "@/lib/auth-utils";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockAdminSession() {
  return {
    user: {
      id: "admin-1",
      name: "Admin User",
      email: "admin@kitfix.com",
      role: "admin" as const,
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
      userId: "admin-1",
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

function mockNonAdminSession(role: "customer" | "technician" = "customer") {
  return {
    user: {
      id: "user-1",
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
      userId: "user-1",
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

const mockProduct = {
  id: "product-1",
  name: "Test Jersey",
  description: "A test product",
  slug: "test-jersey",
  basePrice: 50000,
  category: "jerseys",
  imageUrl: null,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockVariant = {
  id: "variant-1",
  productId: "product-1",
  size: "M",
  stock: 10,
  priceModifier: 0,
};

const mockPersonalization = {
  id: "pers-1",
  productId: "product-1",
  fieldName: "Name",
  fieldType: "text",
  isRequired: true,
  maxLength: 20,
  options: null,
};

const mockOrder = {
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
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();
  mocks.returning.mockResolvedValue([]);
  mocks.selectData.mockResolvedValue([]);
  vi.mocked(getSession).mockResolvedValue(mockAdminSession());
});

// ─── createProduct ──────────────────────────────────────────────────────────

describe("createProduct", () => {
  it("returns Unauthorized when no session exists", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(null);
    const { createProduct } = await import("../admin-store");

    const result = await createProduct({
      name: "Test",
      description: "Desc",
      slug: "test",
      basePrice: 50000,
      category: "jerseys",
      variants: [{ size: "M", stock: 10, priceModifier: 0 }],
    });

    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(mockDb.insert).not.toHaveBeenCalled();
  });

  it("returns Unauthorized when user is not admin", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockNonAdminSession("customer"));
    const { createProduct } = await import("../admin-store");

    const result = await createProduct({
      name: "Test",
      description: "Desc",
      slug: "test",
      basePrice: 50000,
      category: "jerseys",
      variants: [{ size: "M", stock: 10, priceModifier: 0 }],
    });

    expect(result).toEqual({ success: false, error: "Unauthorized" });
  });

  it("validates basePrice > 0", async () => {
    const { createProduct } = await import("../admin-store");

    const result = await createProduct({
      name: "Test",
      description: "Desc",
      slug: "test",
      basePrice: 0,
      category: "jerseys",
      variants: [{ size: "M", stock: 10, priceModifier: 0 }],
    });

    expect(result).toEqual({
      success: false,
      error: "basePrice must be greater than 0",
    });
  });

  it("validates at least one variant", async () => {
    const { createProduct } = await import("../admin-store");

    const result = await createProduct({
      name: "Test",
      description: "Desc",
      slug: "test",
      basePrice: 50000,
      category: "jerseys",
      variants: [],
    });

    expect(result).toEqual({
      success: false,
      error: "At least one variant is required",
    });
  });

  it("creates product with variants and personalization options on success", async () => {
    // Product insert
    mocks.returning.mockResolvedValueOnce([mockProduct]);
    // Variants insert
    mocks.returning.mockResolvedValueOnce([mockVariant]);
    // Personalization insert
    mocks.returning.mockResolvedValueOnce([mockPersonalization]);

    const { createProduct } = await import("../admin-store");

    const result = await createProduct({
      name: "Test Jersey",
      description: "A test product",
      slug: "test-jersey",
      basePrice: 50000,
      category: "jerseys",
      imageUrl: "https://example.com/img.jpg",
      variants: [{ size: "M", stock: 10, priceModifier: 0 }],
      personalizationOptions: [{ fieldName: "Name", fieldType: "text", isRequired: true, maxLength: 20 }],
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe("product-1");
    }
    expect(mocks.values).toHaveBeenCalledTimes(3);
  });

  it("returns error when db throws", async () => {
    mocks.returning.mockRejectedValueOnce(new Error("DB error"));
    const { createProduct } = await import("../admin-store");

    const result = await createProduct({
      name: "Test",
      description: "Desc",
      slug: "test",
      basePrice: 50000,
      category: "jerseys",
      variants: [{ size: "M", stock: 10, priceModifier: 0 }],
    });

    expect(result).toEqual({
      success: false,
      error: "Failed to create product",
    });
  });
});

// ─── updateProduct ──────────────────────────────────────────────────────────

describe("updateProduct", () => {
  it("returns Unauthorized when no session exists", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(null);
    const { updateProduct } = await import("../admin-store");

    const result = await updateProduct("product-1", { name: "Updated" });

    expect(result).toEqual({ success: false, error: "Unauthorized" });
  });

  it("updates product basic fields", async () => {
    mocks.returning.mockResolvedValueOnce([{ ...mockProduct, name: "Updated Jersey" }]);
    const { updateProduct } = await import("../admin-store");

    const result = await updateProduct("product-1", { name: "Updated Jersey", basePrice: 60000 });

    expect(result.success).toBe(true);
    expect(mocks.setChain).toHaveBeenCalledWith(expect.objectContaining({ name: "Updated Jersey", basePrice: 60000 }));
  });

  it("removes old variants and inserts new ones when variants provided", async () => {
    mocks.returning.mockResolvedValueOnce([mockProduct]);
    mocks.returning.mockResolvedValueOnce([mockVariant]);
    const { updateProduct } = await import("../admin-store");

    const result = await updateProduct("product-1", {
      name: "Test Jersey",
      variants: [{ size: "M", stock: 10, priceModifier: 0 }],
    });

    expect(result.success).toBe(true);
    expect(mocks.whereDelete).toHaveBeenCalled(); // deletes old variants
  });

  it("returns error when db throws", async () => {
    mockDb.update.mockImplementationOnce(() => {
      throw new Error("DB error");
    });
    const { updateProduct } = await import("../admin-store");

    const result = await updateProduct("product-1", { name: "Updated" });

    expect(result).toEqual({
      success: false,
      error: "Failed to update product",
    });
  });
});

// ─── deleteProduct ──────────────────────────────────────────────────────────

describe("deleteProduct", () => {
  it("returns Unauthorized when no session exists", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(null);
    const { deleteProduct } = await import("../admin-store");

    const result = await deleteProduct("product-1");

    expect(result).toEqual({ success: false, error: "Unauthorized" });
  });

  it("soft deletes product by setting isActive to false", async () => {
    const { deleteProduct } = await import("../admin-store");

    const result = await deleteProduct("product-1");

    expect(result.success).toBe(true);
    expect(mocks.setChain).toHaveBeenCalledWith({ isActive: false });
  });

  it("returns error when db throws", async () => {
    mockDb.update.mockImplementationOnce(() => {
      throw new Error("DB error");
    });
    const { deleteProduct } = await import("../admin-store");

    const result = await deleteProduct("product-1");

    expect(result).toEqual({
      success: false,
      error: "Failed to delete product",
    });
  });
});

// ─── getProductForEdit ──────────────────────────────────────────────────────

describe("getProductForEdit", () => {
  it("returns Unauthorized when no session exists", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(null);
    const { getProductForEdit } = await import("../admin-store");

    const result = await getProductForEdit("product-1");

    expect(result).toEqual({ success: false, error: "Unauthorized" });
  });

  it("returns product with variants and personalization options", async () => {
    mocks.selectData.mockResolvedValueOnce([mockProduct]);
    const { getProductForEdit } = await import("../admin-store");

    const result = await getProductForEdit("product-1");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe("product-1");
    }
  });

  it("returns error when product not found", async () => {
    mocks.selectData.mockResolvedValueOnce([]);
    const { getProductForEdit } = await import("../admin-store");

    const result = await getProductForEdit("nonexistent");

    expect(result).toEqual({
      success: false,
      error: "Product not found",
    });
  });
});

// ─── getAdminOrders ─────────────────────────────────────────────────────────

describe("getAdminOrders", () => {
  it("returns Unauthorized when no session exists", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(null);
    const { getAdminOrders } = await import("../admin-store");

    const result = await getAdminOrders({});

    expect(result).toEqual({ success: false, error: "Unauthorized" });
  });

  it("returns all orders with customer name", async () => {
    mocks.selectData.mockResolvedValueOnce([mockOrder]);
    const { getAdminOrders } = await import("../admin-store");

    const result = await getAdminOrders({});

    expect(result.success).toBe(true);
    if (result.success) {
      expect(Array.isArray(result.data)).toBe(true);
    }
  });

  it("filters by status", async () => {
    mocks.selectData.mockResolvedValueOnce([mockOrder]);
    const { getAdminOrders } = await import("../admin-store");

    const result = await getAdminOrders({ status: "pending" });

    expect(result.success).toBe(true);
  });
});

// ─── getAdminOrderById ──────────────────────────────────────────────────────

describe("getAdminOrderById", () => {
  it("returns Unauthorized when no session exists", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(null);
    const { getAdminOrderById } = await import("../admin-store");

    const result = await getAdminOrderById("order-1");

    expect(result).toEqual({ success: false, error: "Unauthorized" });
  });

  it("returns full order details with customer info", async () => {
    mocks.selectData.mockResolvedValueOnce([mockOrder]);
    const { getAdminOrderById } = await import("../admin-store");

    const result = await getAdminOrderById("order-1");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe("order-1");
    }
  });

  it("returns error when order not found", async () => {
    mocks.selectData.mockResolvedValueOnce([]);
    const { getAdminOrderById } = await import("../admin-store");

    const result = await getAdminOrderById("nonexistent");

    expect(result).toEqual({
      success: false,
      error: "Order not found",
    });
  });
});

// ─── updateOrderStatus ──────────────────────────────────────────────────────

describe("updateOrderStatus", () => {
  it("returns Unauthorized when no session exists", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(null);
    const { updateOrderStatusAction } = await import("../admin-store");

    const result = await updateOrderStatusAction("order-1", "paid");

    expect(result).toEqual({ success: false, error: "Unauthorized" });
  });

  it("returns Unauthorized when user is not admin", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockNonAdminSession("technician"));
    const { updateOrderStatusAction } = await import("../admin-store");

    const result = await updateOrderStatusAction("order-1", "paid");

    expect(result).toEqual({ success: false, error: "Unauthorized" });
  });

  it("updates order status to valid next status", async () => {
    mocks.selectData.mockResolvedValueOnce([mockOrder]);
    mocks.returning.mockResolvedValueOnce([{ ...mockOrder, status: "paid" }]);
    const { updateOrderStatusAction } = await import("../admin-store");

    const result = await updateOrderStatusAction("order-1", "paid");

    expect(result.success).toBe(true);
    expect(mocks.setChain).toHaveBeenCalledWith({ status: "paid" });
  });

  it("rejects invalid status transitions", async () => {
    mocks.selectData.mockResolvedValueOnce([mockOrder]);
    const { updateOrderStatusAction } = await import("../admin-store");

    const result = await updateOrderStatusAction("order-1", "delivered");

    expect(result).toEqual({
      success: false,
      error: "Invalid status transition from pending to delivered",
    });
  });

  it("returns error when db throws", async () => {
    mocks.selectData.mockResolvedValueOnce([mockOrder]);
    mockDb.update.mockImplementationOnce(() => {
      throw new Error("DB error");
    });
    const { updateOrderStatusAction } = await import("../admin-store");

    const result = await updateOrderStatusAction("order-1", "paid");

    expect(result).toEqual({
      success: false,
      error: "Failed to update order status",
    });
  });
});
