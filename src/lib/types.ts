import { profile, users } from "@/db/schema";
import { z } from "zod";

export const TUser = users.$inferSelect;
export const TProfile = profile.$inferSelect;
export const NewProfile = profile.$inferInsert;

export const usernameSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .max(15, "Username must not exceed 15 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscores, and hyphens"
    ),
});
const PronounsEnum = z.enum(["he/him", "she/her", "they/them", "other"]);

export const profileSchema = z.object({
  name: z.string().min(5).max(25),
  email: z.string().email(),
  username: z.string().min(5).max(20),
  age: z.number().int().min(18).max(120),
  pronouns: PronounsEnum,
  bio: z.string().max(150).optional(),
  location: z.string().optional(),
  website: z.string().url().optional(),
});

export type UsernameFormData = z.infer<typeof usernameSchema>;

export type Item = {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
  static?: boolean;
  isDraggable?: boolean;
  isResizable?: boolean;
  resizeHandles?: Array<"s" | "w" | "e" | "n" | "sw" | "nw" | "se" | "ne">;
  isBounded?: boolean;
  type?: "text" | "image" | "video" | "link";
};
