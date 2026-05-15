import type { Metadata } from "next";
import { Inbox } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { NewEnquiryDialog } from "@/components/new-enquiry-dialog";
import { PageHeader } from "@/components/page-header";
import { RowLink } from "@/components/row-link";
import { StatusFilter } from "@/components/status-filter";
import { StatusBadge } from "@/components/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listContacts } from "@/lib/queries/contacts";
import { getActiveScreedTypes } from "@/lib/queries/catalog";
import { listEnquiries } from "@/lib/queries/enquiries";
import { formatArea, formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Enquiries" };
export const dynamic = "force-dynamic";

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "quoted", label: "Quoted" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
];

export default async function EnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const [all, contacts, screedTypes] = await Promise.all([
    listEnquiries(),
    listContacts(),
    getActiveScreedTypes(),
  ]);
  const enquiries = status ? all.filter((e) => e.status === status) : all;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Enquiries"
        description="Incoming leads from drawings, calls and referrals."
        actions={
          <NewEnquiryDialog
            contacts={contacts.map((c) => ({
              id: c.id,
              name: c.name,
              company: c.company,
            }))}
            screedTypes={screedTypes.map((s) => s.name)}
          />
        }
      />

      <StatusFilter options={STATUS_OPTIONS} />

      {enquiries.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No enquiries here"
          description={
            status
              ? "No enquiries match this filter."
              : "Log your first enquiry to start quoting."
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead>Contact</TableHead>
                <TableHead>Site</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Target date</TableHead>
                <TableHead className="text-right">Area</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enquiries.map((e) => (
                <RowLink key={e.id} href={`/enquiries/${e.id}`}>
                  <TableCell>
                    <div className="font-medium text-slate-800">
                      {e.contact.company ?? e.contact.name}
                    </div>
                    {e.contact.company && (
                      <div className="text-xs text-slate-500">
                        {e.contact.name}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-slate-700">{e.site.town}</div>
                    <div className="text-xs text-slate-500">
                      {e.site.postcode}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-600 capitalize">
                      {e.projectType}
                    </span>
                    <div className="text-xs text-slate-500">
                      {e.screedType}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {formatDate(e.targetDate)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm tabular-nums text-slate-600">
                    {formatArea(e.areaM2)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={e.status} />
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
