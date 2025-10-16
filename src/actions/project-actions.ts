"use server";

import { media, projectMedia, projects } from "@/db/schema";
import { requireProfile } from "@/lib/auth";
import db from "@/lib/db";
import { GetAllProjects, newProjectSchema, TProject } from "@/lib/types";
import { getPublicIdFromUrl } from "@/lib/utils";
import { v2 as cloudinary } from "cloudinary";
import { eq, getTableColumns, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import { getProfileIdByUsername } from "./profile-actions";
cloudinary.config({
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
});

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
      attachments: sql`
        (
          SELECT
            CASE WHEN COUNT(*) = 0 THEN NULL
            ELSE json_agg(json_build_object(
              'id', m.id,
              'url', m.url,
              'type', m.type,
              'width', m.width,
              'height', m.height
            ))
            END
          FROM project_media pm
          JOIN media m ON pm.media_id = m.id
          WHERE pm.project_id = projects.id
        )
      `.as("attachments"),
    })
    .from(projects)
    .leftJoin(media, eq(media.id, projects.logo))
    .where(eq(projects.profileId, profileId?.id as string));
  if (allProjects?.length === 0) {
    return [];
  }
  return allProjects as GetAllProjects[];
};
export const getProjectByID = async (id: string) => {
  // const profileId = await getProfileIdByUsername(username);
  // if (!profileId) {
  //   throw new Error("Profile not found");
  // }
  const { ...rest } = getTableColumns(projects);
  const allProjects = await db
    .select({
      ...rest,
      logo: media.url,
      attachments: sql`
        (
          SELECT
            CASE WHEN COUNT(*) = 0 THEN NULL
            ELSE json_agg(json_build_object(
              'id', m.id,
              'url', m.url,
              'type', m.type,
              'width', m.width,
              'height', m.height
            ))
            END
          FROM project_media pm
          JOIN media m ON pm.media_id = m.id
          WHERE pm.project_id = projects.id
        )
      `.as("attachments"),
    })
    .from(projects)
    .leftJoin(media, eq(media.id, projects.logo))
    .where(eq(projects.id, id as string))
    .limit(1);
  return allProjects[0] as GetAllProjects;
};

export const createProject = async (data: z.infer<typeof newProjectSchema>) => {
  const profileId = await requireProfile();

  const parsed = newProjectSchema.parse(data);
  // If a logo URL was provided, insert it into media and use the id as project.logo
  let logoId: string | null = null;
  if (parsed.logo) {
    const logoMedia = await db
      .insert(media)
      .values({
        // @ts-ignore
        url: parsed.logo,
        type: "image",
        profileId: profileId,
        height: parsed.height ? parseInt(parsed.height as string) : undefined,
        width: parsed.width ? parseInt(parsed.width as string) : undefined,
      })
      .returning({ id: media.id });

    if (!logoMedia) {
      throw new Error("Logo upload failed");
    }
    logoId = logoMedia[0].id;
  }

  const [project] = await db
    .insert(projects)
    .values({
      ...parsed,
      endDate: new Date(parsed?.endDate as string) || null,
      startDate: new Date(parsed?.startDate as string),
      profileId: profileId,
      // use the inserted logo id or null if none
      logo: logoId,
    })
    .returning();

  // If additional media items were included, insert them and link to project
  if (parsed.media && parsed.media.length > 0) {
    await db.transaction(async (tx) => {
      for (const item of parsed.media!) {
        const inserted = await tx
          .insert(media)
          .values({
            url: item.url,
            type: item.type === "video" ? "video" : "image",
            profileId: profileId,
            height: item.height,
            width: item.width,
          })
          .returning({ id: media.id });

        if (inserted && inserted.length > 0) {
          await tx.insert(projectMedia).values({
            projectId: project?.id,
            mediaId: inserted[0].id,
          });
        }
      }
    });
  }
  return project;
};

export const updateProject = async (
  payload: Partial<
    TProject & {
      width: number;
      height: number;
      removeMediaPayload?: Array<{ id: string; url: string }>;
    }
  >
) => {
  try {
    const profileId = await requireProfile();
    let updatedPayload = { ...payload };

    if (payload?.logo) {
      const logoMedia = await db
        .insert(media)
        .values({
          // @ts-ignore
          url: payload?.logo,
          type: "image",
          profileId: profileId,
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

    // If payload includes media array, insert and link them to the project
    if ((payload as any)?.media && (payload as any)?.media.length > 0) {
      const mediaItems = (payload as any).media as Array<{
        url: string;
        width: number;
        height: number;
        type?: string;
      }>;
      await db.transaction(async (tx) => {
        for (const item of mediaItems) {
          const inserted = await tx
            .insert(media)
            .values({
              url: item.url,
              type: item.type === "video" ? "video" : "image",
              profileId: profileId,
              height: item.height,
              width: item.width,
            })
            .returning({ id: media.id });

          if (inserted && inserted.length > 0) {
            await tx.insert(projectMedia).values({
              projectId: payload.id!,
              mediaId: inserted[0].id,
            });
          }
        }
      });
    }

    // If payload includes removeMediaIds, delete project_media links and media rows
    if (payload?.removeMediaPayload && payload.removeMediaPayload.length > 0) {
      const ids = payload.removeMediaPayload.map((item) => item.id);

      const publicIds = payload.removeMediaPayload.map(
        (item) => getPublicIdFromUrl(item.url) as string
      );

      await cloudinary.api.delete_resources(publicIds);
      await db.transaction(async (tx) => {
        //
        // await tx.delete(projectMedia).where(inArray(projectMedia.mediaId, ids));
        await tx.delete(media).where(inArray(media.id, ids));
      });
    }

    const p = await db
      .update(projects)
      .set({
        // Ensure date fields are JS Date objects when passed to the DB layer.
        ...(updatedPayload as any),
        startDate: updatedPayload.startDate
          ? new Date(updatedPayload.startDate as unknown as string)
          : undefined,
        endDate: updatedPayload.endDate
          ? new Date(updatedPayload.endDate as unknown as string)
          : undefined,
      })
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
