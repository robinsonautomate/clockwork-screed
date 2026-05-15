import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { enquiries } from "@/lib/db/schema";

export async function listEnquiries() {
  return db.query.enquiries.findMany({
    with: {
      site: { columns: { town: true, addressLine1: true, postcode: true } },
      contact: { columns: { name: true, company: true } },
      quotes: { columns: { id: true, status: true } },
    },
    orderBy: (e, { desc }) => [desc(e.createdAt)],
  });
}

export async function getEnquiry(id: string) {
  return db.query.enquiries.findFirst({
    where: eq(enquiries.id, id),
    with: {
      site: true,
      contact: true,
      quotes: {
        with: { lines: { orderBy: (l, { asc }) => [asc(l.sortOrder)] } },
        orderBy: (q, { desc }) => [desc(q.createdAt)],
      },
    },
  });
}

export type EnquiryDetail = NonNullable<Awaited<ReturnType<typeof getEnquiry>>>;
