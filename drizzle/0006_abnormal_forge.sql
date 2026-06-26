ALTER TABLE "orders" ADD COLUMN "shipping_mode" "shipping_mode";--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "locker_id" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "tracking_number" varchar(100);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "label_url" text;