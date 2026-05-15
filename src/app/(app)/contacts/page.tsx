import type { Metadata } from "next";
import { Mail, Phone, Users } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { NewContactDialog } from "@/components/new-contact-dialog";
import { PageHeader } from "@/components/page-header";
import { StatusFilter } from "@/components/status-filter";
import { RowLink } from "@/components/row-link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listContacts } from "@/lib/queries/contacts";

export const metadata: Metadata = { title: "Contacts" };
export const dynamic = "force-dynamic";

const ROLE_OPTIONS = [
  { value: "self-builder", label: "Self-builders" },
  { value: "developer", label: "Developers" },
  { value: "main contractor", label: "Contractors" },
  { value: "architect", label: "Architects" },
];

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role } = await searchParams;
  const all = await listContacts();
  const contacts = role ? all.filter((c) => c.role === role) : all;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Contacts"
        description="Customers, developers, contractors and architects."
        actions={<NewContactDialog />}
      />

      <StatusFilter options={ROLE_OPTIONS} paramKey="role" />

      {contacts.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No contacts found"
          description={
            role
              ? "No contacts match this filter."
              : "Add your first contact to get started."
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="text-right">Sites</TableHead>
                <TableHead className="text-right">Jobs</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((c) => (
                <RowLink key={c.id} href={`/contacts/${c.id}`}>
                  <TableCell>
                    <div className="font-medium text-slate-800">{c.name}</div>
                    {c.company && (
                      <div className="text-xs text-slate-500">{c.company}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-600 capitalize">
                      {c.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5 text-xs text-slate-500">
                      {c.email && (
                        <span className="flex items-center gap-1.5">
                          <Mail className="size-3" /> {c.email}
                        </span>
                      )}
                      {c.phone && (
                        <span className="flex items-center gap-1.5">
                          <Phone className="size-3" /> {c.phone}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums text-slate-600">
                    {c.sites.length}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums text-slate-600">
                    {c.jobs.length}
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
