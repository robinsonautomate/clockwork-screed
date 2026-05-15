"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { invoiceLines, invoices, jobs, pourRecords } from "@/lib/db/schema";
import { nextInvoiceNumber } from "@/lib/numbering";
import {
  pourRecordSchema,
  type ActionResult,
  type PourRecordInput,
} from "@/lib/validation";

function dateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Save a completed pour record, mark the job done and raise a draft invoice. */
export async function savePourRecord(
  input: PourRecordInput,
): Promise<ActionResult<{ jobId: string }>> {
  const parsed = pourRecordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Check the pour record",
    };
  }
  const v = parsed.data;

  const checksPassed =
    v.preCheckUfhPressure &&
    v.preCheckEdgeInsulation &&
    v.preCheckDpm &&
    v.preCheckAccess &&
    v.preCheckWaterPower;
  if (!checksPassed && !v.overrideReason?.trim()) {
    return {
      ok: false,
      error:
        "All pre-pour checks must pass, or a supervisor override reason must be recorded.",
    };
  }

  const job = await db.query.jobs.findFirst({
    where: eq(jobs.id, v.jobId),
    with: {
      pourRecord: { columns: { id: true } },
      invoice: { columns: { id: true } },
      quote: {
        columns: { subtotal: true, vat: true, total: true },
        with: { lines: { orderBy: (l, { asc }) => [asc(l.sortOrder)] } },
      },
    },
  });
  if (!job) return { ok: false, error: "Job not found" };
  if (job.pourRecord) {
    return { ok: false, error: "This job already has a pour record." };
  }

  const now = new Date();
  const volume =
    Math.round(((v.actualAreaM2 * v.actualDepthMm) / 1000) * 100) / 100;

  await db.insert(pourRecords).values({
    jobId: v.jobId,
    actualAreaM2: String(v.actualAreaM2),
    actualDepthMm: Math.round(v.actualDepthMm),
    actualVolumeM3: String(volume),
    screedType: v.screedType,
    batchRef: v.batchRef || null,
    ambientTempC: Math.round(v.ambientTempC),
    conditions: v.conditions,
    preCheckUfhPressure: v.preCheckUfhPressure,
    preCheckEdgeInsulation: v.preCheckEdgeInsulation,
    preCheckDpm: v.preCheckDpm,
    preCheckAccess: v.preCheckAccess,
    preCheckWaterPower: v.preCheckWaterPower,
    overrideReason: v.overrideReason?.trim() || null,
    photos: v.photos,
    customerSignatureName: v.customerSignatureName,
    customerSignatureDataUrl: v.customerSignatureDataUrl,
    signedAt: now,
    notes: v.notes || null,
    completedAt: now,
  });

  await db
    .update(jobs)
    .set({ status: "completed" })
    .where(eq(jobs.id, v.jobId));

  // Raise a draft invoice from the quote so the job flows through to billing.
  if (!job.invoice && job.quote) {
    const invoiceNumber = await nextInvoiceNumber();
    const due = new Date(now);
    due.setDate(due.getDate() + 14);
    const [invoice] = await db
      .insert(invoices)
      .values({
        jobId: v.jobId,
        invoiceNumber,
        subtotal: job.quote.subtotal,
        vat: job.quote.vat,
        total: job.quote.total,
        status: "draft",
        dueDate: dateStr(due),
      })
      .returning({ id: invoices.id });

    // Snapshot the quote's line items onto the invoice so they can be
    // edited independently afterwards.
    if (job.quote.lines.length > 0) {
      await db.insert(invoiceLines).values(
        job.quote.lines.map((l, i) => ({
          invoiceId: invoice.id,
          description: l.description,
          qty: l.qty,
          unit: l.unit,
          unitPrice: l.unitPrice,
          lineTotal: l.lineTotal,
          sortOrder: i,
        })),
      );
    }
  }

  revalidatePath(`/jobs/${v.jobId}`);
  revalidatePath("/jobs");
  revalidatePath("/schedule");
  revalidatePath("/invoices");
  revalidatePath("/");
  return { ok: true, data: { jobId: v.jobId } };
}
