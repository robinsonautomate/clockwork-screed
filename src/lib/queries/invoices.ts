import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { invoices } from "@/lib/db/schema";

export async function listInvoices() {
  return db.query.invoices.findMany({
    with: {
      job: {
        columns: { id: true, jobNumber: true, screedType: true },
        with: {
          site: { columns: { town: true } },
          contact: { columns: { name: true, company: true } },
        },
      },
    },
    orderBy: (i, { desc }) => [desc(i.createdAt)],
  });
}

export async function getInvoice(id: string) {
  return db.query.invoices.findFirst({
    where: eq(invoices.id, id),
    with: {
      lines: { orderBy: (l, { asc }) => [asc(l.sortOrder)] },
      job: {
        with: {
          site: true,
          contact: true,
        },
      },
    },
  });
}

export type InvoiceDetail = NonNullable<Awaited<ReturnType<typeof getInvoice>>>;
