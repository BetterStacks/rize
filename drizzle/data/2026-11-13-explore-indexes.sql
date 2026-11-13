-- Indexes for explore, search and profile lookups by post, profile and user.
-- Matches the index() definitions in src/db/schema.ts. Each statement runs on
-- its own (CONCURRENTLY can't run inside a transaction) and doesn't lock writes.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_post_votes_post_id ON post_votes (post_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comments_post_id ON comments (post_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookmarks_post_id ON bookmarks (post_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_post_media_post_id ON post_media ("postId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_post_links_post_id ON post_links ("postId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_created_at ON posts (created_at DESC NULLS LAST);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_profile_id ON posts ("profileId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profile_created_at ON profile (created_at DESC NULLS LAST);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profile_user_id ON profile ("userId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_account_user_id ON account ("userId");
