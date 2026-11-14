-- Scheduled calls: a person opts in, picks days and a local time, and Rize calls them.
-- Additive only. The last statement switches off the old, unused daily-call flag so
-- nobody is called on a schedule without opting in again through the new setting.
BEGIN;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS call_timezone text;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS call_days text[];
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS scheduled_calls_consented_at timestamptz;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS last_scheduled_call_at timestamptz;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS missed_scheduled_calls integer NOT NULL DEFAULT 0;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS scheduled_calls_paused_at timestamptz;
ALTER TABLE voice_calls ADD COLUMN IF NOT EXISTS "trigger" text NOT NULL DEFAULT 'manual';
CREATE INDEX IF NOT EXISTS idx_user_daily_call_enabled ON "user" (daily_call_enabled) WHERE daily_call_enabled;
UPDATE "user" SET daily_call_enabled = false WHERE daily_call_enabled;
COMMIT;
