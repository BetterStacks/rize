"use server";

import db from "@/lib/db";
import { getProfileIdByUsername } from "./profile-actions";
import { GetAllProjects, TNewProject, TProject } from "@/lib/types";
import { eq, getTableColumns } from "drizzle-orm";
import { media, projects } from "@/db/schema";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { revalidatePath } from "next/cache";

export const getAllProjects = async (username: string) => {
  const profileId = await getProfileIdByUsername(username);
  if (!profileId) {
    throw new Error("Profile not found");
  }
  const { ...rest } = getTableColumns(projects);
  const allProjects = await db
    .select({
      ...rest,
      logo: media.url,
    })
    .from(projects)
    .leftJoin(media, eq(media.id, projects.logo))
    .where(eq(projects.profileId, profileId?.id as string));
  if (allProjects?.length === 0) {
    return [];
  }
  return allProjects as GetAllProjects[];
};
export const getProjectByID = async (username: string, id: string) => {
  const profileId = await getProfileIdByUsername(username);
  if (!profileId) {
    throw new Error("Profile not found");
  }
  const { ...rest } = getTableColumns(projects);
  const allProjects = await db
    .select({
      ...rest,
      logo: media.url,
    })
    .from(projects)
    .leftJoin(media, eq(media.id, projects.logo))
    .where(eq(projects.id, id as string))
    .limit(1);

  return allProjects[0] as GetAllProjects;
};

const newProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  url: z.string(),
  description: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  logo: z.string().url("Invalid URL"),
  width: z.string().optional(),
  height: z.string().optional(),
});

export const createProject = async (data: z.infer<typeof newProjectSchema>) => {
  const session = await auth();
  if (!session?.user?.profileId) {
    throw new Error("User not authenticated");
  }

  const parsed = newProjectSchema.parse(data);
  const logoMedia = await db
    .insert(media)
    .values({
      // @ts-ignore
      url: data?.logo,
      type: "image",
      profileId: session?.user?.profileId,
      height: parseInt(data?.height as string),
      width: parseInt(data?.width as string),
    })
    .returning({ id: media.id });

  if (!logoMedia) {
    throw new Error("Logo upload failed");
  }
  const logoId = logoMedia[0].id;

  const project = await db.insert(projects).values({
    ...parsed,
    endDate: new Date(parsed?.endDate as string) || null,
    startDate: new Date(parsed?.startDate as string),
    profileId: session?.user?.profileId,
    logo: logoId,
  });
  return project;
};

export const updateProject = async (
  payload: Partial<TProject & { width: number; height: number }>
) => {
  try {
    let updatedPayload = { ...payload };

    if (payload?.logo) {
      const session = await auth();
      if (!session?.user?.profileId) {
        throw new Error("User not authenticated");
      }

      const logoMedia = await db
        .insert(media)
        .values({
          // @ts-ignore
          url: payload?.logo,
          type: "image",
          profileId: session?.user?.profileId,
          height: payload?.height,
          width: payload?.width,
        })
        .returning({ id: media.id });

      if (!logoMedia) {
        throw new Error("Logo upload failed");
      }

      const logoId = logoMedia[0].id;
      updatedPayload = { ...updatedPayload, logo: logoId };
    }

    const p = await db
      .update(projects)
      .set(updatedPayload)
      .where(eq(projects.id, payload.id!))
      .returning();

    if (p.length === 0) {
      throw new Error("Error updating page");
    }

    return { ok: true, error: null };
  } catch (error) {
    return { ok: false, error: (error as Error)?.message };
  }
};

export async function deleteProject(id: string) {
  const p = await db.delete(projects).where(eq(projects.id, id!)).returning();
  if (p.length === 0) {
    throw new Error("Error deleting page");
  }
}
