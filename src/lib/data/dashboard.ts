import { and, asc, eq, lte, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import {
  groups,
  practiceItems,
  practiceSessions,
  userStats,
  vocabularyEntries,
  vocabularyReviewStats,
} from '@/lib/db/schema'
import { startOfDayInTimeZone, endOfDayInTimeZone } from '@/lib/date'

export type DuePreviewEntry = {
  id: string
  term: string
  definition: string
  partOfSpeech?: string | null
}

export async function getDueWordsPreview(
  userId: string,
  limit = 3
): Promise<DuePreviewEntry[]> {
  const rows = await db
    .select({
      id: vocabularyEntries.id,
      term: vocabularyEntries.term,
      definition: vocabularyEntries.definition,
      partOfSpeech: vocabularyEntries.partOfSpeech,
      nextReviewAt: vocabularyReviewStats.nextReviewAt,
    })
    .from(vocabularyReviewStats)
    .innerJoin(
      vocabularyEntries,
      eq(vocabularyReviewStats.vocabularyId, vocabularyEntries.id)
    )
    .where(
      and(
        eq(vocabularyEntries.userId, userId),
        lte(vocabularyReviewStats.nextReviewAt, new Date())
      )
    )
    .orderBy(asc(vocabularyReviewStats.nextReviewAt))
    .limit(limit)

  return rows.map((r) => ({
    id: r.id,
    term: r.term,
    definition: r.definition,
    partOfSpeech: r.partOfSpeech,
  }))
}

export async function getDashboardSummary(userId: string, timeZone = 'UTC') {
  const now = new Date()
  const todayStart = startOfDayInTimeZone(now, timeZone)
  const todayEnd = endOfDayInTimeZone(now, timeZone)

  const totalVocabulary = await db
    .select({ count: sql<number>`count(*)` })
    .from(vocabularyEntries)
    .where(eq(vocabularyEntries.userId, userId))
    .then((rows) => Number(rows[0]?.count ?? 0))

  const totalGroups = await db
    .select({ count: sql<number>`count(*)` })
    .from(groups)
    .where(eq(groups.userId, userId))
    .then((rows) => Number(rows[0]?.count ?? 0))

  // Count words due for review (nextReviewAt <= now)
  const dueToday = await db
    .select({ count: sql<number>`count(*)` })
    .from(vocabularyReviewStats)
    .innerJoin(
      vocabularyEntries,
      eq(vocabularyReviewStats.vocabularyId, vocabularyEntries.id)
    )
    .where(
      and(
        eq(vocabularyEntries.userId, userId),
        lte(vocabularyReviewStats.nextReviewAt, now)
      )
    )
    .then((rows) => Number(rows[0]?.count ?? 0))

  // Count reviews done today
  const reviewedToday = await db
    .select({ count: sql<number>`count(*)` })
    .from(practiceItems)
    .innerJoin(
      practiceSessions,
      eq(practiceItems.practiceSessionId, practiceSessions.id)
    )
    .where(
      and(
        eq(practiceSessions.userId, userId),
        sql`${practiceItems.reviewedAt} >= ${todayStart}`,
        sql`${practiceItems.reviewedAt} < ${todayEnd}`
      )
    )
    .then((rows) => Number(rows[0]?.count ?? 0))

  const stats = await db
    .select({ streakDays: userStats.streakDays, dailyGoal: userStats.dailyGoal })
    .from(userStats)
    .where(eq(userStats.userId, userId))
    .limit(1)
    .then((rows) => rows[0])

  return {
    totalVocabulary,
    totalGroups,
    dueToday,
    reviewedToday,
    streakDays: stats?.streakDays ?? 0,
    dailyGoal: stats?.dailyGoal ?? 10,
  }
}
