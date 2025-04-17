"use server";

import { gallery, galleryMedia, media } from "@/db/schema";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { GalleryItemProps, TUploadFilesResponse } from "@/lib/types";
import { isImageUrl } from "@/lib/utils";
import { eq, getTableColumns } from "drizzle-orm";
import { getProfileIdByUsername } from "./profile-actions";

export const getGalleryId = async () => {
  const session = await auth();
  if (!session || !session?.user?.profileId) {
    throw new Error("Session not found");
  }
  const galleryId = await db
    .select({
      id: gallery.id,
    })
    .from(gallery)
    .where(eq(gallery.profileId, session?.user?.profileId as string));

  if (galleryId.length === 0) {
    const newGallery = await db
      .insert(gallery)
      .values({ layout: "default", profileId: session?.user?.profileId })
      .returning({ id: gallery.id });
    return newGallery[0];
  }
  return galleryId[0];
};

export const getGalleryItems = async (username: string) => {
  const profileId = await getProfileIdByUsername(username);
  if (!profileId) {
    throw new Error("Profile not found");
  }
  const { ...rest } = getTableColumns(media);
  const items = await db
    .select({
      ...rest,
      galleryMediaId: galleryMedia.id,
    })
    .from(gallery)
    .innerJoin(galleryMedia, eq(gallery.id, galleryMedia.galleryId))
    .innerJoin(media, eq(galleryMedia.mediaId, media.id))
    .where(eq(gallery.profileId, profileId?.id))
    .limit(10);

  if (items.length === 0) {
    return [];
  }
  return items as GalleryItemProps[];
};

export const addGalleryItem = async (payload: TUploadFilesResponse) => {
  const session = await auth();
  if (!session || !session?.user?.profileId) {
    throw new Error("Session not found");
  }
  const { id } = await getGalleryId();
  if (!id) {
    throw new Error("Gallery not found");
  }
  const newMedia = await db
    .insert(media)
    .values({
      url: payload?.url,
      type: isImageUrl(payload?.url) ? "image" : "video",
      profileId: session?.user?.profileId,
      height: payload?.height,
      width: payload?.width,
    })
    .returning({ id: media.id });
  if (newMedia.length === 0) {
    throw new Error("Error adding media");
  }
  const item = await db
    .insert(galleryMedia)
    .values({
      galleryId: id,
      mediaId: newMedia[0].id,
    })
    .returning();
  if (item.length === 0) {
    throw new Error("Error adding gallery item");
  }
  return item[0];
};

export const removeGalleryItem = async (id: string) => {
  const session = await auth();
  if (!session || !session?.user?.profileId) {
    throw new Error("Session not found");
  }
  if (!id) {
    throw new Error("Provide an ID");
  }
  const item = await db.delete(media).where(eq(media.id, id)).returning();
  console.log({ item });
  if (item.length === 0) {
    throw new Error("Error deleting gallery item");
  }
  return item[0];
};

export async function getGalleryItem(id: string) {
  if (!id) {
    throw new Error("Provide an valid ID ");
  }
  const items = await db.select().from(media).where(eq(media.id, id)).limit(1);

  console.log({ items });

  if (items.length === 0) {
    throw new Error("No gallery item found");
  }
  return items[0];
}
