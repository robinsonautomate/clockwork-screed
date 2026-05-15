"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { invoices } from "@/lib/db/schema";
import type { ActionResult } from "@/lib/validation";

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
