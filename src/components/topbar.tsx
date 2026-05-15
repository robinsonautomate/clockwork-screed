"use client";

import { Search } from "lucide-react";
import { OPEN_SEARCH_EVENT } from "@/components/command-palette";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function Topbar() {
  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b border-slate-200 bg-white/90 px-3 backdrop-blur-sm md:px-5">
      <SidebarTrigger className="text-slate-600" />
      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event(OPEN_SEARCH_EVENT))}
        className="ml-auto flex h-9 w-full max-w-xs items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-400 transition-colors hover:border-slate-300 hover:bg-white"
      >
        <Search className="size-4 shrink-0" />
        <span className="flex-1 text-left">Search…</span>
        <kbd className="hidden rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-slate-500 sm:inline">
          ⌘K
        </kbd>
      </button>
    </header>
  );
}
