import { cn } from "@/lib/utils";

const STYLES: Record<string, string> = {
  new: "bg-sky-100 text-sky-700",
  quoted: "bg-amber-100 text-amber-800",
  won: "bg-emerald-100 text-emerald-700",
  lost: "bg-rose-100 text-rose-700",
  draft: "bg-slate-100 text-slate-600",
  sent: "bg-sky-100 text-sky-700",
  accepted: "bg-emerald-100 text-emerald-700",
  declined: "bg-rose-100 text-rose-700",
  scheduled: "bg-indigo-100 text-indigo-700",
  in_progress: "bg-amber-100 text-amber-800",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-slate-100 text-slate-500",
  paid: "bg-emerald-100 text-emerald-700",
  overdue: "bg-rose-100 text-rose-700",
};

export function formatStatusLabel(status: string): string {
  return status.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        STYLES[status] ?? "bg-slate-100 text-slate-600",
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {formatStatusLabel(status)}
    </span>
  );
}
