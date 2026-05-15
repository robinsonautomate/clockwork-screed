"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { contacts, enquiries, sites } from "@/lib/db/schema";
import { normalizeName } from "@/lib/format";
import {
  enquirySchema,
  enquiryUpdateSchema,
  siteUpdateSchema,
  type ActionResult,
  type EnquiryInput,
  type EnquiryUpdateInput,
  type SiteUpdateInput,
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
        name: normalizeName(v.newContactName),
        company: v.newContactCompany
          ? normalizeName(v.newContactCompany)
          : null,
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
      addressLine1: normalizeName(v.addressLine1),
      addressLine2: v.addressLine2 ? normalizeName(v.addressLine2) : null,
      town: normalizeName(v.town),
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

export async function updateEnquiry(
  input: EnquiryUpdateInput,
): Promise<ActionResult> {
  const parsed = enquiryUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Check the enquiry details",
    };
  }
  const v = parsed.data;

  await db
    .update(enquiries)
    .set({
      projectType: v.projectType,
      screedType: v.screedType,
      targetDate: v.targetDate || null,
      areaM2: String(v.areaM2),
      depthMm: v.depthMm,
      source: v.source || null,
      notes: v.notes || null,
      status: v.status,
    })
    .where(eq(enquiries.id, v.id));

  revalidatePath("/enquiries");
  revalidatePath(`/enquiries/${v.id}`);
  revalidatePath("/");
  return { ok: true };
}

export async function updateSite(
  input: SiteUpdateInput,
): Promise<ActionResult> {
  const parsed = siteUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Check the site details",
    };
  }
  const v = parsed.data;

  await db
    .update(sites)
    .set({
      addressLine1: normalizeName(v.addressLine1),
      addressLine2: v.addressLine2 ? normalizeName(v.addressLine2) : null,
      town: normalizeName(v.town),
      postcode: v.postcode.toUpperCase(),
      accessNotes: v.accessNotes || null,
    })
    .where(eq(sites.id, v.id));

  revalidatePath("/enquiries");
  revalidatePath("/jobs");
  revalidatePath("/schedule");
  revalidatePath("/contacts");
  revalidatePath("/");
  return { ok: true };
}
