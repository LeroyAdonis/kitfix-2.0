"use server";

import { eq } from "drizzle-orm";

import { authenticatedAction } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { orders, orderItems, cartItems } from "@/lib/db/schema";
import {
  getProductById,
  checkStock,
  decrementStock,
} from "@/lib/db/queries/products";
import { createPayment } from "@/lib/db/queries/payments";
import { polar } from "@/lib/polar";
import { logger } from "@/lib/logger";
import type { ActionResult, OrderResponse } from "@/types";
import type { ShippingMode } from "@/lib/courier/types";

interface ShippingData {
  shippingMode: ShippingMode;
  lockerId?: string;
  shippingAddress: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
}

export const createOrderFromCart = authenticatedAction(async (
  session,
  shippingData?: ShippingData,
): Promise<ActionResult<OrderResponse>> => {
  const cartRows = await db
    .select()
    .from(cartItems)
    .where(eq(cartItems.userId, session.user.id));

  if (cartRows.length === 0) {
    return { success: false, error: "Your cart is empty." };
  }

  let itemTotal = 0;
  const orderItemData: Array<{
    productId: string;
    variantId: string;
    quantity: number;
    unitPriceCents: number;
    personalization: Record<string, string> | null;
  }> = [];

  for (const item of cartRows) {
    const product = await getProductById(item.productId);
    if (!product) {
      return {
        success: false,
        error: `Product ${item.productId} is no longer available.`,
      };
    }

    const stockOk = await checkStock(item.variantId, item.quantity);
    if (!stockOk) {
      return {
        success: false,
        error: `Insufficient stock for ${product.name}.`,
      };
    }

    const unitPrice = product.basePrice;
    itemTotal += unitPrice * item.quantity;
    orderItemData.push({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      unitPriceCents: unitPrice,
      personalization: item.personalization as Record<string, string> | null,
    });
  }

  const shippingMode = shippingData?.shippingMode;
  const lockerId = shippingData?.lockerId ?? null;
  const shippingAddress = shippingData?.shippingAddress ?? null;

  const shippingCents = shippingMode === "D2D" ? 9900 : 0;
  const grandTotal = itemTotal + shippingCents;

  const [order] = await db
    .insert(orders)
    .values({
      userId: session.user.id,
      status: "pending",
      totalCents: itemTotal,
      shippingCents,
      grandTotalCents: grandTotal,
      shippingAddress: shippingAddress as unknown as Record<string, unknown> | null,
      shippingMode: shippingMode ?? null,
      lockerId,
    })
    .returning();

  const createdItems = await db
    .insert(orderItems)
    .values(
      orderItemData.map((d) => ({
        ...d,
        orderId: order.id,
      })),
    )
    .returning();

  // Decrement stock for each variant
  for (const item of cartRows) {
    await decrementStock(item.variantId, item.quantity);
  }

  // Clear cart
  await db.delete(cartItems).where(eq(cartItems.userId, session.user.id));

  return {
    success: true,
    data: {
      ...order,
      items: createdItems.map((oi) => ({
        ...oi,
        productName: "",
        variantSize: "",
      })),
    },
  };
});

export const getOrders = authenticatedAction(async (
  session,
): Promise<ActionResult<OrderResponse[]>> => {
  const orderRows = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, session.user.id));

  const enriched = await Promise.all(
    orderRows.map(async (order) => {
      const items = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id));

      return {
        ...order,
        items: items.map((oi) => ({
          ...oi,
          productName: "",
          variantSize: "",
        })),
      };
    }),
  );

  return { success: true, data: enriched };
});

export const getOrderById = authenticatedAction(async (
  session,
  orderId: string,
): Promise<ActionResult<OrderResponse>> => {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!order) {
    return { success: false, error: "Order not found." };
  }

  if (order.userId !== session.user.id && session.user.role !== "admin") {
    return { success: false, error: "Order not found." };
  }

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));

  return {
    success: true,
    data: {
      ...order,
      items: items.map((oi) => ({
        ...oi,
        productName: "",
        variantSize: "",
      })),
    },
  };
});

export const initiateOrderCheckout = authenticatedAction(async (
  session,
  orderId: string,
): Promise<ActionResult<{ checkoutUrl: string }>> => {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!order) {
    return { success: false, error: "Order not found." };
  }

  if (order.userId !== session.user.id && session.user.role !== "admin") {
    return { success: false, error: "Order not found." };
  }

  if (order.status !== "pending") {
    return {
      success: false,
      error: "This order cannot be paid for.",
    };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    const checkout = await polar.checkouts.create({
      products: [process.env.POLAR_PRODUCT_ID ?? ""],
      successUrl: `${appUrl}/orders/${orderId}?payment=success`,
      returnUrl: `${appUrl}/orders/${orderId}`,
      metadata: {
        orderId,
        customerId: session.user.id,
      },
    });

    await db
      .update(orders)
      .set({ polarCheckoutId: checkout.id })
      .where(eq(orders.id, orderId));

    await createPayment({
      orderId,
      customerId: session.user.id,
      polarCheckoutId: checkout.id,
      amount: order.grandTotalCents,
      currency: "usd",
      status: "pending",
      metadata: {
        orderId,
        customerId: session.user.id,
        polarCheckoutUrl: checkout.url,
      },
    });

    return {
      success: true,
      data: { checkoutUrl: checkout.url },
    };
  } catch (error) {
    logger.error("Failed to create Polar checkout", { error });
    return {
      success: false,
      error: "Failed to initiate payment. Please try again.",
    };
  }
});
