CREATE SCHEMA "clockwork";
--> statement-breakpoint
CREATE TYPE "clockwork"."contact_role" AS ENUM('self-builder', 'developer', 'main contractor', 'architect');--> statement-breakpoint
CREATE TYPE "clockwork"."enquiry_status" AS ENUM('new', 'quoted', 'won', 'lost');--> statement-breakpoint
CREATE TYPE "clockwork"."invoice_status" AS ENUM('draft', 'sent', 'paid', 'overdue');--> statement-breakpoint
CREATE TYPE "clockwork"."job_status" AS ENUM('scheduled', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "clockwork"."pour_conditions" AS ENUM('sunny', 'cloudy', 'rain', 'cold', 'hot');--> statement-breakpoint
CREATE TYPE "clockwork"."project_type" AS ENUM('new build', 'extension', 'refurb', 'commercial');--> statement-breakpoint
CREATE TYPE "clockwork"."quote_line_unit" AS ENUM('m²', 'm³', 'day', 'item');--> statement-breakpoint
CREATE TYPE "clockwork"."quote_status" AS ENUM('draft', 'sent', 'accepted', 'declined');--> statement-breakpoint
CREATE TABLE "clockwork"."contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"company" text,
	"role" "clockwork"."contact_role" NOT NULL,
	"email" text,
	"phone" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clockwork"."crews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"lead_name" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clockwork"."enquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_id" uuid NOT NULL,
	"contact_id" uuid NOT NULL,
	"project_type" "clockwork"."project_type" NOT NULL,
	"screed_type" text NOT NULL,
	"target_date" date,
	"area_m_2" numeric(10, 2) NOT NULL,
	"depth_mm" integer NOT NULL,
	"notes" text,
	"source" text,
	"status" "clockwork"."enquiry_status" DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clockwork"."invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"invoice_number" text NOT NULL,
	"subtotal" numeric(12, 2) NOT NULL,
	"vat" numeric(12, 2) NOT NULL,
	"total" numeric(12, 2) NOT NULL,
	"status" "clockwork"."invoice_status" DEFAULT 'draft' NOT NULL,
	"due_date" date,
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invoices_invoiceNumber_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "clockwork"."jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quote_id" uuid NOT NULL,
	"site_id" uuid NOT NULL,
	"contact_id" uuid NOT NULL,
	"job_number" text NOT NULL,
	"scheduled_date" date NOT NULL,
	"crew_id" uuid,
	"truck_id" uuid,
	"screed_type" text NOT NULL,
	"area_m_2" numeric(10, 2) NOT NULL,
	"depth_mm" integer NOT NULL,
	"volume_m_3" numeric(10, 2) NOT NULL,
	"status" "clockwork"."job_status" DEFAULT 'scheduled' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "jobs_jobNumber_unique" UNIQUE("job_number")
);
--> statement-breakpoint
CREATE TABLE "clockwork"."pour_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"actual_area_m_2" numeric(10, 2) NOT NULL,
	"actual_depth_mm" integer NOT NULL,
	"actual_volume_m_3" numeric(10, 2) NOT NULL,
	"screed_type" text NOT NULL,
	"batch_ref" text,
	"ambient_temp_c" integer,
	"conditions" "clockwork"."pour_conditions",
	"pre_check_ufh_pressure" boolean DEFAULT false NOT NULL,
	"pre_check_edge_insulation" boolean DEFAULT false NOT NULL,
	"pre_check_dpm" boolean DEFAULT false NOT NULL,
	"pre_check_access" boolean DEFAULT false NOT NULL,
	"pre_check_water_power" boolean DEFAULT false NOT NULL,
	"override_reason" text,
	"photos" text[] DEFAULT '{}'::text[] NOT NULL,
	"customer_signature_name" text,
	"customer_signature_data_url" text,
	"signed_at" timestamp with time zone,
	"notes" text,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pour_records_jobId_unique" UNIQUE("job_id")
);
--> statement-breakpoint
CREATE TABLE "clockwork"."quote_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quote_id" uuid NOT NULL,
	"description" text NOT NULL,
	"qty" numeric(10, 2) NOT NULL,
	"unit" "clockwork"."quote_line_unit" NOT NULL,
	"unit_price" numeric(12, 2) NOT NULL,
	"line_total" numeric(12, 2) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clockwork"."quotes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"enquiry_id" uuid NOT NULL,
	"quote_number" text NOT NULL,
	"status" "clockwork"."quote_status" DEFAULT 'draft' NOT NULL,
	"subtotal" numeric(12, 2) DEFAULT '0' NOT NULL,
	"vat" numeric(12, 2) DEFAULT '0' NOT NULL,
	"total" numeric(12, 2) DEFAULT '0' NOT NULL,
	"valid_until" date,
	"sent_at" timestamp with time zone,
	"accepted_at" timestamp with time zone,
	"pdf_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "quotes_quoteNumber_unique" UNIQUE("quote_number")
);
--> statement-breakpoint
CREATE TABLE "clockwork"."screed_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"default_price_per_m_2" numeric(8, 2) NOT NULL,
	"default_depth_mm" integer NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clockwork"."sites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contact_id" uuid NOT NULL,
	"address_line1" text NOT NULL,
	"address_line2" text,
	"town" text NOT NULL,
	"postcode" text NOT NULL,
	"access_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clockwork"."trucks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"registration" text NOT NULL,
	"name" text NOT NULL,
	"capacity_m_3" numeric(6, 2) NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
ALTER TABLE "clockwork"."enquiries" ADD CONSTRAINT "enquiries_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "clockwork"."sites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clockwork"."enquiries" ADD CONSTRAINT "enquiries_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "clockwork"."contacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clockwork"."invoices" ADD CONSTRAINT "invoices_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "clockwork"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clockwork"."jobs" ADD CONSTRAINT "jobs_quote_id_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "clockwork"."quotes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clockwork"."jobs" ADD CONSTRAINT "jobs_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "clockwork"."sites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clockwork"."jobs" ADD CONSTRAINT "jobs_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "clockwork"."contacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clockwork"."jobs" ADD CONSTRAINT "jobs_crew_id_crews_id_fk" FOREIGN KEY ("crew_id") REFERENCES "clockwork"."crews"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clockwork"."jobs" ADD CONSTRAINT "jobs_truck_id_trucks_id_fk" FOREIGN KEY ("truck_id") REFERENCES "clockwork"."trucks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clockwork"."pour_records" ADD CONSTRAINT "pour_records_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "clockwork"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clockwork"."quote_lines" ADD CONSTRAINT "quote_lines_quote_id_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "clockwork"."quotes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clockwork"."quotes" ADD CONSTRAINT "quotes_enquiry_id_enquiries_id_fk" FOREIGN KEY ("enquiry_id") REFERENCES "clockwork"."enquiries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clockwork"."sites" ADD CONSTRAINT "sites_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "clockwork"."contacts"("id") ON DELETE cascade ON UPDATE no action;