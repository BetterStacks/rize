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
import { getPublicIdFromUrl } from "@/lib/utils";
import { v2 as cloudinary } from "cloudinary";
import { desc, eq, inArray, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
cloudinary.config({
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(req.url);
    const { id } = await params;
    const userProfileId = searchParams.get("profileId");
    const [query] = await db
      .select({
        id: posts.id,
        content: posts.content,
        createdAt: posts.createdAt,
        username: profile.username,
        profileId: profile.id,
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
        profile.id,

        media.id,
        postLinks.id
      )
      .where(eq(posts.id, id));
    return NextResponse.json({ data: query, error: null }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { data: null, error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}
export function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {}
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const mediaToDelete = await db
      .select()
      .from(postMedia)
      .leftJoin(media, eq(media.id, postMedia.mediaId))
      .where(eq(postMedia.postId, id));

    if (mediaToDelete.length > 0) {
      const publicIds = mediaToDelete
        .map((media) => getPublicIdFromUrl(media?.media?.url as string))
        .filter(Boolean) as string[];
      if (publicIds.length > 0) {
        await cloudinary.api.delete_resources(publicIds);
        const ids = mediaToDelete.map((m) => m.media?.id);
        await db.transaction(async (tx) => {
          await tx.delete(media).where(inArray(media.id, ids as string[]));
        });
      }
    }

    const [deletedPost] = await db
      .delete(posts)
      .where(eq(posts.id, id))
      .returning();

    return NextResponse.json(
      { data: deletedPost, error: null },
      { status: 200 }
    );
  } catch (err) {
    console.log((err as Error)?.message);
    return NextResponse.json(
      { data: null, error: "Failed to delete post" },
      { status: 500 }
    );
  }
}
