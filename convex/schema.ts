import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  activity: defineTable({
    timestamp: v.number(),
    action_type: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    metadata: v.optional(v.string()), // JSON string
    status: v.string(), // "success" | "error" | "pending"
    session_id: v.optional(v.string()),
  })
    .index("by_timestamp", ["timestamp"])
    .index("by_action_type", ["action_type"])
    .searchIndex("search_activity", {
      searchField: "title",
      filterFields: ["action_type", "status"],
    }),

  cron_jobs: defineTable({
    name: v.string(),
    schedule_expr: v.string(),
    schedule_human: v.string(),
    next_run: v.optional(v.number()),
    last_run: v.optional(v.number()),
    last_status: v.optional(v.string()),
    enabled: v.boolean(),
    job_id: v.optional(v.string()),
  }).index("by_name", ["name"]),

  documents: defineTable({
    title: v.string(),
    content: v.string(),
    file_path: v.string(),
    doc_type: v.string(), // "memory" | "doc" | "config"
    last_modified: v.number(),
  })
    .index("by_file_path", ["file_path"])
    .searchIndex("search_documents", {
      searchField: "content",
      filterFields: ["doc_type"],
    }),
});
