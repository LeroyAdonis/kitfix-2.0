import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";

// ── Queries ──

async function resolvePhotoUrls(
  ctx: { storage: { getUrl: (id: string) => Promise<string | null> } },
  job: { photoStorageIds?: string[]; [key: string]: unknown },
): Promise<Record<string, unknown>> {
  const resolved: string[] = [];
  for (const id of job.photoStorageIds ?? []) {
    const url = await ctx.storage.getUrl(id);
    if (url) resolved.push(url);
  }
  return { ...job, photoUrls: resolved };
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const jobs = await ctx.db.query("jobs").order("desc").collect();
    return Promise.all(jobs.map((job) => resolvePhotoUrls(ctx, job)));
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
    const jobs = await ctx.db
      .query("jobs")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .order("desc")
      .collect();
    return Promise.all(jobs.map((job) => resolvePhotoUrls(ctx, job)));
  },
});

export const get = query({
  args: { id: v.id("jobs") },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.id);
    if (!job) return null;
    return resolvePhotoUrls(ctx, job);
  },
});

// Customer tracking: jobs belonging to the current Better Auth user
export const listByUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity?.() ?? null;
    if (!user) return [];
    const jobs = await ctx.db
      .query("jobs")
      .withIndex("by_userId", (q) => q.eq("userId", user.subject))
      .order("desc")
      .collect();
    return Promise.all(jobs.map((job) => resolvePhotoUrls(ctx, job)));
  },
});

// Resolve a storage ID to a signed URL (used by the AI analyze route)
export const getPhotoUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

// ── Mutations ──

export const create = mutation({
  args: {
    customerName: v.string(),
    customerPhone: v.optional(v.string()),
    customerEmail: v.optional(v.string()),
    description: v.string(),
    photoStorageIds: v.array(v.id("_storage")),
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
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity?.() ?? null;
    return await ctx.db.insert("jobs", {
      customerName: args.customerName,
      customerPhone: args.customerPhone,
      customerEmail: args.customerEmail ?? user?.email,
      customerChannel: "web",
      userId: user?.subject,
      description: args.description,
      damageType: args.aiAnalysis?.damageType,
      photoStorageIds: args.photoStorageIds,
      photoUrls: [],
      aiAnalysis: args.aiAnalysis,
      quote: args.aiAnalysis?.suggestedPrice,
      status: "new",
      adminNotes: undefined,
    });
  },
});

export const createWebJob = mutation({
  args: {
    customerName: v.string(),
    customerPhone: v.optional(v.string()),
    description: v.string(),
    photoStorageIds: v.array(v.id("_storage")),
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
  },
  handler: async (ctx, args) => {
    // Web jobs require an authenticated user
    const user = await ctx.auth.getUserIdentity?.();
    if (!user) throw new Error("Authentication required to submit a web job");

    return await ctx.db.insert("jobs", {
      customerName: args.customerName,
      customerPhone: args.customerPhone,
      customerEmail: user.email,
      customerChannel: "web",
      userId: user.subject,
      description: args.description,
      damageType: args.aiAnalysis?.damageType,
      photoStorageIds: args.photoStorageIds,
      photoUrls: [],
      aiAnalysis: args.aiAnalysis,
      quote: args.aiAnalysis?.suggestedPrice,
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

// ── Actions ──

// Client calls this to get a signed upload URL, then PUTs the file directly
export const generateUploadUrl = action({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
