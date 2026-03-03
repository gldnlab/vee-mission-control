import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const sync = mutation({
  args: {
    jobs: v.array(
      v.object({
        job_id: v.optional(v.string()),
        name: v.string(),
        schedule_expr: v.string(),
        schedule_human: v.string(),
        next_run: v.optional(v.number()),
        last_run: v.optional(v.number()),
        last_status: v.optional(v.string()),
        enabled: v.boolean(),
        agent: v.optional(v.string()),
        recipient: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Upsert each job by name
    for (const job of args.jobs) {
      const existing = await ctx.db
        .query("cron_jobs")
        .withIndex("by_name", (q) => q.eq("name", job.name))
        .first();
      if (existing) {
        await ctx.db.patch(existing._id, job);
      } else {
        await ctx.db.insert("cron_jobs", job);
      }
    }
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("cron_jobs").collect();
  },
});
