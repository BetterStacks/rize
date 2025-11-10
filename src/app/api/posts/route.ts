import { NextRequest, NextResponse } from "next/server";

import {
  comments,
  likes,
  media,
  postLinks,
  postMedia,
  posts,
  profile,
} from "@/db/schema";
import db from "@/lib/db";
import { desc, eq, sql } from "drizzle-orm";
import { newPostSchema } from "@/lib/types";
import instance from "@/lib/axios-instance";
import { Result } from "url-metadata";
import { isImageUrl } from "@/lib/utils";

const PAGE_SIZE = 10;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pageParam = searchParams.get("page") || "1";
    // normalize page to a positive integer (defaults to 1)
    const parsed = parseInt(pageParam, 10);
    const page = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
    const offset = Math.max(0, (page - 1) * PAGE_SIZE);
    const userProfileId = searchParams.get("profileId");

    const query = db
      .select({
        id: posts.id,
        content: posts.content,
        createdAt: posts.createdAt,
        profileId: profile.id,
        username: profile.username,
        name: profile.displayName,
        avatar: profile.profileImage,
        likeCount: sql<number>`COUNT(DISTINCT ${likes.profileId})`.as(
          "likeCount"
        ),
        commentCount: sql<number>`COUNT(DISTINCT ${comments.id})`.as(
          "commentCount"
        ),

        liked: userProfileId
          ? sql<boolean>`COALESCE(BOOL_OR(${likes.profileId} = ${userProfileId}), false)`.as(
              "liked"
            )
          : sql<boolean>`false`.as("liked"),

        commented: userProfileId
          ? sql<boolean>`COALESCE(BOOL_OR(${comments.profileId} = ${userProfileId}), false)`.as(
              "commented"
            )
          : sql<boolean>`false`.as("commented"),

        media: sql`
          CASE 
            WHEN ${media.id} IS NOT NULL THEN json_build_object(
              'id', ${media.id},
              'url', ${media.url},
              'type', ${media.type},
              'width', ${media.width},
              'height', ${media.height}
            )
            ELSE NULL
          END
        `.as("media"),

        link: sql`
          CASE 
            WHEN ${postLinks.id} IS NOT NULL THEN json_build_object(
              'id', ${postLinks.id},
              'url', ${postLinks.url},
              'data', ${postLinks.data},
              'createdAt', ${postLinks.createdAt}
            )
            ELSE NULL
          END
        `.as("link"),
      })
      .from(posts)
      .innerJoin(profile, eq(posts.profileId, profile.id))
      .leftJoin(postMedia, eq(posts.id, postMedia.postId))
      .leftJoin(likes, eq(posts.id, likes.postId))
      .leftJoin(comments, eq(posts.id, comments.postId))
      .leftJoin(media, eq(postMedia.mediaId, media.id))
      .leftJoin(postLinks, eq(posts.id, postLinks.postId))
      .groupBy(
        posts.id,
        profile.username,
        profile.id,

        profile.displayName,
        profile.profileImage,
        media.id,
        postLinks.id
      )
      .orderBy(desc(posts.createdAt))
      .limit(PAGE_SIZE)
      .offset(offset);

    const results = await query;

    // Pagination metadata
    const nextPage = results.length === PAGE_SIZE ? page + 1 : null;
    console.log(results);
    return NextResponse.json({
      data: { posts: results, nextPage },
      error: null,
    });
  } catch (error) {
    console.error("[EXPLORE_API_ERROR]", error);
    return NextResponse.json(
      { data: null, error: "Failed to fetch explore feed" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    console.log(payload);
    const { success, data } = newPostSchema.safeParse(payload);
    if (!success) {
      return NextResponse.json(
        { data: null, error: "Invalid payload" },
        { status: 400 }
      );
    }
    await db.transaction(async (tx) => {
      const [newPost] = await tx
        .insert(posts)
        .values({
          content: data.content || null,
          profileId: payload?.profileId,
        })
        .returning({ id: posts.id });

      if (data?.link) {
        const res = await instance.get("/url", {
          params: {
            url: data?.link,
          },
        });
        if (res?.status !== 200)
          throw new Error("Failed to fetch link metadata");

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
            profileId: payload?.profileId,
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
    return NextResponse.json(
      { data: "Post created", error: null },
      { status: 201 }
    );
  } catch (error) {
    console.error("[EXPLORE_API_ERROR]", error);
    return NextResponse.json(
      { data: null, error: "Failed to fetch explore feed" },
      { status: 500 }
    );
  }
}
