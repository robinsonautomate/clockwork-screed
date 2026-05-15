"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { contacts, enquiries, sites } from "@/lib/db/schema";
import {
  enquirySchema,
  type ActionResult,
  type EnquiryInput,
} from "@/lib/validation";

export async function createEnquiry(
  input: EnquiryInput,
): Promise<ActionResult<{ id: string }>> {
  const parsed = enquirySchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Check the enquiry details",
    };
  }
  const v = parsed.data;

  // Resolve the contact — existing, or create a new one from the form.
  let contactId = v.contactId || "";
  if (!contactId) {
    if (!v.newContactName) {
      return { ok: false, error: "Choose a contact or enter a new one" };
    }
    const [created] = await db
      .insert(contacts)
      .values({
        name: v.newContactName,
        company: v.newContactCompany || null,
        role: v.newContactRole ?? "self-builder",
        email: v.newContactEmail || null,
        phone: v.newContactPhone || null,
      })
      .returning({ id: contacts.id });
    contactId = created.id;
  }

  const [site] = await db
    .insert(sites)
    .values({
      contactId,
      addressLine1: v.addressLine1,
      addressLine2: v.addressLine2 || null,
      town: v.town,
      postcode: v.postcode.toUpperCase(),
      accessNotes: v.accessNotes || null,
    })
    .returning({ id: sites.id });

  const [enquiry] = await db
    .insert(enquiries)
    .values({
      siteId: site.id,
      contactId,
      projectType: v.projectType,
      screedType: v.screedType,
      targetDate: v.targetDate || null,
      areaM2: String(v.areaM2),
      depthMm: v.depthMm,
      notes: v.notes || null,
      source: v.source || null,
      status: "new",
    })
    .returning({ id: enquiries.id });

  revalidatePath("/enquiries");
  revalidatePath("/contacts");
  revalidatePath("/");
  return { ok: true, data: { id: enquiry.id } };
}
