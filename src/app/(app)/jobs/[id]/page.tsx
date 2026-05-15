import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
  ClipboardList,
  FileText,
  MapPin,
  XCircle,
} from "lucide-react";
import { JobScheduleDialog } from "@/components/job-schedule-dialog";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { getCrews, getTrucks } from "@/lib/queries/catalog";
import { getJob } from "@/lib/queries/jobs";
import {
  capitalize,
  formatArea,
  formatDate,
  formatDateTime,
  formatVolume,
  gbp,
} from "@/lib/format";

export const dynamic = "force-dynamic";

const PRE_CHECKS = [
  ["preCheckUfhPressure", "UFH pressure tested"],
  ["preCheckEdgeInsulation", "Edge insulation fitted"],
  ["preCheckDpm", "DPM / membrane in place"],
  ["preCheckAccess", "Site access clear"],
  ["preCheckWaterPower", "Water & power available"],
] as const;

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [job, crews, trucks] = await Promise.all([
    getJob(id),
    getCrews(),
    getTrucks(),
  ]);
  if (!job) notFound();

  const pour = job.pourRecord;
  const canPour = job.status !== "completed" && job.status !== "cancelled";

  return (
    <div className="space-y-5">
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="size-4" /> Jobs
      </Link>

      <PageHeader
        title={
          <span className="flex items-center gap-3">
            <span className="font-mono">{job.jobNumber}</span>
            <StatusBadge status={job.status} />
          </span>
        }
        description={`${job.site.town} · ${job.contact.company ?? job.contact.name}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <JobScheduleDialog
              jobId={job.id}
              scheduledDate={job.scheduledDate}
              crewId={job.crewId}
              truckId={job.truckId}
              screedType={job.screedType}
              areaM2={job.areaM2}
              depthMm={job.depthMm}
              crews={crews.map((c) => ({ id: c.id, name: c.name }))}
              trucks={trucks.map((t) => ({ id: t.id, name: t.name }))}
            />
            {canPour && (
              <Button asChild variant="accent" size="lg">
                <Link href={`/jobs/${job.id}/pour`}>
                  <ClipboardList className="size-4" /> Start pour record
                </Link>
              </Button>
            )}
            {pour && (
              <Button asChild variant="accent">
                <a
                  href={`/api/jobs/${job.id}/certificate`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <FileText className="size-4" /> Aftercare certificate
                </a>
              </Button>
            )}
          </div>
        }
      />

      {/* Spec strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Spec label="Scheduled" value={formatDate(job.scheduledDate)} />
        <Spec label="Screed" value={job.screedType} />
        <Spec label="Area" value={formatArea(job.areaM2)} />
        <Spec label="Volume" value={formatVolume(job.volumeM3)} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Job metadata */}
        <div className="space-y-5">
          <Section title="Site">
            <div className="space-y-1 px-4 py-3 text-sm">
              <p className="flex items-start gap-2 font-medium text-slate-800">
                <MapPin className="mt-0.5 size-4 shrink-0 text-slate-400" />
                {job.site.addressLine1}
              </p>
              {job.site.addressLine2 && (
                <p className="pl-6 text-slate-600">{job.site.addressLine2}</p>
              )}
              <p className="pl-6 text-slate-600">
                {job.site.town}, {job.site.postcode}
              </p>
              {job.site.accessNotes && (
                <p className="mt-2 rounded-md bg-amber-50 px-2 py-1.5 text-xs text-amber-800">
                  Access: {job.site.accessNotes}
                </p>
              )}
            </div>
          </Section>

          <Section title="Assignment">
            <dl className="divide-y divide-slate-100 text-sm">
              <Row label="Crew">{job.crew?.name ?? "Unassigned"}</Row>
              <Row label="Truck">
                {job.truck
                  ? `${job.truck.name} (${job.truck.registration})`
                  : "Unassigned"}
              </Row>
              <Row label="Depth">{job.depthMm} mm</Row>
            </dl>
          </Section>

          <Section title="Linked records">
            <div className="space-y-2 px-4 py-3 text-sm">
              <LinkRow
                href={`/contacts/${job.contactId}`}
                label="Contact"
                value={job.contact.name}
              />
              {job.quote && (
                <LinkRow
                  href={`/quotes/${job.quote.id}`}
                  label={`Quote · ${gbp(job.quote.total)}`}
                  value={job.quote.quoteNumber}
                />
              )}
              {job.invoice && (
                <LinkRow
                  href={`/invoices/${job.invoice.id}`}
                  label={`Invoice · ${job.invoice.status}`}
                  value={job.invoice.invoiceNumber}
                />
              )}
            </div>
          </Section>
        </div>

        {/* Pour record / CTA */}
        <div className="lg:col-span-2">
          {pour ? (
            <Section title="Pour record">
              <div className="space-y-5 p-4">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <Spec
                    label="Area poured"
                    value={formatArea(pour.actualAreaM2)}
                  />
                  <Spec label="Depth" value={`${pour.actualDepthMm} mm`} />
                  <Spec
                    label="Volume"
                    value={formatVolume(pour.actualVolumeM3)}
                  />
                  <Spec label="Batch ref" value={pour.batchRef ?? "—"} />
                  <Spec
                    label="Ambient temp"
                    value={
                      pour.ambientTempC != null
                        ? `${pour.ambientTempC}°C`
                        : "—"
                    }
                  />
                  <Spec
                    label="Conditions"
                    value={pour.conditions ? capitalize(pour.conditions) : "—"}
                  />
                </div>

                {/* Pre-pour checks */}
                <div>
                  <h3 className="mb-2 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                    Pre-pour checks
                  </h3>
                  <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                    {PRE_CHECKS.map(([key, label]) => {
                      const ok = pour[key];
                      return (
                        <div
                          key={key}
                          className="flex items-center gap-2 text-sm"
                        >
                          {ok ? (
                            <CheckCircle2 className="size-4 text-emerald-600" />
                          ) : (
                            <XCircle className="size-4 text-rose-500" />
                          )}
                          <span
                            className={
                              ok ? "text-slate-700" : "text-slate-500"
                            }
                          >
                            {label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {pour.overrideReason && (
                    <p className="mt-2 rounded-md bg-amber-50 px-2 py-1.5 text-xs text-amber-800">
                      Supervisor override: {pour.overrideReason}
                    </p>
                  )}
                </div>

                {/* Photos */}
                {pour.photos.length > 0 && (
                  <div>
                    <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                      <Camera className="size-3.5" />
                      Site photos ({pour.photos.length})
                    </h3>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {pour.photos.map((url) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={url}
                          src={url}
                          alt="Pour site photo"
                          className="aspect-square w-full rounded-lg border border-slate-200 object-cover"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Sign-off */}
                <div className="flex flex-wrap items-end justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div>
                    <h3 className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                      Customer sign-off
                    </h3>
                    {pour.customerSignatureDataUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={pour.customerSignatureDataUrl}
                        alt="Customer signature"
                        className="mt-1 h-14 rounded bg-white"
                      />
                    )}
                    <p className="mt-1 text-sm font-medium text-slate-800">
                      {pour.customerSignatureName ?? "—"}
                    </p>
                    <p className="text-xs text-slate-500">
                      Signed {formatDateTime(pour.signedAt)}
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <a
                      href={`/api/jobs/${job.id}/certificate`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <FileText className="size-4" /> Certificate
                    </a>
                  </Button>
                </div>

                {pour.notes && (
                  <div>
                    <h3 className="mb-1 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                      Notes
                    </h3>
                    <p className="text-sm text-slate-600">{pour.notes}</p>
                  </div>
                )}
                <p className="text-xs text-slate-400">
                  Pour completed {formatDateTime(pour.completedAt)}
                </p>
              </div>
            </Section>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
              <div className="rounded-full bg-amber-100 p-3">
                <ClipboardList className="size-7 text-amber-600" />
              </div>
              <h3 className="mt-3 text-base font-semibold text-slate-800">
                Pour not yet recorded
              </h3>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                Run the on-site pour record on a phone or tablet — pre-pour
                checks, pour data, photos and customer sign-off.
              </p>
              {canPour && (
                <Button
                  asChild
                  variant="accent"
                  size="lg"
                  className="mt-4 h-12 px-6 text-base"
                >
                  <Link href={`/jobs/${job.id}/pour`}>
                    <ClipboardList className="size-5" /> Start pour record
                  </Link>
                </Button>
              )}
            </div>
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

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-semibold text-slate-900">
        {value}
      </p>
    </div>
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

function LinkRow({
  href,
  label,
  value,
}: {
  href: string;
  label: string;
  value: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50"
    >
      <span className="text-xs text-slate-500 capitalize">{label}</span>
      <span className="flex items-center gap-1 font-mono text-xs font-medium text-amber-600">
        {value} <ArrowRight className="size-3" />
      </span>
    </Link>
  );
}
