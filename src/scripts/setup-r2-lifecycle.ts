import "dotenv/config";
import { applyRecordingLifecycleRule } from "../lib/voice/r2";

// Adds the 7-day expiry rule for call recordings to the R2 bucket.
applyRecordingLifecycleRule()
  .then((rules) => {
    console.log("R2 lifecycle rules now on the bucket:");
    for (const rule of rules) console.log(`- ${rule.ID} (${rule.Status})`);
  })
  .catch((error) => {
    console.error("Failed to apply R2 lifecycle rule:", error?.message ?? error);
    process.exit(1);
  });
