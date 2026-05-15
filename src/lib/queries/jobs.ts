import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { jobs } from "@/lib/db/schema";

export async function listJobs() {
  return db.query.jobs.findMany({
    with: {
      site: { columns: { town: true, addressLine1: true, postcode: true } },
      contact: { columns: { name: true, company: true } },
      crew: { columns: { name: true } },
      truck: { columns: { name: true, registration: true } },
      pourRecord: { columns: { id: true } },
    },
    orderBy: (j, { asc }) => [asc(j.scheduledDate)],
  });
}

export async function getJob(id: string) {
  return db.query.jobs.findFirst({
    where: eq(jobs.id, id),
    with: {
      site: true,
      contact: true,
      crew: true,
      truck: true,
      quote: { columns: { id: true, quoteNumber: true, total: true } },
      pourRecord: true,
      invoice: { columns: { id: true, invoiceNumber: true, status: true } },
    },
  });
}

export type JobDetail = NonNullable<Awaited<ReturnType<typeof getJob>>>;
