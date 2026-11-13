ALTER TABLE "resume_roasts" ADD COLUMN "overall_roast" text;--> statement-breakpoint
ALTER TABLE "resume_roasts" ADD COLUMN "roast_score" integer;--> statement-breakpoint
ALTER TABLE "resume_roasts" ADD COLUMN "personality_emojis" varchar(20);--> statement-breakpoint
ALTER TABLE "resume_roasts" ADD COLUMN "corporate_speak_data" jsonb;--> statement-breakpoint
ALTER TABLE "resume_roasts" ADD COLUMN "personality_quotient_data" jsonb;--> statement-breakpoint
ALTER TABLE "resume_roasts" ADD COLUMN "story_telling_data" jsonb;--> statement-breakpoint
ALTER TABLE "resume_roasts" ADD COLUMN "uniqueness_data" jsonb;--> statement-breakpoint
ALTER TABLE "resume_roasts" ADD COLUMN "professional_maturity_data" jsonb;