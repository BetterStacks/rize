"use server";

import { v2 as cloudinary } from "cloudinary";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

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

export const revalidatePageOnClient = async (path: string) => {
  revalidatePath(path, "page");
};
