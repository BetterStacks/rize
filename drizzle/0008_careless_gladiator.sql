ALTER TABLE "posts" DROP CONSTRAINT "posts_parent_post_id_posts_id_fk";
--> statement-breakpoint
ALTER TABLE "posts" DROP COLUMN "parent_post_id";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "onboarding_call_id";