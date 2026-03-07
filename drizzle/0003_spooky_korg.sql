ALTER TABLE "repair_requests" ADD COLUMN "pickup_required" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "repair_requests" ADD COLUMN "pickup_fee" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "repair_requests" ADD COLUMN "delivery_fee" integer DEFAULT 0;