import type { Metadata } from "next";
import { ReceiptText } from "lucide-react";
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
import { listInvoices } from "@/lib/queries/invoices";
import { formatDate, gbp } from "@/lib/format";

export const metadata: Metadata = { title: "Invoices" };
export const dynamic = "force-dynamic";

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
];

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const all = await listInvoices();
  const invoices = status
    ? all.filter((i) => i.status === status)
    : all;

  const outstanding = all
    .filter((i) => i.status === "sent" || i.status === "overdue")
    .reduce((a, i) => a + Number(i.total), 0);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Invoices"
        description={`${gbp(outstanding, { decimals: 0 })} outstanding across sent and overdue invoices.`}
      />

      <StatusFilter options={STATUS_OPTIONS} />

      {invoices.length === 0 ? (
        <EmptyState
          icon={ReceiptText}
          title="No invoices here"
          description={
            status
              ? "No invoices match this filter."
              : "Invoices are raised automatically when a pour is completed."
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead>Invoice no.</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Job</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <RowLink key={inv.id} href={`/invoices/${inv.id}`}>
                  <TableCell className="font-mono text-xs font-medium text-slate-800">
                    {inv.invoiceNumber}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium text-slate-800">
                      {inv.job.contact.company ?? inv.job.contact.name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {inv.job.site.town}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-600">
                    {inv.job.jobNumber}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm font-medium tabular-nums text-slate-800">
                    {gbp(inv.total)}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {formatDate(inv.dueDate)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={inv.status} />
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
