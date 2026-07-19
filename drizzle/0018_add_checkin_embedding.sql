CREATE EXTENSION IF NOT EXISTS vector;
ALTER TABLE "daily_checkins" ADD COLUMN IF NOT EXISTS "embedding" vector(768);
