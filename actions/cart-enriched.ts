"use server";

import { authenticatedAction } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { cartItems, products, productVariants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { ActionResult } from "@/types";

export interface EnrichedCartItem {
  id: string;
  productId: string;
  productName: string;
  variantSize: string;
  unitPrice: number;
  quantity: number;
  personalization: Record<string, string> | null;
}

export interface EnrichedCartData {
  items: EnrichedCartItem[];
  itemTotal: number;
}

export const getEnrichedCart = authenticatedAction(async (
  session,
): Promise<ActionResult<EnrichedCartData>> => {
  const items = await db
    .select({
      id: cartItems.id,
      productId: cartItems.productId,
      variantId: cartItems.variantId,
      quantity: cartItems.quantity,
      personalization: cartItems.personalization,
      productName: products.name,
      basePrice: products.basePrice,
      size: productVariants.size,
      priceModifier: productVariants.priceModifier,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .innerJoin(productVariants, eq(cartItems.variantId, productVariants.id))
    .where(eq(cartItems.userId, session.user.id));

  let itemTotal = 0;
  const enriched = items.map((item) => {
    const unitPrice = item.basePrice + item.priceModifier;
    itemTotal += unitPrice * item.quantity;
    return {
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      variantSize: item.size,
      unitPrice,
      quantity: item.quantity,
      personalization: item.personalization as Record<string, string> | null,
    };
  });

  return {
    success: true,
    data: { items: enriched, itemTotal },
  };
});
