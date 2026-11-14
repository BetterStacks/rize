-- "Ask them something": a signed-in visitor asks a question on someone's profile.
-- The owner sees it privately and chooses whether a Rize call asks it; their
-- answer is cut from their own words and posted only if they approve it.
-- Additive only.
BEGIN;
CREATE TABLE IF NOT EXISTS profile_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profile(id) ON DELETE CASCADE,        -- who is asked
  asker_profile_id uuid NOT NULL REFERENCES profile(id) ON DELETE CASCADE,  -- who asked
  question text NOT NULL,
  -- pending (waiting for the owner) | accepted (ask on a call) | asked (a call asked it)
  -- | answered (a post answers it) | skipped (owner passed)
  status text NOT NULL DEFAULT 'pending',
  call_id uuid REFERENCES voice_calls(id) ON DELETE SET NULL,
  answer_post_id uuid REFERENCES posts(id) ON DELETE SET NULL,
  answered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_profile_questions_profile_status ON profile_questions (profile_id, status);
CREATE INDEX IF NOT EXISTS idx_profile_questions_asker ON profile_questions (asker_profile_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profile_questions_answer_post ON profile_questions (answer_post_id) WHERE answer_post_id IS NOT NULL;
CREATE TABLE IF NOT EXISTS profile_question_blocks (
  profile_id uuid NOT NULL REFERENCES profile(id) ON DELETE CASCADE,
  blocked_profile_id uuid NOT NULL REFERENCES profile(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (profile_id, blocked_profile_id)
);
ALTER TABLE voice_calls ADD COLUMN IF NOT EXISTS question_id uuid REFERENCES profile_questions(id) ON DELETE SET NULL;
COMMIT;
