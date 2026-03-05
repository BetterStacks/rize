import { EmploymentType as TEmploymentType } from "@/lib/types";
import { relations } from "drizzle-orm";
import {
  boolean,
  customType,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
// Define account types for better-auth compatibility
export type AccountType = "oauth" | "oidc" | "email" | "webauthn";
import { Result } from "url-metadata";
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
const EmploymentType = customType<{ data: TEmploymentType }>({
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
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  isOnboarded: boolean("is_onboarded").notNull().default(false),
  isClaimed: boolean("is_claimed").notNull().default(true),
  resumeFileId: text("resume_file_id"),
  claimToken: text("claim_token"),
  letrazId: text("letraz_id"),
  phoneNumber: text("phoneNumber").unique(),
  phoneNumberVerified: boolean("phoneNumberVerified").notNull().default(false),
  onboardingCallId: text("onboarding_call_id"),
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
  personalMission: text("personal_mission"),
  lifePhilosophy: text("life_philosophy"),
  hasCompletedWalkthrough: boolean("has_completed_walkthrough")
    .notNull()
    .default(false),
  website: text("website"),
  isLive: boolean("is_live").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const sections = pgTable("sections", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => v4()),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profile.id, { onDelete: "cascade" }),
  slug: varchar("slug", { length: 50 }).notNull(),
  enabled: boolean("enabled").notNull().default(true),
  order: integer("order").notNull(),
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
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const media = pgTable("media", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => v4()),
  url: text("url").notNull(),
  type: MediaType("type").notNull(),
  width: integer("width"),
  height: integer("height"),
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

export const posts = pgTable("posts", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => gen_uuid()),
  content: text("content"),
  profileId: uuid("profileId").references(() => profile.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const postLinks = pgTable("post_links", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => gen_uuid()),
  postId: uuid("postId").references(() => posts.id, {
    onDelete: "cascade",
  }),
  url: text("url").notNull(),
  data: jsonb("data").$type<Result | null>().notNull().default(null),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const postVotes = pgTable(
  "post_votes",
  {
    profileId: uuid("profile_id")
      .references(() => profile.id, { onDelete: "cascade" })
      .notNull(),
    postId: uuid("post_id")
      .references(() => posts.id, { onDelete: "cascade" })
      .notNull(),
    value: integer("value").notNull().default(1), // 1 for upvote, -1 for downvote
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.profileId, table.postId] }),
    };
  },
);

export const comments = pgTable("comments", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => gen_uuid()),
  profileId: uuid("profile_id")
    .references(() => profile.id)
    .notNull(),
  postId: uuid("post_id")
    .references(() => posts.id)
    .notNull(),
  content: text("content").notNull(),
  url: text("url"),
  mediaId: uuid("media_id").references(() => media.id, {
    onDelete: "set null",
  }),
  data: jsonb("data").$type<Result | null>().notNull().default(null),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
export const bookmarks = pgTable(
  "bookmarks",
  {
    profileId: uuid("profile_id")
      .references(() => profile.id)
      .notNull(),
    postId: uuid("post_id")
      .references(() => posts.id)
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.profileId, table.postId] }),
    };
  },
);

export const projectBookmarks = pgTable(
  "project_bookmarks",
  {
    profileId: uuid("profile_id")
      .references(() => profile.id, { onDelete: "cascade" })
      .notNull(),
    projectId: uuid("project_id")
      .references(() => projects.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.profileId, table.projectId] }),
    };
  },
);

export const postMedia = pgTable("post_media", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => gen_uuid()),
  postId: uuid("postId").references(() => posts.id, {
    onDelete: "cascade",
  }),
  mediaId: uuid("mediaId").references(() => media.id, {
    onDelete: "cascade",
  }),
});
export const page = pgTable("page", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => gen_uuid()),
  thumbnail: uuid("thumbnail").references(() => media.id, {
    onDelete: "cascade",
  }),
  title: varchar("title", { length: 120 }).notNull(),
  content: text("content").notNull(),
  profileId: uuid("profileId").references(() => profile.id, {
    onDelete: "cascade",
  }),
  status: PageStatus("status").notNull().default("draft"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const pageRelations = relations(page, ({ one }) => ({
  profile: one(profile, {
    fields: [page.profileId],
    references: [profile.id],
  }),
}));

export const projects = pgTable("projects", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => gen_uuid()),
  name: varchar("name", { length: 120 }).notNull(),
  tagline: varchar("tagline", { length: 60 }).notNull().default(""),
  description: text("description").notNull(),
  profileId: uuid("profileId").references(() => profile.id, {
    onDelete: "cascade",
  }),
  status: ProjectStatus("status").notNull().default("wip"),
  logo: uuid("logo").references(() => media.id, {
    onDelete: "cascade",
  }),
  url: text("url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const projectTopics = pgTable(
  "project_topics",
  {
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),

    topicId: uuid("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.projectId, t.topicId] }),
  }),
);

export const skills = pgTable("skills", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
});

export const projectSkills = pgTable(
  "project_skills",
  {
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    skillId: uuid("skill_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.projectId, t.skillId] }),
  }),
);

export const projectCollaborators = pgTable(
  "project_collaborators",
  {
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profile.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.projectId, t.profileId] }),
  }),
);

export const projectCollaboratorsRelations = relations(
  projectCollaborators,
  ({ one }) => ({
    project: one(projects, {
      fields: [projectCollaborators.projectId],
      references: [projects.id],
    }),
    profile: one(profile, {
      fields: [projectCollaborators.profileId],
      references: [profile.id],
    }),
  }),
);

export const profileSkills = pgTable(
  "profile_skills",
  {
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profile.id, { onDelete: "cascade" }),
    skillId: uuid("skill_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.profileId, t.skillId] }),
  }),
);

export const projectMedia = pgTable("project_media", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => gen_uuid()),
  projectId: uuid("project_id").references(() => projects.id, {
    onDelete: "cascade",
  }),
  mediaId: uuid("media_id").references(() => media.id, {
    onDelete: "cascade",
  }),
});

export const projectVotes = pgTable(
  "project_votes",
  {
    profileId: uuid("profile_id")
      .references(() => profile.id, { onDelete: "cascade" })
      .notNull(),
    projectId: uuid("project_id")
      .references(() => projects.id, { onDelete: "cascade" })
      .notNull(),
    value: integer("value").notNull().default(1), // 1 for upvote, -1 for downvote
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.profileId, table.projectId] }),
    };
  },
);

export const education = pgTable("education", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => gen_uuid()),
  profileId: uuid("profileId")
    .notNull()
    .references(() => profile.id, { onDelete: "cascade" }),
  school: varchar("school", { length: 255 }).notNull(),
  degree: varchar("degree", { length: 255 }),
  fieldOfStudy: varchar("field_of_study", { length: 255 }),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  grade: varchar("grade", { length: 50 }),

  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const experience = pgTable("experience", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => gen_uuid()),
  profileId: uuid("profileId")
    .notNull()
    .references(() => profile.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  company: varchar("company", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }),
  employmentType: EmploymentType("employment_type").notNull().default("Full-time"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  currentlyWorking: boolean("currently_working").notNull().default(false),
  companyLogo: uuid("company_logo").references(() => media.id, {
    onDelete: "cascade",
  }),
  website: text("website"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const certificates = pgTable("certificates", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => gen_uuid()),
  profileId: uuid("profileId")
    .notNull()
    .references(() => profile.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  fileUrl: text("file_url").notNull(), // Required PDF file
  issuer: varchar("issuer", { length: 255 }),
  issueDate: timestamp("issue_date"),
  expiryDate: timestamp("expiry_date"),
  credentialId: varchar("credential_id", { length: 255 }),
  credentialUrl: text("credential_url"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const profileSections = pgTable("profile_sections", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => gen_uuid()),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profile.id),
  slug: text("slug").unique().notNull(),
  enabled: boolean("enabled").notNull().default(true),
  order: integer("order").notNull(),
});

export const profileSectionsRelations = relations(
  profileSections,
  ({ one }) => ({
    profile: one(profile, {
      fields: [profileSections.profileId],
      references: [profile.id],
    }),
  }),
);

export const storyElements = pgTable("story_elements", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => gen_uuid()),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profile.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull(), // 'mission', 'value', 'milestone', 'dream', 'superpower'
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content").notNull(),
  order: integer("order").notNull().default(0),
  isPublic: boolean("is_public").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const postMediaRelations = relations(postMedia, ({ one }) => ({
  posts: one(posts, {
    fields: [postMedia.postId],
    references: [posts.id],
  }),
  media: one(media, {
    fields: [postMedia.mediaId],
    references: [media.id],
  }),
}));

export const projectMediaRelations = relations(projectMedia, ({ one }) => ({
  projects: one(projects, {
    fields: [projectMedia.projectId],
    references: [projects.id],
  }),
  media: one(media, {
    fields: [projectMedia.mediaId],
    references: [media.id],
  }),
}));

export const projectTopicsRelations = relations(projectTopics, ({ one }) => ({
  project: one(projects, {
    fields: [projectTopics.projectId],
    references: [projects.id],
  }),

  topic: one(topics, {
    fields: [projectTopics.topicId],
    references: [topics.id],
  }),
}));

export const skillsRelations = relations(skills, ({ many }) => ({
  projects: many(projectSkills),
  profiles: many(profileSkills),
}));

export const projectSkillsRelations = relations(projectSkills, ({ one }) => ({
  project: one(projects, {
    fields: [projectSkills.projectId],
    references: [projects.id],
  }),
  skill: one(skills, {
    fields: [projectSkills.skillId],
    references: [skills.id],
  }),
}));

export const profileSkillsRelations = relations(profileSkills, ({ one }) => ({
  profile: one(profile, {
    fields: [profileSkills.profileId],
    references: [profile.id],
  }),
  skill: one(skills, {
    fields: [profileSkills.skillId],
    references: [skills.id],
  }),
}));

export const postVotesRelations = relations(postVotes, ({ one }) => ({
  profile: one(profile, {
    fields: [postVotes.profileId],
    references: [profile.id],
  }),
  post: one(posts, {
    fields: [postVotes.postId],
    references: [posts.id],
  }),
}));

export const projectVotesRelations = relations(projectVotes, ({ one }) => ({
  profile: one(profile, {
    fields: [projectVotes.profileId],
    references: [profile.id],
  }),
  project: one(projects, {
    fields: [projectVotes.projectId],
    references: [projects.id],
  }),
}));

export const experienceRelations = relations(experience, ({ one }) => ({
  profile: one(profile, {
    fields: [experience.profileId],
    references: [profile.id],
  }),
}));

export const educationRelations = relations(education, ({ one }) => ({
  profile: one(profile, {
    fields: [education.profileId],
    references: [profile.id],
  }),
}));

export const certificatesRelations = relations(certificates, ({ one }) => ({
  profile: one(profile, {
    fields: [certificates.profileId],
    references: [profile.id],
  }),
}));
export const galleryRelations = relations(gallery, ({ one }) => ({
  profile: one(profile, {
    fields: [gallery.profileId],
    references: [profile.id],
  }),
}));
export const mediaRelations = relations(media, ({ one, many }) => ({
  profile: one(profile, {
    fields: [media.profileId],
    references: [profile.id],
  }),
  galleryMedia: many(galleryMedia),
}));

export const galleryMediaRelations = relations(galleryMedia, ({ one }) => ({
  gallery: one(gallery, {
    fields: [galleryMedia.galleryId],
    references: [gallery.id],
  }),
  media: one(media, {
    fields: [galleryMedia.mediaId],
    references: [media.id],
  }),
}));
export const socialLinksRelations = relations(socialLinks, ({ one }) => ({
  profile: one(profile, {
    fields: [socialLinks.profileId],
    references: [profile.id],
  }),
}));
export const profileRelations = relations(profile, ({ many, one }) => ({
  user: one(users, {
    fields: [profile.userId],
    references: [users.id],
  }),
  socialLinks: many(socialLinks),
  media: many(media),
  gallery: many(gallery),
  experience: many(experience),
  education: many(education),
  certificates: many(certificates),
  projects: many(projects),
  projectVotes: many(projectVotes),
  sections: many(profileSections),
  storyElements: many(storyElements),
  page: many(page),
  skills: many(profileSkills),
  votes: many(postVotes),
}));

export const storyElementsRelations = relations(storyElements, ({ one }) => ({
  profile: one(profile, {
    fields: [storyElements.profileId],
    references: [profile.id],
  }),
}));
export const usersRelations = relations(users, ({ many }) => ({
  profiles: many(profile),
}));
export const postsRelations = relations(posts, ({ one, many }) => ({
  profile: one(profile, {
    fields: [posts.profileId],
    references: [profile.id],
  }),
  media: many(postMedia),
  topics: many(postTopics),
  votes: many(postVotes),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  profile: one(profile, {
    fields: [projects.profileId],
    references: [profile.id],
  }),
  media: many(projectMedia),
  votes: many(projectVotes),
  topics: many(projectTopics),
  skills: many(projectSkills),
  collaborators: many(projectCollaborators),
}));

// ── Topics ────────────────────────────────────────────────────────────────
export const topics = pgTable("topics", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  emoji: text("emoji"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/** Many-to-many: posts ↔ topics */
export const postTopics = pgTable(
  "post_topics",
  {
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    topicId: uuid("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
  },
  (t) => ({ pk: primaryKey({ columns: [t.postId, t.topicId] }) }),
);

/** Users can subscribe to topics for their personalised feed */
export const profileTopicSubscriptions = pgTable(
  "profile_topic_subscriptions",
  {
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profile.id, { onDelete: "cascade" }),
    topicId: uuid("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.profileId, t.topicId] }) }),
);

/** Users can follow other profiles (for personalised feed) */
export const profileFollows = pgTable(
  "profile_follows",
  {
    followerId: uuid("follower_id")
      .notNull()
      .references(() => profile.id, { onDelete: "cascade" }),
    followingId: uuid("following_id")
      .notNull()
      .references(() => profile.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.followerId, t.followingId] }) }),
);

// Relations
export const topicsRelations = relations(topics, ({ many }) => ({
  posts: many(postTopics),
  projects: many(projectTopics),
  subscribers: many(profileTopicSubscriptions),
}));

export const postTopicsRelations = relations(postTopics, ({ one }) => ({
  post: one(posts, { fields: [postTopics.postId], references: [posts.id] }),
  topic: one(topics, { fields: [postTopics.topicId], references: [topics.id] }),
}));

export const profileTopicSubscriptionsRelations = relations(
  profileTopicSubscriptions,
  ({ one }) => ({
    profile: one(profile, {
      fields: [profileTopicSubscriptions.profileId],
      references: [profile.id],
    }),
    topic: one(topics, {
      fields: [profileTopicSubscriptions.topicId],
      references: [topics.id],
    }),
  }),
);

export const profileFollowsRelations = relations(profileFollows, ({ one }) => ({
  follower: one(profile, {
    fields: [profileFollows.followerId],
    references: [profile.id],
    relationName: "follower",
  }),
  following: one(profile, {
    fields: [profileFollows.followingId],
    references: [profile.id],
    relationName: "following",
  }),
}));

// ── Custom Feeds ───────────────────────────────────────────────────────────
export const customFeeds = pgTable("custom_feeds", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profile.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 100 }).notNull(),
  description: text("description"),
  isPublic: boolean("is_public").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const customFeedTopics = pgTable(
  "custom_feed_topics",
  {
    feedId: uuid("feed_id")
      .notNull()
      .references(() => customFeeds.id, { onDelete: "cascade" }),
    topicId: uuid("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
  },
  (t) => ({ pk: primaryKey({ columns: [t.feedId, t.topicId] }) }),
);

export const customFeedProfiles = pgTable(
  "custom_feed_profiles",
  {
    feedId: uuid("feed_id")
      .notNull()
      .references(() => customFeeds.id, { onDelete: "cascade" }),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profile.id, { onDelete: "cascade" }),
  },
  (t) => ({ pk: primaryKey({ columns: [t.feedId, t.profileId] }) }),
);

export const customFeedsRelations = relations(customFeeds, ({ one, many }) => ({
  profile: one(profile, {
    fields: [customFeeds.profileId],
    references: [profile.id],
  }),
  topics: many(customFeedTopics),
  profiles: many(customFeedProfiles),
}));

export const customFeedTopicsRelations = relations(
  customFeedTopics,
  ({ one }) => ({
    feed: one(customFeeds, {
      fields: [customFeedTopics.feedId],
      references: [customFeeds.id],
    }),
    topic: one(topics, {
      fields: [customFeedTopics.topicId],
      references: [topics.id],
    }),
  }),
);

export const customFeedProfilesRelations = relations(
  customFeedProfiles,
  ({ one }) => ({
    feed: one(customFeeds, {
      fields: [customFeedProfiles.feedId],
      references: [customFeeds.id],
    }),
    profile: one(profile, {
      fields: [customFeedProfiles.profileId],
      references: [profile.id],
    }),
  }),
);
// Better-auth required tables
export const accounts = pgTable("account", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => v4()),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const sessions = pgTable("session", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => v4()),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const verification = pgTable("verification", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => v4()),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

// Analytics tables
export const profileViews = pgTable("profile_views", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => v4()),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profile.id, { onDelete: "cascade" }),
  viewerProfileId: uuid("viewer_profile_id").references(() => profile.id, {
    onDelete: "cascade",
  }), // null if anonymous
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  country: text("country"),
  city: text("city"),
  viewedAt: timestamp("viewed_at").notNull().defaultNow(),
});

export const engagementMetrics = pgTable("engagement_metrics", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => v4()),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profile.id, { onDelete: "cascade" }),
  date: timestamp("date").notNull().defaultNow(),
  totalViews: integer("total_views").notNull().default(0),
  uniqueViews: integer("unique_views").notNull().default(0),
  totalVotes: integer("total_votes").notNull().default(0),
  totalComments: integer("total_comments").notNull().default(0),
  totalBookmarks: integer("total_bookmarks").notNull().default(0),
  profileClicks: integer("profile_clicks").notNull().default(0), // clicks on social links, projects, etc.
});

export const clickTracking = pgTable("click_tracking", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => v4()),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profile.id, { onDelete: "cascade" }),
  elementType: varchar("element_type", { length: 50 }).notNull(), // 'social_link', 'project', 'writing', 'email', etc.
  elementId: uuid("element_id"), // reference to specific element (project, social link, etc.)
  clickedAt: timestamp("clicked_at").notNull().defaultNow(),
  clickerProfileId: uuid("clicker_profile_id").references(() => profile.id, {
    onDelete: "cascade",
  }), // null if anonymous
  ipAddress: text("ip_address"),
});

// Analytics relations
const profileViewsRelations = relations(profileViews, ({ one }) => ({
  profile: one(profile, {
    fields: [profileViews.profileId],
    references: [profile.id],
  }),
  viewer: one(profile, {
    fields: [profileViews.viewerProfileId],
    references: [profile.id],
  }),
}));

const engagementMetricsRelations = relations(engagementMetrics, ({ one }) => ({
  profile: one(profile, {
    fields: [engagementMetrics.profileId],
    references: [profile.id],
  }),
}));

const clickTrackingRelations = relations(clickTracking, ({ one }) => ({
  profile: one(profile, {
    fields: [clickTracking.profileId],
    references: [profile.id],
  }),
  clicker: one(profile, {
    fields: [clickTracking.clickerProfileId],
    references: [profile.id],
  }),
}));

// Roast Analytics tables
export const roastAnalytics = pgTable("roast_analytics", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => v4()),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profile.id, { onDelete: "cascade" }),
  totalRoasts: integer("total_roasts").notNull().default(0),
  firstRoastAt: timestamp("first_roast_at"),
  lastRoastAt: timestamp("last_roast_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

export const roastHistory = pgTable("roast_history", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => v4()),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profile.id, { onDelete: "cascade" }),
  roastedAt: timestamp("roasted_at").notNull().defaultNow(),
});
