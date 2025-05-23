"use server";
import { sections } from "@/db/schema";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { and, eq, not } from "drizzle-orm";
import { getProfileIdByUsername } from "./profile-actions";

type TogglePayload = { slug: string };

export const getSections = async (username: string) => {
  if (!username) {
    throw new Error("Provide username");
  }
  const { id } = await getProfileIdByUsername(username);
  if (!id) {
    throw new Error("Profile not found");
  }
  const sectionsList = await db
    .select()
    .from(sections)
    .where(eq(sections.profileId, id))
    .orderBy(sections.order);
  return sectionsList;
};

export async function bulkInsertSections() {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }
  const sectionsList = [
    {
      slug: "gallery",
      order: 0,
      enabled: true,
    },
    {
      slug: "posts",
      order: 1,
      enabled: true,
    },
    {
      slug: "writings",
      order: 2,
      enabled: true,
    },
    {
      slug: "projects",
      order: 3,
      enabled: true,
    },
    {
      slug: "education",
      order: 4,
      enabled: true,
    },
    {
      slug: "experience",
      order: 5,
      enabled: true,
    },
  ];

  await db.insert(sections).values(
    sectionsList?.map((section) => ({
      ...section,
      profileId: session.user.profileId,
    }))
  );
}

export async function updateSections(orderedIds: string[]) {
  // Update order
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }

  await Promise.all(
    orderedIds.map((id, index) =>
      db
        .update(sections)
        .set({ order: index })
        .where(
          and(
            eq(sections.profileId, session?.user?.profileId),
            eq(sections.slug, id)
          )
        )
    )
  );
}

export async function toggleSection(toggles: TogglePayload[]) {
  // Update order
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }
  await Promise.all(
    toggles.map(({ slug }) =>
      db
        .update(sections)
        .set({ enabled: not(sections.enabled) })
        .where(
          and(
            eq(sections.profileId, session?.user?.profileId),
            eq(sections.slug, slug)
          )
        )
    )
  );
}
