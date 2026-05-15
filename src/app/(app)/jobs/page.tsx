import type { Metadata } from "next";
import { HardHat } from "lucide-react";
import { DateRangeFilter } from "@/components/date-range-filter";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { RowLink } from "@/components/row-link";
import { StatusBadge } from "@/components/status-badge";
import { StatusFilter } from "@/components/status-filter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listJobs } from "@/lib/queries/jobs";
import { formatArea, formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Jobs" };
export const dynamic = "force-dynamic";

const STATUS_OPTIONS = [
  { value: "scheduled", label: "Scheduled" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; from?: string; to?: string }>;
}) {
  const { status, from, to } = await searchParams;
  const all = await listJobs();
  const jobs = all.filter(
    (j) =>
      (!status || j.status === status) &&
      (!from || j.scheduledDate >= from) &&
      (!to || j.scheduledDate <= to),
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Jobs"
        description="Scheduled pours, in progress and completed."
      />

      <div className="flex flex-wrap items-center gap-3">
        <StatusFilter options={STATUS_OPTIONS} />
        <DateRangeFilter />
      </div>

      {jobs.length === 0 ? (
        <EmptyState
          icon={HardHat}
          title="No jobs found"
          description={
            status || from || to
              ? "No jobs match these filters."
              : "Accept a quote to create the first job."
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead>Job no.</TableHead>
                <TableHead>Site</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Crew</TableHead>
                <TableHead>Truck</TableHead>
                <TableHead>Screed</TableHead>
                <TableHead className="text-right">Area</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <RowLink key={job.id} href={`/jobs/${job.id}`}>
                  <TableCell className="font-mono text-xs font-medium text-slate-800">
                    {job.jobNumber}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium text-slate-800">
                      {job.site.town}
                    </div>
                    <div className="text-xs text-slate-500">
                      {job.site.addressLine1}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {formatDate(job.scheduledDate)}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {job.crew?.name ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {job.truck?.name ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {job.screedType}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm tabular-nums text-slate-600">
                    {formatArea(job.areaM2)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={job.status} />
                  </TableCell>
                </RowLink>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
