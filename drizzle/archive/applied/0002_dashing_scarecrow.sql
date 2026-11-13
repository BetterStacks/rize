CREATE TABLE "resume_roast_views" (
	"id" uuid PRIMARY KEY NOT NULL,
	"roast_id" uuid NOT NULL,
	"ip_hash" varchar(64),
	"user_agent" text,
	"referrer" text,
	"viewed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resume_roasts" (
	"id" uuid PRIMARY KEY NOT NULL,
	"full_name" varchar(100),
	"job_title" varchar(200),
	"company" varchar(200),
	"location" varchar(100),
	"years_of_experience" integer,
	"roast_text" text NOT NULL,
	"resume_source" varchar(20) NOT NULL,
	"original_file_name" varchar(255),
	"view_count" integer DEFAULT 0 NOT NULL,
	"share_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"ip_hash" varchar(64)
);
--> statement-breakpoint
ALTER TABLE "resume_roast_views" ADD CONSTRAINT "resume_roast_views_roast_id_resume_roasts_id_fk" FOREIGN KEY ("roast_id") REFERENCES "public"."resume_roasts"("id") ON DELETE cascade ON UPDATE no action;