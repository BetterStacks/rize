ALTER TABLE "certificates" ALTER COLUMN "issuer" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "certificates" ALTER COLUMN "file_url" SET NOT NULL;