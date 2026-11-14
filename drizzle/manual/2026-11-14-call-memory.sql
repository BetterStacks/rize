-- Call memory, in two layers:
--   call_observations: facts from one call, each in the person's exact words (append-only).
--   call_memories: what Rize understands about the person over time, built from observations,
--                  reinforced, resolved or superseded as later calls come in.
-- Retrieval picks a few memories for each call. Additive only.
BEGIN;
CREATE TABLE IF NOT EXISTS call_observations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  call_id uuid NOT NULL REFERENCES voice_calls(id) ON DELETE CASCADE,
  quote text NOT NULL,
  fact text NOT NULL,
  kind text NOT NULL DEFAULT 'event',
  synthesized boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_call_observations_user ON call_observations (user_id, created_at DESC);
CREATE TABLE IF NOT EXISTS call_memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  note text NOT NULL,
  kind text NOT NULL DEFAULT 'event',
  importance integer NOT NULL DEFAULT 5,
  follow_up_after date,
  -- active | completed (it happened / was answered) | superseded (wrong or changed)
  status text NOT NULL DEFAULT 'active',
  observation_ids uuid[] NOT NULL DEFAULT '{}',
  -- When it stopped being active, what happened (completed) and which observation showed it.
  closed_at timestamptz,
  outcome text,
  outcome_observation_id uuid REFERENCES call_observations(id) ON DELETE SET NULL,
  superseded_by uuid REFERENCES call_memories(id) ON DELETE SET NULL,
  last_reinforced_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_call_memories_user_status ON call_memories (user_id, status);
ALTER TABLE voice_calls ADD COLUMN IF NOT EXISTS memory_ids_used uuid[];
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS call_memory_enabled boolean NOT NULL DEFAULT true;
COMMIT;
