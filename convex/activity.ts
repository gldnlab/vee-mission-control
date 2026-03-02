import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const log = mutation({
  args: {
    timestamp: v.optional(v.number()),
    action_type: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    metadata: v.optional(v.string()),
    status: v.string(),
    session_id: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("activity", {
      ...args,
      timestamp: args.timestamp ?? Date.now(),
    });
  },
});

export const list = query({
  args: {
    limit: v.optional(v.number()),
    action_type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db.query("activity").withIndex("by_timestamp").order("desc");
    const results = await q.take(args.limit ?? 100);
    if (args.action_type) {
      return results.filter((r) => r.action_type === args.action_type);
    }
    return results;
  },
});

export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("activity")
      .withSearchIndex("search_activity", (q) => q.search("title", args.query))
      .take(20);
  },
});
