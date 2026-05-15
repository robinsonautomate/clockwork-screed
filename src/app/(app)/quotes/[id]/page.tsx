import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Info } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { QuoteActions } from "@/components/quote-actions";
import { QuoteBuilder } from "@/components/quote-builder";
import { StatusBadge } from "@/components/status-badge";
import { getQuote } from "@/lib/queries/quotes";
import { formatArea, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

const STATUS_NOTE: Record<string, string> = {
  draft:
    "Draft — adjust the line items, then mark as sent. No email is sent; download the PDF and send it from your own email client.",
  sent: "Sent — download the PDF above to email to the customer. Mark accepted to schedule the job.",
  accepted: "Accepted — a job has been created and scheduled.",
  declined: "Declined — this quote is closed.",
};

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quote = await getQuote(id);
  if (!quote) notFound();

  const { enquiry } = quote;
  const job = quote.jobs[0] ?? null;

  return (
    <div className="space-y-5">
      <Link
        href="/quotes"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="size-4" /> Quotes
      </Link>

      <PageHeader
        title={
          <span className="flex items-center gap-3">
            <span className="font-mono">{quote.quoteNumber}</span>
            <StatusBadge status={quote.status} />
          </span>
        }
        description={`${enquiry.contact.company ?? enquiry.contact.name} · ${enquiry.site.town}`}
        actions={
          <QuoteActions
            quoteId={quote.id}
            status={quote.status}
            jobId={job?.id ?? null}
          />
        }
      />

      <div className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
        <Info className="mt-0.5 size-3.5 shrink-0 text-slate-400" />
        <p>{STATUS_NOTE[quote.status]}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <QuoteBuilder
            quoteId={quote.id}
            status={quote.status}
            initialLines={quote.lines.map((l) => ({
              description: l.description,
              qty: l.qty,
              unit: l.unit,
              unitPrice: l.unitPrice,
            }))}
            initialValidUntil={quote.validUntil}
          />
        </div>

        <div className="space-y-5">
          <Section title="Quote for">
            <div className="space-y-0.5 px-4 py-3 text-sm">
              <p className="font-medium text-slate-800">
                {enquiry.contact.company ?? enquiry.contact.name}
              </p>
              {enquiry.contact.company && (
                <p className="text-slate-600">{enquiry.contact.name}</p>
              )}
              {enquiry.contact.email && (
                <p className="text-slate-500">{enquiry.contact.email}</p>
              )}
              {enquiry.contact.phone && (
                <p className="text-slate-500">{enquiry.contact.phone}</p>
              )}
            </div>
          </Section>

          <Section title="Site & project">
            <div className="space-y-1 px-4 py-3 text-sm">
              <p className="font-medium text-slate-800">
                {enquiry.site.addressLine1}
              </p>
              <p className="text-slate-600">
                {enquiry.site.town}, {enquiry.site.postcode}
              </p>
              <dl className="mt-2 space-y-1 text-xs text-slate-500">
                <div className="flex justify-between">
                  <dt>Project</dt>
                  <dd className="capitalize text-slate-700">
                    {enquiry.projectType}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>Screed</dt>
                  <dd className="text-slate-700">{enquiry.screedType}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Area / depth</dt>
                  <dd className="font-mono text-slate-700">
                    {formatArea(enquiry.areaM2)} · {enquiry.depthMm}mm
                  </dd>
                </div>
              </dl>
              <Link
                href={`/enquiries/${enquiry.id}`}
                className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-amber-600 hover:text-amber-700"
              >
                View enquiry <ArrowRight className="size-3" />
              </Link>
            </div>
          </Section>

          {job && (
            <Section title="Linked job">
              <div className="px-4 py-3 text-sm">
                <Link
                  href={`/jobs/${job.id}`}
                  className="font-mono font-medium text-amber-600 hover:text-amber-700"
                >
                  {job.jobNumber}
                </Link>
                <p className="mt-0.5 text-xs text-slate-500">
                  Created when the quote was accepted.
                </p>
              </div>
            </Section>
          )}

          <p className="px-1 text-xs text-slate-400">
            Quote issued {formatDate(quote.createdAt)}
            {quote.sentAt ? ` · sent ${formatDate(quote.sentAt)}` : ""}
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
