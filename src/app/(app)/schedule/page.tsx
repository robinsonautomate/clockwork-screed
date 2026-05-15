import type { Metadata } from "next";
import Link from "next/link";
import { format } from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ScheduleGrid } from "@/components/schedule-grid";
import { Button } from "@/components/ui/button";
import { getScheduleWeek } from "@/lib/queries/schedule";

export const metadata: Metadata = { title: "Schedule" };
export const dynamic = "force-dynamic";

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week } = await searchParams;
  const offset = Number.parseInt(week ?? "0", 10) || 0;
  const data = await getScheduleWeek(offset);

  const rangeLabel = `${format(data.weekStart, "d MMM")} – ${format(
    data.weekEnd,
    "d MMM yyyy",
  )}`;

  const weekLabel =
    offset === 0
      ? "This week"
      : offset === 1
        ? "Next week"
        : offset === -1
          ? "Last week"
          : `${offset > 0 ? "+" : ""}${offset} weeks`;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Schedule"
        description="Pours by crew across the week."
        actions={
          <div className="flex items-center gap-1.5">
            <Button asChild variant="outline" size="icon">
              <Link href={`/schedule?week=${offset - 1}`} aria-label="Previous week">
                <ChevronLeft className="size-4" />
              </Link>
            </Button>
            {offset !== 0 && (
              <Button asChild variant="outline" size="sm">
                <Link href="/schedule">Today</Link>
              </Button>
            )}
            <Button asChild variant="outline" size="icon">
              <Link href={`/schedule?week=${offset + 1}`} aria-label="Next week">
                <ChevronRight className="size-4" />
              </Link>
            </Button>
          </div>
        }
      />

      <div className="flex items-center gap-2 text-sm">
        <CalendarDays className="size-4 text-slate-400" />
        <span className="font-semibold text-slate-800">{weekLabel}</span>
        <span className="text-slate-400">·</span>
        <span className="font-mono text-slate-600">{rangeLabel}</span>
      </div>

      <ScheduleGrid week={data} />

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
        <Legend dot="bg-indigo-500" label="Scheduled" />
        <Legend dot="bg-amber-500" label="In progress" />
        <Legend dot="bg-emerald-500" label="Completed" />
        <Legend dot="bg-slate-400" label="Cancelled" />
      </div>
    </div>
  );
}

function Legend({ dot, label }: { dot: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`size-2 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
