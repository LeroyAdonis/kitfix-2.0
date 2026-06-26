CREATE TYPE "public"."shipping_mode" AS ENUM('L2L', 'D2D', 'D2L', 'L2D');--> statement-breakpoint
ALTER TYPE "public"."repair_status" ADD VALUE 'item_received' BEFORE 'in_repair';--> statement-breakpoint
ALTER TYPE "public"."repair_status" ADD VALUE 'ready_for_shipment' BEFORE 'shipped';--> statement-breakpoint
ALTER TYPE "public"."repair_status" ADD VALUE 'delivered';--> statement-breakpoint
ALTER TYPE "public"."repair_status" ADD VALUE 'cancelled';--> statement-breakpoint
ALTER TABLE "repair_requests" ADD COLUMN "shipping_mode" "shipping_mode";--> statement-breakpoint
ALTER TABLE "repair_requests" ADD COLUMN "outbound_locker_id" text;--> statement-breakpoint
ALTER TABLE "repair_requests" ADD COLUMN "return_locker_id" text;--> statement-breakpoint
ALTER TABLE "repair_requests" ADD COLUMN "outbound_tracking" varchar(100);--> statement-breakpoint
ALTER TABLE "repair_requests" ADD COLUMN "return_tracking" varchar(100);--> statement-breakpoint
ALTER TABLE "repair_requests" ADD COLUMN "outbound_label_url" text;--> statement-breakpoint
ALTER TABLE "repair_requests" ADD COLUMN "return_label_url" text;--> statement-breakpoint
ALTER TABLE "repair_requests" ADD COLUMN "shipping_rate_cents" integer;--> statement-breakpoint
ALTER TABLE "repair_requests" ADD COLUMN "shipping_surcharge_cents" integer;