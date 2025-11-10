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
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest
  // { params }: { params: Promise<{ profileId: string }> }
) {
  const { searchParams } = new URL(req.url);
  const userProfileId = searchParams.get("profileId");
  console.log(userProfileId);
  if (!userProfileId)
    return NextResponse.json(
      { data: null, error: "Profile ID is required" },
      { status: 400 }
    );
  try {
    const profilePosts = await db
      .select({
        id: posts.id,
        profileId: profile.id,
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
      .where(eq(posts.profileId, userProfileId))
      .groupBy(
        posts.id,
        profile.username,
        profile.displayName,
        profile.id,

        profile.profileImage,
        media.id,
        postLinks.id
      )
      .orderBy(desc(posts.createdAt));

    return NextResponse.json(
      { data: profilePosts, error: null },
      { status: 200 }
    );
  } catch (error) {
    console.error("[PROFILE_API_ERROR]", error);
    return NextResponse.json(
      { data: null, error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
