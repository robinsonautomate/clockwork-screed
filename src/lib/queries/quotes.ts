import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { quotes } from "@/lib/db/schema";

export async function listQuotes() {
  return db.query.quotes.findMany({
    with: {
      enquiry: {
        columns: { id: true, screedType: true },
        with: {
          site: { columns: { town: true, addressLine1: true } },
          contact: { columns: { name: true, company: true } },
        },
      },
    },
    orderBy: (q, { desc }) => [desc(q.createdAt)],
  });
}

export async function getQuote(id: string) {
  return db.query.quotes.findFirst({
    where: eq(quotes.id, id),
    with: {
      lines: { orderBy: (l, { asc }) => [asc(l.sortOrder)] },
      enquiry: { with: { site: true, contact: true } },
      jobs: { columns: { id: true, jobNumber: true } },
    },
  });
}

export type QuoteDetail = NonNullable<Awaited<ReturnType<typeof getQuote>>>;
