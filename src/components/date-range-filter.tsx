"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";

export function DateRangeFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";

  function apply(next: { from?: string; to?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1">
      <span className="text-xs font-medium text-slate-500">Scheduled</span>
      <Input
        type="date"
        value={from}
        onChange={(e) => apply({ from: e.target.value })}
        className="h-7 w-[140px] text-xs"
      />
      <span className="text-xs text-slate-400">→</span>
      <Input
        type="date"
        value={to}
        onChange={(e) => apply({ to: e.target.value })}
        className="h-7 w-[140px] text-xs"
      />
      {(from || to) && (
        <button
          type="button"
          onClick={() => apply({ from: "", to: "" })}
          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="Clear date filter"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}
