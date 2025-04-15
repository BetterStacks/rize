import {
  boolean,
  customType,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";
import { v4 as gen_uuid, v4 } from "uuid";

export type TPronouns = "he/him" | "she/her" | "they/them" | "other";
export type Media = "image" | "video";
export type TPageMedia = "thumbnail" | "content-media";
export type TPageStatus = "draft" | "published";
export type TProjectStatus = "wip" | "completed" | "archived";

const Pronouns = customType<{ data: TPronouns }>({
  dataType() {
    return "text";
  },
});
const MediaType = customType<{ data: Media }>({
  dataType() {
    return "text";
  },
});
const PageMediaType = customType<{ data: TPageMedia }>({
  dataType() {
    return "text";
  },
});
const PageStatus = customType<{ data: TPageStatus }>({
  dataType() {
    return "text";
  },
});
const ProjectStatus = customType<{ data: TProjectStatus }>({
  dataType() {
    return "text";
  },
});

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => v4()),
  name: text("name"),
  email: text("email").unique(),
  password: text("password"),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  isOnboarded: boolean("is_onboarded").notNull().default(false),
});

export const profile = pgTable("profile", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => v4()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  profileImage: text("profile_image"),
  displayName: varchar("display_name", { length: 30 }),
  username: varchar("username", { length: 20 }).unique(),
  age: integer("age").notNull().default(18),
  pronouns: Pronouns("pronouns").notNull().default("he/him"),
  bio: text("bio"),
  location: text("location"),
  website: text("website"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

export const sections = pgTable("sections", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => v4()),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profile.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const socialLinks = pgTable("social_links", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => v4()),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profile.id, { onDelete: "cascade" }),
  platform: text("platform").notNull(),
  url: text("url").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

export const media = pgTable("media", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => v4()),
  url: text("url").notNull(),
  type: MediaType("type").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profile.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const gallery = pgTable("gallery", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => v4()),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profile.id, { onDelete: "cascade" }),
  layout: text("layout").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const galleryMedia = pgTable("gallery_media", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => v4()),
  galleryId: uuid("gallery_id").references(() => gallery.id, {
    onDelete: "cascade",
  }),
  mediaId: uuid("media_id").references(() => media.id, { onDelete: "cascade" }),
});

export const page = pgTable("page", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => gen_uuid()),
  title: varchar("title", { length: 120 }).notNull(),
  content: text("content").notNull(),
  profileId: uuid("profileId").references(() => profile.id, {
    onDelete: "cascade",
  }),
  status: PageStatus("status").notNull().default("draft"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

export const pageMedia = pgTable("page_media", {
  pageId: uuid("page_id")
    .notNull()
    .references(() => page.id, {
      onDelete: "cascade",
    }),
  mediaId: uuid("media_id")
    .notNull()
    .references(() => media.id, {
      onDelete: "cascade",
    }),
  type: PageMediaType("type").notNull().default("content-media"),
});

export const projects = pgTable("projects", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => gen_uuid()),
  name: varchar("name", { length: 120 }).notNull(),
  description: text("description").notNull(),
  profileId: uuid("profileId").references(() => profile.id, {
    onDelete: "cascade",
  }),
  status: ProjectStatus("status").notNull().default("wip"),
  logo: uuid("logo")
    .notNull()
    .references(() => media.id, {
      onDelete: "cascade",
    }),
  url: text("url"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    {
      compoundKey: primaryKey({
        columns: [account.provider, account.providerAccountId],
      }),
    },
  ]
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => [
    {
      compositePk: primaryKey({
        columns: [verificationToken.identifier, verificationToken.token],
      }),
    },
  ]
);

export const authenticators = pgTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports"),
  },
  (authenticator) => [
    {
      compositePK: primaryKey({
        columns: [authenticator.userId, authenticator.credentialID],
      }),
    },
  ]
);
