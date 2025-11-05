import { getAllEducation } from "@/actions/education-actions";
import { getAllExperience } from "@/actions/experience-actions";
import { getGalleryItems } from "@/actions/gallery-actions";
import { bulkInsertSections, getSections } from "@/actions/general-actions";
import { getAllPages } from "@/actions/page-actions";
import { getUserPosts } from "@/actions/post-actions";
import { getAllProjects } from "@/actions/project-actions";
import { getSocialLinks } from "@/actions/social-links-actions";
import { getStoryElementsByUsername } from "@/actions/story-actions";
import { profile, users } from "@/db/schema";
import db from "@/lib/db";
import { v2 as cloudinary } from "cloudinary";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

cloudinary.config({
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
});

type TProfilePayload = {
  displayName: string;
  username: string;
  // profileImage: string;
  userId: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as TProfilePayload;
    console.log({ body });
    const [newProfile] = await db
      .insert(profile)
      .values({
        ...body,
        userId: body.userId,
      })
      .returning();

    if (!newProfile) {
      throw new Error("Profile creation failed");
    }

    await bulkInsertSections(newProfile.id);

    await db
      .update(users)
      .set({ isOnboarded: true })
      .where(eq(users.id, body.userId));

    return NextResponse.json(
      {
        data: { ...newProfile },
        error: null,
      },
      {
        status: 200,
      }
    );
    // }
  } catch (error) {
    console.error("Error signing up user:", error);
    return NextResponse.json(
      { data: null, error: (error as Error)?.message || "Failed to Signup " }
      // { status: 500 }
    );
  }
}
export async function GET(req: NextRequest) {
  try {
    const username = req.nextUrl.searchParams.get("username");

    if (!username) {
      return NextResponse.json(
        { data: null, error: "Username is required" },
        { status: 400 }
      );
    }

    const [newProfile] = await db
      .select()
      .from(profile)
      .where(eq(profile.username, username));
    if (!newProfile) {
      return NextResponse.json(
        { data: null, error: "Profile not found" },
        { status: 404 }
      );
    }

    const [
      socialLinks,
      gallery,
      writings,
      projects,
      education,
      workExperience,
      posts,
      sections,
      storyElements,
    ] = await Promise.all([
      getSocialLinks(username),
      getGalleryItems(username),
      getAllPages(username).then((pages) =>
        pages.map((page) => ({
          ...page,
          avatar: page.thumbnail || "", // Provide a default or derived avatar value
        }))
      ),
      getAllProjects(username),
      getAllEducation(username),
      getAllExperience(username),
      getUserPosts(username),
      getSections(username),
      getStoryElementsByUsername(username),
    ]);

    return NextResponse.json(
      {
        data: {
          profile: newProfile,
          socialLinks,
          gallery,
          writings,
          projects,
          education,
          workExperience,
          posts,
          sections,
          storyElements,
        },
        error: null,
      },
      {
        status: 200,
      }
    );
    // }
  } catch (error) {
    console.error("Error signing up user:", error);
    return NextResponse.json(
      { data: null, error: (error as Error)?.message || "Failed to Signup " }
      // { status: 500 }
    );
  }
}
