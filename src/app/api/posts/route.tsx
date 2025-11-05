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
