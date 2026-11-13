CREATE TABLE "certificates" (
	"id" uuid PRIMARY KEY NOT NULL,
	"profileId" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"issuer" varchar(255) NOT NULL,
	"issue_date" timestamp,
	"expiry_date" timestamp,
	"credential_id" varchar(255),
	"credential_url" text,
	"file_url" text,
	"description" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "posts" DROP CONSTRAINT "posts_parent_post_id_posts_id_fk";
--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_profileId_profile_id_fk" FOREIGN KEY ("profileId") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" DROP COLUMN "parent_post_id";