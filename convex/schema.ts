import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  jobs: defineTable({
    customerName: v.string(),
    customerPhone: v.string(),
    customerChannel: v.union(v.literal("whatsapp"), v.literal("telegram")),
    description: v.string(),
    damageType: v.optional(v.string()),
    photoUrls: v.array(v.string()),
    quote: v.optional(v.number()),
    status: v.union(
      v.literal("new"),
      v.literal("in_repair"),
      v.literal("ready"),
      v.literal("done"),
    ),
    adminNotes: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_phone", ["customerPhone"]),
});
