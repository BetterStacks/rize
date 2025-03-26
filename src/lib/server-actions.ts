"use server";

import { initialValue } from "@/components/editor/utils";
import {
  gallery,
  galleryMedia,
  media,
  page,
  pageMedia,
  profile,
  users,
} from "@/db/schema";
import {
  GetProfileByUsername,
  profileSchema,
  TMedia,
  TPage,
  TUploadFilesResponse,
  TUser,
} from "@/lib/types";
import { hashSync } from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import { and, eq, getTableColumns, not } from "drizzle-orm";
import { cookies } from "next/headers";
import { z } from "zod";
import { auth } from "./auth";
import db from "./db";
import { isImageUrl } from "./utils";

cloudinary.config({
  api_key: "537392939961543",
  api_secret: "ao9f7xxkcT3qjMyTqe-JjYPgGNM",
  cloud_name: "dfccipzwz",
});

export const setServerCookie = async (key: string, value: string) => {
  return (await cookies()).set(key, value);
};
export const getServerCookie = async (key: string) => {
  return (await cookies()).get(key)?.value;
};
export const deleteServerCookie = async (key: string) => {
  return (await cookies()).delete(key);
};

export async function updateUserAndProfile(
  data: z.infer<typeof profileSchema>
) {
  const session = await auth();
  if (!session) {
    return { success: false, error: "Session not found" };
  }

  const validatedFields = profileSchema.safeParse(data);

  if (!validatedFields.success) {
    return { success: false, error: validatedFields.error.format() };
  }

  const { name, email, ...profileData } = validatedFields.data;

  const userUpdates = { name, email };
  const profileUpdates = profileData;
  console.log({ userUpdates, profileUpdates });
  if (userUpdates?.name || userUpdates?.email) {
    await db
      .update(users)
      .set(userUpdates)
      .where(eq(users.id, session?.user?.id));
  }
  await db
    .update(profile)
    .set(profileUpdates)
    .where(eq(profile.userId, session?.user?.id));

  return { success: true, error: null };
}

export const getProfileById = async (id: string) => {
  const { ...rest } = getTableColumns(profile);
  const p = await db
    .select({
      ...rest,
      image: users.image,
      name: users.name,
      email: users.email,
    })
    .from(profile)
    .innerJoin(users, eq(profile.userId, users.id))
    .where(eq(profile.id, id))
    .limit(1);
  if (!p || p.length === 0) {
    throw new Error("Profile not found");
  }
  return p[0];
};

export const getProfileByUsername = async (username: string) => {
  // try {

  const { ...rest } = getTableColumns(profile);
  const p = await db
    .select({
      ...rest,
      image: users.image,
      name: users.name,
      email: users.email,
    })
    .from(profile)
    .innerJoin(users, eq(profile.userId, users.id))
    .where(eq(profile.username, username))
    .limit(1);

  if (!p || p.length === 0) {
    throw new Error("Profile not found");
  }

  return p[0] as GetProfileByUsername;
};

export const createProfile = async (username: string) => {
  try {
    const session = await auth();
    console.log({ session });
    if (!session) {
      throw new Error("Session not found");
    }
    const p = await db
      .insert(profile)
      .values({
        userId: session?.user?.id,
        username: username,
      })
      .returning();
    if (p.length === 0) {
      throw new Error("Error creating profile");
    }

    return { data: p[0], error: null };
  } catch (error) {
    return { data: null, error: (error as Error)?.message };
  }
};

export const setUserIsOnboarded = async () => {
  const session = await auth();
  if (!session) {
    return { success: false, error: "Session not found" };
  }

  await db
    .update(users)
    .set({ isOnboarded: not(users.isOnboarded) })
    .where(eq(users.id, session?.user?.id));

  return { success: true, error: null };
};

export async function updateUserImage(url: string) {
  const session = await auth();
  if (!session) {
    return { success: false, error: "Session not found" };
  }

  await db
    .update(users)
    .set({ image: url })
    .where(eq(users.id, session?.user?.id));

  return { success: true, error: null };
}

export const userExists = async (email: string) => {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return user;
  } catch (error) {
    throw new Error((error as Error)?.message);
  }
};

export const register = async (
  payload: Pick<typeof TUser, "email" | "password" | "name">
) => {
  try {
    const alreadyExists = await userExists(payload.email as string);
    if (alreadyExists) {
      throw new Error("User already exists");
    }
    const hashedPassword = hashSync(payload.password as string, 10);
    const image = `https://api.dicebear.com/9.x/initials/svg?seed=${payload.name}`;
    const [user] = await db
      .insert(users)
      .values({
        ...payload,
        password: hashedPassword,
        image,
      })
      .returning();

    return { data: user, error: null };
  } catch (error) {
    return { data: null, error: (error as Error)?.message };
  }
};
export const isUsernameAvailable = async (username: string) => {
  // try {
  const [user] = await db
    .select()
    .from(profile)
    .where(eq(profile.username, username))
    .limit(1);

  return { available: !user };
};

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
    console.log({ p });
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
    console.log({ p });
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
    .leftJoin(
      pageMedia,
      and(eq(pageMedia.pageId, page.id), eq(pageMedia.type, "thumbnail"))
    )
    .leftJoin(media, eq(media.id, pageMedia.mediaId))
    .where(eq(page.profileId, profileId?.id!));
  // console.log(pages);
  if (pages.length === 0) {
    throw new Error("No pages found");
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
    .leftJoin(
      pageMedia,
      and(eq(pageMedia.pageId, page.id), eq(pageMedia.type, "thumbnail"))
    )
    .leftJoin(media, eq(media.id, pageMedia.mediaId))
    .where(and(eq(page.id, id)))
    .limit(1);
  // console.log(pages);
  if (pages.length === 0) {
    throw new Error("No page found");
  }
  return pages[0];
};

//   const sessoin = await auth();
//   const links = await db
//     .select({
//       id: socialLinks.id,
//       name: socialLinks.name,
//       icon: socialLinks.icon,
//       url: profileSocialLinks.url,
//       createdAt: profileSocialLinks.createdAt,
//     })
//     .from(socialLinks)
//     .innerJoin(
//       profileSocialLinks,
//       eq(socialLinks.id, profileSocialLinks.socialLinksId)
//     )
//     .where(eq(profileSocialLinks.profileId, sessoin?.user?.profileId!));

//   console.log({ links });

//   if (links.length === 0) {
//     throw new Error("No social links found");
//   }
//   return links as TSocialLink[];
// };

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
    .where(eq(gallery.profileId, session?.user?.profileId!));
  if (galleryId.length === 0) {
    // throw new Error("No gallery found");
    console.log("No gallery found");
    const newGallery = await db
      .insert(gallery)
      .values({ layout: "default", profileId: session?.user?.profileId })
      .returning({ id: gallery.id });
    return newGallery[0];
  }
  return galleryId[0];
};

export const getProfileIdByUsername = async (username: string) => {
  const profileId = await db
    .select({ id: profile.id })
    .from(profile)
    .where(eq(profile.username, username));
  if (profileId.length === 0) {
    throw new Error("Profile not found");
  }
  return profileId[0];
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
    .limit(8);

  // console.log({ items });

  if (items.length === 0) {
    throw new Error("No gallery items found");
  }
  return items as (typeof TMedia & {
    galleryMediaId: string | null;
    width: number;
    height: number;
  })[];
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
  if (item.length === 0) {
    throw new Error("Error deleting gallery item");
  }
  return item[0];
};

export async function uploadFilesToCloudinary(formData: FormData) {
  try {
    const files = formData.getAll("files");
    const type = formData.get("type") as "image" | "video";

    if (!files || files.length === 0) {
      return { success: false, error: "No files provided" };
    }

    const results: string[] = [];
    const fileBuffers = files.map(async (file) => {
      if (!(file instanceof File)) return;
      const arrayBuffer = await file.arrayBuffer();
      return Buffer.from(arrayBuffer);
    });
    for (const file of files) {
      if (!(file instanceof File)) continue;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // try {
      //   const result: UploadApiResponse = await new Promise(
      //     (resolve, reject) => {
      //       const uploadStream = cloudinary.uploader.upload_stream(
      //         {
      //           folder: "fyp-stacks/gallery", // Optional: specify a folder in Cloudinary
      //           resource_type: type, // Automatically detect resource type
      //           filename_override: file.name, // Use original filename
      //         },
      //         (error, result) => {
      //           if (error) {
      //             reject(error);
      //           } else {
      //             resolve(result!);
      //           }
      //         }
      //       );

      //       uploadStream.write(buffer);
      //       uploadStream.end();
      //     }
      //   );
      //   results.push(result?.secure_url as string);
      // } catch (uploadError) {
      //   console.error(`Error uploading ${file.name}:`, uploadError);
      // }
    }
    console.log({ results });
    return { success: true, data: results };
  } catch (error) {
    console.error("Error uploading files to Cloudinary:", error);
    return {
      success: false,
      error: (error as Error).message || "Failed to upload files",
    };
  }
}

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
      type: isImageUrl(payload?.url) ? "image" : "video",
      profileId: session?.user?.profileId,
      height: payload?.height,
      width: payload?.width,
    })
    .returning({ id: media.id });
  console.log({ newMedia });
  if (newMedia.length === 0) {
    throw new Error("Error updating page thumbnail");
  }
  const newPageMedia = await db
    .insert(pageMedia)
    .values({
      mediaId: newMedia[0].id,
      pageId: payload?.pageId,
      type: "thumbnail",
    })
    .returning();

  if (newPageMedia.length === 0) {
    throw new Error("Error updating page thumbnail");
  }
  return { success: true, error: null };
}
