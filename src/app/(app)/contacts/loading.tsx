import { PageHeader } from "@/components/page-header";
import { TableSkeleton } from "@/components/table-skeleton";

export default function Loading() {
  return (
    <div className="space-y-5">
      <PageHeader title="Contacts" description="Loading directory…" />
      <TableSkeleton rows={8} cols={5} />
    </div>
  );
}
