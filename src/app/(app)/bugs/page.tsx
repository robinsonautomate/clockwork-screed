import type { Metadata } from "next";
import { Bug } from "lucide-react";
import { BugStatusControl } from "@/components/bug-status-control";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { StatusFilter } from "@/components/status-filter";
import { listBugReports } from "@/lib/queries/bugs";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Bug log" };
export const dynamic = "force-dynamic";

const STATUS_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "resolved", label: "Resolved" },
  { value: "wont_fix", label: "Won’t fix" },
];

const SEVERITY_STYLE: Record<string, string> = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-rose-100 text-rose-700",
};

export default async function BugsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const all = await listBugReports();
  const bugs = status ? all.filter((b) => b.status === status) : all;

  const openCount = all.filter(
    (b) => b.status === "open" || b.status === "in_progress",
  ).length;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Bug log"
        description={`Reports submitted from the in-app widget — ${openCount} open.`}
      />

      <StatusFilter options={STATUS_OPTIONS} />

      {bugs.length === 0 ? (
        <EmptyState
          icon={Bug}
          title="No bug reports"
          description={
            status
              ? "No reports match this filter."
              : "Use the “Report a bug” button (bottom-right) to log one."
          }
        />
      ) : (
        <div className="space-y-3">
          {bugs.map((bug) => (
            <div
              key={bug.id}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                        SEVERITY_STYLE[bug.severity],
                      )}
                    >
                      {bug.severity}
                    </span>
                    <StatusBadge status={bug.status} />
                  </div>
                  <h3 className="mt-2 text-sm font-semibold text-slate-800">
                    {bug.summary}
                  </h3>
                </div>
                <BugStatusControl
                  id={bug.id}
                  status={bug.status}
                  resolutionNote={bug.resolutionNote}
                />
              </div>

              {bug.detail && (
                <p className="mt-2 text-sm whitespace-pre-wrap text-slate-600">
                  {bug.detail}
                </p>
              )}

              <p className="mt-2 text-xs text-slate-400">
                {bug.pageUrl && (
                  <>
                    <span className="font-mono">{bug.pageUrl}</span> ·{" "}
                  </>
                )}
                Reported {formatDateTime(bug.createdAt)}
              </p>

              {bug.resolutionNote && (
                <div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2">
                  <p className="text-xs font-semibold text-emerald-800">
                    Resolution
                  </p>
                  <p className="mt-0.5 text-sm whitespace-pre-wrap text-emerald-900">
                    {bug.resolutionNote}
                  </p>
                  {bug.resolvedAt && (
                    <p className="mt-1 text-xs text-emerald-700">
                      {formatDateTime(bug.resolvedAt)}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
