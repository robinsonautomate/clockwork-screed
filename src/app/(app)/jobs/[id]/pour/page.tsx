import { notFound, redirect } from "next/navigation";
import { PourFlow } from "@/components/pour/pour-flow";
import { getJob } from "@/lib/queries/jobs";

export const dynamic = "force-dynamic";

export default async function PourPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await getJob(id);
  if (!job) notFound();

  // A job that already has a pour record is complete — send back to detail.
  if (job.pourRecord) {
    redirect(`/jobs/${id}`);
  }

  return (
    <PourFlow
      job={{
        id: job.id,
        jobNumber: job.jobNumber,
        areaM2: job.areaM2,
        depthMm: job.depthMm,
        screedType: job.screedType,
        siteTown: job.site.town,
        siteAddress: job.site.addressLine1,
        contactName: job.contact.name,
      }}
    />
  );
}
