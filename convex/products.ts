import { v } from "convex/values";
import { query, mutation, QueryCtx } from "./_generated/server";

// ── Helpers ──

function computeVariantStats(
  variants: { stock: number; priceModifier: number; isActive: boolean }[],
) {
  let totalStock = 0;
  let minActiveModifier = Infinity;

  for (const v of variants) {
    // Only active variants count toward sellable stock (F-02).
    if (v.isActive) totalStock += v.stock;
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

// ── Mutations ──

/** Turn a product name into a URL-safe slug. */
function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Find a unique slug, appending -2, -3, ... on collision. */
async function uniqueSlug(ctx: QueryCtx, base: string): Promise<string> {
  let slug = base;
  let counter = 2;
  while (true) {
    const existing = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (!existing) return slug;
    slug = `${base}-${counter}`;
    counter++;
  }
}

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    basePrice: v.number(),
    category: v.union(v.literal("jersey"), v.literal("accessory"), v.literal("other")),
    imageUrl: v.optional(v.string()),
    variants: v.array(
      v.object({
        size: v.string(),
        stock: v.number(),
        priceModifier: v.number(),
      }),
    ),
    personalizationOptions: v.array(
      v.object({
        label: v.string(),
        type: v.union(v.literal("text"), v.literal("select")),
        required: v.boolean(),
        maxLength: v.optional(v.number()),
        options: v.optional(v.array(v.string())),
      }),
    ),
  },
  handler: async (ctx, args) => {
    if (args.basePrice <= 0) {
      throw new Error("basePrice must be greater than 0 (in ZAR cents)");
    }
    if (args.variants.length === 0) {
      throw new Error("At least one variant is required");
    }
    for (const v of args.variants) {
      if (v.stock < 0) {
        throw new Error(`Stock for size "${v.size}" must be >= 0`);
      }
    }

    const slug = await uniqueSlug(ctx, nameToSlug(args.name));
    const now = Date.now();

    const productId = await ctx.db.insert("products", {
      name: args.name,
      slug,
      description: args.description,
      basePrice: args.basePrice,
      category: args.category,
      imageUrl: args.imageUrl,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    for (const v of args.variants) {
      await ctx.db.insert("productVariants", {
        productId,
        size: v.size,
        stock: v.stock,
        priceModifier: v.priceModifier,
        isActive: true,
      });
    }

    for (const opt of args.personalizationOptions) {
      await ctx.db.insert("personalizationOptions", {
        productId,
        label: opt.label,
        type: opt.type,
        required: opt.required,
        maxLength: opt.maxLength,
        options: opt.options,
      });
    }

    return productId;
  },
});

export const update = mutation({
  args: {
    id: v.id("products"),
    name: v.string(),
    description: v.string(),
    basePrice: v.number(),
    category: v.union(v.literal("jersey"), v.literal("accessory"), v.literal("other")),
    imageUrl: v.optional(v.string()),
    variants: v.array(
      v.object({
        _id: v.optional(v.id("productVariants")),
        size: v.string(),
        stock: v.number(),
        priceModifier: v.number(),
      }),
    ),
    personalizationOptions: v.array(
      v.object({
        _id: v.optional(v.id("personalizationOptions")),
        label: v.string(),
        type: v.union(v.literal("text"), v.literal("select")),
        required: v.boolean(),
        maxLength: v.optional(v.number()),
        options: v.optional(v.array(v.string())),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product) throw new Error("Product not found");

    if (args.basePrice <= 0) {
      throw new Error("basePrice must be greater than 0 (in ZAR cents)");
    }
    if (args.variants.length === 0) {
      throw new Error("At least one variant is required");
    }
    for (const v of args.variants) {
      if (v.stock < 0) {
        throw new Error(`Stock for size "${v.size}" must be >= 0`);
      }
    }

    // Handle slug: regenerate if name changed, ensure uniqueness
    let slug = product.slug;
    if (args.name !== product.name) {
      slug = await uniqueSlug(ctx, nameToSlug(args.name));
    }

    await ctx.db.patch(args.id, {
      name: args.name,
      slug,
      description: args.description,
      basePrice: args.basePrice,
      category: args.category,
      imageUrl: args.imageUrl,
      updatedAt: Date.now(),
    });

    // ── Sync variants ──
    const existingVariants = await ctx.db
      .query("productVariants")
      .withIndex("by_productId", (q) => q.eq("productId", args.id))
      .collect();

    const existingIds = new Set(
      existingVariants.map((v) => v._id),
    );
    const incomingIds = new Set(
      args.variants.filter((v) => v._id).map((v) => v._id),
    );

    // Deactivate removed variants (NOT delete)
    for (const ev of existingVariants) {
      if (!incomingIds.has(ev._id)) {
        await ctx.db.patch(ev._id, { isActive: false });
      }
    }

    // Add new or update existing
    for (const v of args.variants) {
      if (v._id && existingIds.has(v._id)) {
        await ctx.db.patch(v._id, {
          size: v.size,
          stock: v.stock,
          priceModifier: v.priceModifier,
          isActive: true,
        });
      } else {
        await ctx.db.insert("productVariants", {
          productId: args.id,
          size: v.size,
          stock: v.stock,
          priceModifier: v.priceModifier,
          isActive: true,
        });
      }
    }

    // ── Sync personalization options ──
    // Intentional asymmetry (F-01): personalization options are lightweight form
    // metadata with no inventory/order history value, so removed ones are hard-
    // deleted here while removed variants are soft-deactivated above (variants
    // preserve stock/order-history integrity). Revisit when orders (12b/13) land.
    const existingOptions = await ctx.db
      .query("personalizationOptions")
      .withIndex("by_productId", (q) => q.eq("productId", args.id))
      .collect();

    const existingOptIds = new Set(
      existingOptions.map((o) => o._id),
    );
    const incomingOptIds = new Set(
      args.personalizationOptions.filter((o) => o._id).map((o) => o._id),
    );

    // Remove deleted options
    for (const eo of existingOptions) {
      if (!incomingOptIds.has(eo._id)) {
        await ctx.db.delete(eo._id);
      }
    }

    // Add new or update existing
    for (const opt of args.personalizationOptions) {
      if (opt._id && existingOptIds.has(opt._id)) {
        await ctx.db.patch(opt._id, {
          label: opt.label,
          type: opt.type,
          required: opt.required,
          maxLength: opt.maxLength,
          options: opt.options,
        });
      } else {
        await ctx.db.insert("personalizationOptions", {
          productId: args.id,
          label: opt.label,
          type: opt.type,
          required: opt.required,
          maxLength: opt.maxLength,
          options: opt.options,
        });
      }
    }
  },
});

export const softDelete = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product) throw new Error("Product not found");
    await ctx.db.patch(args.id, { isActive: false, updatedAt: Date.now() });
  },
});

export const toggleActive = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product) throw new Error("Product not found");
    await ctx.db.patch(args.id, {
      isActive: !product.isActive,
      updatedAt: Date.now(),
    });
  },
});
