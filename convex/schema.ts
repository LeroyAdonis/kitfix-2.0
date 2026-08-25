import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  jobs: defineTable({
    customerName: v.string(),
    customerPhone: v.optional(v.string()),
    customerEmail: v.optional(v.string()),
    customerChannel: v.union(
      v.literal("whatsapp"),
      v.literal("telegram"),
      v.literal("web"),
    ),
    // Better Auth user id (component users table lives outside main schema)
    userId: v.optional(v.string()),
    description: v.string(),
    damageType: v.optional(v.string()),
    // Convex storage IDs; resolve to URLs via ctx.storage.getUrl in queries
    photoStorageIds: v.array(v.id("_storage")),
    // Legacy resolved URLs kept for backward compat with existing admin UI
    photoUrls: v.array(v.string()),
    aiAnalysis: v.optional(
      v.object({
        damageType: v.string(),
        description: v.string(),
        suggestedTier: v.string(),
        suggestedPrice: v.number(),
        confidence: v.number(),
        model: v.string(),
      }),
    ),
    quote: v.optional(v.number()),
    // Audit trail of every quote change (B011): oldest → newest.
    // Each entry: { quote (cents), status ("estimate"|"confirmed"), at (epoch ms) }
    quoteHistory: v.optional(
      v.array(
        v.object({
          quote: v.number(),
          status: v.union(v.literal("estimate"), v.literal("confirmed")),
          at: v.number(),
        }),
      ),
    ),
    // Quote lifecycle: AI sets an estimate at creation; admin may override
    // (resets to "estimate"); customer confirms when happy.
    quoteStatus: v.optional(
      v.union(v.literal("estimate"), v.literal("confirmed")),
    ),
    paymentStatus: v.optional(
      v.union(v.literal("unpaid"), v.literal("paid")),
    ),
    paymentReference: v.optional(v.string()),
    paidAt: v.optional(v.number()),
    status: v.union(
      v.literal("new"),
      v.literal("in_repair"),
      v.literal("ready"),
      v.literal("done"),
    ),
    adminNotes: v.optional(v.string()),
    // Epoch ms when archived; absent = active. Soft-delete for admin archive.
    archivedAt: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_phone", ["customerPhone"])
    .index("by_userId", ["userId"]),

  products: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    basePrice: v.number(),           // ZAR cents (integer) — matches jobs.quote convention
    category: v.union(v.literal("jersey"), v.literal("accessory"), v.literal("other")),
    imageUrl: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),           // epoch ms
    updatedAt: v.number(),           // epoch ms
  })
    .index("by_slug", ["slug"])
    .index("by_category", ["category"]),

  productVariants: defineTable({
    productId: v.id("products"),
    size: v.string(),                // "XS" | "S" | "M" | "L" | "XL" | "2XL" | "3XL" | "Kids"
    stock: v.number(),               // >= 0
    priceModifier: v.number(),       // ZAR cents added to basePrice (can be negative for discounts)
    isActive: v.boolean(),
  })
    .index("by_productId", ["productId"]),

  personalizationOptions: defineTable({
    productId: v.id("products"),
    label: v.string(),               // e.g. "Name", "Number", "Sleeve text"
    type: v.union(v.literal("text"), v.literal("select")),
    required: v.boolean(),
    maxLength: v.optional(v.number()), // for text type
    options: v.optional(v.array(v.string())), // for select type
  })
    .index("by_productId", ["productId"]),
});
