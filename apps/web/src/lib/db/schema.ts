import {
  boolean,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const vocabularyEntries = pgTable("vocabulary_entries", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  term: text("term").notNull(),
  definition: text("definition").notNull(),
  language: text("language"),
  partOfSpeech: text("part_of_speech"),
  examples: jsonb("examples").notNull().default([]),
  tags: jsonb("tags").notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const groups = pgTable("groups", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const vocabularyGroups = pgTable(
  "vocabulary_groups",
  {
    vocabularyId: text("vocabulary_id")
      .notNull()
      .references(() => vocabularyEntries.id, { onDelete: "cascade" }),
    groupId: text("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.vocabularyId, t.groupId] })],
);

export const practiceSessions = pgTable("practice_sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const practiceItems = pgTable("practice_items", {
  id: text("id").primaryKey(),
  practiceSessionId: text("practice_session_id")
    .notNull()
    .references(() => practiceSessions.id, { onDelete: "cascade" }),
  vocabularyId: text("vocabulary_id")
    .notNull()
    .references(() => vocabularyEntries.id, { onDelete: "cascade" }),
  prompt: text("prompt").notNull(),
  dueAt: timestamp("due_at").notNull(),
  reviewedAt: timestamp("reviewed_at"),
  remembered: boolean("remembered"),
  answer: text("answer"),
});

export const userStats = pgTable("user_stats", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  streakDays: integer("streak_days").notNull().default(0),
  lastPracticeDate: text("last_practice_date"),
});
