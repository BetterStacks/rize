ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "call_interval_days" integer DEFAULT 1 NOT NULL;
