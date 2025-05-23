"use server";

import { media, postMedia, posts, profile } from "@/db/schema";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { GetExplorePosts } from "@/lib/types";
import { isImageUrl } from "@/lib/utils";
import {
  AnyColumn,
  desc,
  eq,
  getTableColumns,
  InferColumnsDataTypes,
  sql,
} from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getProfileIdByUsername } from "./profile-actions";

export const getExploreFeed = async () => {
  const { ...rest } = getTableColumns(posts);
  let postsData = await db
    .select({
      ...rest,
      username: profile.username,
      name: profile.displayName,
      avatar: profile.profileImage,

      media: sql`json_agg(
        json_build_object(
          'id', media.id,
          'url', media.url,
          'type', media.type,
          'width', media.width,
          'height', media.height
        )
        
      )  FILTER (WHERE media.id IS NOT NULL)`,
    })
    .from(posts)
    .innerJoin(profile, eq(posts.profileId, profile.id))
    .leftJoin(postMedia, eq(posts.id, postMedia.postId))
    .leftJoin(media, eq(postMedia.mediaId, media.id))
    .groupBy(
      posts.id,
      profile.username,
      profile.displayName,
      profile.profileImage
    )
    .orderBy(desc(posts.createdAt));
  // .limit(10);

  if (postsData.length === 0) {
    return [];
  }

  return postsData as GetExplorePosts[];
};
export const getUserPosts = async (username: string) => {
  const profileId = await getProfileIdByUsername(username);
  if (!profileId) {
    throw new Error("Profile not found");
  }
  const { ...rest } = getTableColumns(posts);
  const postsData = await db
    .select({
      ...rest,
      username: profile.username,
      name: profile.displayName,
      avatar: profile.profileImage,

      media: sql`json_agg(
        json_build_object(
          'id', media.id,
          'url', media.url,
          'type', media.type,
          'width', media.width,
          'height', media.height
        )
      )`,
    })
    .from(posts)
    .innerJoin(profile, eq(posts.profileId, profile.id))
    .innerJoin(postMedia, eq(posts.id, postMedia.postId))
    .innerJoin(media, eq(postMedia.mediaId, media.id))
    .where(eq(posts.profileId, profileId?.id))
    .groupBy(
      posts.id,
      profile.username,
      profile.displayName,
      profile.profileImage
    )
    .orderBy(desc(posts.createdAt))
    .limit(4);
  // .limit(10);

  if (postsData.length === 0) {
    return [];
  }
  return postsData as GetExplorePosts[];
};

const newPostSchema = z.object({
  content: z.string().min(1).max(500),
  files: z.array(
    z
      .object({
        url: z.string().url(),
        height: z.number(),
        width: z.number(),
      })
      .optional()
  ),
});
export const createPost = async (payload: z.infer<typeof newPostSchema>) => {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }
  const profileId = session.user.profileId;
  const { success, data } = newPostSchema.safeParse(payload);
  if (!success) {
    throw new Error("Invalid payload");
  }

  const newPost = await db
    .insert(posts)
    .values({
      content: data.content,
      profileId: profileId,
    })
    .returning({ id: posts.id });

  if (data.files.length > 0) {
    data?.files?.forEach(async (file) => {
      const newMediaItem = await db
        .insert(media)
        .values({
          url: file?.url as string,
          type: isImageUrl(file?.url as string) ? "image" : "video",
          profileId: profileId,
          height: file?.height as number,
          width: file?.width as number,
        })
        .returning({ id: posts.id });
      if (newMediaItem.length === 0) {
        throw new Error("Error adding media item");
      }
      await db.insert(postMedia).values({
        postId: newPost[0].id,
        mediaId: newMediaItem[0].id,
      });
    });
  }
  revalidatePath("/explore", "page");
  revalidatePath("/[username]", "page");
  console.log("");
};
