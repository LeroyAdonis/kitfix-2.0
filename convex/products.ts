import { v } from "convex/values";
import { query } from "./_generated/server";

// ── Helpers ──

function computeVariantStats(
  variants: { stock: number; priceModifier: number; isActive: boolean }[],
) {
  let totalStock = 0;
  let minActiveModifier = Infinity;

  for (const v of variants) {
    totalStock += v.stock;
    if (v.isActive && v.priceModifier < minActiveModifier) {
      minActiveModifier = v.priceModifier;
    }
  }

  return {
    totalStock,
    variantCount: variants.length,
    displayPriceModifier: minActiveModifier === Infinity ? 0 : minActiveModifier,
  };
}

// ── Queries ──

/** All products with variant count and total stock (admin list). */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();

    const results = await Promise.all(
      products.map(async (product) => {
        const variants = await ctx.db
          .query("productVariants")
          .withIndex("by_productId", (q) => q.eq("productId", product._id))
          .collect();

        const { totalStock, variantCount, displayPriceModifier } =
          computeVariantStats(variants);

        return {
          ...product,
          totalStock,
          variantCount,
          displayPrice: product.basePrice + displayPriceModifier,
        };
      }),
    );

    return results;
  },
});

/** Active products only (for future storefront). */
export const listActive = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db
      .query("products")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const results = await Promise.all(
      products.map(async (product) => {
        const variants = await ctx.db
          .query("productVariants")
          .withIndex("by_productId", (q) => q.eq("productId", product._id))
          .collect();

        const { totalStock, variantCount, displayPriceModifier } =
          computeVariantStats(variants);

        return {
          ...product,
          totalStock,
          variantCount,
          displayPrice: product.basePrice + displayPriceModifier,
        };
      }),
    );

    return results;
  },
});

/** Single product with all variants and personalization options. */
export const get = query({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product) return null;

    const variants = await ctx.db
      .query("productVariants")
      .withIndex("by_productId", (q) => q.eq("productId", product._id))
      .collect();

    const personalizationOptions = await ctx.db
      .query("personalizationOptions")
      .withIndex("by_productId", (q) => q.eq("productId", product._id))
      .collect();

    const { totalStock, variantCount, displayPriceModifier } =
      computeVariantStats(variants);

    return {
      ...product,
      variants,
      personalizationOptions,
      totalStock,
      variantCount,
      displayPrice: product.basePrice + displayPriceModifier,
    };
  },
});

/** Product by slug (for future storefront URLs). */
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const product = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!product) return null;

    const variants = await ctx.db
      .query("productVariants")
      .withIndex("by_productId", (q) => q.eq("productId", product._id))
      .collect();

    const personalizationOptions = await ctx.db
      .query("personalizationOptions")
      .withIndex("by_productId", (q) => q.eq("productId", product._id))
      .collect();

    const { totalStock, variantCount, displayPriceModifier } =
      computeVariantStats(variants);

    return {
      ...product,
      variants,
      personalizationOptions,
      totalStock,
      variantCount,
      displayPrice: product.basePrice + displayPriceModifier,
    };
  },
});
