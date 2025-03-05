import { galleryMedia, media, page, profile, users } from "@/db/schema";
import { BaseEditor, BaseRange, Descendant, Element, Range } from "slate";
import { HistoryEditor } from "slate-history";
import { ReactEditor } from "slate-react";
import { z } from "zod";

export const TUser = users.$inferSelect;
export const TPage = page.$inferInsert;
export const TProfile = profile.$inferSelect;
export const TGalleryItem = galleryMedia.$inferSelect;
export const NewProfile = profile.$inferInsert;
export const TMedia = media.$inferSelect;
export type GalleryItemProps = typeof TMedia & {
  galleryMediaId: string | null;
};

export type GalleryConfigProps = {
  cols: 2 | 3 | 4;
  length: number;
};

export type TSocialLink = {
  id: string;
  icon: string;
  name: string;
  url: string;
  createdAt: Date;
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
  name: z.string().min(5).max(25).optional(),
  email: z.string().email().optional(),
  // image: z.string().url().optional(),
  username: z.string().min(5).max(20).optional(),
  age: z.number().int().min(18).max(120).optional(),
  pronouns: PronounsEnum.optional(),
  bio: z.string().max(150).optional(),
  location: z.string().optional(),
  website: z.string().url().optional().nullable(),
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
