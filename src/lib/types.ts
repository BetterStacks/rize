import {
  comments,
  education,
  experience,
  certificates,
  galleryMedia,
  Media,
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
import { Result } from "url-metadata";
import { InferUITool, ToolUIPart, UIMessage, UITools } from "ai";
import { z } from "zod";
import { ProfileTools } from "@/app/api/chat/profile/tools";

export const TUser = users.$inferSelect;
export const TPage = page.$inferInsert;
export type TProfile = typeof profile.$inferSelect;
export const TGalleryItem = galleryMedia.$inferSelect;
export const NewProfile = profile.$inferInsert;
export const TMedia = media.$inferSelect;
export type TComment = typeof comments.$inferSelect;
export type TNewComment = typeof comments.$inferInsert;
export type TSocialLink = typeof socialLinks.$inferSelect;
export type TProject = typeof projects.$inferSelect;
export type TNewProject = typeof projects.$inferInsert;
export type TEducation = typeof education.$inferSelect;
export type TNewEducation = typeof education.$inferInsert;
export type TExperience = typeof experience.$inferSelect;
export type TNewExperience = typeof experience.$inferInsert;
export type TCertificate = typeof certificates.$inferSelect;
export type TNewCertificate = typeof certificates.$inferInsert;

export type TStoryElementType =
  | "mission"
  | "value"
  | "milestone"
  | "dream"
  | "superpower";

export type TStoryElement = {
  id: string;
  profileId: string;
  type: TStoryElementType;
  title: string;
  content: string;
  order: number;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type WordType = "email" | "link" | "word" | "newline";

export interface ClassifiedWord {
  type: WordType;
  value: string;
}

export type TUploadFilesResponse = {
  width: number;
  height: number;
  url: string;
  type?: 'image' | 'video';
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

  media: TPostMedia;
  link: { id: string; url: string; createdAt: Date; data: Result };
  id: string;
  content: string;
  commentCount: number;
  commented?: boolean;
  profileId: string | null;
  createdAt: Date;
  updatedAt: Date;
  liked?: boolean;
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

export type GetCommentWithProfile = TComment & {
  username: string;
  displayName: string;
  profileImage: string;
  media: TPostMedia | null;
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
export type GetAllProjects = TProject & {
  thumbnail: string;
  attachments?: Array<{
    id: string;
    url: string;
    type: "image" | "video";
    width: number;
    height: number;
  }> | null;
};

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

export const profileSchema = z.object({
  email: z.string().email().optional(),
  image: z.string().url().optional(),
  displayName: z.string().min(5).max(25).optional(),
  isOnboarded: z.boolean().optional(),
  username: z.string().min(5).max(20).optional(),

  profileImage: z.string().optional(),
  bio: z.string().max(200, "Bio must be 200 characters or less").optional(),
  hasCompletedWalkthrough: z.boolean().optional(),
  isLive: z.boolean().optional(),
  website: z.string().url().optional(),
  location: z.string().optional(),
  personalMission: z.string().optional(),
  lifePhilosophy: z.string().optional(),
  age: z.number().int().min(0).max(120).optional(),
});

export const AddCommentPayload = z.object({
  content: z.string().min(2).max(1200),
  profileId: z.string().uuid(),
  url: z.string().optional(),
  data: z.any().optional(),
  media: z
    .object({
      width: z.number(),
      height: z.number(),
      url: z.string().url(),
    })
    .optional(),
  postId: z.string().uuid(),
});

export type TAddNewComment = z.infer<typeof AddCommentPayload>;

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

export const fileSchema = z.object({
  url: z.string().url(),
  height: z.number(),
  width: z.number(),
  type: z.string().optional(),
});
export const newProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  url: z.string(),
  description: z.string(),
  startDate: z.string(),
  tagline: z
    .string()
    .min(1, "Tagline is required")
    .max(60, "Tagline must not exceed 60 characters"),
  endDate: z.string().optional(),
  // logo is optional now
  logo: z.string().url("Invalid URL").optional(),
  width: z.string().optional(),
  height: z.string().optional(),
  media: z.array(fileSchema).optional(),
});



export const updateBasicInfoSchema = z.object({
  displayName: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  personalMission: z.string().optional(),
  lifePhilosophy: z.string().optional(),
  age: z.number().optional(),
});

export const addExperienceSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .describe("The job title or position held (e.g., 'Software Engineer')"),
  company: z
    .string()
    .min(1, "Company is required")
    .describe("The name of the company or organization"),
  location: z
    .string()
    .optional()
    .describe("The geographic location (e.g., 'San Francisco, CA' or 'Remote')"),
  employmentType: z
    .string()
    .optional()
    .describe("The type of employment (e.g., 'Full-time', 'Contract')"),
  startDate: z
    .string()
    .optional()
    .describe("When you started this role (e.g., 'Jan 2022' or '2022-01-01')"),
  endDate: z
    .string()
    .optional()
    .describe(
      "When you ended this role. Leave empty if currently working there."
    ),
  currentlyWorking: z
    .boolean()
    .default(false)
    .describe("Whether you are still in this role"),
  website: z
    .string()
    .url()
    .optional()
    .describe("The company website or a link to the project/role"),
  companyLogo: z
    .string()
    .optional()
    .describe("The media ID or URL for the company logo"),
  description: z
    .string()
    .optional()
    .describe(
      "Key responsibilities, achievements, or technologies used in this role"
    ),
});

export const updateExperienceSchema = addExperienceSchema.partial().extend({
  id: z.string(),
});

export const deleteExperienceSchema = z.object({
  id: z.string(),
  title: z.string().optional(), // For UI display in confirmation
  company: z.string().optional(), // For UI display in confirmation
});


export const addEducationSchema = z.object({
  school: z
    .string()
    .min(1, "School name is required")
    .describe("The name of the educational institution"),
  degree: z
    .string()
    .optional()
    .describe("The degree obtained (e.g., 'Bachelor of Science')"),
  fieldOfStudy: z
    .string()
    .optional()
    .describe("The field of study or major (e.g., 'Computer Science')"),
  startDate: z
    .string()
    .optional()
    .describe("When you started your studies"),
  endDate: z
    .string()
    .optional()
    .describe("When you finished or expect to finish"),
  grade: z
    .string()
    .optional()
    .describe("GPA or equivalent academic grade"),
  description: z
    .string()
    .optional()
    .describe("Honors, extracurriculars, or relevant coursework"),
});

export const updateEducationSchema = addEducationSchema.partial().extend({
  id: z.string(),
});

export const deleteEducationSchema = z.object({
  id: z.string(),
  school: z.string().optional(), // For UI display in confirmation
});

export const addCertificateSchema = z.object({
  name: z
    .string()
    .min(1, "Certificate name is required")
    .describe("The name of the certificate or certification"),
  issuer: z
    .string()
    .min(1, "Issuer is required")
    .describe("The organization that issued the certificate"),
  issueDate: z
    .string()
    .optional()
    .describe("When the certificate was issued"),
  expiryDate: z
    .string()
    .optional()
    .describe("When the certificate expires (if applicable)"),
  credentialId: z
    .string()
    .optional()
    .describe("The credential ID or certificate number"),
  credentialUrl: z
    .string()
    .url()
    .optional()
    .describe("URL to verify the certificate online"),
  fileUrl: z
    .string()
    .url()
    .optional()
    .describe("URL to the certificate file/document"),
  description: z
    .string()
    .optional()
    .describe("Additional details about the certificate"),
});

export const updateCertificateSchema = addCertificateSchema.partial().extend({
  id: z.string(),
});

export const deleteCertificateSchema = z.object({
  id: z.string(),
  name: z.string().optional(), // For UI display in confirmation
});


export const addStoryElementSchema = z.object({
  type: z.enum(["mission", "value", "milestone", "dream", "superpower"]),
  title: z.string(),
  content: z.string(),
});

export const addProjectSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .describe("The name of the project"),
  tagline: z
    .string()
    .optional()
    .describe("A short one-liner description of the project"),
  description: z
    .string()
    .min(1, "Description is required")
    .describe("Detailed description of what the project does"),
  url: z
    .string()
    .url()
    .optional()
    .describe("The project's URL or repository link"),
  status: z
    .enum(["wip", "completed", "archived"])
    .default("completed")
    .describe("The current status of the project"),
  logo: z
    .string()
    .optional()
    .describe("The media ID or URL for the project logo"),
  startDate: z.string().optional().describe("When the project started"),
  endDate: z.string().optional().describe("When the project ended or was shipped"),
});

export const updateProjectSchema = addProjectSchema.partial().extend({
  id: z.string(),
});

export const deleteProjectSchema = z.object({
  id: z.string(),
  name: z.string().optional(), // For UI display in confirmation
});

export const addGalleryItemSchema = z.object({
  attachmentIds: z.array(z.string()).min(1).describe("An array of attachment IDs (filenames or identifiers) from the user's message to add to the gallery."),
});

export const deleteGalleryItemSchema = z.object({
  ids: z.array(z.string()).describe("The UUIDs of the media items to delete"),
});


export type Tool<TArgs> = {
  args: TArgs;
};

export type Metadata = {
  isWelcomeMessage?: boolean;
};


// export type ChatToolUIPart = ToolUIPart<{
//   delete_file: {
//     input: DeleteFileInput;
//     output: { success: boolean; message: string };
//   };
// }>;


export type ChatMessage<T extends UITools = any> = UIMessage<Metadata, never, T> & {
  attachments?: any[];
  experimental_attachments?: any[];
};
