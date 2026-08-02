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
    // Quote lifecycle: AI sets an estimate at creation; admin may override
    // (resets to "estimate"); customer confirms when happy.
    quoteStatus: v.optional(
      v.union(v.literal("estimate"), v.literal("confirmed")),
    ),
    status: v.union(
      v.literal("new"),
      v.literal("in_repair"),
      v.literal("ready"),
      v.literal("done"),
    ),
    adminNotes: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_phone", ["customerPhone"])
    .index("by_userId", ["userId"]),
});
