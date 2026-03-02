"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  addWeeks,
  subWeeks,
  isSameDay,
  isAfter,
  isBefore,
  startOfDay,
} from "date-fns";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar, Clock, CheckCircle, XCircle } from "lucide-react";
import { clsx } from "clsx";

export default function CalendarPage() {
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const jobs = useQuery(api.crons.list, {});
  const days = eachDayOfInterval({ start: weekStart, end: endOfWeek(weekStart, { weekStartsOn: 1 }) });
  const today = startOfDay(new Date());

  // Map jobs to days by next_run timestamp
  const jobsForDay = (day: Date) =>
    (jobs ?? []).filter((j) => {
      if (!j.next_run) return false;
      return isSameDay(new Date(j.next_run), day);
    });

  // Also show all enabled jobs with no next_run in a sidebar
  const allEnabled = (jobs ?? []).filter((j) => j.enabled);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Calendar size={20} className="text-violet-400" /> Scheduled Tasks
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {format(weekStart, "MMMM d")} – {format(endOfWeek(weekStart, { weekStartsOn: 1 }), "MMMM d, yyyy")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekStart((w) => subWeeks(w, 1))}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg border border-zinc-700 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg border border-zinc-700 text-sm transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => setWeekStart((w) => addWeeks(w, 1))}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg border border-zinc-700 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Week grid */}
      <div className="grid grid-cols-7 gap-2 mb-8">
        {days.map((day) => {
          const isToday = isSameDay(day, today);
          const isPast = isBefore(day, today);
          const dayJobs = jobsForDay(day);
          return (
            <div
              key={day.toISOString()}
              className={clsx(
                "rounded-xl border p-3 min-h-32",
                isToday
                  ? "border-violet-500 bg-violet-500/10"
                  : isPast
                  ? "border-zinc-800 bg-zinc-900/50 opacity-60"
                  : "border-zinc-800 bg-zinc-900"
              )}
            >
              <div className={clsx("text-xs font-semibold mb-1", isToday ? "text-violet-300" : "text-zinc-500")}>
                {format(day, "EEE")}
              </div>
              <div className={clsx("text-lg font-bold mb-2", isToday ? "text-violet-200" : "text-zinc-200")}>
                {format(day, "d")}
              </div>
              <div className="space-y-1">
                {dayJobs.map((job) => (
                  <div
                    key={job._id}
                    className="text-xs bg-emerald-500/20 text-emerald-300 rounded px-2 py-1 truncate"
                    title={job.name}
                  >
                    {job.next_run && (
                      <span className="text-emerald-500 mr-1">{format(new Date(job.next_run), "HH:mm")}</span>
                    )}
                    {job.name}
                  </div>
                ))}
                {dayJobs.length === 0 && (
                  <span className="text-xs text-zinc-700">—</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* All scheduled jobs list */}
      <div>
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-3">All Scheduled Jobs</h2>
        {jobs === undefined && (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-14 bg-zinc-800/50 rounded-lg animate-pulse" />
            ))}
          </div>
        )}
        {jobs?.length === 0 && (
          <div className="text-center py-12 text-zinc-500">
            <Clock size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No scheduled jobs yet. They'll appear here once synced.</p>
          </div>
        )}
        <div className="space-y-2">
          {(jobs ?? []).map((job) => (
            <div
              key={job._id}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 flex items-center gap-4"
            >
              <div className={clsx("w-2 h-2 rounded-full shrink-0", job.enabled ? "bg-emerald-400" : "bg-zinc-600")} />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{job.name}</div>
                <div className="text-xs text-zinc-500">{job.schedule_human || job.schedule_expr}</div>
              </div>
              <div className="text-right text-xs text-zinc-500 shrink-0">
                {job.next_run && <div>Next: {format(new Date(job.next_run), "MMM d, h:mm a")}</div>}
                {job.last_run && <div>Last: {format(new Date(job.last_run), "MMM d, h:mm a")}</div>}
              </div>
              {job.last_status && (
                <div className="shrink-0">
                  {job.last_status === "success" ? (
                    <CheckCircle size={16} className="text-emerald-400" />
                  ) : (
                    <XCircle size={16} className="text-red-400" />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
