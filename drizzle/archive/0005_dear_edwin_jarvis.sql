ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "phone_number" text;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "phone_number_collected" boolean DEFAULT false NOT NULL;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "onboarding_call_id" text;