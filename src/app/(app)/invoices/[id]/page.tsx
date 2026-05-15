import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { InvoiceActions } from "@/components/invoice-actions";
import { InvoiceLinesEditor } from "@/components/invoice-lines-editor";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { getInvoice } from "@/lib/queries/invoices";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = await getInvoice(id);
  if (!invoice) notFound();

  const { job } = invoice;

  return (
    <div className="space-y-5">
      <Link
        href="/invoices"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="size-4" /> Invoices
      </Link>

      <PageHeader
        title={
          <span className="flex items-center gap-3">
            <span className="font-mono">{invoice.invoiceNumber}</span>
            <StatusBadge status={invoice.status} />
          </span>
        }
        description={`${job.contact.company ?? job.contact.name} · ${job.site.town}`}
        actions={
          <InvoiceActions invoiceId={invoice.id} status={invoice.status} />
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Line items — editable */}
        <div className="lg:col-span-2">
          <InvoiceLinesEditor
            invoiceId={invoice.id}
            status={invoice.status}
            initialLines={invoice.lines.map((l) => ({
              description: l.description,
              qty: l.qty,
              unit: l.unit,
              unitPrice: l.unitPrice,
            }))}
          />
        </div>

        {/* Side */}
        <div className="space-y-5">
          <Section title="Invoice to">
            <div className="space-y-0.5 px-4 py-3 text-sm">
              <p className="font-medium text-slate-800">
                {job.contact.company ?? job.contact.name}
              </p>
              {job.contact.company && (
                <p className="text-slate-600">{job.contact.name}</p>
              )}
              {job.contact.email && (
                <p className="text-slate-500">{job.contact.email}</p>
              )}
            </div>
          </Section>

          <Section title="Details">
            <dl className="divide-y divide-slate-100 text-sm">
              <Row label="Issued">{formatDate(invoice.createdAt)}</Row>
              <Row label="Due">{formatDate(invoice.dueDate)}</Row>
              {invoice.paidAt && (
                <Row label="Paid">{formatDate(invoice.paidAt)}</Row>
              )}
              <Row label="Site">
                {job.site.addressLine1}, {job.site.town}
              </Row>
            </dl>
            <div className="border-t border-slate-100 p-3">
              <Link
                href={`/jobs/${job.id}`}
                className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 hover:text-amber-700"
              >
                Job {job.jobNumber} <ArrowRight className="size-3" />
              </Link>
            </div>
          </Section>

          <p className="px-1 text-xs text-slate-400">
            No email is sent automatically — preview the PDF and send it from
            your own email client.
          </p>
        </div>
      </div>
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

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-between gap-4 px-4 py-2.5">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-800">{children}</dd>
    </div>
  );
}
