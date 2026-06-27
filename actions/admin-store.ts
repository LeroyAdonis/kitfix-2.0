"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

import { authenticatedAdminAction } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { products, productVariants, personalizationOptions, orders, orderItems, user } from "@/lib/db/schema";
import type { ActionResult } from "@/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CreateProductInput {
  name: string;
  description: string;
  slug: string;
  basePrice: number;
  category: string;
  imageUrl?: string;
  variants: { size: string; stock: number; priceModifier: number }[];
  personalizationOptions?: { fieldName: string; fieldType: string; isRequired: boolean; maxLength?: number; options?: unknown }[];
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  slug?: string;
  basePrice?: number;
  category?: string;
  imageUrl?: string | null;
  variants?: { size: string; stock: number; priceModifier: number }[];
  personalizationOptions?: { fieldName: string; fieldType: string; isRequired: boolean; maxLength?: number; options?: unknown }[];
}

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ["paid", "cancelled"],
  paid: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

// ---------------------------------------------------------------------------
// Product actions
// ---------------------------------------------------------------------------

export const createProduct = authenticatedAdminAction(async (
  session,
  input: CreateProductInput,
): Promise<ActionResult<{ id: string }>> => {
  if (input.basePrice <= 0) {
    return { success: false, error: "basePrice must be greater than 0" };
  }
  if (!input.variants || input.variants.length === 0) {
    return { success: false, error: "At least one variant is required" };
  }

  try {
    const [product] = await db
      .insert(products)
      .values({
        name: input.name,
        description: input.description,
        slug: input.slug,
        basePrice: input.basePrice,
        category: input.category,
        imageUrl: input.imageUrl ?? null,
      })
      .returning();

    const variantData = input.variants.map((v) => ({
      productId: product.id,
      size: v.size,
      stock: v.stock,
      priceModifier: v.priceModifier,
    }));
    await db.insert(productVariants).values(variantData).returning();

    if (input.personalizationOptions && input.personalizationOptions.length > 0) {
      const persData = input.personalizationOptions.map((p) => ({
        productId: product.id,
        fieldName: p.fieldName,
        fieldType: p.fieldType,
        isRequired: p.isRequired,
        maxLength: p.maxLength ?? null,
        options: p.options ?? null,
      }));
      await db.insert(personalizationOptions).values(persData).returning();
    }

    revalidatePath("/admin/store");

    return { success: true, data: { id: product.id } };
  } catch {
    return { success: false, error: "Failed to create product" };
  }
});

export const updateProduct = authenticatedAdminAction(async (
  session,
  id: string,
  input: UpdateProductInput,
): Promise<ActionResult<{ id: string }>> => {
  try {
    const updateData: Record<string, unknown> = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.slug !== undefined) updateData.slug = input.slug;
    if (input.basePrice !== undefined) updateData.basePrice = input.basePrice;
    if (input.category !== undefined) updateData.category = input.category;
    if (input.imageUrl !== undefined) updateData.imageUrl = input.imageUrl;

    if (Object.keys(updateData).length > 0) {
      await db.update(products).set(updateData).where(eq(products.id, id));
    }

    if (input.variants !== undefined) {
      await db.delete(productVariants).where(eq(productVariants.productId, id));
      const variantData = input.variants.map((v) => ({
        productId: id,
        size: v.size,
        stock: v.stock,
        priceModifier: v.priceModifier,
      }));
      await db.insert(productVariants).values(variantData);
    }

    if (input.personalizationOptions !== undefined) {
      await db.delete(personalizationOptions).where(eq(personalizationOptions.productId, id));
      const persData = input.personalizationOptions.map((p) => ({
        productId: id,
        fieldName: p.fieldName,
        fieldType: p.fieldType,
        isRequired: p.isRequired,
        maxLength: p.maxLength ?? null,
        options: p.options ?? null,
      }));
      await db.insert(personalizationOptions).values(persData);
    }

    revalidatePath("/admin/store");
    revalidatePath(`/admin/store/${id}`);

    return { success: true, data: { id } };
  } catch {
    return { success: false, error: "Failed to update product" };
  }
});

export const deleteProduct = authenticatedAdminAction(async (
  session,
  id: string,
): Promise<ActionResult<{ id: string }>> => {
  try {
    await db.update(products).set({ isActive: false }).where(eq(products.id, id));

    revalidatePath("/admin/store");

    return { success: true, data: { id } };
  } catch {
    return { success: false, error: "Failed to delete product" };
  }
});

export const getProductForEdit = authenticatedAdminAction(async (
  session,
  id: string,
): Promise<ActionResult<{
  id: string;
  name: string;
  description: string;
  slug: string;
  basePrice: number;
  category: string;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  variants: { id: string; size: string; stock: number; priceModifier: number }[];
  personalizationOptions: { id: string; fieldName: string; fieldType: string; isRequired: boolean; maxLength: number | null; options: unknown }[];
}>> => {
  try {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    if (!product) return { success: false, error: "Product not found" };

    const variants = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, id));

    const persOptions = await db
      .select()
      .from(personalizationOptions)
      .where(eq(personalizationOptions.productId, id));

    return {
      success: true,
      data: {
        ...product,
        variants,
        personalizationOptions: persOptions,
      },
    };
  } catch {
    return { success: false, error: "Failed to get product" };
  }
});

// ---------------------------------------------------------------------------
// Order actions
// ---------------------------------------------------------------------------

export const getAdminOrders = authenticatedAdminAction(async (
  session,
  filters: { status?: string },
): Promise<ActionResult<Array<{
  id: string;
  userId: string;
  status: string;
  totalCents: number;
  shippingCents: number;
  grandTotalCents: number;
  shippingAddress: unknown;
  polarCheckoutId: string | null;
  createdAt: Date;
  updatedAt: Date;
  customerName: string;
}>>> => {
  try {
    const orderRows = await db
      .select()
      .from(orders)
      .where(filters.status ? eq(orders.status, filters.status) : undefined);

    const userIds = [...new Set(orderRows.map((o) => o.userId))];
    const userRows = userIds.length > 0
      ? await db.select().from(user).where(eq(user.id, userIds[0]))
      : [];

    const userMap = new Map(userRows.map((u) => [u.id, u.name]));

    const result = orderRows.map((o) => ({
      ...o,
      customerName: userMap.get(o.userId) ?? "Unknown",
    }));

    return { success: true, data: result };
  } catch {
    return { success: false, error: "Failed to get orders" };
  }
});

export const getAdminOrderById = authenticatedAdminAction(async (
  session,
  id: string,
): Promise<ActionResult<{
  id: string;
  userId: string;
  status: string;
  totalCents: number;
  shippingCents: number;
  grandTotalCents: number;
  shippingAddress: unknown;
  polarCheckoutId: string | null;
  createdAt: Date;
  updatedAt: Date;
  customerName: string;
  customerEmail: string;
  items: Array<{
    id: string;
    orderId: string;
    productId: string;
    variantId: string;
    quantity: number;
    unitPriceCents: number;
    personalization: unknown;
    productName: string;
    variantSize: string;
  }>;
}>> => {
  try {
    const [order] = await db
      .select({
        id: orders.id,
        userId: orders.userId,
        status: orders.status,
        totalCents: orders.totalCents,
        shippingCents: orders.shippingCents,
        grandTotalCents: orders.grandTotalCents,
        shippingAddress: orders.shippingAddress,
        polarCheckoutId: orders.polarCheckoutId,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        customerName: user.name,
        customerEmail: user.email,
      })
      .from(orders)
      .innerJoin(user, eq(orders.userId, user.id))
      .where(eq(orders.id, id))
      .limit(1);

    if (!order) return { success: false, error: "Order not found" };

    const orderItemsList = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, id));

    return {
      success: true,
      data: {
        ...order,
        items: orderItemsList.map((oi) => ({
          ...oi,
          productName: "",
          variantSize: "",
        })),
      },
    };
  } catch {
    return { success: false, error: "Failed to get order" };
  }
});

export const updateOrderStatusAction = authenticatedAdminAction(async (
  session,
  orderId: string,
  newStatus: string,
): Promise<ActionResult<{ orderId: string }>> => {
  try {
    const [order] = await db
      .select({ status: orders.status })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order) return { success: false, error: "Order not found" };

    const allowed = VALID_TRANSITIONS[order.status];
    if (!allowed || !allowed.includes(newStatus)) {
      return {
        success: false,
        error: `Invalid status transition from ${order.status} to ${newStatus}`,
      };
    }

    await db
      .update(orders)
      .set({ status: newStatus })
      .where(eq(orders.id, orderId));

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);

    return { success: true, data: { orderId } };
  } catch {
    return { success: false, error: "Failed to update order status" };
  }
});
