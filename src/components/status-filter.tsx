"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export type FilterOption = { value: string; label: string };

export function StatusFilter({
  options,
  paramKey = "status",
  allLabel = "All",
}: {
  options: FilterOption[];
  paramKey?: string;
  allLabel?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get(paramKey) ?? "all";

  function select(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") params.delete(paramKey);
    else params.set(paramKey, value);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  const all: FilterOption[] = [{ value: "all", label: allLabel }, ...options];

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
      {all.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => select(opt.value)}
          className={cn(
            "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
            current === opt.value
              ? "bg-slate-800 text-white"
              : "text-slate-600 hover:bg-slate-100",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
