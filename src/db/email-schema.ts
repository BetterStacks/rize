import { pgTable, text, timestamp, uuid, varchar, boolean, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { v4 } from "uuid";
import { users } from "./schema";

export type EmailTemplate = 'welcome' | 'followUp' | 'weekly_digest' | 'feature_announcement';
export type EmailStatus = 'scheduled' | 'sent' | 'failed' | 'bounced' | 'opened' | 'clicked';

// Email tracking table for analytics and preventing spam
export const emailTracking = pgTable("email_tracking", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => v4()),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  template: varchar("template", { length: 50 }).notNull().$type<EmailTemplate>(),
  status: varchar("status", { length: 20 }).notNull().default("scheduled").$type<EmailStatus>(),
  
  // Email metadata
  subject: text("subject"),
  sentAt: timestamp("sent_at"),
  scheduledFor: timestamp("scheduled_for"),
  
  // Engagement tracking
  openedAt: timestamp("opened_at"),
  clickedAt: timestamp("clicked_at"),
  
  // Error handling
  errorMessage: text("error_message"),
  retryCount: integer("retry_count").notNull().default(0),
  
  // Metadata
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

// User email preferences
export const emailPreferences = pgTable("email_preferences", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => v4()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
  
  // Email type preferences
  onboardingEmails: boolean("onboarding_emails").notNull().default(true),
  weeklyDigest: boolean("weekly_digest").notNull().default(true),
  featureAnnouncements: boolean("feature_announcements").notNull().default(true),
  marketingEmails: boolean("marketing_emails").notNull().default(false),
  
  // Global unsubscribe
  unsubscribedAt: timestamp("unsubscribed_at"),
  unsubscribeToken: text("unsubscribe_token").unique(),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

// Scheduled email jobs (for background processing)
export const emailJobs = pgTable("email_jobs", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => v4()),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  template: varchar("template", { length: 50 }).notNull().$type<EmailTemplate>(),
  
  // Job scheduling
  scheduledFor: timestamp("scheduled_for").notNull(),
  processedAt: timestamp("processed_at"),
  
  // Job data (JSON payload for email generation)
  payload: text("payload").notNull(), // JSON string with user data
  
  // Job status
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  attempts: integer("attempts").notNull().default(0),
  maxAttempts: integer("max_attempts").notNull().default(3),
  
  // Error handling
  lastError: text("last_error"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

// Relations
export const emailTrackingRelations = relations(emailTracking, ({ one }) => ({
  user: one(users, {
    fields: [emailTracking.userId],
    references: [users.id],
  }),
}));

export const emailPreferencesRelations = relations(emailPreferences, ({ one }) => ({
  user: one(users, {
    fields: [emailPreferences.userId],
    references: [users.id],
  }),
}));

export const emailJobsRelations = relations(emailJobs, ({ one }) => ({
  user: one(users, {
    fields: [emailJobs.userId],
    references: [users.id],
  }),
}));