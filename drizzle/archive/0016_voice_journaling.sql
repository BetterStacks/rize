-- Voice journaling: GPT-Live phone calls, transcripts and post drafts
CREATE TABLE IF NOT EXISTS "voice_calls" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"kind" text DEFAULT 'journal' NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"language" text,
	"twilio_call_sid" text,
	"openai_session_id" text,
	"transcript" jsonb,
	"recording_key" text,
	"recording_expires_at" timestamp,
	"duration_seconds" integer,
	"close_reason" text,
	"error" text,
	"drafts_generated_at" timestamp,
	"started_at" timestamp,
	"ended_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "voice_calls_twilio_call_sid_unique" UNIQUE("twilio_call_sid"),
	CONSTRAINT "voice_calls_openai_session_id_unique" UNIQUE("openai_session_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "voice_drafts" (
	"id" uuid PRIMARY KEY NOT NULL,
	"call_id" uuid NOT NULL,
	"profile_id" uuid NOT NULL,
	"content" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"post_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "voice_calls" ADD CONSTRAINT "voice_calls_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_drafts" ADD CONSTRAINT "voice_drafts_call_id_voice_calls_id_fk" FOREIGN KEY ("call_id") REFERENCES "public"."voice_calls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_drafts" ADD CONSTRAINT "voice_drafts_profile_id_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_drafts" ADD CONSTRAINT "voice_drafts_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_voice_calls_user_created" ON "voice_calls" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_voice_drafts_profile_status" ON "voice_drafts" USING btree ("profile_id","status");
