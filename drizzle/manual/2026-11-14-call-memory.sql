-- Call memory: short notes Rize keeps between a person's calls, each tied to
-- their exact words and the call they came from. Additive only.
BEGIN;
CREATE TABLE IF NOT EXISTS call_memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  call_id uuid NOT NULL REFERENCES voice_calls(id) ON DELETE CASCADE,
  quote text NOT NULL,
  note text NOT NULL,
  kind text NOT NULL DEFAULT 'event',
  follow_up_after date,
  status text NOT NULL DEFAULT 'active',
  last_mentioned_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_call_memories_user_status ON call_memories (user_id, status);
ALTER TABLE voice_calls ADD COLUMN IF NOT EXISTS memory_ids_used uuid[];
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS call_memory_enabled boolean NOT NULL DEFAULT true;
COMMIT;
