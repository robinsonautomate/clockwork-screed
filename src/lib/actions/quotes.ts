"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { enquiries, jobs, quoteLines, quotes } from "@/lib/db/schema";
import { toNumber } from "@/lib/format";
import { nextJobNumber, nextQuoteNumber } from "@/lib/numbering";
import { buildDefaultQuoteLines, calcTotals, lineTotal } from "@/lib/quoting";
import {
  quoteSaveSchema,
  type ActionResult,
  type QuoteSaveInput,
} from "@/lib/validation";

function dateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}
function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

/** Create a draft quote from an enquiry, pre-populated with default lines. */
export async function generateQuote(
  enquiryId: string,
): Promise<ActionResult<{ id: string }>> {
  const enquiry = await db.query.enquiries.findFirst({
    where: eq(enquiries.id, enquiryId),
    with: { quotes: { columns: { id: true } } },
  });
  if (!enquiry) return { ok: false, error: "Enquiry not found" };

  if (enquiry.quotes.length > 0) {
    return { ok: true, data: { id: enquiry.quotes[0].id } };
  }

  const screedTypes = await db.query.screedTypes.findMany();
  const match = screedTypes.find((s) => s.name === enquiry.screedType);
  const pricePerM2 = match ? toNumber(match.defaultPricePerM2) : 18;

  const draftLines = buildDefaultQuoteLines({
    screedType: enquiry.screedType,
    pricePerM2,
    areaM2: toNumber(enquiry.areaM2),
    depthMm: enquiry.depthMm,
    projectType: enquiry.projectType,
  });
  const { subtotal, vat, total } = calcTotals(draftLines);

  const quoteNumber = await nextQuoteNumber();
  const [quote] = await db
    .insert(quotes)
    .values({
      enquiryId,
      quoteNumber,
      status: "draft",
      subtotal: String(subtotal),
      vat: String(vat),
      total: String(total),
      validUntil: dateStr(addDays(new Date(), 30)),
    })
    .returning({ id: quotes.id });

  await db.insert(quoteLines).values(
    draftLines.map((l, i) => ({
      quoteId: quote.id,
      description: l.description,
      qty: String(l.qty),
      unit: l.unit,
      unitPrice: String(l.unitPrice),
      lineTotal: String(lineTotal(l.qty, l.unitPrice)),
      sortOrder: i,
    })),
  );

  if (enquiry.status === "new") {
    await db
      .update(enquiries)
      .set({ status: "quoted" })
      .where(eq(enquiries.id, enquiryId));
  }

  revalidatePath("/quotes");
  revalidatePath("/enquiries");
  revalidatePath(`/enquiries/${enquiryId}`);
  return { ok: true, data: { id: quote.id } };
}

/** Persist edited line items and recompute totals. */
export async function saveQuote(input: QuoteSaveInput): Promise<ActionResult> {
  const parsed = quoteSaveSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Check the quote lines",
    };
  }
  const v = parsed.data;
  const { subtotal, vat, total } = calcTotals(v.lines);

  await db.delete(quoteLines).where(eq(quoteLines.quoteId, v.quoteId));
  await db.insert(quoteLines).values(
    v.lines.map((l, i) => ({
      quoteId: v.quoteId,
      description: l.description,
      qty: String(l.qty),
      unit: l.unit,
      unitPrice: String(l.unitPrice),
      lineTotal: String(lineTotal(l.qty, l.unitPrice)),
      sortOrder: i,
    })),
  );
  await db
    .update(quotes)
    .set({
      subtotal: String(subtotal),
      vat: String(vat),
      total: String(total),
      validUntil: v.validUntil || null,
    })
    .where(eq(quotes.id, v.quoteId));

  revalidatePath(`/quotes/${v.quoteId}`);
  revalidatePath("/quotes");
  return { ok: true };
}

export async function sendQuote(quoteId: string): Promise<ActionResult> {
  const quote = await db.query.quotes.findFirst({
    where: eq(quotes.id, quoteId),
  });
  if (!quote) return { ok: false, error: "Quote not found" };

  await db
    .update(quotes)
    .set({ status: "sent", sentAt: quote.sentAt ?? new Date() })
    .where(eq(quotes.id, quoteId));

  revalidatePath(`/quotes/${quoteId}`);
  revalidatePath("/quotes");
  revalidatePath("/");
  return { ok: true };
}

export async function declineQuote(quoteId: string): Promise<ActionResult> {
  const quote = await db.query.quotes.findFirst({
    where: eq(quotes.id, quoteId),
  });
  if (!quote) return { ok: false, error: "Quote not found" };

  await db
    .update(quotes)
    .set({ status: "declined" })
    .where(eq(quotes.id, quoteId));
  await db
    .update(enquiries)
    .set({ status: "lost" })
    .where(eq(enquiries.id, quote.enquiryId));

  revalidatePath(`/quotes/${quoteId}`);
  revalidatePath("/quotes");
  revalidatePath("/enquiries");
  return { ok: true };
}

/** Accept a quote — marks it accepted and spins up a scheduled job. */
export async function acceptQuote(
  quoteId: string,
): Promise<ActionResult<{ jobId: string }>> {
  const quote = await db.query.quotes.findFirst({
    where: eq(quotes.id, quoteId),
    with: { enquiry: true, jobs: { columns: { id: true } } },
  });
  if (!quote) return { ok: false, error: "Quote not found" };
  if (quote.jobs.length > 0) {
    return { ok: true, data: { jobId: quote.jobs[0].id } };
  }

  const enq = quote.enquiry;
  const area = toNumber(enq.areaM2);
  const volume = Math.round(((area * enq.depthMm) / 1000) * 100) / 100;

  const targetIsFuture =
    enq.targetDate && new Date(enq.targetDate) > new Date();
  const scheduledDate = targetIsFuture
    ? enq.targetDate!
    : dateStr(addDays(new Date(), 14));

  const jobNumber = await nextJobNumber();
  const [job] = await db
    .insert(jobs)
    .values({
      quoteId,
      siteId: enq.siteId,
      contactId: enq.contactId,
      jobNumber,
      scheduledDate,
      screedType: enq.screedType,
      areaM2: enq.areaM2,
      depthMm: enq.depthMm,
      volumeM3: String(volume),
      status: "scheduled",
    })
    .returning({ id: jobs.id });

  await db
    .update(quotes)
    .set({ status: "accepted", acceptedAt: new Date() })
    .where(eq(quotes.id, quoteId));
  await db
    .update(enquiries)
    .set({ status: "won" })
    .where(eq(enquiries.id, enq.id));

  revalidatePath(`/quotes/${quoteId}`);
  revalidatePath("/quotes");
  revalidatePath("/jobs");
  revalidatePath("/schedule");
  revalidatePath("/");
  return { ok: true, data: { jobId: job.id } };
}
