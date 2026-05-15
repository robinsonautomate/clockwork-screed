import { count } from "drizzle-orm";
import { db } from "@/lib/db";
import { invoices, jobs, quotes } from "@/lib/db/schema";

const pad4 = (n: number) => String(n).padStart(4, "0");

/** Document references — CWS-YYYY-####, sequential within the dataset. */

export async function nextQuoteNumber(): Promise<string> {
  const [{ n }] = await db.select({ n: count() }).from(quotes);
  return `CWS-${new Date().getFullYear()}-${pad4(Number(n) + 1)}`;
}

export async function nextJobNumber(): Promise<string> {
  const [{ n }] = await db.select({ n: count() }).from(jobs);
  return `CWS-J-${new Date().getFullYear()}-${pad4(Number(n) + 1)}`;
}

export async function nextInvoiceNumber(): Promise<string> {
  const [{ n }] = await db.select({ n: count() }).from(invoices);
  return `CWS-INV-${new Date().getFullYear()}-${pad4(Number(n) + 1)}`;
}
