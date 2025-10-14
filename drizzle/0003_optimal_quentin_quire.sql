ALTER TABLE "profile" ADD COLUMN "qr_code_url" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "is_claimed" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "resume_file_id" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "claim_token" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "letraz_id" text;