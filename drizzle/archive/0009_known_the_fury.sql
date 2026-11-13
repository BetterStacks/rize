CREATE TABLE "vapi_calls" (
	"id" uuid PRIMARY KEY NOT NULL,
	"call_id" text NOT NULL,
	"user_id" text NOT NULL,
	"phone_number" text,
	"status" text DEFAULT 'in_progress' NOT NULL,
	"duration" integer,
	"cost" integer,
	"ended_reason" text,
	"transcript" text,
	"transcript_received_at" timestamp,
	"recording_url" text,
	"processing_status" text DEFAULT 'pending',
	"processing_error" text,
	"processing_attempts" integer DEFAULT 0 NOT NULL,
	"last_processed_at" timestamp,
	"extracted_data" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "vapi_calls_call_id_unique" UNIQUE("call_id")
);
--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "parent_post_id" uuid;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "onboarding_call_id" text;--> statement-breakpoint
ALTER TABLE "vapi_calls" ADD CONSTRAINT "vapi_calls_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_parent_post_id_posts_id_fk" FOREIGN KEY ("parent_post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;