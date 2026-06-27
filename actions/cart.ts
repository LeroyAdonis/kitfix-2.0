"use server";

import { and, eq } from "drizzle-orm";

import { authenticatedAction } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { cartItems } from "@/lib/db/schema";
import { checkStock, getProductById } from "@/lib/db/queries/products";
import type { ActionResult } from "@/types";

async function getCartItemOrError(itemId: string, userId: string): Promise<{ error: string } | { item: typeof cartItems.$inferSelect }> {
  const items = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.id, itemId), eq(cartItems.userId, userId)))
    .limit(1);

  if (items.length === 0) {
    return { error: "Cart item not found." };
  }
  return { item: items[0] };
}

export const updateCartItem = authenticatedAction(async (
  session,
  itemId: string,
  quantity: number,
): Promise<ActionResult<{ id: string; quantity: number }>> => {
  const result = await getCartItemOrError(itemId, session.user.id);
  if ("error" in result) {
    return { success: false, error: result.error };
  }

  if (quantity <= 0) {
    await db.delete(cartItems).where(eq(cartItems.id, itemId));
    return { success: true, data: { id: itemId, quantity: 0 } };
  }

  await db
    .update(cartItems)
    .set({ quantity })
    .where(eq(cartItems.id, itemId));

  return { success: true, data: { id: itemId, quantity } };
});

export const getCartTotal = authenticatedAction(async (
  session,
): Promise<ActionResult<{ itemTotal: number; shippingTotal: number; grandTotal: number }>> => {
  const items = await db
    .select()
    .from(cartItems)
    .where(eq(cartItems.userId, session.user.id));

  let itemTotal = 0;
  for (const item of items) {
    const product = await getProductById(item.productId);
    if (product) {
      itemTotal += product.basePrice * item.quantity;
    }
  }

  const shippingTotal = 0;
  const grandTotal = itemTotal + shippingTotal;

  return { success: true, data: { itemTotal, shippingTotal, grandTotal } };
});

export const getCart = authenticatedAction(async (
  session,
): Promise<
  ActionResult<{ items: Array<{ id: string; productId: string; variantId: string; quantity: number; personalization: Record<string, string> | null }> }>
> => {
  const items = await db
    .select()
    .from(cartItems)
    .where(eq(cartItems.userId, session.user.id));

  return {
    success: true,
    data: {
      items: items.map((item) => ({
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        personalization: item.personalization as Record<string, string> | null,
      })),
    },
  };
});

export const removeFromCart = authenticatedAction(async (
  session,
  itemId: string,
): Promise<ActionResult<null>> => {
  const result = await getCartItemOrError(itemId, session.user.id);
  if ("error" in result) {
    return { success: false, error: result.error };
  }

  await db.delete(cartItems).where(eq(cartItems.id, itemId));
  return { success: true, data: null };
});

export const addToCart = authenticatedAction(async (
  session,
  input: {
    productId: string;
    variantId: string;
    quantity: number;
    personalization?: Record<string, string>;
  },
): Promise<ActionResult<{ id: string; productId: string; variantId: string; quantity: number; personalization: Record<string, string> | null }>> => {
  const product = await getProductById(input.productId);
  if (!product || !product.isActive) {
    return { success: false, error: "Product is not available." };
  }

  const stockAvailable = await checkStock(input.variantId, input.quantity);
  if (!stockAvailable) {
    return { success: false, error: "Insufficient stock." };
  }

  // Check for existing cart item with same combo
  const existing = await db
    .select({ id: cartItems.id, quantity: cartItems.quantity })
    .from(cartItems)
    .where(
      and(
        eq(cartItems.userId, session.user.id),
        eq(cartItems.productId, input.productId),
        eq(cartItems.variantId, input.variantId),
        eq(cartItems.personalization, (input.personalization ?? {}) as Record<string, string>),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    const newQty = existing[0].quantity + input.quantity;
    await db
      .update(cartItems)
      .set({ quantity: newQty })
      .where(eq(cartItems.id, existing[0].id));

    const [updated] = await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.id, existing[0].id))
      .limit(1);

    return {
      success: true,
      data: {
        id: updated.id,
        productId: updated.productId,
        variantId: updated.variantId,
        quantity: updated.quantity,
        personalization: updated.personalization as Record<string, string> | null,
      },
    };
  }

  const [item] = await db.insert(cartItems).values({
    userId: session.user.id,
    productId: input.productId,
    variantId: input.variantId,
    quantity: input.quantity,
    personalization: (input.personalization ?? null) as Record<string, string> | null,
  }).returning();

  return {
    success: true,
    data: {
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      personalization: item.personalization as Record<string, string> | null,
    },
  };
});
