"use server";

import { initialValue } from "@/components/editor/utils";
import { media, page } from "@/db/schema";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { TPage, TUploadFilesResponse } from "@/lib/types";
import { and, eq, getTableColumns } from "drizzle-orm";
import { getProfileIdByUsername } from "./profile-actions";

export const createPage = async () => {
  try {
    const sessoin = await auth();
    const p = await db
      .insert(page)
      .values({
        title: "Untitled",
        content: JSON.stringify(initialValue),
        profileId: sessoin?.user?.profileId as string,
      })
      .returning();
    if (p.length === 0) {
      throw new Error("Error creating page");
    }
    return { data: p[0], error: null };
  } catch (error) {
    return { data: null, error: (error as Error)?.message };
  }
};

export const updatePage = async (payload: typeof TPage) => {
  try {
    const p = await db
      .update(page)
      .set(payload)
      .where(eq(page.id, payload.id!))
      .returning();
    // console.log({ p });
    if (p.length === 0) {
      throw new Error("Error updating page");
    }
    return { ok: true, error: null };
  } catch (error) {
    return { ok: false, error: (error as Error)?.message };
  }
};
export const getAllPages = async (username: string) => {
  // try {
  const profileId = await getProfileIdByUsername(username);
  if (!profileId) {
    throw new Error("Profile not found");
  }
  const { ...rest } = getTableColumns(page);
  const pages = await db
    .select({
      ...rest,
      thumbnail: media.url,
    })
    .from(page)
    .leftJoin(media, eq(media.id, page.thumbnail))
    .where(eq(page.profileId, profileId?.id as string));
  if (pages.length === 0) {
    return [];
  }
  return pages as (typeof TPage & { thumbnail: string })[];
};
export const getPageById = async (id: string) => {
  const { ...rest } = getTableColumns(page);
  const pages = await db
    .select({
      ...rest,
      thumbnail: media.url,
    })
    .from(page)
    .leftJoin(media, eq(media.id, page.thumbnail))
    .where(and(eq(page.id, id)))
    .limit(1);
  // console.log(pages);
  if (pages.length === 0) {
    throw new Error("No page found");
  }
  return pages[0];
};

export async function updatePageThumbnail(
  payload: TUploadFilesResponse & { pageId: string }
) {
  console.log({ payload });
  const session = await auth();
  if (!session || !session?.user?.profileId) {
    throw new Error("Session not found");
  }
  const newMedia = await db
    .insert(media)
    .values({
      url: payload?.url,
      type: "image",
      profileId: session?.user?.profileId,
      height: payload?.height,
      width: payload?.width,
    })
    .returning({ id: media.id });
  if (newMedia.length === 0) {
    throw new Error("Error creating thumbnail media");
  }

  const newThumbnail = await db
    .update(page)
    .set({ thumbnail: newMedia[0].id })
    .where(eq(page.id, payload?.pageId))
    .returning();

  if (newThumbnail.length === 0) {
    throw new Error("Error updating page thumbnail");
  }

  return true;
}

export async function removePageThumbnail({ pageId }: { pageId: string }) {
  const session = await auth();
  if (!session || !session?.user?.profileId) {
    throw new Error("Session not found");
  }

  const newThumbnail = await db
    .update(page)
    .set({ thumbnail: null })
    .where(eq(page.id, pageId))
    .returning();

  if (newThumbnail.length === 0) {
    throw new Error("Error deleting page thumbnail");
  }

  return true;
}
