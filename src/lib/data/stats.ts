import { and, eq, gte, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import {
  practiceItems,
  practiceSessions,
  vocabularyEntries,
  vocabularyReviewStats,
} from '@/lib/db/schema'
import { dayKeyInTimeZone, previousDayKey } from '@/lib/date'

export type LearningStats = {
  totalVocabulary: number
  dueToday: number
  overallAccuracy: number
  masteryDistribution: {
    label: string
    count: number
    color: string
  }[]
  weakWords: {
    id: string
    term: string
    definition: string
    accuracy: number
    totalReviews: number
  }[]
  recentActivity: {
    date: string
    count: number
  }[]
}

export async function getLearningStats(
  userId: string,
  timeZone = 'UTC'
): Promise<LearningStats> {
  const now = new Date()

  const totalVocabulary = await db
    .select({ count: sql<number>`count(*)` })
    .from(vocabularyEntries)
    .where(eq(vocabularyEntries.userId, userId))
    .then((rows) => Number(rows[0]?.count ?? 0))

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
        sql`${vocabularyReviewStats.nextReviewAt} <= ${now}`
      )
    )
    .then((rows) => Number(rows[0]?.count ?? 0))

  const allStats = await db
    .select({
      totalReviews: vocabularyReviewStats.totalReviews,
      totalCorrect: vocabularyReviewStats.totalCorrect,
      intervalDays: vocabularyReviewStats.intervalDays,
      easeFactor: vocabularyReviewStats.easeFactor,
      vocabularyId: vocabularyReviewStats.vocabularyId,
      term: vocabularyEntries.term,
      definition: vocabularyEntries.definition,
    })
    .from(vocabularyReviewStats)
    .innerJoin(
      vocabularyEntries,
      eq(vocabularyReviewStats.vocabularyId, vocabularyEntries.id)
    )
    .where(eq(vocabularyEntries.userId, userId))

  const totalReviews = allStats.reduce((s, r) => s + r.totalReviews, 0)
  const totalCorrect = allStats.reduce((s, r) => s + r.totalCorrect, 0)
  const overallAccuracy =
    totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0

  const newCount = allStats.filter((r) => r.intervalDays === 1).length
  const learningCount = allStats.filter(
    (r) => r.intervalDays >= 2 && r.intervalDays <= 6
  ).length
  const reviewingCount = allStats.filter(
    (r) => r.intervalDays >= 7 && r.intervalDays <= 20
  ).length
  const masteredCount = allStats.filter((r) => r.intervalDays > 20).length

  const weakWords = allStats
    .filter((r) => r.totalReviews > 0)
    .map((r) => ({
      id: r.vocabularyId,
      term: r.term,
      definition: r.definition,
      accuracy:
        r.totalReviews > 0
          ? Math.round((r.totalCorrect / r.totalReviews) * 100)
          : 0,
      totalReviews: r.totalReviews,
    }))
    .filter((r) => r.accuracy < 70)
    .sort((a, b) => a.accuracy - b.accuracy || b.totalReviews - a.totalReviews)
    .slice(0, 10)

  // Recent activity: last 14 days, in the user's timezone.
  const dayKeys: string[] = []
  let key = dayKeyInTimeZone(now, timeZone)
  for (let i = 0; i < 14; i++) {
    dayKeys.unshift(key)
    key = previousDayKey(key)
  }
  const days = dayKeys.map((date) => ({ date, count: 0 }))

  const sessions = await db
    .select({
      date: practiceSessions.date,
      count: sql<number>`count(${practiceItems.id})`,
    })
    .from(practiceSessions)
    .leftJoin(
      practiceItems,
      eq(practiceItems.practiceSessionId, practiceSessions.id)
    )
    .where(
      and(
        eq(practiceSessions.userId, userId),
        gte(practiceSessions.date, days[0].date)
      )
    )
    .groupBy(practiceSessions.date)

  const sessionMap = new Map(sessions.map((s) => [s.date, Number(s.count)]))
  const recentActivity = days.map((d) => ({
    date: d.date,
    count: sessionMap.get(d.date) ?? 0,
  }))

  return {
    totalVocabulary,
    dueToday,
    overallAccuracy,
    masteryDistribution: [
      { label: 'New', count: newCount, color: 'bg-error' },
      { label: 'Learning', count: learningCount, color: 'bg-warning' },
      { label: 'Reviewing', count: reviewingCount, color: 'bg-accent' },
      { label: 'Mastered', count: masteredCount, color: 'bg-success' },
    ],
    weakWords,
    recentActivity,
  }
}
