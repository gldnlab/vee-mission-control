"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Calendar, Search, Zap } from "lucide-react";
import { clsx } from "clsx";

const nav = [
  { href: "/activity", label: "Activity Feed", icon: Activity },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/search", label: "Global Search", icon: Search },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-56 bg-zinc-900 border-r border-zinc-800 flex flex-col">
      <div className="flex items-center gap-2 px-4 py-5 border-b border-zinc-800">
        <div className="w-7 h-7 rounded-full bg-violet-500 flex items-center justify-center">
          <Zap size={14} className="text-white" />
        </div>
        <span className="font-semibold text-sm tracking-wide">Mission Control</span>
      </div>
      <nav className="flex-1 py-4 px-2 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
              pathname === href
                ? "bg-violet-500/20 text-violet-300 font-medium"
                : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
            )}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>
      <div className="px-4 py-3 border-t border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-zinc-400">Vee is online</span>
        </div>
      </div>
    </aside>
  );
}
