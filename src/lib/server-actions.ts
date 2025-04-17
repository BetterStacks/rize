"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export const setServerCookie = async (key: string, value: string) => {
  return (await cookies()).set(key, value);
};
export const getServerCookie = async (key: string) => {
  return (await cookies()).get(key)?.value;
};
export const deleteServerCookie = async (key: string) => {
  return (await cookies()).delete(key);
};

export const revalidatePageOnClient = async (path: string) => {
  revalidatePath(path, "page");
};
