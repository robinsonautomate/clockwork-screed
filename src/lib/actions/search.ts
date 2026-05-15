"use server";

import { db } from "@/lib/db";

export type SearchItem = {
  type: "Contact" | "Enquiry" | "Quote" | "Job" | "Invoice";
  label: string;
  sublabel: string;
  href: string;
  keywords: string;
};

/** Flat index powering the ⌘K command palette. */
export async function getSearchIndex(): Promise<SearchItem[]> {
  const [contacts, enquiries, quotes, jobs, invoices] = await Promise.all([
    db.query.contacts.findMany({
      columns: { id: true, name: true, company: true, role: true },
    }),
    db.query.enquiries.findMany({
      columns: { id: true, projectType: true, status: true },
      with: {
        site: { columns: { town: true, addressLine1: true } },
        contact: { columns: { name: true } },
      },
    }),
    db.query.quotes.findMany({
      columns: { id: true, quoteNumber: true, status: true },
      with: {
        enquiry: {
          columns: {},
          with: {
            site: { columns: { town: true } },
            contact: { columns: { name: true, company: true } },
          },
        },
      },
    }),
    db.query.jobs.findMany({
      columns: { id: true, jobNumber: true, status: true, screedType: true },
      with: { site: { columns: { town: true, addressLine1: true } } },
    }),
    db.query.invoices.findMany({
      columns: { id: true, invoiceNumber: true, status: true },
      with: {
        job: {
          columns: {},
          with: { site: { columns: { town: true } } },
        },
      },
    }),
  ]);

  const items: SearchItem[] = [];

  for (const c of contacts) {
    items.push({
      type: "Contact",
      label: c.name,
      sublabel: c.company ?? c.role,
      href: `/contacts/${c.id}`,
      keywords: `${c.name} ${c.company ?? ""} ${c.role}`,
    });
  }
  for (const e of enquiries) {
    items.push({
      type: "Enquiry",
      label: `${e.site.town} — ${e.projectType}`,
      sublabel: `${e.contact.name} · ${e.status}`,
      href: `/enquiries/${e.id}`,
      keywords: `${e.site.town} ${e.site.addressLine1} ${e.projectType} ${e.contact.name}`,
    });
  }
  for (const q of quotes) {
    items.push({
      type: "Quote",
      label: q.quoteNumber,
      sublabel: `${q.enquiry.contact.company ?? q.enquiry.contact.name} · ${q.enquiry.site.town}`,
      href: `/quotes/${q.id}`,
      keywords: `${q.quoteNumber} ${q.enquiry.contact.name} ${q.enquiry.site.town} ${q.status}`,
    });
  }
  for (const j of jobs) {
    items.push({
      type: "Job",
      label: `${j.jobNumber} — ${j.site.town}`,
      sublabel: `${j.screedType} · ${j.status.replace("_", " ")}`,
      href: `/jobs/${j.id}`,
      keywords: `${j.jobNumber} ${j.site.town} ${j.site.addressLine1} ${j.screedType}`,
    });
  }
  for (const inv of invoices) {
    items.push({
      type: "Invoice",
      label: inv.invoiceNumber,
      sublabel: `${inv.job.site.town} · ${inv.status}`,
      href: `/invoices/${inv.id}`,
      keywords: `${inv.invoiceNumber} ${inv.job.site.town} ${inv.status}`,
    });
  }

  return items;
}
