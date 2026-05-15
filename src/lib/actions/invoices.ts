"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { invoiceLines, invoices } from "@/lib/db/schema";
import { calcTotals, lineTotal } from "@/lib/quoting";
import {
  invoiceLinesSaveSchema,
  type ActionResult,
  type InvoiceLinesSaveInput,
} from "@/lib/validation";

function revalidate(id: string) {
  revalidatePath("/invoices");
  revalidatePath(`/invoices/${id}`);
  revalidatePath("/");
}

export async function markInvoiceSent(id: string): Promise<ActionResult> {
  const invoice = await db.query.invoices.findFirst({
    where: eq(invoices.id, id),
  });
  if (!invoice) return { ok: false, error: "Invoice not found" };

  await db
    .update(invoices)
    .set({ status: "sent" })
    .where(eq(invoices.id, id));
  revalidate(id);
  return { ok: true };
}

/** Replace an invoice's line items and recompute its totals. */
export async function saveInvoiceLines(
  input: InvoiceLinesSaveInput,
): Promise<ActionResult> {
  const parsed = invoiceLinesSaveSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Check the line items",
    };
  }
  const v = parsed.data;

  const invoice = await db.query.invoices.findFirst({
    where: eq(invoices.id, v.invoiceId),
  });
  if (!invoice) return { ok: false, error: "Invoice not found" };
  if (invoice.status === "paid") {
    return { ok: false, error: "A paid invoice can no longer be edited." };
  }

  const { subtotal, vat, total } = calcTotals(v.lines);

  await db.delete(invoiceLines).where(eq(invoiceLines.invoiceId, v.invoiceId));
  await db.insert(invoiceLines).values(
    v.lines.map((l, i) => ({
      invoiceId: v.invoiceId,
      description: l.description,
      qty: String(l.qty),
      unit: l.unit,
      unitPrice: String(l.unitPrice),
      lineTotal: String(lineTotal(l.qty, l.unitPrice)),
      sortOrder: i,
    })),
  );
  await db
    .update(invoices)
    .set({
      subtotal: String(subtotal),
      vat: String(vat),
      total: String(total),
    })
    .where(eq(invoices.id, v.invoiceId));

  revalidate(v.invoiceId);
  return { ok: true };
}

export async function markInvoicePaid(id: string): Promise<ActionResult> {
  const invoice = await db.query.invoices.findFirst({
    where: eq(invoices.id, id),
  });
  if (!invoice) return { ok: false, error: "Invoice not found" };

  await db
    .update(invoices)
    .set({ status: "paid", paidAt: new Date() })
    .where(eq(invoices.id, id));
  revalidate(id);
  return { ok: true };
}
