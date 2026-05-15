import Link from "next/link";
import { format } from "date-fns";
import type { ScheduleWeek } from "@/lib/queries/schedule";
import { formatArea } from "@/lib/format";
import { cn } from "@/lib/utils";

const STATUS_DOT: Record<string, string> = {
  scheduled: "bg-indigo-500",
  in_progress: "bg-amber-500",
  completed: "bg-emerald-500",
  cancelled: "bg-slate-400",
};

export function ScheduleGrid({ week }: { week: ScheduleWeek }) {
  const { days, crews, jobs } = week;
  const todayStr = new Date().toISOString().slice(0, 10);

  const hasUnassigned = jobs.some((j) => !j.crewId);
  const rows: { id: string | null; name: string; lead?: string }[] = [
    ...crews.map((c) => ({ id: c.id, name: c.name, lead: c.leadName })),
    ...(hasUnassigned ? [{ id: null, name: "Unassigned" }] : []),
  ];

  function cellJobs(crewId: string | null, dayStr: string) {
    return jobs.filter(
      (j) => (j.crewId ?? null) === crewId && j.scheduledDate === dayStr,
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <div className="grid min-w-[820px] grid-cols-[132px_repeat(7,minmax(0,1fr))]">
        {/* Header row */}
        <div className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
          Crew
        </div>
        {days.map((day) => {
          const dayStr = day.toISOString().slice(0, 10);
          const isToday = dayStr === todayStr;
          return (
            <div
              key={dayStr}
              className={cn(
                "border-b border-l border-slate-200 px-3 py-2 text-center",
                isToday ? "bg-amber-50" : "bg-slate-50",
              )}
            >
              <div className="text-xs font-semibold text-slate-600">
                {format(day, "EEE")}
              </div>
              <div
                className={cn(
                  "font-mono text-sm",
                  isToday ? "font-bold text-amber-700" : "text-slate-400",
                )}
              >
                {format(day, "d MMM")}
              </div>
            </div>
          );
        })}

        {/* Crew rows */}
        {rows.map((row) => (
          <div key={row.id ?? "unassigned"} className="contents">
            <div className="border-b border-slate-100 px-3 py-3">
              <div className="text-sm font-semibold text-slate-800">
                {row.name}
              </div>
              {row.lead && (
                <div className="text-xs text-slate-500">{row.lead}</div>
              )}
            </div>
            {days.map((day) => {
              const dayStr = day.toISOString().slice(0, 10);
              const isToday = dayStr === todayStr;
              const cell = cellJobs(row.id, dayStr);
              return (
                <div
                  key={dayStr}
                  className={cn(
                    "min-h-20 space-y-1.5 border-b border-l border-slate-100 p-1.5",
                    isToday && "bg-amber-50/40",
                  )}
                >
                  {cell.map((job) => (
                    <Link
                      key={job.id}
                      href={`/jobs/${job.id}`}
                      className="block rounded-lg border border-slate-200 bg-white p-2 shadow-xs transition-colors hover:border-amber-300 hover:bg-amber-50"
                    >
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            "size-2 shrink-0 rounded-full",
                            STATUS_DOT[job.status] ?? "bg-slate-400",
                          )}
                        />
                        <span className="truncate text-xs font-semibold text-slate-800">
                          {job.site.town}
                        </span>
                      </div>
                      <div className="mt-0.5 truncate text-[11px] text-slate-500">
                        {formatArea(job.areaM2)}
                      </div>
                      <div className="truncate text-[11px] text-slate-400">
                        {job.screedType}
                      </div>
                    </Link>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
