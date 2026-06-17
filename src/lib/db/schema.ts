import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core'

// Better Auth tables
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull().default(''),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  idToken: text('id_token'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// App tables
export const vocabularyEntries = pgTable(
  'vocabulary_entries',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    term: text('term').notNull(),
    definition: text('definition').notNull(),
    language: text('language'),
    partOfSpeech: text('part_of_speech'),
    pronunciation: text('pronunciation'),
    notes: text('notes'),
    etymology: text('etymology'),
    mnemonic: text('mnemonic'),
    examples: jsonb('examples').$type<string[]>().notNull().default([]),
    synonyms: jsonb('synonyms').$type<string[]>().notNull().default([]),
    antonyms: jsonb('antonyms').$type<string[]>().notNull().default([]),
    tags: jsonb('tags').$type<string[]>().notNull().default([]),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [index('vocab_user_idx').on(t.userId)]
)

export const groups = pgTable(
  'groups',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [index('groups_user_idx').on(t.userId)]
)

export const vocabularyGroups = pgTable(
  'vocabulary_groups',
  {
    vocabularyId: text('vocabulary_id')
      .notNull()
      .references(() => vocabularyEntries.id, { onDelete: 'cascade' }),
    groupId: text('group_id')
      .notNull()
      .references(() => groups.id, { onDelete: 'cascade' }),
  },
  (t) => [
    primaryKey({ columns: [t.vocabularyId, t.groupId] }),
    index('vocab_groups_group_idx').on(t.groupId),
    index('vocab_groups_vocab_idx').on(t.vocabularyId),
  ]
)

export const practiceSessions = pgTable(
  'practice_sessions',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    groupId: text('group_id').references(() => groups.id, {
      onDelete: 'cascade',
    }),
    date: text('date').notNull(),
    status: text('status').notNull().default('pending'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [
    index('practice_sessions_user_date_idx').on(t.userId, t.date),
    uniqueIndex('practice_sessions_user_date_group_uidx').on(
      t.userId,
      t.date,
      t.groupId
    ),
  ]
)

export const practiceItems = pgTable(
  'practice_items',
  {
    id: text('id').primaryKey(),
    practiceSessionId: text('practice_session_id')
      .notNull()
      .references(() => practiceSessions.id, { onDelete: 'cascade' }),
    vocabularyId: text('vocabulary_id')
      .notNull()
      .references(() => vocabularyEntries.id, { onDelete: 'cascade' }),
    prompt: text('prompt').notNull(),
    dueAt: timestamp('due_at').notNull(),
    reviewedAt: timestamp('reviewed_at'),
    remembered: boolean('remembered'),
    answer: text('answer'),
  },
  (t) => [
    index('practice_items_session_idx').on(t.practiceSessionId),
    index('practice_items_vocab_idx').on(t.vocabularyId),
  ]
)

export const userStats = pgTable(
  'user_stats',
  {
    userId: text('user_id')
      .primaryKey()
      .references(() => user.id, { onDelete: 'cascade' }),
    streakDays: integer('streak_days').notNull().default(0),
    lastPracticeDate: text('last_practice_date'),
    dailyGoal: integer('daily_goal').notNull().default(10),
  },
  (t) => [index('user_stats_user_idx').on(t.userId)]
)

export const vocabularyReviewStats = pgTable(
  'vocabulary_review_stats',
  {
    vocabularyId: text('vocabulary_id')
      .primaryKey()
      .references(() => vocabularyEntries.id, { onDelete: 'cascade' }),
    nextReviewAt: timestamp('next_review_at').notNull().defaultNow(),
    intervalDays: integer('interval_days').notNull().default(1),
    easeFactor: integer('ease_factor').notNull().default(250), // stored as hundredths (2.50 = 250)
    consecutiveCorrect: integer('consecutive_correct').notNull().default(0),
    totalReviews: integer('total_reviews').notNull().default(0),
    totalCorrect: integer('total_correct').notNull().default(0),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [
    index('review_stats_vocab_idx').on(t.vocabularyId),
    index('review_stats_next_review_idx').on(t.nextReviewAt),
  ]
)

export const subscriptions = pgTable(
  'subscriptions',
  {
    userId: text('user_id')
      .primaryKey()
      .references(() => user.id, { onDelete: 'cascade' }),
    stripeCustomerId: text('stripe_customer_id').notNull(),
    stripeSubscriptionId: text('stripe_subscription_id'),
    stripePriceId: text('stripe_price_id'),
    status: text('status').notNull().default('inactive'),
    currentPeriodEnd: timestamp('current_period_end'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [index('subscriptions_user_idx').on(t.userId)]
)
