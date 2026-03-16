ALTER TYPE "public"."repair_status" ADD VALUE 'quote_sent' BEFORE 'in_repair';--> statement-breakpoint
ALTER TYPE "public"."repair_status" ADD VALUE 'quote_accepted' BEFORE 'in_repair';--> statement-breakpoint
ALTER TABLE "repair_requests" ADD COLUMN "quote_decline_reason" text;