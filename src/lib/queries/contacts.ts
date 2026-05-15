import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { contacts } from "@/lib/db/schema";

export async function listContacts() {
  return db.query.contacts.findMany({
    columns: {
      id: true,
      name: true,
      company: true,
      role: true,
      email: true,
      phone: true,
    },
    with: {
      sites: { columns: { id: true } },
      jobs: { columns: { id: true } },
    },
    orderBy: (c, { asc }) => [asc(c.name)],
  });
}

export async function getContact(id: string) {
  return db.query.contacts.findFirst({
    where: eq(contacts.id, id),
    with: {
      sites: { orderBy: (s, { asc }) => [asc(s.town)] },
      enquiries: {
        with: { site: { columns: { town: true, addressLine1: true } } },
        orderBy: (e, { desc }) => [desc(e.createdAt)],
      },
      jobs: {
        with: {
          site: { columns: { town: true, addressLine1: true } },
          quote: { columns: { total: true, quoteNumber: true } },
        },
        orderBy: (j, { desc }) => [desc(j.scheduledDate)],
      },
    },
  });
}

export type ContactDetail = NonNullable<Awaited<ReturnType<typeof getContact>>>;
