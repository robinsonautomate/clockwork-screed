import { PageHeader } from "@/components/page-header";
import { TableSkeleton } from "@/components/table-skeleton";

export default function Loading() {
  return (
    <div className="space-y-5">
      <PageHeader title="Quotes" description="Loading quotes…" />
      <TableSkeleton rows={7} cols={6} />
    </div>
  );
}
