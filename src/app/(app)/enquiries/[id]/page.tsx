import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, FileText } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { EnquiryEditor } from "@/components/enquiry-editor";
import { GenerateQuoteButton } from "@/components/generate-quote-button";
import { PageHeader } from "@/components/page-header";
import { SiteEditor } from "@/components/site-editor";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { getActiveScreedTypes } from "@/lib/queries/catalog";
import { getEnquiry } from "@/lib/queries/enquiries";
import { formatDate, gbp } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function EnquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const enquiry = await getEnquiry(id);
  if (!enquiry) notFound();

  const quote = enquiry.quotes[0] ?? null;
  const { site, contact } = enquiry;
  const screedTypes = await getActiveScreedTypes();

  return (
    <div className="space-y-5">
      <Link
        href="/enquiries"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="size-4" /> Enquiries
      </Link>

      <PageHeader
        title={
          <span className="flex items-center gap-3">
            <span className="capitalize">
              {enquiry.projectType} — {site.town}
            </span>
            <StatusBadge status={enquiry.status} />
          </span>
        }
        description={`${contact.company ?? contact.name} · logged ${formatDate(enquiry.createdAt)}`}
        actions={
          quote ? (
            <Button asChild variant="accent">
              <Link href={`/quotes/${quote.id}`}>
                Open quote <ArrowRight className="size-4" />
              </Link>
            </Button>
          ) : (
            <GenerateQuoteButton enquiryId={enquiry.id} />
          )
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Details */}
        <div className="space-y-5">
          <EnquiryEditor
            enquiry={{
              id: enquiry.id,
              projectType: enquiry.projectType,
              screedType: enquiry.screedType,
              targetDate: enquiry.targetDate,
              areaM2: enquiry.areaM2,
              depthMm: enquiry.depthMm,
              source: enquiry.source,
              notes: enquiry.notes,
              status: enquiry.status,
            }}
            screedTypes={screedTypes.map((s) => s.name)}
          />

          <SiteEditor
            site={{
              id: site.id,
              addressLine1: site.addressLine1,
              addressLine2: site.addressLine2,
              town: site.town,
              postcode: site.postcode,
              accessNotes: site.accessNotes,
            }}
          />

          <Section title="Contact">
            <div className="space-y-0.5 px-4 py-3 text-sm">
              <p className="font-medium text-slate-800">{contact.name}</p>
              {contact.company && (
                <p className="text-slate-600">{contact.company}</p>
              )}
              <p className="text-slate-500 capitalize">{contact.role}</p>
              {contact.email && <p className="text-slate-500">{contact.email}</p>}
              {contact.phone && <p className="text-slate-500">{contact.phone}</p>}
              <Link
                href={`/contacts/${contact.id}`}
                className="inline-flex items-center gap-1 pt-1 text-xs font-medium text-amber-600 hover:text-amber-700"
              >
                View contact <ArrowRight className="size-3" />
              </Link>
            </div>
          </Section>
        </div>

        {/* Quote */}
        <div className="lg:col-span-2">
          {quote ? (
            <Section title="Quote">
              <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-slate-800">
                      {quote.quoteNumber}
                    </span>
                    <StatusBadge status={quote.status} />
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {quote.lines.length} line items · issued{" "}
                    {formatDate(quote.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-2xl font-semibold tabular-nums text-slate-900">
                    {gbp(quote.total)}
                  </p>
                  <p className="text-xs text-slate-500">incl. VAT</p>
                </div>
              </div>
              <div className="border-t border-slate-100 p-4">
                <Button asChild variant="outline" className="w-full sm:w-auto">
                  <Link href={`/quotes/${quote.id}`}>
                    Open quote builder <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </Section>
          ) : (
            <EmptyState
              icon={FileText}
              title="No quote yet"
              description="Use “Generate quote” above — it creates a draft with line items pre-filled from the screed type and area, ready to edit."
            />
          )}
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
