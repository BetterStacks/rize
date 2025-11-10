import { getAllEducation } from "@/actions/education-actions";
import { getAllExperience } from "@/actions/experience-actions";
import { getGalleryItems } from "@/actions/gallery-actions";
import { getSections } from "@/actions/general-actions";
import { getAllPages } from "@/actions/page-actions";
import { getUserPosts } from "@/actions/post-actions";
import {
  getRecentlyJoinedProfiles,
  isUsernameAvailable,
} from "@/actions/profile-actions";
import { getAllProjects } from "@/actions/project-actions";
import { getSocialLinks } from "@/actions/social-links-actions";
import { getStoryElementsByUsername } from "@/actions/story-actions";
import { profile } from "@/db/schema";
import db from "@/lib/db";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

type TMode = "check-username" | "get-profile" | "recently-joined";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode") as TMode;
    const { username } = await params;
    if (!username) {
      return NextResponse.json(
        { data: null, error: "Username is required" },
        { status: 400 }
      );
    }
    if (mode === "get-profile") {
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
    } else if (mode === "check-username") {
      const exists = await isUsernameAvailable(username);
      return NextResponse.json(
        { data: exists?.available, error: null },
        { status: 200 }
      );
    } else if (mode === "recently-joined") {
      const limit = searchParams.get("limit");
      const profiles = await getRecentlyJoinedProfiles(
        limit ? parseInt(limit) : 10
      );

      return NextResponse.json(
        { data: profiles, error: null },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      {
        data: null,
        error: (error as Error)?.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
