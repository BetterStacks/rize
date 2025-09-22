import { relations } from 'drizzle-orm'
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
} from 'drizzle-orm/pg-core'
// Define account types for better-auth compatibility
export type AccountType = 'oauth' | 'oidc' | 'email' | 'webauthn'
import { Result } from 'url-metadata'
import { v4 as gen_uuid, v4 } from 'uuid'

export type TPronouns = 'he/him' | 'she/her' | 'they/them' | 'other';
export type Media = 'image' | 'video';
export type TPageMedia = 'thumbnail' | 'content-media';
export type TPageStatus = 'draft' | 'published';
export type TProjectStatus = 'wip' | 'completed' | 'archived';

const Pronouns = customType<{ data: TPronouns }>({
  dataType() {
    return 'text'
  },
})
const MediaType = customType<{ data: Media }>({
  dataType() {
    return 'text'
  },
})
const PageStatus = customType<{ data: TPageStatus }>({
  dataType() {
    return 'text'
  },
})
const ProjectStatus = customType<{ data: TProjectStatus }>({
  dataType() {
    return 'text'
  },
})

export const users = pgTable('user', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => v4()),
  name: text('name'),
  email: text('email').unique(),
  password: text('password'),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  isOnboarded: boolean('is_onboarded').notNull().default(false),
  isClaimed: boolean('is_claimed').notNull().default(true),
  resumeFileId: text('resume_file_id'),
  claimToken: text('claim_token'),
  letrazId: text('letraz_id'),
})

export const profile = pgTable('profile', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => v4()),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  profileImage: text('profile_image'),
  displayName: varchar('display_name', { length: 30 }),
  username: varchar('username', { length: 20 }).unique(),
  age: integer('age').notNull().default(18),
  pronouns: Pronouns('pronouns').notNull().default('he/him'),
  bio: text('bio'),
  location: text('location'),
  personalMission: text('personal_mission'),
  lifePhilosophy: text('life_philosophy'),
  hasCompletedWalkthrough: boolean('has_completed_walkthrough')
    .notNull()
    .default(false),
  website: text('website'),
  isLive: boolean('is_live').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .$onUpdate(() => new Date()),
})

export const sections = pgTable('sections', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => v4()),
  profileId: uuid('profile_id')
    .notNull()
    .references(() => profile.id, { onDelete: 'cascade' }),
  slug: varchar('slug', { length: 50 }).notNull(),
  enabled: boolean('enabled').notNull().default(true),
  order: integer('order').notNull(),
})

export const socialLinks = pgTable('social_links', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => v4()),
  profileId: uuid('profile_id')
    .notNull()
    .references(() => profile.id, { onDelete: 'cascade' }),
  platform: text('platform').notNull(),
  url: text('url').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .$onUpdate(() => new Date()),
})

export const media = pgTable('media', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => v4()),
  url: text('url').notNull(),
  type: MediaType('type').notNull(),
  width: integer('width').notNull(),
  height: integer('height').notNull(),
  profileId: uuid('profile_id')
    .notNull()
    .references(() => profile.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const gallery = pgTable('gallery', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => v4()),
  profileId: uuid('profile_id')
    .notNull()
    .references(() => profile.id, { onDelete: 'cascade' }),
  layout: text('layout').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const galleryMedia = pgTable('gallery_media', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => v4()),
  galleryId: uuid('gallery_id').references(() => gallery.id, {
    onDelete: 'cascade',
  }),
  mediaId: uuid('media_id').references(() => media.id, { onDelete: 'cascade' }),
})

export const posts = pgTable('posts', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => gen_uuid()),
  content: text('content'),
  profileId: uuid('profileId').references(() => profile.id, {
    onDelete: 'cascade',
  }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const postLinks = pgTable('post_links', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => gen_uuid()),
  postId: uuid('postId').references(() => posts.id, {
    onDelete: 'cascade',
  }),
  url: text('url').notNull(),
  data: jsonb('data').$type<Result | null>().notNull().default(null),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const likes = pgTable(
  'likes',
  {
    profileId: uuid('profile_id')
      .references(() => profile.id, { onDelete: 'cascade' })
      .notNull(),
    postId: uuid('post_id')
      .references(() => posts.id, { onDelete: 'cascade' })
      .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.profileId, table.postId] }),
    }
  }
)

export const comments = pgTable('comments', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => gen_uuid()),
  profileId: uuid('profile_id')
    .references(() => profile.id)
    .notNull(),
  postId: uuid('post_id')
    .references(() => posts.id)
    .notNull(),
  content: text('content').notNull(),
  url: text('url'),
  mediaId: uuid('media_id').references(() => media.id, {
    onDelete: 'set null',
  }),
  data: jsonb('data').$type<Result | null>().notNull().default(null),

  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
})
export const bookmarks = pgTable(
  'bookmarks',
  {
    profileId: uuid('profile_id')
      .references(() => profile.id)
      .notNull(),
    postId: uuid('post_id')
      .references(() => posts.id)
      .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.profileId, table.postId] }),
    }
  }
)

export const postMedia = pgTable('post_media', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => gen_uuid()),
  postId: uuid('postId').references(() => posts.id, {
    onDelete: 'cascade',
  }),
  mediaId: uuid('mediaId').references(() => media.id, {
    onDelete: 'cascade',
  }),
})
export const page = pgTable('page', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => gen_uuid()),
  thumbnail: uuid('thumbnail').references(() => media.id, {
    onDelete: 'cascade',
  }),
  title: varchar('title', { length: 120 }).notNull(),
  content: text('content').notNull(),
  profileId: uuid('profileId').references(() => profile.id, {
    onDelete: 'cascade',
  }),
  status: PageStatus('status').notNull().default('draft'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .$onUpdate(() => new Date()),
})

export const projects = pgTable('projects', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => gen_uuid()),
  name: varchar('name', { length: 120 }).notNull(),
  description: text('description').notNull(),
  profileId: uuid('profileId').references(() => profile.id, {
    onDelete: 'cascade',
  }),
  status: ProjectStatus('status').notNull().default('wip'),
  logo: uuid('logo').references(() => media.id, {
    onDelete: 'cascade',
  }),
  url: text('url'),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
})

export const education = pgTable('education', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => gen_uuid()),
  profileId: uuid('profileId')
    .notNull()
    .references(() => profile.id, { onDelete: 'cascade' }),
  school: varchar('school', { length: 255 }).notNull(),
  degree: varchar('degree', { length: 255 }),
  fieldOfStudy: varchar('field_of_study', { length: 255 }),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  grade: varchar('grade', { length: 50 }),

  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const experience = pgTable('experience', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => gen_uuid()),
  profileId: uuid('profileId')
    .notNull()
    .references(() => profile.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  company: varchar('company', { length: 255 }).notNull(),
  location: varchar('location', { length: 255 }),
  employmentType: varchar('employment_type', { length: 100 }),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  currentlyWorking: boolean('currently_working').notNull().default(false),
  companyLogo: uuid('company_logo').references(() => media.id, {
    onDelete: 'cascade',
  }),
  website: text('website'),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const profileSections = pgTable('profile_sections', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => gen_uuid()),
  profileId: uuid('profile_id')
    .notNull()
    .references(() => profile.id),
  slug: text('slug').unique().notNull(),
  enabled: boolean('enabled').notNull().default(true),
  order: integer('order').notNull(),
})

export const storyElements = pgTable('story_elements', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => gen_uuid()),
  profileId: uuid('profile_id')
    .notNull()
    .references(() => profile.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(), // 'mission', 'value', 'milestone', 'dream', 'superpower'
  title: varchar('title', { length: 200 }).notNull(),
  content: text('content').notNull(),
  order: integer('order').notNull().default(0),
  isPublic: boolean('is_public').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .$onUpdate(() => new Date()),
})

export const postMediaRelations = relations(postMedia, ({ one }) => ({
  posts: one(posts, {
    fields: [postMedia.postId],
    references: [posts.id],
  }),
  media: one(media, {
    fields: [postMedia.mediaId],
    references: [media.id],
  }),
}))
export const experienceRelations = relations(experience, ({ one }) => ({
  profile: one(profile, {
    fields: [experience.profileId],
    references: [profile.id],
  }),
}))

export const educationRelations = relations(education, ({ one }) => ({
  profile: one(profile, {
    fields: [education.profileId],
    references: [profile.id],
  }),
}))
const galleryRelations = relations(gallery, ({ one }) => ({
  profile: one(profile, {
    fields: [gallery.profileId],
    references: [profile.id],
  }),
}))
const mediaRelations = relations(media, ({ one }) => ({
  profile: one(profile, {
    fields: [media.profileId],
    references: [profile.id],
  }),
  gallery: one(gallery, {
    fields: [media.id],
    references: [gallery.id],
  }),
}))
const socialLinksRelations = relations(socialLinks, ({ one }) => ({
  profile: one(profile, {
    fields: [socialLinks.profileId],
    references: [profile.id],
  }),
}))
const profileRelations = relations(profile, ({ many, one }) => ({
  user: one(users, {
    fields: [profile.userId],
    references: [users.id],
  }),
  socialLinks: many(socialLinks),
  media: many(media),
  gallery: many(gallery),
  galleryMedia: many(galleryMedia),
  experience: many(experience),
  education: many(education),
  projects: many(projects),
  sections: many(profileSections),
  storyElements: many(storyElements),
  page: many(page),
}))

const storyElementsRelations = relations(storyElements, ({ one }) => ({
  profile: one(profile, {
    fields: [storyElements.profileId],
    references: [profile.id],
  }),
}))
const usersRelations = relations(users, ({ many }) => ({
  profiles: many(profile),
}))
const postsRelations = relations(posts, ({ one, many }) => ({
  profile: one(profile, {
    fields: [posts.profileId],
    references: [profile.id],
  }),
  media: many(postMedia),
}))
// Better-auth required tables
export const accounts = pgTable('account', {
  id: text('id').primaryKey().$defaultFn(() => v4()),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const sessions = pgTable('session', {
  id: text('id').primaryKey().$defaultFn(() => v4()),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey().$defaultFn(() => v4()),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// Analytics tables
export const profileViews = pgTable('profile_views', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => v4()),
  profileId: uuid('profile_id')
    .notNull()
    .references(() => profile.id, { onDelete: 'cascade' }),
  viewerProfileId: uuid('viewer_profile_id')
    .references(() => profile.id, { onDelete: 'cascade' }), // null if anonymous
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  referrer: text('referrer'),
  country: text('country'),
  city: text('city'),
  viewedAt: timestamp('viewed_at').notNull().defaultNow(),
})

export const engagementMetrics = pgTable('engagement_metrics', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => v4()),
  profileId: uuid('profile_id')
    .notNull()
    .references(() => profile.id, { onDelete: 'cascade' }),
  date: timestamp('date').notNull().defaultNow(),
  totalViews: integer('total_views').notNull().default(0),
  uniqueViews: integer('unique_views').notNull().default(0),
  totalLikes: integer('total_likes').notNull().default(0),
  totalComments: integer('total_comments').notNull().default(0),
  totalBookmarks: integer('total_bookmarks').notNull().default(0),
  profileClicks: integer('profile_clicks').notNull().default(0), // clicks on social links, projects, etc.
})

export const clickTracking = pgTable('click_tracking', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => v4()),
  profileId: uuid('profile_id')
    .notNull()
    .references(() => profile.id, { onDelete: 'cascade' }),
  elementType: varchar('element_type', { length: 50 }).notNull(), // 'social_link', 'project', 'writing', 'email', etc.
  elementId: uuid('element_id'), // reference to specific element (project, social link, etc.)
  clickedAt: timestamp('clicked_at').notNull().defaultNow(),
  clickerProfileId: uuid('clicker_profile_id')
    .references(() => profile.id, { onDelete: 'cascade' }), // null if anonymous
  ipAddress: text('ip_address'),
})

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
}))

const engagementMetricsRelations = relations(engagementMetrics, ({ one }) => ({
  profile: one(profile, {
    fields: [engagementMetrics.profileId],
    references: [profile.id],
  }),
}))

const clickTrackingRelations = relations(clickTracking, ({ one }) => ({
  profile: one(profile, {
    fields: [clickTracking.profileId],
    references: [profile.id],
  }),
  clicker: one(profile, {
    fields: [clickTracking.clickerProfileId],
    references: [profile.id],
  }),
}))
