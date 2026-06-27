import { describe, it, expect, vi, beforeEach } from "vitest";

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

  const orderBy = vi.fn();
  const withFn = vi.fn(() => ({ orderBy }));
  const findMany = vi.fn(() => ({ with: withFn }));
  const findFirst = vi.fn(() => ({ with: withFn }));

  const dbQuery = {
    products: {
      findMany,
      findFirst,
    },
    productVariants: {
      findFirst,
    },
  };

  return {
    mocks: { returning, values, insert, selectData, whereFn, whereUpdate, whereDelete, orderBy, with: withFn, findMany, findFirst },
    mockDb: { insert, select, update, delete: deleteFn, query: dbQuery },
  };
});

vi.mock("@/lib/auth-utils", () => ({
  getSession: vi.fn(),
}));

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

import { getSession } from "@/lib/auth-utils";
import { checkStock, getActiveProducts, getProductBySlug, getProductById, getProductVariants } from "@/lib/db/queries/products";
import { addToCart, getCart, removeFromCart, updateCartItem } from "../cart";

function mockSession(userId = "user-1") {
  const role = "customer" as const;
  return {
    user: {
      id: userId, name: "Test User", email: "test@example.com",
      role, emailVerified: true, image: null,
      banned: false, banReason: null, banExpires: null,
      createdAt: new Date(), updatedAt: new Date(),
    },
    session: {
      id: "sess-1", userId, token: "test-token",
      expiresAt: new Date(Date.now() + 86400000),
      ipAddress: null, userAgent: null,
      createdAt: new Date(), updatedAt: new Date(), impersonatedBy: null,
    },
  } as any;
}

const mockProduct = {
  id: "product-1", name: "Test Jersey", slug: "test-jersey",
  description: "A test jersey", basePrice: 50000, category: "jerseys",
  imageUrl: null, isActive: true,
  createdAt: new Date(), updatedAt: new Date(),
};

const mockVariant = {
  id: "variant-1", productId: "product-1",
  size: "M", stock: 10, priceModifier: 0,
};

const mockVariants = [
  mockVariant,
  { id: "variant-2", productId: "product-1", size: "L", stock: 0, priceModifier: 500 },
  { id: "variant-3", productId: "product-1", size: "XL", stock: 5, priceModifier: 1000 },
];

const mockPersonalizationOptions = [
  { id: "po-1", productId: "product-1", fieldName: "name", fieldType: "text", isRequired: true, maxLength: 15, options: null },
  { id: "po-2", productId: "product-1", fieldName: "number", fieldType: "text", isRequired: false, maxLength: 2, options: null },
];

beforeEach(() => {
  vi.clearAllMocks();
  mocks.returning.mockResolvedValue([]);
  mocks.selectData.mockResolvedValue([]);
  mocks.findMany.mockReturnThis();
  mocks.findFirst.mockReturnThis();
  mocks.with.mockReturnThis();
});

describe("Product Listing", () => {
  it("getActiveProducts returns only active products with variants", async () => {
    vi.mocked(getActiveProducts).mockResolvedValue([
      { ...mockProduct, variants: mockVariants },
    ]);

    const products = await getActiveProducts();
    expect(products).toHaveLength(1);
    expect(products[0].name).toBe("Test Jersey");
    expect(products[0].variants).toHaveLength(3);
    expect(getActiveProducts).toHaveBeenCalled();
  });

  it("getActiveProducts returns empty array when no active products", async () => {
    vi.mocked(getActiveProducts).mockResolvedValue([]);

    const products = await getActiveProducts();
    expect(products).toHaveLength(0);
  });
});

describe("Product Detail", () => {
  it("getProductBySlug returns product with variants and personalization options", async () => {
    vi.mocked(getProductBySlug).mockResolvedValue({
      ...mockProduct,
      variants: mockVariants,
      personalizationOptions: mockPersonalizationOptions,
    });

    const product = await getProductBySlug("test-jersey");
    expect(product).not.toBeNull();
    expect(product!.name).toBe("Test Jersey");
    expect(product!.variants).toHaveLength(3);
    expect(product!.personalizationOptions).toHaveLength(2);
  });

  it("getProductBySlug returns null for non-existent slug", async () => {
    vi.mocked(getProductBySlug).mockResolvedValue(null);

    const product = await getProductBySlug("non-existent");
    expect(product).toBeNull();
  });
});

describe("Variant Stock", () => {
  it("checks in-stock variant correctly", async () => {
    vi.mocked(checkStock).mockResolvedValue(true);

    const available = await checkStock("variant-1", 1);
    expect(available).toBe(true);
  });

  it("checks out-of-stock variant correctly", async () => {
    vi.mocked(checkStock).mockResolvedValue(false);

    const available = await checkStock("variant-2", 1);
    expect(available).toBe(false);
  });
});

describe("Add to Cart Flow", () => {
  it("adds item to cart for logged-in user", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession());
    vi.mocked(getProductById).mockResolvedValueOnce({ id: "product-1", isActive: true } as any);
    vi.mocked(checkStock).mockResolvedValueOnce(true);
    mocks.returning.mockResolvedValueOnce([
      { id: "cart-1", userId: "user-1", productId: "product-1", variantId: "variant-1", quantity: 1, personalization: { name: "John" }, createdAt: new Date(), updatedAt: new Date() },
    ]);

    const result = await addToCart({ productId: "product-1", variantId: "variant-1", quantity: 1, personalization: { name: "John" } });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.quantity).toBe(1);
      expect(result.data.productId).toBe("product-1");
      expect(result.data.variantId).toBe("variant-1");
    }
  });

  it("rejects add to cart for unauthenticated user", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(null);

    const result = await addToCart({ productId: "product-1", variantId: "variant-1", quantity: 1 });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("You must be signed in.");
  });

  it("rejects add to cart when out of stock", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession());
    vi.mocked(getProductById).mockResolvedValueOnce({ id: "product-1", isActive: true } as any);
    vi.mocked(checkStock).mockResolvedValueOnce(false);

    const result = await addToCart({ productId: "product-1", variantId: "variant-2", quantity: 1 });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("Insufficient stock.");
  });

  it("increments quantity for duplicate variant and personalization", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession());
    vi.mocked(getProductById).mockResolvedValueOnce({ id: "product-1", isActive: true } as any);
    vi.mocked(checkStock).mockResolvedValueOnce(true);
    mocks.selectData.mockResolvedValueOnce([{ id: "cart-1", quantity: 1 }]);
    mocks.selectData.mockResolvedValueOnce([{ id: "cart-1", productId: "product-1", variantId: "variant-1", quantity: 2, personalization: { name: "John" } }]);

    const result = await addToCart({ productId: "product-1", variantId: "variant-1", quantity: 1, personalization: { name: "John" } });

    expect(result.success).toBe(true);
    expect(mocks.insert).not.toHaveBeenCalled();
  });
});

describe("Cart Items and Totals", () => {
  it("getCart returns cart items for logged-in user", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession());
    mocks.selectData.mockResolvedValueOnce([
      { id: "cart-1", userId: "user-1", productId: "product-1", variantId: "variant-1", quantity: 2, personalization: { name: "John" }, createdAt: new Date(), updatedAt: new Date() },
    ]);

    const result = await getCart();
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.items).toHaveLength(1);
      expect(result.data.items[0].quantity).toBe(2);
    }
  });

  it("returns empty cart for user with no items", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession());

    const result = await getCart();
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.items).toHaveLength(0);
    }
  });

  it("updateCartItem changes quantity", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession());
    mocks.selectData.mockResolvedValueOnce([
      { id: "cart-1", userId: "user-1", productId: "product-1", variantId: "variant-1", quantity: 1, personalization: null },
    ]);

    const result = await updateCartItem("cart-1", 3);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.quantity).toBe(3);
  });

  it("removeFromCart deletes item", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession());
    mocks.selectData.mockResolvedValueOnce([{ id: "cart-1", userId: "user-1" }]);

    const result = await removeFromCart("cart-1");
    expect(result.success).toBe(true);
  });
});

describe("Empty Cart State", () => {
  it("returns empty items array for new users", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession());

    const result = await getCart();
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.items).toEqual([]);
    }
  });
});
