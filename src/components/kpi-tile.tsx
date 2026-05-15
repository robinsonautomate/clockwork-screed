import type { ComponentType, ReactNode } from "react";
import type { LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";

export function KpiTile({
  label,
  value,
  sublabel,
  icon: Icon,
  tone = "slate",
}: {
  label: string;
  value: ReactNode;
  sublabel?: ReactNode;
  icon?: ComponentType<LucideProps>;
  tone?: "slate" | "amber" | "emerald" | "sky" | "rose";
}) {
  const tones: Record<string, string> = {
    slate: "bg-slate-100 text-slate-600",
    amber: "bg-amber-100 text-amber-700",
    emerald: "bg-emerald-100 text-emerald-700",
    sky: "bg-sky-100 text-sky-700",
    rose: "bg-rose-100 text-rose-700",
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium tracking-wide text-slate-500 uppercase">
          {label}
        </span>
        {Icon && (
          <span className={cn("rounded-md p-1.5", tones[tone])}>
            <Icon className="size-4" />
          </span>
        )}
      </div>
      <div className="mt-2 font-mono text-2xl font-semibold tracking-tight tabular-nums text-slate-900">
        {value}
      </div>
      {sublabel && (
        <p className="mt-1 text-xs text-slate-500">{sublabel}</p>
      )}
    </div>
  );
}
