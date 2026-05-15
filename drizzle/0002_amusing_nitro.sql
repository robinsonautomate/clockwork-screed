CREATE TYPE "clockwork"."bug_severity" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "clockwork"."bug_status" AS ENUM('open', 'in_progress', 'resolved', 'wont_fix');--> statement-breakpoint
CREATE TABLE "clockwork"."bug_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"summary" text NOT NULL,
	"detail" text,
	"page_url" text,
	"severity" "clockwork"."bug_severity" DEFAULT 'medium' NOT NULL,
	"status" "clockwork"."bug_status" DEFAULT 'open' NOT NULL,
	"resolution_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone
);
