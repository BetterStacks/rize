"use server";

import {
  bookmarks,
  likes,
  media,
  postLinks,
  postMedia,
  posts,
  profile,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { GetExplorePosts } from "@/lib/types";
import { isImageUrl } from "@/lib/utils";
import { and, desc, eq, getTableColumns, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getProfileIdByUsername } from "./profile-actions";
import { Result } from "url-metadata";
import axios from "axios";

const PAGE_SIZE = 4;

export const getExploreFeed = async (pageParam: number = 0) => {
  const { ...rest } = getTableColumns(posts);
  const session = await auth();

  const offset = pageParam * PAGE_SIZE;
  let query = db
    .select({
      ...rest,
      username: profile.username,
      name: profile.displayName,
      avatar: profile.profileImage,
      likeCount: sql<number>`count(likes.profile_id)`.as("likesCount"),
      ...(session && {
        liked:
          sql<boolean>`BOOL_OR(${likes.profileId} = ${session?.user?.profileId})`.as(
            "liked"
          ),
      }),

      media: sql`
      CASE 
        WHEN media.id IS NOT NULL THEN json_build_object(
          'id', media.id,
          'url', media.url,
          'type', media.type,
          'width', media.width,
          'height', media.height
        )
        ELSE NULL
      END
    `.as("media"),

      link: sql`
      CASE 
        WHEN post_links.id IS NOT NULL THEN json_build_object(
          'id', post_links.id,
          'url', post_links.url,
          'data', post_links.data,
          'createdAt', post_links.created_at
        )
        ELSE NULL
      END
    `.as("link"),
    })
    .from(posts)
    .innerJoin(profile, eq(posts.profileId, profile.id))
    .leftJoin(postMedia, eq(posts.id, postMedia.postId))
    .leftJoin(likes, eq(posts.id, likes.postId))
    .leftJoin(media, eq(postMedia.mediaId, media.id))
    .leftJoin(postLinks, eq(posts.id, postLinks.postId))
    .groupBy(
      posts.id,
      profile.username,
      profile.displayName,
      profile.profileImage,
      media.id,
      postLinks.id
    )
    .orderBy(desc(posts.createdAt))
    .limit(PAGE_SIZE)
    .offset(offset);

  const postsData = await query;

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(posts);

  const hasMore = offset + postsData.length < count;

  return {
    posts: postsData as GetExplorePosts[],
    nextCursor: hasMore ? pageParam + 1 : undefined,
  };
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
      likeCount: sql<number>`count(likes.profile_id)`.as("likesCount"),
      liked: sql<boolean>`BOOL_OR(${likes.profileId} = ${profileId?.id})`.as(
        "liked"
      ),
      media: sql`
      CASE 
        WHEN media.id IS NOT NULL THEN json_build_object(
          'id', media.id,
          'url', media.url,
          'type', media.type,
          'width', media.width,
          'height', media.height
        )
        ELSE NULL
      END
    `.as("media"),

      link: sql`
      CASE 
        WHEN post_links.id IS NOT NULL THEN json_build_object(
          'id', post_links.id,
          'url', post_links.url,
          'data', post_links.data,
          'createdAt', post_links.created_at
        )
        ELSE NULL
      END
    `.as("link"),
    })
    .from(posts)
    .innerJoin(profile, eq(posts.profileId, profile.id))
    .leftJoin(postMedia, eq(posts.id, postMedia.postId))
    .leftJoin(likes, eq(posts.id, likes.postId))
    .leftJoin(media, eq(postMedia.mediaId, media.id))
    .leftJoin(postLinks, eq(posts.id, postLinks.postId))
    .where(eq(posts.profileId, profileId?.id))
    .groupBy(
      posts.id,
      profile.username,
      profile.displayName,
      profile.profileImage,
      media.id,
      postLinks.id
    )
    .orderBy(desc(posts.createdAt))
    .limit(4);

  if (postsData.length === 0) {
    return [];
  }
  return postsData as GetExplorePosts[];
};

export const deletePost = async (postId: string) => {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }
  await db
    .delete(posts)
    .where(
      and(eq(posts.id, postId), eq(posts.profileId, session.user.profileId))
    );
};

export const getPostById = async (id: string) => {
  const { ...rest } = getTableColumns(posts);
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }
  let query = await db
    .select({
      ...rest,
      username: profile.username,
      name: profile.displayName,
      avatar: profile.profileImage,
      likeCount: sql<number>`count(likes.profile_id)`.as("likesCount"),
      liked:
        sql<boolean>`BOOL_OR(${likes.profileId} = ${session?.user?.profileId})`.as(
          "liked"
        ),

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
    .leftJoin(likes, eq(posts.id, likes.postId))
    .leftJoin(media, eq(postMedia.mediaId, media.id))
    .where(eq(posts.id, id))
    .groupBy(
      posts.id,
      profile.username,
      profile.displayName,
      profile.profileImage
    );

  if (query?.length === 0) {
    throw new Error("Post not found");
  }
  return query[0] as GetExplorePosts;
};

const newPostSchema = z.object({
  content: z.string().min(1).max(500).optional(),
  link: z.string().url().optional(),
  file: z
    .object({
      url: z.string().url(),
      height: z.number(),
      width: z.number(),
    })
    .optional(),
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
  await db.transaction(async (tx) => {
    const [newPost] = await tx
      .insert(posts)
      .values({
        content: data.content || null,
        profileId: profileId,
      })
      .returning({ id: posts.id });

    if (data?.link) {
      const res = await axios("http://localhost:3000/api/url", {
        params: {
          url: data?.link,
        },
      });
      if (res?.status !== 200) throw new Error("Failed to fetch link metadata");

      const metadata = res?.data?.metadata as Result;

      await tx.insert(postLinks).values({
        url: data?.link,
        data: metadata,
        postId: newPost.id,
      });
    }
    if (data.file) {
      const newMediaItem = await tx
        .insert(media)
        .values({
          url: data?.file?.url as string,
          type: isImageUrl(data?.file?.url as string) ? "image" : "video",
          profileId: profileId,
          height: data?.file?.height as number,
          width: data?.file?.width as number,
        })
        .returning({ id: posts.id });

      if (newMediaItem.length === 0) {
        throw new Error("Error adding media item");
      }
      await tx.insert(postMedia).values({
        postId: newPost?.id,
        mediaId: newMediaItem[0].id,
      });
    }
  });
};

export async function toggleLike(postId: string, like: boolean) {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }
  if (like) {
    await db
      .insert(likes)
      .values({ postId, profileId: session?.user?.profileId })
      .onConflictDoNothing();
  } else {
    await db
      .delete(likes)
      .where(
        and(
          eq(likes.postId, postId),
          eq(likes.profileId, session?.user?.profileId)
        )
      );
  }
}

export async function toggleBookmark(postId: string, bookmark: boolean) {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }
  if (bookmark) {
    await db
      .insert(bookmarks)
      .values({ postId, profileId: session?.user?.profileId })
      .onConflictDoNothing();
  } else {
    await db
      .delete(bookmarks)
      .where(
        and(
          eq(bookmarks.postId, postId),
          eq(bookmarks.profileId, session?.user?.profileId)
        )
      );
  }
}
