import { PageHeader } from "@/components/page-header";
import { TableSkeleton } from "@/components/table-skeleton";

export default function Loading() {
  return (
    <div className="space-y-5">
      <PageHeader title="Invoices" description="Loading invoices…" />
      <TableSkeleton rows={6} cols={6} />
    </div>
  );
}
