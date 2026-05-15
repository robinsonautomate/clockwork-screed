import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { InvoiceActions } from "@/components/invoice-actions";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { getInvoice } from "@/lib/queries/invoices";
import { formatDate, gbp } from "@/lib/format";

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
  const lines = job.quote?.lines ?? [];

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
        {/* Line items */}
        <div className="space-y-5 lg:col-span-2">
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-2.5">
              <h2 className="text-sm font-semibold text-slate-800">
                Line items
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                    <th className="px-4 py-2 font-medium">Description</th>
                    <th className="px-4 py-2 text-right font-medium">Qty</th>
                    <th className="px-4 py-2 text-right font-medium">
                      Unit price
                    </th>
                    <th className="px-4 py-2 text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.length === 0 ? (
                    <tr className="border-b border-slate-100">
                      <td className="px-4 py-2.5 text-slate-700">
                        {job.screedType} — screed installation
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-slate-600">
                        1
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-slate-600">
                        {gbp(invoice.subtotal)}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono font-medium text-slate-800">
                        {gbp(invoice.subtotal)}
                      </td>
                    </tr>
                  ) : (
                    lines.map((line) => (
                      <tr key={line.id} className="border-b border-slate-100">
                        <td className="px-4 py-2.5 text-slate-700">
                          {line.description}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono tabular-nums text-slate-600">
                          {line.qty} {line.unit}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono tabular-nums text-slate-600">
                          {gbp(line.unitPrice)}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono font-medium tabular-nums text-slate-800">
                          {gbp(line.lineTotal)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end border-t border-slate-200 bg-slate-50 p-4">
              <dl className="w-full max-w-[240px] space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Subtotal</dt>
                  <dd className="font-mono tabular-nums text-slate-700">
                    {gbp(invoice.subtotal)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">VAT at 20%</dt>
                  <dd className="font-mono tabular-nums text-slate-700">
                    {gbp(invoice.vat)}
                  </dd>
                </div>
                <div className="flex justify-between rounded-md bg-slate-800 px-3 py-1.5 text-white">
                  <dt className="font-semibold">Total due</dt>
                  <dd className="font-mono font-semibold tabular-nums">
                    {gbp(invoice.total)}
                  </dd>
                </div>
              </dl>
            </div>
          </section>
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
