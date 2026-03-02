import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const sync = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    file_path: v.string(),
    doc_type: v.string(),
    last_modified: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("documents")
      .withIndex("by_file_path", (q) => q.eq("file_path", args.file_path))
      .first();
    const data = { ...args, last_modified: args.last_modified ?? Date.now() };
    if (existing) {
      await ctx.db.patch(existing._id, data);
      return existing._id;
    }
    return await ctx.db.insert("documents", data);
  },
});

export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("documents")
      .withSearchIndex("search_documents", (q) =>
        q.search("content", args.query)
      )
      .take(20);
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("documents").collect();
  },
});
