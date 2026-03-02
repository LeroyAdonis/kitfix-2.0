CREATE TYPE "public"."damage_type" AS ENUM('tear', 'hole', 'stain', 'fading', 'logo_damage', 'seam_split', 'other');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('status_update', 'payment', 'review_request', 'assignment', 'system');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'completed', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."photo_type" AS ENUM('before', 'during', 'after');--> statement-breakpoint
CREATE TYPE "public"."repair_status" AS ENUM('submitted', 'reviewed', 'in_repair', 'quality_check', 'shipped');--> statement-breakpoint
CREATE TYPE "public"."urgency_level" AS ENUM('standard', 'rush', 'emergency');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('customer', 'admin', 'technician');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"repair_request_id" text,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" text PRIMARY KEY NOT NULL,
	"repair_request_id" text NOT NULL,
	"customer_id" text NOT NULL,
	"polar_checkout_id" text NOT NULL,
	"polar_order_id" text,
	"amount" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'usd' NOT NULL,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"paid_at" timestamp,
	"refunded_at" timestamp,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payments_polar_checkout_id_unique" UNIQUE("polar_checkout_id"),
	CONSTRAINT "payments_polar_order_id_unique" UNIQUE("polar_order_id")
);
--> statement-breakpoint
CREATE TABLE "repair_photos" (
	"id" text PRIMARY KEY NOT NULL,
	"repair_request_id" text NOT NULL,
	"url" text NOT NULL,
	"thumbnail_url" text,
	"original_filename" text NOT NULL,
	"mime_type" varchar(50) NOT NULL,
	"size_bytes" integer NOT NULL,
	"photo_type" "photo_type" NOT NULL,
	"uploaded_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "repair_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"customer_id" text NOT NULL,
	"technician_id" text,
	"jersey_description" text NOT NULL,
	"jersey_brand" text,
	"jersey_size" varchar(10) NOT NULL,
	"damage_type" "damage_type" NOT NULL,
	"damage_description" text NOT NULL,
	"urgency_level" "urgency_level" DEFAULT 'standard' NOT NULL,
	"current_status" "repair_status" DEFAULT 'submitted' NOT NULL,
	"estimated_cost" integer,
	"final_cost" integer,
	"ai_damage_assessment" jsonb,
	"admin_notes" text,
	"tracking_number" varchar(100),
	"shipping_address" jsonb,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" text PRIMARY KEY NOT NULL,
	"repair_request_id" text NOT NULL,
	"customer_id" text NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"technician_response" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "reviews_repair_request_id_unique" UNIQUE("repair_request_id"),
	CONSTRAINT "rating_range" CHECK ("reviews"."rating" >= 1 AND "reviews"."rating" <= 5)
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "status_history" (
	"id" text PRIMARY KEY NOT NULL,
	"repair_request_id" text NOT NULL,
	"from_status" "repair_status",
	"to_status" "repair_status" NOT NULL,
	"changed_by" text NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" "user_role" DEFAULT 'customer' NOT NULL,
	"banned" boolean DEFAULT false NOT NULL,
	"ban_reason" text,
	"ban_expires" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_repair_request_id_repair_requests_id_fk" FOREIGN KEY ("repair_request_id") REFERENCES "public"."repair_requests"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_repair_request_id_repair_requests_id_fk" FOREIGN KEY ("repair_request_id") REFERENCES "public"."repair_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_customer_id_user_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repair_photos" ADD CONSTRAINT "repair_photos_repair_request_id_repair_requests_id_fk" FOREIGN KEY ("repair_request_id") REFERENCES "public"."repair_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repair_photos" ADD CONSTRAINT "repair_photos_uploaded_by_user_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repair_requests" ADD CONSTRAINT "repair_requests_customer_id_user_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repair_requests" ADD CONSTRAINT "repair_requests_technician_id_user_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_repair_request_id_repair_requests_id_fk" FOREIGN KEY ("repair_request_id") REFERENCES "public"."repair_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_customer_id_user_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "status_history" ADD CONSTRAINT "status_history_repair_request_id_repair_requests_id_fk" FOREIGN KEY ("repair_request_id") REFERENCES "public"."repair_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "status_history" ADD CONSTRAINT "status_history_changed_by_user_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_notifications_user_is_read" ON "notifications" USING btree ("user_id","is_read");--> statement-breakpoint
CREATE INDEX "idx_notifications_created_at" ON "notifications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_payments_repair_request_id" ON "payments" USING btree ("repair_request_id");--> statement-breakpoint
CREATE INDEX "idx_payments_polar_checkout_id" ON "payments" USING btree ("polar_checkout_id");--> statement-breakpoint
CREATE INDEX "idx_payments_polar_order_id" ON "payments" USING btree ("polar_order_id");--> statement-breakpoint
CREATE INDEX "idx_repair_photos_repair_request_id" ON "repair_photos" USING btree ("repair_request_id");--> statement-breakpoint
CREATE INDEX "idx_repair_requests_customer_id" ON "repair_requests" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "idx_repair_requests_technician_id" ON "repair_requests" USING btree ("technician_id");--> statement-breakpoint
CREATE INDEX "idx_repair_requests_current_status" ON "repair_requests" USING btree ("current_status");--> statement-breakpoint
CREATE INDEX "idx_repair_requests_created_at" ON "repair_requests" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_status_history_repair_request_id" ON "status_history" USING btree ("repair_request_id");--> statement-breakpoint
CREATE INDEX "idx_status_history_created_at" ON "status_history" USING btree ("created_at");