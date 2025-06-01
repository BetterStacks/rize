import {
  education,
  experience,
  galleryMedia,
  media,
  page,
  profile,
  projects,
  socialLinks,
  users,
} from "@/db/schema";
import { ReactNode } from "react";
import { BaseEditor, BaseRange, Descendant, Element, Range } from "slate";
import { HistoryEditor } from "slate-history";
import { ReactEditor } from "slate-react";
import { z } from "zod";

export const TUser = users.$inferSelect;
export const TPage = page.$inferInsert;
export type TProfile = typeof profile.$inferSelect;
export const TGalleryItem = galleryMedia.$inferSelect;
export const NewProfile = profile.$inferInsert;
export const TMedia = media.$inferSelect;
export type TSocialLink = typeof socialLinks.$inferSelect;
export type TProject = typeof projects.$inferSelect;
export type TNewProject = typeof projects.$inferInsert;
export type TEducation = typeof education.$inferSelect;
export type TNewEducation = typeof education.$inferInsert;
export type TExperience = typeof experience.$inferSelect;
export type TNewExperience = typeof experience.$inferInsert;

export type WordType = "email" | "link" | "word" | "newline";

export interface ClassifiedWord {
  type: WordType;
  value: string;
}

export type TUploadFilesResponse = {
  width: number;
  height: number;
  url: string;
};

export type TPostMedia = {
  id: string;
  url: string;
  type: "image" | "video";
  height: number;
  width: number;
};

export type GetExplorePosts = {
  username: string | null;
  name: string | null;
  avatar: string | null;

  media: TPostMedia[];
  links?: { id: string; url: string; createdAt: Date }[];
  id: string;
  content: string;
  profileId: string | null;
  createdAt: Date;
  updatedAt: Date;
  liked?: boolean; // 👈 add this
  bookmarked?: boolean;
  likeCount: number;
};

export type TSection = {
  id: string;
  enabled: boolean;
  name: string;
  order: number;
  component: ReactNode;
};

export type GetProfileByUsername =
  | (typeof profile.$inferSelect & {
      image: string;
      name: string;
      email: string;
    })
  | null;
export type GalleryItemProps = typeof TMedia & {
  galleryMediaId: string | null;
  // width: number;
  // height: number;
};

export type GetAllWritings = typeof TPage & {
  avatar: string;
  thumbnail: string;
};
export type GetAllProjects = TProject & { thumbnail: string };

export type SocialPlatform =
  | "facebook"
  | "twitter"
  | "instagram"
  | "linkedin"
  | "github"
  | "youtube"
  | "reddit"
  | "discord"
  | "snapchat"
  | "spotify"
  | "pinterest"
  | "other";

export type GalleryConfigProps = {
  layout: "messy-grid" | "masonry-grid";
};

export type BlockQuoteElement = {
  type: "block-quote";
  align?: string;
  children: Descendant[];
};

export type BulletedListElement = {
  type: "bulleted-list";
  align?: string;
  children: Descendant[];
};

export type CheckListItemElement = {
  type: "check-list-item";
  checked: boolean;
  children: Descendant[];
};

export type EditableVoidElement = {
  type: "editable-void";
  children: EmptyText[];
};

export type HeadingElement = {
  type: "heading";
  align?: string;
  children: Descendant[];
};

export type HeadingTwoElement = {
  type: "heading-two";
  align?: string;
  children: Descendant[];
};

export type ImageElement = {
  type: "image";
  url: string;
  children: EmptyText[];
};

export type LinkElement = { type: "link"; url: string; children: Descendant[] };

export type ButtonElement = { type: "button"; children: Descendant[] };

export type BadgeElement = { type: "badge"; children: Descendant[] };

export type ListItemElement = { type: "list-item"; children: Descendant[] };

export type MentionElement = {
  type: "mention";
  character: string;
  children: CustomText[];
};

export type ParagraphElement = {
  type: "paragraph";
  align?: string;
  children: Descendant[];
};

// export type TableElement = { type: "table"; children: TableRow[] };

// export type TableCellElement = { type: "table-cell"; children: CustomText[] };

// export type TableRowElement = { type: "table-row"; children: TableCell[] };

export type TitleElement = { type: "title"; children: Descendant[] };

export type VideoElement = {
  type: "video";
  url: string;
  children: EmptyText[];
};

export type CodeBlockElement = {
  type: "code-block";
  language: string;
  children: Descendant[];
};

export type CodeLineElement = {
  type: "code-line";
  children: Descendant[];
};

type CustomElement =
  | BlockQuoteElement
  | BulletedListElement
  | CheckListItemElement
  | EditableVoidElement
  | HeadingElement
  | HeadingTwoElement
  | ImageElement
  | LinkElement
  | ButtonElement
  | BadgeElement
  | ListItemElement
  | MentionElement
  | ParagraphElement
  // | TableElement
  // | TableRowElement
  // | TableCellElement
  | TitleElement
  | VideoElement
  | CodeBlockElement
  | CodeLineElement;

export type CustomText = {
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
  text: string;
};

export type EmptyText = {
  text: string;
};

export type CustomEditor = BaseEditor &
  ReactEditor &
  HistoryEditor & {
    nodeToDecorations?: Map<Element, Range[]>;
  };

declare module "slate" {
  interface CustomTypes {
    Editor: CustomEditor;
    Element: CustomElement;
    Text: CustomText | EmptyText;
    Range: BaseRange & {
      [key: string]: unknown;
    };
  }
}

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
  email: z.string().email().optional(),
  image: z.string().url().optional(),
  displayName: z.string().min(5).max(25).optional(),
  isOnboarded: z.boolean().optional(),
  username: z.string().min(5).max(20).optional(),
  // age: z.number().int().min(18).max(120).optional(),
  // pronouns: PronounsEnum.optional(),
  profileImage: z.string().url().optional(),
  bio: z.string().max(200, "Bio must be 200 characters or less").optional(),
  hasCompletedWalkthrough: z.boolean().optional(),
  // location: z.string().optional(),
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
};
