import { PageHeader } from "@/components/page-header";
import { TableSkeleton } from "@/components/table-skeleton";

export default function Loading() {
  return (
    <div className="space-y-5">
      <PageHeader title="Jobs" description="Loading jobs…" />
      <TableSkeleton rows={8} cols={7} />
    </div>
  );
}
