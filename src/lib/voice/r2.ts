import {
  GetBucketLifecycleConfigurationCommand,
  GetObjectCommand,
  type LifecycleRule,
  PutBucketLifecycleConfigurationCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Call recordings live in Cloudflare R2 (S3-compatible). The bucket has a
// lifecycle rule that deletes everything under RECORDINGS_PREFIX after 7 days.
export const RECORDINGS_PREFIX = "call-recordings/";
export const RECORDING_RETENTION_DAYS = 7;

let client: S3Client | null = null;

function r2(): S3Client {
  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
      },
    });
  }
  return client;
}

const bucket = () => process.env.R2_BUCKET || "";

export async function uploadRecording(
  callId: string,
  body: Buffer,
  contentType: string
): Promise<{ key: string; expiresAt: Date }> {
  const ext = contentType === "audio/mpeg" ? "mp3" : "wav";
  const key = `${RECORDINGS_PREFIX}${callId}.${ext}`;
  await r2().send(
    new PutObjectCommand({
      Bucket: bucket(),
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
  const expiresAt = new Date(
    Date.now() + RECORDING_RETENTION_DAYS * 24 * 60 * 60 * 1000
  );
  return { key, expiresAt };
}

// The bucket is private; recordings are only reachable through short-lived signed URLs.
export async function getRecordingUrl(key: string, expiresIn = 600) {
  return getSignedUrl(
    r2(),
    new GetObjectCommand({ Bucket: bucket(), Key: key }),
    { expiresIn }
  );
}

const LIFECYCLE_RULE_ID = "delete-call-recordings-after-7-days";

// One-time setup, run via `npx tsx src/scripts/setup-r2-lifecycle.ts`.
// PutBucketLifecycleConfiguration replaces every rule on the bucket, so keep
// any rules that already exist and only add/replace ours.
export async function applyRecordingLifecycleRule() {
  let existing: LifecycleRule[] = [];
  try {
    const current = await r2().send(
      new GetBucketLifecycleConfigurationCommand({ Bucket: bucket() })
    );
    existing = current.Rules ?? [];
  } catch (error: any) {
    if (error?.name !== "NoSuchLifecycleConfiguration") throw error;
  }

  const rules: LifecycleRule[] = [
    ...existing.filter((rule) => rule.ID !== LIFECYCLE_RULE_ID),
    {
      ID: LIFECYCLE_RULE_ID,
      Status: "Enabled",
      Filter: { Prefix: RECORDINGS_PREFIX },
      Expiration: { Days: RECORDING_RETENTION_DAYS },
    },
  ];

  await r2().send(
    new PutBucketLifecycleConfigurationCommand({
      Bucket: bucket(),
      LifecycleConfiguration: { Rules: rules },
    })
  );
  return rules;
}
