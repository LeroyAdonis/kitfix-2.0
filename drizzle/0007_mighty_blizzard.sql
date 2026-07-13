CREATE TABLE "voice_notes" (
	"id" text PRIMARY KEY NOT NULL,
	"repair_request_id" text NOT NULL,
	"customer_id" text NOT NULL,
	"status_at_generation" "repair_status" NOT NULL,
	"audio_url" text NOT NULL,
	"script" text NOT NULL,
	"duration_ms" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "voice_notes" ADD CONSTRAINT "voice_notes_repair_request_id_repair_requests_id_fk" FOREIGN KEY ("repair_request_id") REFERENCES "public"."repair_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_notes" ADD CONSTRAINT "voice_notes_customer_id_user_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_voice_notes_repair_request_id" ON "voice_notes" USING btree ("repair_request_id");--> statement-breakpoint
CREATE INDEX "idx_voice_notes_customer_id" ON "voice_notes" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "idx_voice_notes_created_at" ON "voice_notes" USING btree ("created_at");