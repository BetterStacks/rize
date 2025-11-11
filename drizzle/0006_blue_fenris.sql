CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" varchar(120) NOT NULL,
	"slug" varchar(50) NOT NULL,
	"type" text NOT NULL,
	"logo" uuid NOT NULL,
	"description" text NOT NULL,
	"address" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"website" text NOT NULL,
	"founded_year" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_logo_media_id_fk" FOREIGN KEY ("logo") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;