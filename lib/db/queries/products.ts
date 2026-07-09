import { eq, sql } from "drizzle-orm";

import { db } from "../index";
import { products, productVariants } from "../schema";

/** Fetch a single product by ID. Returns null if not found. */
export async function getProductById(id: string) {
  const result = await db.query.products.findFirst({
    where: eq(products.id, id),
  });
  return result ?? null;
}

/** Fetch all active products with their variants. */
export async function getActiveProducts() {
  return db.query.products.findMany({
    where: eq(products.isActive, true),
    with: {
      variants: true,
    },
    orderBy: [products.createdAt],
  });
}

/** Fetch a single product by slug with variants + personalization options. */
export async function getProductBySlug(slug: string) {
  const result = await db.query.products.findFirst({
    where: eq(products.slug, slug),
    with: {
      variants: true,
      personalizationOptions: true,
    },
  });
  return result ?? null;
}

/** Fetch all variants for a product. */
export async function getProductVariants(productId: string) {
  return db.query.productVariants.findMany({
    where: eq(productVariants.productId, productId),
  });
}

/** Check if a variant has enough stock. */
export async function checkStock(variantId: string, quantity: number) {
  const variant = await db.query.productVariants.findFirst({
    where: eq(productVariants.id, variantId),
    columns: { stock: true },
  });
  return variant ? variant.stock >= quantity : false;
}

/** Decrement stock for a variant (for checkout). */
export async function decrementStock(variantId: string, quantity: number) {
  await db
    .update(productVariants)
    .set({
      stock: sql`${productVariants.stock} - ${quantity}`,
    })
    .where(eq(productVariants.id, variantId));
}
