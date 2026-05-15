import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Mail,
  MapPin,
  Phone,
  StickyNote,
} from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { RowLink } from "@/components/row-link";
import { StatusBadge } from "@/components/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getContact } from "@/lib/queries/contacts";
import { formatArea, formatDate, gbp, toNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const contact = await getContact(id);
  if (!contact) notFound();

  const completedJobs = contact.jobs.filter((j) => j.status === "completed");
  const totalDone = completedJobs.reduce(
    (a, j) => a + toNumber(j.quote?.total),
    0,
  );

  return (
    <div className="space-y-5">
      <Link
        href="/contacts"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="size-4" /> Contacts
      </Link>

      <PageHeader
        title={contact.name}
        description={
          <span className="capitalize">
            {contact.company ? `${contact.company} · ` : ""}
            {contact.role}
          </span>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Sites" value={String(contact.sites.length)} />
        <Stat label="Enquiries" value={String(contact.enquiries.length)} />
        <Stat label="Jobs" value={String(contact.jobs.length)} />
        <Stat label="Value completed" value={gbp(totalDone, { decimals: 0 })} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Left — details + sites */}
        <div className="space-y-5">
          <Section title="Details">
            <dl className="divide-y divide-slate-100">
              <DetailRow icon={Building2} label="Role">
                <span className="capitalize">{contact.role}</span>
              </DetailRow>
              <DetailRow icon={Mail} label="Email">
                {contact.email ?? "—"}
              </DetailRow>
              <DetailRow icon={Phone} label="Phone">
                {contact.phone ?? "—"}
              </DetailRow>
              {contact.notes && (
                <DetailRow icon={StickyNote} label="Notes">
                  {contact.notes}
                </DetailRow>
              )}
            </dl>
          </Section>

          <Section title="Sites">
            {contact.sites.length === 0 ? (
              <p className="px-4 py-6 text-sm text-slate-500">
                No sites recorded for this contact.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {contact.sites.map((site) => (
                  <li
                    key={site.id}
                    className="flex gap-2.5 px-4 py-3 text-sm"
                  >
                    <MapPin className="mt-0.5 size-4 shrink-0 text-slate-400" />
                    <div>
                      <p className="font-medium text-slate-800">
                        {site.addressLine1}
                      </p>
                      <p className="text-xs text-slate-500">
                        {site.town} · {site.postcode}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>

        {/* Right — job history */}
        <div className="space-y-5 lg:col-span-2">
          <Section title="Job history">
            {contact.jobs.length === 0 ? (
              <div className="p-4">
                <EmptyState
                  title="No jobs yet"
                  description="Jobs appear here once a quote is accepted."
                />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead>Job</TableHead>
                    <TableHead>Scheduled</TableHead>
                    <TableHead>Screed</TableHead>
                    <TableHead className="text-right">Area</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contact.jobs.map((job) => (
                    <RowLink key={job.id} href={`/jobs/${job.id}`}>
                      <TableCell>
                        <div className="font-mono text-xs font-medium text-slate-800">
                          {job.jobNumber}
                        </div>
                        <div className="text-xs text-slate-500">
                          {job.site.town}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {formatDate(job.scheduledDate)}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {job.screedType}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm tabular-nums text-slate-600">
                        {formatArea(job.areaM2)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm tabular-nums text-slate-700">
                        {gbp(job.quote?.total ?? 0, { decimals: 0 })}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={job.status} />
                      </TableCell>
                    </RowLink>
                  ))}
                </TableBody>
              </Table>
            )}
          </Section>

          <Section title="Enquiries">
            {contact.enquiries.length === 0 ? (
              <p className="px-4 py-6 text-sm text-slate-500">
                No enquiries recorded.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {contact.enquiries.map((enq) => (
                  <li key={enq.id}>
                    <Link
                      href={`/enquiries/${enq.id}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-800 capitalize">
                          {enq.projectType} — {enq.site.town}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {enq.screedType} · {formatArea(enq.areaM2)}
                        </p>
                      </div>
                      <StatusBadge status={enq.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
        {label}
      </p>
      <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-slate-900">
        {value}
      </p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-2.5">
        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 px-4 py-2.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-slate-400" />
      <div className="min-w-0">
        <dt className="text-xs text-slate-500">{label}</dt>
        <dd className="text-sm text-slate-800">{children}</dd>
      </div>
    </div>
  );
}
