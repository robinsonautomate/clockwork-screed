import { relations, sql } from "drizzle-orm";
import {
  boolean,
  date,
  integer,
  numeric,
  pgSchema,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

/* ────────────────────────────────────────────────────────────────────────
 * Dedicated Postgres schema.
 * The target Neon database already hosts an unrelated project in `public`
 * (operatives, scaffold_tags, vehicles, ...), so this app is namespaced into
 * its own `clockwork` schema to avoid any collision and leave that data
 * untouched.
 * ──────────────────────────────────────────────────────────────────────── */

export const cws = pgSchema("clockwork");

/* ── Enums — status fields use pg enums per the brief ─────────────────── */

export const contactRole = cws.enum("contact_role", [
  "self-builder",
  "developer",
  "main contractor",
  "architect",
]);

export const projectType = cws.enum("project_type", [
  "new build",
  "extension",
  "refurb",
  "commercial",
]);

export const enquiryStatus = cws.enum("enquiry_status", [
  "new",
  "quoted",
  "won",
  "lost",
]);

export const quoteStatus = cws.enum("quote_status", [
  "draft",
  "sent",
  "accepted",
  "declined",
]);

export const quoteLineUnit = cws.enum("quote_line_unit", [
  "m²",
  "m³",
  "day",
  "item",
]);

export const jobStatus = cws.enum("job_status", [
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
]);

export const invoiceStatus = cws.enum("invoice_status", [
  "draft",
  "sent",
  "paid",
  "overdue",
]);

export const pourConditions = cws.enum("pour_conditions", [
  "sunny",
  "cloudy",
  "rain",
  "cold",
  "hot",
]);

const createdAt = timestamp({ withTimezone: true }).defaultNow().notNull();

/* ── Tables ───────────────────────────────────────────────────────────── */

export const contacts = cws.table("contacts", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  company: text(),
  role: contactRole().notNull(),
  email: text(),
  phone: text(),
  notes: text(),
  createdAt,
});

export const sites = cws.table("sites", {
  id: uuid().primaryKey().defaultRandom(),
  contactId: uuid()
    .notNull()
    .references(() => contacts.id, { onDelete: "cascade" }),
  addressLine1: text().notNull(),
  addressLine2: text(),
  town: text().notNull(),
  postcode: text().notNull(),
  accessNotes: text(),
  createdAt,
});

export const crews = cws.table("crews", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  leadName: text().notNull(),
  active: boolean().notNull().default(true),
});

export const trucks = cws.table("trucks", {
  id: uuid().primaryKey().defaultRandom(),
  registration: text().notNull(),
  name: text().notNull(),
  capacityM3: numeric({ precision: 6, scale: 2 }).notNull(),
  active: boolean().notNull().default(true),
});

export const screedTypes = cws.table("screed_types", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  defaultPricePerM2: numeric({ precision: 8, scale: 2 }).notNull(),
  defaultDepthMm: integer().notNull(),
  active: boolean().notNull().default(true),
});

export const enquiries = cws.table("enquiries", {
  id: uuid().primaryKey().defaultRandom(),
  siteId: uuid()
    .notNull()
    .references(() => sites.id, { onDelete: "cascade" }),
  contactId: uuid()
    .notNull()
    .references(() => contacts.id, { onDelete: "cascade" }),
  projectType: projectType().notNull(),
  screedType: text().notNull(),
  targetDate: date(),
  areaM2: numeric({ precision: 10, scale: 2 }).notNull(),
  depthMm: integer().notNull(),
  notes: text(),
  source: text(),
  status: enquiryStatus().notNull().default("new"),
  createdAt,
});

export const quotes = cws.table("quotes", {
  id: uuid().primaryKey().defaultRandom(),
  enquiryId: uuid()
    .notNull()
    .references(() => enquiries.id, { onDelete: "cascade" }),
  quoteNumber: text().notNull().unique(),
  status: quoteStatus().notNull().default("draft"),
  subtotal: numeric({ precision: 12, scale: 2 }).notNull().default("0"),
  vat: numeric({ precision: 12, scale: 2 }).notNull().default("0"),
  total: numeric({ precision: 12, scale: 2 }).notNull().default("0"),
  validUntil: date(),
  sentAt: timestamp({ withTimezone: true }),
  acceptedAt: timestamp({ withTimezone: true }),
  pdfUrl: text(),
  createdAt,
});

export const quoteLines = cws.table("quote_lines", {
  id: uuid().primaryKey().defaultRandom(),
  quoteId: uuid()
    .notNull()
    .references(() => quotes.id, { onDelete: "cascade" }),
  description: text().notNull(),
  qty: numeric({ precision: 10, scale: 2 }).notNull(),
  unit: quoteLineUnit().notNull(),
  unitPrice: numeric({ precision: 12, scale: 2 }).notNull(),
  lineTotal: numeric({ precision: 12, scale: 2 }).notNull(),
  sortOrder: integer().notNull().default(0),
});

export const jobs = cws.table("jobs", {
  id: uuid().primaryKey().defaultRandom(),
  quoteId: uuid()
    .notNull()
    .references(() => quotes.id, { onDelete: "cascade" }),
  siteId: uuid()
    .notNull()
    .references(() => sites.id, { onDelete: "cascade" }),
  contactId: uuid()
    .notNull()
    .references(() => contacts.id, { onDelete: "cascade" }),
  jobNumber: text().notNull().unique(),
  scheduledDate: date().notNull(),
  crewId: uuid().references(() => crews.id, { onDelete: "set null" }),
  truckId: uuid().references(() => trucks.id, { onDelete: "set null" }),
  screedType: text().notNull(),
  areaM2: numeric({ precision: 10, scale: 2 }).notNull(),
  depthMm: integer().notNull(),
  volumeM3: numeric({ precision: 10, scale: 2 }).notNull(),
  status: jobStatus().notNull().default("scheduled"),
  createdAt,
});

export const pourRecords = cws.table("pour_records", {
  id: uuid().primaryKey().defaultRandom(),
  jobId: uuid()
    .notNull()
    .unique()
    .references(() => jobs.id, { onDelete: "cascade" }),
  actualAreaM2: numeric({ precision: 10, scale: 2 }).notNull(),
  actualDepthMm: integer().notNull(),
  actualVolumeM3: numeric({ precision: 10, scale: 2 }).notNull(),
  screedType: text().notNull(),
  batchRef: text(),
  ambientTempC: integer(),
  conditions: pourConditions(),
  preCheckUfhPressure: boolean().notNull().default(false),
  preCheckEdgeInsulation: boolean().notNull().default(false),
  preCheckDpm: boolean().notNull().default(false),
  preCheckAccess: boolean().notNull().default(false),
  preCheckWaterPower: boolean().notNull().default(false),
  overrideReason: text(),
  photos: text()
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  customerSignatureName: text(),
  customerSignatureDataUrl: text(),
  signedAt: timestamp({ withTimezone: true }),
  notes: text(),
  completedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export const invoices = cws.table("invoices", {
  id: uuid().primaryKey().defaultRandom(),
  jobId: uuid()
    .notNull()
    .references(() => jobs.id, { onDelete: "cascade" }),
  invoiceNumber: text().notNull().unique(),
  subtotal: numeric({ precision: 12, scale: 2 }).notNull(),
  vat: numeric({ precision: 12, scale: 2 }).notNull(),
  total: numeric({ precision: 12, scale: 2 }).notNull(),
  status: invoiceStatus().notNull().default("draft"),
  dueDate: date(),
  paidAt: timestamp({ withTimezone: true }),
  createdAt,
});

/* ── Relations — power Drizzle relational queries (db.query.*) ─────────── */

export const contactsRelations = relations(contacts, ({ many }) => ({
  sites: many(sites),
  enquiries: many(enquiries),
  jobs: many(jobs),
}));

export const sitesRelations = relations(sites, ({ one, many }) => ({
  contact: one(contacts, {
    fields: [sites.contactId],
    references: [contacts.id],
  }),
  enquiries: many(enquiries),
  jobs: many(jobs),
}));

export const crewsRelations = relations(crews, ({ many }) => ({
  jobs: many(jobs),
}));

export const trucksRelations = relations(trucks, ({ many }) => ({
  jobs: many(jobs),
}));

export const enquiriesRelations = relations(enquiries, ({ one, many }) => ({
  site: one(sites, { fields: [enquiries.siteId], references: [sites.id] }),
  contact: one(contacts, {
    fields: [enquiries.contactId],
    references: [contacts.id],
  }),
  quotes: many(quotes),
}));

export const quotesRelations = relations(quotes, ({ one, many }) => ({
  enquiry: one(enquiries, {
    fields: [quotes.enquiryId],
    references: [enquiries.id],
  }),
  lines: many(quoteLines),
  jobs: many(jobs),
}));

export const quoteLinesRelations = relations(quoteLines, ({ one }) => ({
  quote: one(quotes, {
    fields: [quoteLines.quoteId],
    references: [quotes.id],
  }),
}));

export const jobsRelations = relations(jobs, ({ one }) => ({
  quote: one(quotes, { fields: [jobs.quoteId], references: [quotes.id] }),
  site: one(sites, { fields: [jobs.siteId], references: [sites.id] }),
  contact: one(contacts, {
    fields: [jobs.contactId],
    references: [contacts.id],
  }),
  crew: one(crews, { fields: [jobs.crewId], references: [crews.id] }),
  truck: one(trucks, { fields: [jobs.truckId], references: [trucks.id] }),
  pourRecord: one(pourRecords),
  invoice: one(invoices),
}));

export const pourRecordsRelations = relations(pourRecords, ({ one }) => ({
  job: one(jobs, { fields: [pourRecords.jobId], references: [jobs.id] }),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  job: one(jobs, { fields: [invoices.jobId], references: [jobs.id] }),
}));

/* ── Inferred types ───────────────────────────────────────────────────── */

export type Contact = typeof contacts.$inferSelect;
export type NewContact = typeof contacts.$inferInsert;
export type Site = typeof sites.$inferSelect;
export type NewSite = typeof sites.$inferInsert;
export type Crew = typeof crews.$inferSelect;
export type Truck = typeof trucks.$inferSelect;
export type ScreedType = typeof screedTypes.$inferSelect;
export type Enquiry = typeof enquiries.$inferSelect;
export type NewEnquiry = typeof enquiries.$inferInsert;
export type Quote = typeof quotes.$inferSelect;
export type NewQuote = typeof quotes.$inferInsert;
export type QuoteLine = typeof quoteLines.$inferSelect;
export type NewQuoteLine = typeof quoteLines.$inferInsert;
export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;
export type PourRecord = typeof pourRecords.$inferSelect;
export type NewPourRecord = typeof pourRecords.$inferInsert;
export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;

export type ContactRole = (typeof contactRole.enumValues)[number];
export type ProjectType = (typeof projectType.enumValues)[number];
export type EnquiryStatus = (typeof enquiryStatus.enumValues)[number];
export type QuoteStatus = (typeof quoteStatus.enumValues)[number];
export type QuoteLineUnit = (typeof quoteLineUnit.enumValues)[number];
export type JobStatus = (typeof jobStatus.enumValues)[number];
export type InvoiceStatus = (typeof invoiceStatus.enumValues)[number];
export type PourConditions = (typeof pourConditions.enumValues)[number];
