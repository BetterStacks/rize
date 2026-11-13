"use server";

import {
  bookmarks,
  certificates,
  comments,
  media,
  posts,
  profile,
  profileSections,
  sessions,
  users,
  verification,
  voiceCalls,
} from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import db from "@/lib/db";
import { logger } from "@/lib/logger";
import { checkRateLimit } from "@/lib/rate-limit";
import { deleteFromS3, getOwnS3KeyFromUrl } from "@/lib/s3";
import { deleteRecording } from "@/lib/voice/r2";
import { and, eq, inArray, isNotNull, ne, notInArray, or } from "drizzle-orm";
import { z } from "zod";

type ActionResult = { success: true } | { success: false; error: string };

const confirmSchema = z.string().trim().min(1).max(320);

// Permanently deletes the signed-in user's account and everything tied to it.
// Rows go in one transaction; files in S3 and R2 are removed afterwards, best
// effort, so a storage hiccup can't leave a half-deleted account behind.
export async function deleteMyAccount(confirmUsername: string): Promise<ActionResult> {
  const session = await requireAuth();
  const userId = session.user.id;

  const { success } = await checkRateLimit("auth", `delete-account:${userId}`);
  if (!success) return { success: false, error: "Too many attempts. Try again in a minute." };

  const parsed = confirmSchema.safeParse(confirmUsername);
  const expected = session.user.username || session.user.email;
  if (!parsed.success || !expected || parsed.data.toLowerCase() !== expected.toLowerCase()) {
    return { success: false, error: "That doesn't match. Type it exactly as shown." };
  }

  const [user] = await db
    .select({
      email: users.email,
      phoneNumber: users.phoneNumber,
      image: users.image,
      resumeFileId: users.resumeFileId,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!user) return { success: false, error: "Account not found" };

  const live = await db
    .select({ id: voiceCalls.id })
    .from(voiceCalls)
    .where(
      and(
        eq(voiceCalls.userId, userId),
        inArray(voiceCalls.status, ["queued", "ringing", "in_progress"])
      )
    )
    .limit(1);
  if (live.length) return { success: false, error: "A call is in progress. Try again when it has ended." };

  // profile.userId isn't unique, so collect every profile on the account.
  const profiles = await db
    .select({ id: profile.id, profileImage: profile.profileImage })
    .from(profile)
    .where(eq(profile.userId, userId));
  const profileIds = profiles.map((p) => p.id);

  // --- Collect files to remove once the rows are gone ---
  const fileUrls = new Set<string>();
  if (user.image) fileUrls.add(user.image);
  if (user.resumeFileId) fileUrls.add(user.resumeFileId);
  for (const p of profiles) if (p.profileImage) fileUrls.add(p.profileImage);

  if (profileIds.length) {
    const [mediaRows, certRows] = await Promise.all([
      db.select({ url: media.url }).from(media).where(inArray(media.profileId, profileIds)),
      db
        .select({ url: certificates.fileUrl })
        .from(certificates)
        .where(inArray(certificates.profileId, profileIds)),
    ]);
    for (const row of mediaRows) fileUrls.add(row.url);
    for (const row of certRows) fileUrls.add(row.url);
  }

  // Media and certificate URLs are stored as sent by the client, so only touch
  // URLs in the exact form our uploads produce, and skip any file another
  // account also points at.
  let candidateUrls = [...fileUrls].filter((url) => getOwnS3KeyFromUrl(url));
  if (candidateUrls.length) {
    const [sharedMedia, sharedAvatars, sharedCerts, sharedUserFiles] = await Promise.all([
      db
        .select({ url: media.url })
        .from(media)
        .where(
          profileIds.length
            ? and(inArray(media.url, candidateUrls), notInArray(media.profileId, profileIds))
            : inArray(media.url, candidateUrls)
        ),
      db
        .select({ url: profile.profileImage })
        .from(profile)
        .where(and(inArray(profile.profileImage, candidateUrls), ne(profile.userId, userId))),
      db
        .select({ url: certificates.fileUrl })
        .from(certificates)
        .where(
          profileIds.length
            ? and(
                inArray(certificates.fileUrl, candidateUrls),
                notInArray(certificates.profileId, profileIds)
              )
            : inArray(certificates.fileUrl, candidateUrls)
        ),
      db
        .select({ image: users.image, resume: users.resumeFileId })
        .from(users)
        .where(
          and(
            ne(users.id, userId),
            or(inArray(users.image, candidateUrls), inArray(users.resumeFileId, candidateUrls))
          )
        ),
    ]);
    const shared = new Set<string>();
    for (const r of sharedMedia) shared.add(r.url);
    for (const r of sharedAvatars) if (r.url) shared.add(r.url);
    for (const r of sharedCerts) shared.add(r.url);
    for (const r of sharedUserFiles) {
      if (r.image) shared.add(r.image);
      if (r.resume) shared.add(r.resume);
    }
    candidateUrls = candidateUrls.filter((url) => !shared.has(url));
  }
  const s3Keys = [...new Set(candidateUrls.map((url) => getOwnS3KeyFromUrl(url)!))];

  const recordingRows = await db
    .select({ key: voiceCalls.recordingKey })
    .from(voiceCalls)
    .where(and(eq(voiceCalls.userId, userId), isNotNull(voiceCalls.recordingKey)));
  const recordingKeys = recordingRows.map((r) => r.key).filter((k): k is string => !!k);

  // --- Delete rows ---
  await db.transaction(async (tx) => {
    if (profileIds.length) {
      const myPosts = await tx
        .select({ id: posts.id })
        .from(posts)
        .where(inArray(posts.profileId, profileIds));
      const postIds = myPosts.map((p) => p.id);

      // comments, bookmarks and profile_sections reference profile/posts
      // without ON DELETE CASCADE, so they would block the delete below.
      // This also removes other people's comments and bookmarks on these posts.
      await tx
        .delete(comments)
        .where(
          postIds.length
            ? or(inArray(comments.profileId, profileIds), inArray(comments.postId, postIds))
            : inArray(comments.profileId, profileIds)
        );
      await tx
        .delete(bookmarks)
        .where(
          postIds.length
            ? or(inArray(bookmarks.profileId, profileIds), inArray(bookmarks.postId, postIds))
            : inArray(bookmarks.profileId, profileIds)
        );
      await tx.delete(profileSections).where(inArray(profileSections.profileId, profileIds));
    }

    // Pending sign-in or verification codes for this email or phone number.
    const identifiers = [user.email, user.phoneNumber].filter((v): v is string => !!v);
    if (identifiers.length) {
      await tx.delete(verification).where(inArray(verification.identifier, identifiers));
    }

    // Sign out everywhere. The user delete would cascade these too, but do it
    // explicitly so it can't depend on the FK.
    await tx.delete(sessions).where(eq(sessions.userId, userId));

    // Cascades to account, profile (and everything under it), voice_calls and
    // voice_drafts.
    await tx.delete(users).where(eq(users.id, userId));
  });

  // --- Remove files, best effort ---
  const [s3Results, r2Results] = await Promise.all([
    Promise.allSettled(s3Keys.map((key) => deleteFromS3(key))),
    Promise.allSettled(recordingKeys.map((key) => deleteRecording(key))),
  ]);
  const s3Failed = s3Results.filter((r) => r.status === "rejected").length;
  const r2Failed = r2Results.filter((r) => r.status === "rejected").length;
  logger.info("Account deleted", {
    userId,
    profiles: profileIds.length,
    s3: s3Keys.length,
    s3Failed,
    recordings: recordingKeys.length,
    recordingsFailed: r2Failed,
  });

  return { success: true };
}
