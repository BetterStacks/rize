"use server";

import { profile, users } from "@/db/schema";
import { TUser, NewProfile, profileSchema } from "@/lib/types";
import { hashSync } from "bcryptjs";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import db from "./db";
import { z } from "zod";

export const setServerCookie = async (key: string, value: string) => {
  return (await cookies()).set(key, value);
};
export const getServerCookie = async (key: string) => {
  return (await cookies()).get(key)?.value;
};
export const deleteServerCookie = async (key: string) => {
  return (await cookies()).delete(key);
};

export const updateProfile = async (data: FormData | null) => {
  const validatedFields = profileSchema.safeParse({
    username: data!.get("username"),
    age: Number(data!.get("age")),
    pronouns: data!.get("pronouns"),
    bio: data!.get("bio"),
    location: data!.get("location"),
    website: data!.get("website"),
  });

  if (!validatedFields.success) {
    return {
      error: "Invalid fields",
      details: validatedFields.error.flatten(),
    };
  }

  // Here you would update the database with the new profile data
  // For this example, we'll just return the validated data
  return { success: true, data: validatedFields.data };
};

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
