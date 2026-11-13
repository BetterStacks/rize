-- Production indexes for 10K DAU performance
-- Profile lookups (most critical - used on every page view)
CREATE INDEX IF NOT EXISTS idx_profile_userid ON "profile"("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_profile_username ON "profile"("username");--> statement-breakpoint

-- Posts indexes
CREATE INDEX IF NOT EXISTS idx_posts_profileid ON "posts"("profileId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_posts_createdat ON "posts"("created_at" DESC);--> statement-breakpoint

-- Comments indexes
CREATE INDEX IF NOT EXISTS idx_comments_postid ON "comments"("post_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_comments_profileid ON "comments"("profile_id");--> statement-breakpoint

-- Post media
CREATE INDEX IF NOT EXISTS idx_postmedia_postid ON "post_media"("postId");--> statement-breakpoint

-- Post links
CREATE INDEX IF NOT EXISTS idx_postlinks_postid ON "post_links"("postId");--> statement-breakpoint

-- Post topics
CREATE INDEX IF NOT EXISTS idx_posttopics_postid ON "post_topics"("post_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_posttopics_topicid ON "post_topics"("topic_id");--> statement-breakpoint

-- Bookmarks
CREATE INDEX IF NOT EXISTS idx_bookmarks_profileid ON "bookmarks"("profile_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_bookmarks_postid ON "bookmarks"("post_id");--> statement-breakpoint

-- Project bookmarks
CREATE INDEX IF NOT EXISTS idx_projectbookmarks_profileid ON "project_bookmarks"("profile_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_projectbookmarks_projectid ON "project_bookmarks"("project_id");--> statement-breakpoint

-- Media
CREATE INDEX IF NOT EXISTS idx_media_profileid ON "media"("profile_id");--> statement-breakpoint

-- Gallery
CREATE INDEX IF NOT EXISTS idx_gallery_profileid ON "gallery"("profile_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_gallerymedia_galleryid ON "gallery_media"("gallery_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_gallerymedia_mediaid ON "gallery_media"("media_id");--> statement-breakpoint

-- Projects
CREATE INDEX IF NOT EXISTS idx_projects_profileid ON "projects"("profileId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_projects_createdat ON "projects"("created_at" DESC);--> statement-breakpoint

-- Project media
CREATE INDEX IF NOT EXISTS idx_projectmedia_projectid ON "project_media"("project_id");--> statement-breakpoint

-- Project topics
CREATE INDEX IF NOT EXISTS idx_projecttopics_projectid ON "project_topics"("project_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_projecttopics_topicid ON "project_topics"("topic_id");--> statement-breakpoint

-- Project skills
CREATE INDEX IF NOT EXISTS idx_projectskills_projectid ON "project_skills"("project_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_projectskills_skillid ON "project_skills"("skill_id");--> statement-breakpoint

-- Profile skills
CREATE INDEX IF NOT EXISTS idx_profileskills_profileid ON "profile_skills"("profile_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_profileskills_skillid ON "profile_skills"("skill_id");--> statement-breakpoint

-- Project collaborators
CREATE INDEX IF NOT EXISTS idx_projectcollaborators_projectid ON "project_collaborators"("project_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_projectcollaborators_profileid ON "project_collaborators"("profile_id");--> statement-breakpoint

-- Education & Experience
CREATE INDEX IF NOT EXISTS idx_education_profileid ON "education"("profileId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_experience_profileid ON "experience"("profileId");--> statement-breakpoint

-- Certificates
CREATE INDEX IF NOT EXISTS idx_certificates_profileid ON "certificates"("profileId");--> statement-breakpoint

-- Pages
CREATE INDEX IF NOT EXISTS idx_page_profileid ON "page"("profileId");--> statement-breakpoint

-- Sections
CREATE INDEX IF NOT EXISTS idx_sections_profileid ON "sections"("profile_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_profilesections_profileid ON "profile_sections"("profile_id");--> statement-breakpoint

-- Story elements
CREATE INDEX IF NOT EXISTS idx_storyelements_profileid ON "story_elements"("profile_id");--> statement-breakpoint

-- Social links
CREATE INDEX IF NOT EXISTS idx_sociallinks_profileid ON "social_links"("profile_id");--> statement-breakpoint

-- Sessions
CREATE INDEX IF NOT EXISTS idx_sessions_userid ON "session"("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_sessions_expiresat ON "session"("expiresAt");--> statement-breakpoint

-- Accounts
CREATE INDEX IF NOT EXISTS idx_accounts_userid ON "account"("userId");--> statement-breakpoint

-- Profile follows
CREATE INDEX IF NOT EXISTS idx_profilefollows_followerid ON "profile_follows"("follower_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_profilefollows_followingid ON "profile_follows"("following_id");--> statement-breakpoint

-- Profile topic subscriptions
CREATE INDEX IF NOT EXISTS idx_profiletopicsubs_profileid ON "profile_topic_subscriptions"("profile_id");--> statement-breakpoint

-- Custom feeds
CREATE INDEX IF NOT EXISTS idx_customfeeds_profileid ON "custom_feeds"("profile_id");--> statement-breakpoint

-- Analytics - profile views (high volume table)
CREATE INDEX IF NOT EXISTS idx_profileviews_profileid ON "profile_views"("profile_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_profileviews_viewedat ON "profile_views"("viewed_at" DESC);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_profileviews_profileid_viewedat ON "profile_views"("profile_id", "viewed_at" DESC);--> statement-breakpoint

-- Engagement metrics
CREATE INDEX IF NOT EXISTS idx_engagementmetrics_profileid ON "engagement_metrics"("profile_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_engagementmetrics_date ON "engagement_metrics"("date" DESC);--> statement-breakpoint

-- Click tracking
CREATE INDEX IF NOT EXISTS idx_clicktracking_profileid ON "click_tracking"("profile_id");--> statement-breakpoint

-- Roast analytics
CREATE INDEX IF NOT EXISTS idx_roastanalytics_profileid ON "roast_analytics"("profile_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_roasthistory_profileid ON "roast_history"("profile_id");
