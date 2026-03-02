"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect, useRef } from "react";
import { Search, FileText, Brain, File } from "lucide-react";
import { format } from "date-fns";
import { clsx } from "clsx";

const DOC_TYPE_ICONS: Record<string, React.ReactNode> = {
  memory: <Brain size={14} className="text-purple-400" />,
  doc: <FileText size={14} className="text-blue-400" />,
  config: <File size={14} className="text-zinc-400" />,
};

function highlight(text: string, query: string) {
  if (!query.trim()) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text.slice(0, 200);
  const start = Math.max(0, idx - 60);
  const end = Math.min(text.length, idx + query.length + 140);
  const snippet = (start > 0 ? "…" : "") + text.slice(start, end) + (end < text.length ? "…" : "");
  return snippet;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  // Cmd+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const results = useQuery(
    api.documents.search,
    debouncedQuery.length >= 2 ? { query: debouncedQuery } : "skip"
  );

  const activityResults = useQuery(
    api.activity.search,
    debouncedQuery.length >= 2 ? { query: debouncedQuery } : "skip"
  );

  const hasResults = (results?.length ?? 0) + (activityResults?.length ?? 0) > 0;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold flex items-center gap-2 mb-1">
          <Search size={20} className="text-violet-400" /> Global Search
        </h1>
        <p className="text-sm text-zinc-500">Search memory files, docs, and activity</p>
      </div>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search anything… (⌘K)"
          autoFocus
          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-9 pr-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
          >
            ✕
          </button>
        )}
      </div>

      {!debouncedQuery && (
        <div className="text-center py-20 text-zinc-600">
          <Search size={40} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm">Start typing to search memory, docs, and activity</p>
        </div>
      )}

      {debouncedQuery.length >= 2 && results === undefined && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-zinc-800/50 rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {debouncedQuery.length >= 2 && results !== undefined && !hasResults && (
        <div className="text-center py-16 text-zinc-500">
          <p>No results for <span className="text-zinc-300">"{debouncedQuery}"</span></p>
        </div>
      )}

      {(results?.length ?? 0) > 0 && (
        <div className="mb-6">
          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">
            Documents & Memory ({results!.length})
          </div>
          <div className="space-y-2">
            {results!.map((doc) => (
              <div
                key={doc._id}
                className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  {DOC_TYPE_ICONS[doc.doc_type] ?? <File size={14} />}
                  <span className="font-medium text-sm">{doc.title}</span>
                  <span className="text-xs text-zinc-600 ml-auto">
                    {format(new Date(doc.last_modified), "MMM d, yyyy")}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 font-mono leading-relaxed">
                  {highlight(doc.content, debouncedQuery)}
                </p>
                <div className="text-xs text-zinc-600 mt-1">{doc.file_path}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(activityResults?.length ?? 0) > 0 && (
        <div>
          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">
            Activity ({activityResults!.length})
          </div>
          <div className="space-y-2">
            {activityResults!.map((a) => (
              <div
                key={a._id}
                className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{a.title}</span>
                  <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
                    {a.action_type.replace(/_/g, " ")}
                  </span>
                  <span className="text-xs text-zinc-600 ml-auto">
                    {format(new Date(a.timestamp), "MMM d, h:mm a")}
                  </span>
                </div>
                {a.description && (
                  <p className="text-xs text-zinc-400 mt-1">{a.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
