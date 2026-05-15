import type { Metadata } from "next";
import { FileText } from "lucide-react";
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
import { listQuotes } from "@/lib/queries/quotes";
import { formatDate, gbp } from "@/lib/format";

export const metadata: Metadata = { title: "Quotes" };
export const dynamic = "force-dynamic";

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "accepted", label: "Accepted" },
  { value: "declined", label: "Declined" },
];

export default async function QuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const all = await listQuotes();
  const quotes = status ? all.filter((q) => q.status === status) : all;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Quotes"
        description="Quotations issued from enquiries — track through to accepted."
      />

      <StatusFilter options={STATUS_OPTIONS} />

      {quotes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No quotes here"
          description={
            status
              ? "No quotes match this filter."
              : "Generate a quote from an enquiry to see it here."
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead>Quote no.</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Site</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.map((q) => (
                <RowLink key={q.id} href={`/quotes/${q.id}`}>
                  <TableCell className="font-mono text-xs font-medium text-slate-800">
                    {q.quoteNumber}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium text-slate-800">
                      {q.enquiry.contact.company ?? q.enquiry.contact.name}
                    </div>
                    {q.enquiry.contact.company && (
                      <div className="text-xs text-slate-500">
                        {q.enquiry.contact.name}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {q.enquiry.site.town}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm font-medium tabular-nums text-slate-800">
                    {gbp(q.total)}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {q.sentAt ? formatDate(q.sentAt) : "—"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={q.status} />
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
