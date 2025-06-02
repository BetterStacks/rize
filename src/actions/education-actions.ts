// app/actions/education.ts
"use server";

import { education } from "@/db/schema";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { TEducation } from "@/lib/types";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getProfileIdByUsername } from "./profile-actions";

const educationSchema = z.object({
  id: z.string().optional(),
  school: z.string().min(1),
  degree: z.string().optional(),
  fieldOfStudy: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  grade: z.string().optional(),
  activities: z.string().optional(),
  description: z.string().optional(),
});

export async function upsertEducation(data: z.infer<typeof educationSchema>) {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }
  const profileId = session.user.profileId;
  const validated = educationSchema.parse(data);
  if (validated.id) {
    await db
      .update(education)
      .set({ ...validated, updatedAt: new Date() })
      .where(eq(education.id, validated.id));
  } else {
    await db.insert(education).values({ ...validated, profileId: profileId });
  }
}

export const getAllEducation = async (username: string) => {
  const profileId = await getProfileIdByUsername(username);
  if (!profileId) {
    throw new Error("Profile not found");
  }
  const allEducation = await db
    .select()
    .from(education)
    .where(eq(education.profileId, profileId?.id as string));
  if (allEducation?.length === 0) {
    return [];
  }
  return allEducation as TEducation[];
};
export const getEducationById = async (id: string) => {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }
  const data = await db
    .select()
    .from(education)
    .where(eq(education.id, id as string))
    .limit(1);
  if (data?.length === 0) {
    return null;
  }
  return data[0] as TEducation;
};

export async function deleteEducation(id: string) {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }
  const profileId = session.user.profileId;
  await db
    .delete(education)
    .where(and(eq(education.id, id), eq(education.profileId, profileId)));
}
