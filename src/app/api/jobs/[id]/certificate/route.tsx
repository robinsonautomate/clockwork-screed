import { renderToBuffer } from "@react-pdf/renderer";
import { CertificateDocument } from "@/lib/pdf/certificate-pdf";
import { getJob } from "@/lib/queries/jobs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const job = await getJob(id);
  if (!job) {
    return new Response("Job not found", { status: 404 });
  }
  if (!job.pourRecord) {
    return new Response("No pour record for this job yet", { status: 404 });
  }

  const buffer = await renderToBuffer(<CertificateDocument job={job} />);

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="aftercare-${job.jobNumber}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
