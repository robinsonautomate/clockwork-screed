import { z } from "zod";

/** Standard server-action return shape. */
export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

const optionalText = (max = 500) =>
  z.string().trim().max(max).optional().or(z.literal(""));

const optionalEmail = z
  .union([z.literal(""), z.email("Enter a valid email address")])
  .optional();

/* ── Contacts ─────────────────────────────────────────────────────────── */

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter a contact name"),
  company: optionalText(140),
  role: z.enum(["self-builder", "developer", "main contractor", "architect"]),
  email: optionalEmail,
  phone: optionalText(40),
  notes: optionalText(1000),
});
export type ContactInput = z.infer<typeof contactSchema>;

/* ── Enquiries ────────────────────────────────────────────────────────── */

export const enquirySchema = z.object({
  // contact — either an existing id, or a new contact's details
  contactId: z.string().uuid().optional().or(z.literal("")),
  newContactName: optionalText(140),
  newContactCompany: optionalText(140),
  newContactRole: z
    .enum(["self-builder", "developer", "main contractor", "architect"])
    .optional(),
  newContactEmail: optionalEmail,
  newContactPhone: optionalText(40),
  // site
  addressLine1: z.string().trim().min(3, "Enter the site address"),
  addressLine2: optionalText(140),
  town: z.string().trim().min(2, "Enter the town"),
  postcode: z.string().trim().min(4, "Enter the postcode").max(10),
  accessNotes: optionalText(500),
  // enquiry
  projectType: z.enum(["new build", "extension", "refurb", "commercial"]),
  screedType: z.string().trim().min(2, "Choose a screed type"),
  targetDate: optionalText(20),
  areaM2: z.coerce.number().positive("Enter the area in m²").max(100000),
  depthMm: z.coerce.number().int().positive("Enter the depth").max(500),
  source: optionalText(80),
  notes: optionalText(1000),
});
export type EnquiryInput = z.infer<typeof enquirySchema>;
/** Pre-coercion shape — number fields arrive as strings from inputs. */
export type EnquiryFormValues = z.input<typeof enquirySchema>;

/* ── Quote lines ──────────────────────────────────────────────────────── */

export const quoteLineSchema = z.object({
  description: z.string().trim().min(2, "Enter a description"),
  qty: z.coerce.number().positive("Qty must be greater than 0"),
  unit: z.enum(["m²", "m³", "day", "item"]),
  unitPrice: z.coerce.number().min(0, "Price cannot be negative"),
});
export type QuoteLineInput = z.infer<typeof quoteLineSchema>;

export const quoteSaveSchema = z.object({
  quoteId: z.string().uuid(),
  validUntil: optionalText(20),
  lines: z.array(quoteLineSchema).min(1, "Add at least one line item"),
});
export type QuoteSaveInput = z.infer<typeof quoteSaveSchema>;

/* ── Crews / Trucks / Screed types (settings) ─────────────────────────── */

export const crewSchema = z.object({
  name: z.string().trim().min(2, "Enter a crew name"),
  leadName: z.string().trim().min(2, "Enter the crew lead"),
  active: z.boolean().default(true),
});
export type CrewInput = z.infer<typeof crewSchema>;

export const truckSchema = z.object({
  name: z.string().trim().min(2, "Enter a truck name"),
  registration: z.string().trim().min(2, "Enter the registration"),
  capacityM3: z.coerce.number().positive("Enter the capacity").max(100),
  active: z.boolean().default(true),
});
export type TruckInput = z.infer<typeof truckSchema>;

export const screedTypeSchema = z.object({
  name: z.string().trim().min(2, "Enter a screed type name"),
  defaultPricePerM2: z.coerce.number().positive("Enter a price").max(1000),
  defaultDepthMm: z.coerce.number().int().positive("Enter a depth").max(500),
  active: z.boolean().default(true),
});
export type ScreedTypeInput = z.infer<typeof screedTypeSchema>;

/* ── Job scheduling ───────────────────────────────────────────────────── */

export const jobScheduleSchema = z.object({
  jobId: z.string().uuid(),
  scheduledDate: z.string().trim().min(8, "Choose a date"),
  crewId: z.string().uuid().optional().or(z.literal("")),
  truckId: z.string().uuid().optional().or(z.literal("")),
});
export type JobScheduleInput = z.infer<typeof jobScheduleSchema>;

/* ── Pour record ──────────────────────────────────────────────────────── */

export const pourRecordSchema = z.object({
  jobId: z.string().uuid(),
  preCheckUfhPressure: z.boolean(),
  preCheckEdgeInsulation: z.boolean(),
  preCheckDpm: z.boolean(),
  preCheckAccess: z.boolean(),
  preCheckWaterPower: z.boolean(),
  overrideReason: optionalText(300),
  actualAreaM2: z.coerce.number().positive("Enter the area poured").max(100000),
  actualDepthMm: z.coerce.number().positive("Enter the depth").max(500),
  screedType: z.string().trim().min(2, "Enter the screed type"),
  batchRef: optionalText(60),
  ambientTempC: z.coerce.number().min(-10).max(45),
  conditions: z.enum(["sunny", "cloudy", "rain", "cold", "hot"]),
  photos: z.array(z.string().url()).max(8),
  customerSignatureName: z.string().trim().min(2, "Enter the customer name"),
  customerSignatureDataUrl: z.string().min(10, "A signature is required"),
  notes: optionalText(1000),
});
export type PourRecordInput = z.infer<typeof pourRecordSchema>;
