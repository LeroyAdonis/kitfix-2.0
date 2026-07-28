import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ── Queries ──

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("jobs").order("desc").collect();
  },
});

export const listByStatus = query({
  args: {
    status: v.union(
      v.literal("new"),
      v.literal("in_repair"),
      v.literal("ready"),
      v.literal("done"),
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("jobs")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { id: v.id("jobs") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// ── Mutations ──

export const create = mutation({
  args: {
    customerName: v.string(),
    customerPhone: v.string(),
    description: v.string(),
    photoUrls: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("jobs", {
      customerName: args.customerName,
      customerPhone: args.customerPhone,
      customerChannel: "whatsapp",
      description: args.description,
      damageType: undefined,
      photoUrls: args.photoUrls,
      quote: undefined,
      status: "new",
      adminNotes: undefined,
    });
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("jobs"),
    status: v.union(
      v.literal("new"),
      v.literal("in_repair"),
      v.literal("ready"),
      v.literal("done"),
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const updateNotes = mutation({
  args: { id: v.id("jobs"), notes: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { adminNotes: args.notes });
  },
});

export const updateQuote = mutation({
  args: { id: v.id("jobs"), quote: v.number() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { quote: args.quote });
  },
});
