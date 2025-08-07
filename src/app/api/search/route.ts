import { searchProfiles } from "@/actions/profile-actions";
import db from "@/lib/db";
import { posts, projects, profile } from "@/db/schema";
import { ilike, or, and, eq } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") || "";
  const type = searchParams.get("type") || "all"; // all, people, posts, projects

  try {
    const results: any = {
      people: [],
      posts: [],
      projects: [],
      total: 0
    };

    if (type === "all" || type === "people") {
      const profileResults = await searchProfiles(query);
      results.people = profileResults.slice(0, 10);
    }

    if (type === "all" || type === "posts") {
      const postResults = await db
        .select({
          id: posts.id,
          content: posts.content,
          createdAt: posts.createdAt,
          profileId: posts.profileId,
          username: profile.username,
          displayName: profile.displayName,
          profileImage: profile.profileImage,
        })
        .from(posts)
        .innerJoin(profile, eq(posts.profileId, profile.id))
        .where(
          and(
            ilike(posts.content, `%${query}%`),
            posts.content // Only posts with content
          )
        )
        .limit(10)
        .orderBy(posts.createdAt);

      results.posts = postResults;
    }

    if (type === "all" || type === "projects") {
      const projectResults = await db
        .select({
          id: projects.id,
          name: projects.name,
          description: projects.description,
          status: projects.status,
          url: projects.url,
          profileId: projects.profileId,
          username: profile.username,
          displayName: profile.displayName,
          profileImage: profile.profileImage,
        })
        .from(projects)
        .innerJoin(profile, eq(projects.profileId, profile.id))
        .where(
          or(
            ilike(projects.name, `%${query}%`),
            ilike(projects.description, `%${query}%`)
          )
        )
        .limit(10);

      results.projects = projectResults;
    }

    results.total = results.people.length + results.posts.length + results.projects.length;

    return Response.json(results, { status: 200 });
  } catch (error) {
    console.error("Error searching:", error);
    return Response.json(
      { error: "Failed to search" },
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
