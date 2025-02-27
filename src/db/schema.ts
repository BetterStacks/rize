import {
  boolean,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";
import { customType } from "drizzle-orm/pg-core";
import { v4 as gen_uuid, v4 } from "uuid";

type TPronouns = "he/him" | "she/her" | "they/them" | "other";
type TMedia = "image" | "video";

const Pronouns = customType<{ data: TPronouns }>({
  dataType() {
    return "text";
  },
});
const MediaType = customType<{ data: TMedia }>({
  dataType() {
    return "text";
  },
});

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  password: text("password"),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
});

export const profile = pgTable("profile", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  username: varchar("username", { length: 20 }).unique(),
  age: integer("age").notNull().default(18),
  pronouns: Pronouns("pronouns").notNull().default("he/him"),
  bio: varchar("bio", { length: 150 }),
  location: text("location"),
  website: text("website"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

export const socialLinks = pgTable("social_links", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => v4()),
  name: varchar("name", { length: 50 }).notNull().unique(), // e.g., "LinkedIn", "GitHub"
  icon: text("icon"), // Optional: Store icon URLs or icon class names
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const gallery = pgTable("gallery", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => v4()),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profile.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

export const galleryMedia = pgTable("gallery_media", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => v4()),
  galleryId: uuid("gallery_id").references(() => gallery.id, {
    onDelete: "cascade",
  }),
  url: text("url").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

export const profileSocialLinks = pgTable("profile_social_links", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => v4()),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profile.id, { onDelete: "cascade" }),
  socialLinksId: uuid("social_links_id")
    .notNull()
    .references(() => socialLinks.id, { onDelete: "cascade" }),
  url: text("url").notNull(), // User-provided link
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const experience = pgTable("experience", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => v4()),
  profileId: uuid("profile_id").references(() => profile.id, {
    onDelete: "cascade",
  }),
  companyName: varchar("company_name", { length: 25 }).notNull(),
  website: text("website"),
  position: varchar("position", { length: 40 }).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

export const page = pgTable("page", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => gen_uuid()),
  title: varchar("title", { length: 60 }).notNull(),
  thumbnail: text("thumbnail"),
  content: text("content").notNull(),
  profileId: uuid("profileId").references(() => profile.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

export const skill = pgTable("skill", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  icon: text("icon").notNull(),
  name: text("name").notNull(),
});

export const profileToSkills = pgTable(
  "skill",
  {
    profileId: text("profileId")
      .notNull()
      .references(() => profile.id, { onDelete: "cascade" }),
    skillId: text("skillId")
      .notNull()
      .references(() => skill.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.profileId, table.skillId] }),
  })
);

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
