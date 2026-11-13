ALTER TABLE "user" RENAME COLUMN "phone_number" TO "phoneNumber";--> statement-breakpoint
ALTER TABLE "user" RENAME COLUMN "phone_number_collected" TO "phoneNumberVerified";--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_phoneNumber_unique" UNIQUE("phoneNumber");