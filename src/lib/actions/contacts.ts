"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { contacts } from "@/lib/db/schema";
import {
  contactSchema,
  type ActionResult,
  type ContactInput,
} from "@/lib/validation";

export async function createContact(
  input: ContactInput,
): Promise<ActionResult<{ id: string }>> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid contact details",
    };
  }
  const v = parsed.data;

  const [row] = await db
    .insert(contacts)
    .values({
      name: v.name,
      company: v.company || null,
      role: v.role,
      email: v.email || null,
      phone: v.phone || null,
      notes: v.notes || null,
    })
    .returning({ id: contacts.id });

  revalidatePath("/contacts");
  return { ok: true, data: { id: row.id } };
}
