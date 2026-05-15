import {
  addDays,
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { db } from "@/lib/db";
import { toDate, toNumber } from "@/lib/format";

export type ActivityEvent = {
  kind: "enquiry" | "quote" | "job" | "invoice";
  at: Date;
  title: string;
  sub: string;
  href: string;
};

function contactLabel(c: { name: string; company: string | null }): string {
  return c.company ?? c.name;
}

export async function getDashboard() {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const today = startOfDay(now);
  const in7 = addDays(today, 7);

  const inRange = (d: Date | string | null, from: Date, to: Date) => {
    const x = toDate(d);
    return !!x && x >= from && x <= to;
  };

  const [enquiries, quotes, pours, invoices, jobs] = await Promise.all([
    db.query.enquiries.findMany({
      with: {
        site: { columns: { town: true } },
        contact: { columns: { name: true, company: true } },
      },
    }),
    db.query.quotes.findMany({
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
    db.query.pourRecords.findMany({
      with: {
        job: {
          columns: { id: true },
          with: { site: { columns: { town: true } } },
        },
      },
    }),
    db.query.invoices.findMany({
      with: {
        job: {
          columns: { id: true },
          with: {
            site: { columns: { town: true } },
            contact: { columns: { name: true, company: true } },
          },
        },
      },
    }),
    db.query.jobs.findMany({
      with: {
        site: { columns: { town: true, addressLine1: true } },
        contact: { columns: { name: true, company: true } },
        crew: { columns: { name: true } },
      },
    }),
  ]);

  /* ── KPIs ──────────────────────────────────────────────────────────── */

  const newEnquiriesMonth = enquiries.filter((e) =>
    inRange(e.createdAt, monthStart, monthEnd),
  ).length;
  const newEnquiriesWeek = enquiries.filter((e) =>
    inRange(e.createdAt, weekStart, weekEnd),
  ).length;

  const quotedValueMonth = quotes
    .filter((q) => q.sentAt && inRange(q.sentAt, monthStart, monthEnd))
    .reduce((a, q) => a + toNumber(q.total), 0);

  const wonValueMonth = quotes
    .filter((q) => q.acceptedAt && inRange(q.acceptedAt, monthStart, monthEnd))
    .reduce((a, q) => a + toNumber(q.total), 0);

  const m2PouredMonth = pours
    .filter((p) => inRange(p.completedAt, monthStart, monthEnd))
    .reduce((a, p) => a + toNumber(p.actualAreaM2), 0);

  const outstanding = invoices.filter(
    (i) => i.status === "sent" || i.status === "overdue",
  );
  const outstandingValue = outstanding.reduce(
    (a, i) => a + toNumber(i.total),
    0,
  );
  const overdueCount = invoices.filter((i) => i.status === "overdue").length;

  /* ── Upcoming pours (next 7 days) ──────────────────────────────────── */

  const upcoming = jobs
    .filter((j) => {
      const d = toDate(j.scheduledDate);
      return (
        !!d &&
        d >= today &&
        d <= in7 &&
        (j.status === "scheduled" || j.status === "in_progress")
      );
    })
    .sort(
      (a, b) =>
        (toDate(a.scheduledDate)?.getTime() ?? 0) -
        (toDate(b.scheduledDate)?.getTime() ?? 0),
    );

  /* ── Activity feed ─────────────────────────────────────────────────── */

  const events: ActivityEvent[] = [];

  for (const e of enquiries) {
    events.push({
      kind: "enquiry",
      at: e.createdAt,
      title: `Enquiry logged — ${e.site.town}`,
      sub: `${contactLabel(e.contact)} · ${e.projectType}`,
      href: `/enquiries/${e.id}`,
    });
  }
  for (const q of quotes) {
    if (q.acceptedAt) {
      events.push({
        kind: "quote",
        at: q.acceptedAt,
        title: `Quote ${q.quoteNumber} accepted`,
        sub: contactLabel(q.enquiry.contact),
        href: `/quotes/${q.id}`,
      });
    } else if (q.sentAt) {
      events.push({
        kind: "quote",
        at: q.sentAt,
        title: `Quote ${q.quoteNumber} sent`,
        sub: contactLabel(q.enquiry.contact),
        href: `/quotes/${q.id}`,
      });
    }
  }
  for (const p of pours) {
    events.push({
      kind: "job",
      at: p.completedAt,
      title: `Pour completed — ${p.job.site.town}`,
      sub: `${toNumber(p.actualAreaM2).toLocaleString("en-GB")} m² · ${p.screedType}`,
      href: `/jobs/${p.job.id}`,
    });
  }
  for (const i of invoices) {
    if (i.paidAt) {
      events.push({
        kind: "invoice",
        at: i.paidAt,
        title: `Invoice ${i.invoiceNumber} paid`,
        sub: contactLabel(i.job.contact),
        href: `/invoices/${i.id}`,
      });
    } else {
      events.push({
        kind: "invoice",
        at: i.createdAt,
        title: `Invoice ${i.invoiceNumber} raised`,
        sub: `${contactLabel(i.job.contact)} · ${i.job.site.town}`,
        href: `/invoices/${i.id}`,
      });
    }
  }

  const activity = events
    .filter((e) => toDate(e.at))
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 10);

  return {
    kpis: {
      newEnquiriesMonth,
      newEnquiriesWeek,
      quotedValueMonth,
      wonValueMonth,
      m2PouredMonth,
      outstandingValue,
      outstandingCount: outstanding.length,
      overdueCount,
    },
    upcoming,
    activity,
  };
}
