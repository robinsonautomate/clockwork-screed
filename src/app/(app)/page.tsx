import type { Metadata } from "next";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowRight,
  CalendarDays,
  FileText,
  HardHat,
  Inbox,
  Layers,
  ReceiptText,
  TrendingUp,
} from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { KpiTile } from "@/components/kpi-tile";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { getDashboard } from "@/lib/queries/dashboard";
import {
  formatArea,
  formatDate,
  formatDayShort,
  formatNumber,
  gbp,
} from "@/lib/format";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

const ACTIVITY_ICON = {
  enquiry: Inbox,
  quote: FileText,
  job: HardHat,
  invoice: ReceiptText,
} as const;

export default async function DashboardPage() {
  const { kpis, upcoming, activity } = await getDashboard();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Live view of enquiries, quoting and pours across the business."
      />

      {/* KPI tiles */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiTile
          label="New enquiries"
          value={formatNumber(kpis.newEnquiriesMonth)}
          sublabel={`${kpis.newEnquiriesWeek} logged this week`}
          icon={Inbox}
          tone="sky"
        />
        <KpiTile
          label="Quoted value"
          value={gbp(kpis.quotedValueMonth, { decimals: 0 })}
          sublabel="Quotes sent this month"
          icon={FileText}
          tone="amber"
        />
        <KpiTile
          label="Won value"
          value={gbp(kpis.wonValueMonth, { decimals: 0 })}
          sublabel="Quotes accepted this month"
          icon={TrendingUp}
          tone="emerald"
        />
        <KpiTile
          label="m² poured"
          value={`${formatNumber(Math.round(kpis.m2PouredMonth))} m²`}
          sublabel="Completed pours this month"
          icon={Layers}
          tone="slate"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Upcoming pours */}
        <section className="lg:col-span-2">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <CalendarDays className="size-4 text-slate-500" />
                Upcoming pours — next 7 days
              </h2>
              <Link
                href="/schedule"
                className="flex items-center gap-1 text-xs font-medium text-amber-600 hover:text-amber-700"
              >
                Schedule <ArrowRight className="size-3.5" />
              </Link>
            </div>
            {upcoming.length === 0 ? (
              <div className="p-4">
                <EmptyState
                  icon={CalendarDays}
                  title="No pours booked in the next 7 days"
                  description="Accepted quotes become jobs and appear here once scheduled."
                />
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {upcoming.map((job) => (
                  <li key={job.id}>
                    <Link
                      href={`/jobs/${job.id}`}
                      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50"
                    >
                      <div className="flex w-14 shrink-0 flex-col items-center rounded-lg border border-slate-200 bg-slate-50 py-1.5">
                        <span className="text-[10px] font-medium tracking-wide text-slate-500 uppercase">
                          {formatDayShort(job.scheduledDate).split(" ")[0]}
                        </span>
                        <span className="font-mono text-base font-semibold text-slate-800">
                          {formatDate(job.scheduledDate).split(" ")[0]}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-800">
                          {job.site.town}
                          <span className="font-normal text-slate-400">
                            {" "}
                            · {job.site.addressLine1}
                          </span>
                        </p>
                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          {job.screedType} · {formatArea(job.areaM2)} ·{" "}
                          {job.crew?.name ?? "Crew TBC"}
                        </p>
                      </div>
                      <StatusBadge status={job.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Outstanding invoices */}
        <section>
          <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <ReceiptText className="size-4 text-slate-500" />
                Outstanding invoices
              </h2>
            </div>
            <div className="flex flex-1 flex-col justify-between gap-4 p-4">
              <div>
                <p className="font-mono text-3xl font-semibold tracking-tight tabular-nums text-slate-900">
                  {gbp(kpis.outstandingValue, { decimals: 0 })}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {kpis.outstandingCount}{" "}
                  {kpis.outstandingCount === 1 ? "invoice" : "invoices"} awaiting
                  payment
                </p>
                {kpis.overdueCount > 0 && (
                  <p className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700">
                    {kpis.overdueCount} overdue — chase up
                  </p>
                )}
              </div>
              <Link
                href="/invoices"
                className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                View all invoices <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* Recent activity */}
      <section>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-800">
              Recent activity
            </h2>
          </div>
          {activity.length === 0 ? (
            <div className="p-4">
              <EmptyState title="No activity yet" />
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {activity.map((event, i) => {
                const Icon = ACTIVITY_ICON[event.kind];
                return (
                  <li key={i}>
                    <Link
                      href={event.href}
                      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50"
                    >
                      <span className="rounded-md bg-slate-100 p-2 text-slate-500">
                        <Icon className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-800">
                          {event.title}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {event.sub}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs text-slate-400">
                        {formatDistanceToNow(event.at, { addSuffix: true })}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
