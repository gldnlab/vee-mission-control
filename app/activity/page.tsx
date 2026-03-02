"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { format, isToday, isYesterday, startOfDay } from "date-fns";
import { useState } from "react";
import {
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
} from "lucide-react";
import { clsx } from "clsx";

const ACTION_TYPES = [
  "all",
  "email_sent",
  "memory_updated",
  "cron_ran",
  "search_performed",
  "file_edited",
  "slack_message",
  "task_created",
  "document_synced",
];

const ACTION_COLORS: Record<string, string> = {
  email_sent: "bg-blue-500/20 text-blue-300",
  memory_updated: "bg-purple-500/20 text-purple-300",
  cron_ran: "bg-emerald-500/20 text-emerald-300",
  search_performed: "bg-yellow-500/20 text-yellow-300",
  file_edited: "bg-orange-500/20 text-orange-300",
  slack_message: "bg-pink-500/20 text-pink-300",
  task_created: "bg-cyan-500/20 text-cyan-300",
  document_synced: "bg-indigo-500/20 text-indigo-300",
};

function dayLabel(ts: number) {
  const d = new Date(ts);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "EEEE, MMMM d");
}

function StatusIcon({ status }: { status: string }) {
  if (status === "success") return <CheckCircle size={14} className="text-emerald-400 shrink-0" />;
  if (status === "error") return <XCircle size={14} className="text-red-400 shrink-0" />;
  return <Clock size={14} className="text-yellow-400 shrink-0" />;
}

export default function ActivityPage() {
  const [filter, setFilter] = useState("all");
  const activities = useQuery(api.activity.list, {
    limit: 200,
    action_type: filter === "all" ? undefined : filter,
  });

  // Group by day
  const grouped: Record<string, typeof activities> = {};
  (activities ?? []).forEach((a: any) => {
    const key = String(startOfDay(new Date(a.timestamp)).getTime());
    if (!grouped[key]) grouped[key] = [];
    grouped[key]!.push(a);
  });
  const days = Object.keys(grouped).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Activity size={20} className="text-violet-400" /> Activity Feed
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Everything Vee has done for you</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-zinc-500" />
          <select
            className="bg-zinc-800 border border-zinc-700 text-zinc-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-violet-500"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            {ACTION_TYPES.map((t) => (
              <option key={t} value={t}>
                {t === "all" ? "All types" : t.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>
      </div>

      {activities === undefined && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-zinc-800/50 rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {activities?.length === 0 && (
        <div className="text-center py-24 text-zinc-500">
          <Activity size={40} className="mx-auto mb-3 opacity-30" />
          <p>No activity yet. Vee is ready and waiting.</p>
        </div>
      )}

      {days.map((dayKey) => (
        <div key={dayKey} className="mb-8">
          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">
            {dayLabel(Number(dayKey))}
          </div>
          <div className="space-y-2">
            {grouped[dayKey]!.map((a: any) => (
              <div
                key={a._id}
                className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 flex items-start gap-3 hover:border-zinc-700 transition-colors"
              >
                <StatusIcon status={a.status} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-zinc-100">{a.title}</span>
                    <span
                      className={clsx(
                        "text-xs px-2 py-0.5 rounded-full font-medium",
                        ACTION_COLORS[a.action_type] ?? "bg-zinc-700 text-zinc-300"
                      )}
                    >
                      {a.action_type.replace(/_/g, " ")}
                    </span>
                  </div>
                  {a.description && (
                    <p className="text-xs text-zinc-400 mt-0.5 truncate">{a.description}</p>
                  )}
                </div>
                <span className="text-xs text-zinc-600 shrink-0 font-mono">
                  {format(new Date(a.timestamp), "h:mm a")}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
