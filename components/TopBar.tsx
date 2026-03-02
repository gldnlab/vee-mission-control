"use client";
import { useEffect, useState } from "react";
import { format } from "date-fns";

export default function TopBar() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () => setTime(format(new Date(), "EEE MMM d, h:mm:ss a"));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <header className="h-12 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-6">
      <span className="text-sm font-medium text-zinc-300">Vee / Derek</span>
      <span className="text-xs text-zinc-500 font-mono">{time}</span>
    </header>
  );
}
