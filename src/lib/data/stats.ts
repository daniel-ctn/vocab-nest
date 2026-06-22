import { and, eq, gte, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import {
  practiceItems,
  practiceSessions,
  userStats,
  vocabularyEntries,
  vocabularyReviewStats,
} from '@/lib/db/schema'
import { dayKeyInTimeZone, nextDayKey, previousDayKey } from '@/lib/date'
import { rootingTier } from '@/lib/rooting'

export type LearningStats = {
  totalVocabulary: number
  dueToday: number
  overallAccuracy: number
  longestStreak: number
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
  /** ~16 weeks of daily review counts for a calendar heatmap. */
  heatmap: {
    date: string
    count: number
  }[]
  /** Upcoming review load. */
  forecast: {
    dueIn7: number
    dueIn30: number
    upcoming: { date: string; count: number }[]
  }
  achievements: {
    label: string
    achieved: boolean
    hint: string
  }[]
}

export async function getLearningStats(
  userId: string,
  timeZone = 'UTC'
): Promise<LearningStats> {
  const now = new Date()

  // Activity heatmap key range: last 16 weeks, in the user's timezone.
  // Computed up front so the heatmap query can join the parallel batch below.
  const HEATMAP_DAYS = 112
  const heatKeys: string[] = []
  let hk = dayKeyInTimeZone(now, timeZone)
  for (let i = 0; i < HEATMAP_DAYS; i++) {
    heatKeys.unshift(hk)
    hk = previousDayKey(hk)
  }

  // All five reads are independent — run them concurrently.
  const [totalVocabulary, dueToday, allStats, sessions, streakRow] =
    await Promise.all([
      db
        .select({ count: sql<number>`count(*)` })
        .from(vocabularyEntries)
        .where(eq(vocabularyEntries.userId, userId))
        .then((rows) => Number(rows[0]?.count ?? 0)),

      db
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
        .then((rows) => Number(rows[0]?.count ?? 0)),

      db
        .select({
          totalReviews: vocabularyReviewStats.totalReviews,
          totalCorrect: vocabularyReviewStats.totalCorrect,
          intervalDays: vocabularyReviewStats.intervalDays,
          easeFactor: vocabularyReviewStats.easeFactor,
          nextReviewAt: vocabularyReviewStats.nextReviewAt,
          vocabularyId: vocabularyReviewStats.vocabularyId,
          term: vocabularyEntries.term,
          definition: vocabularyEntries.definition,
        })
        .from(vocabularyReviewStats)
        .innerJoin(
          vocabularyEntries,
          eq(vocabularyReviewStats.vocabularyId, vocabularyEntries.id)
        )
        .where(eq(vocabularyEntries.userId, userId)),

      db
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
            gte(practiceSessions.date, heatKeys[0])
          )
        )
        .groupBy(practiceSessions.date),

      db
        .select({ longestStreak: userStats.longestStreak })
        .from(userStats)
        .where(eq(userStats.userId, userId))
        .limit(1)
        .then((rows) => rows[0]),
    ])

  const totalReviews = allStats.reduce((s, r) => s + r.totalReviews, 0)
  const totalCorrect = allStats.reduce((s, r) => s + r.totalCorrect, 0)
  const overallAccuracy =
    totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0

  const tierCounts: [number, number, number, number] = [0, 0, 0, 0]
  for (const r of allStats) tierCounts[rootingTier(r.intervalDays)]++
  const [newCount, learningCount, reviewingCount, masteredCount] = tierCounts

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

  const sessionMap = new Map(sessions.map((s) => [s.date, Number(s.count)]))
  const heatmap = heatKeys.map((date) => ({
    date,
    count: sessionMap.get(date) ?? 0,
  }))
  const recentActivity = heatmap.slice(-14)

  // Review-load forecast from each card's next review date.
  const in7 = new Date(now.getTime() + 7 * 86_400_000)
  const in30 = new Date(now.getTime() + 30 * 86_400_000)
  let dueIn7 = 0
  let dueIn30 = 0
  const upcomingKeys: string[] = []
  let uk = dayKeyInTimeZone(now, timeZone)
  for (let i = 0; i < 14; i++) {
    upcomingKeys.push(uk)
    uk = nextDayKey(uk)
  }
  const upcomingMap = new Map(upcomingKeys.map((k) => [k, 0]))
  for (const r of allStats) {
    const at = r.nextReviewAt
    if (at <= in7) dueIn7++
    if (at <= in30) dueIn30++
    // Overdue cards count toward today.
    const k = dayKeyInTimeZone(at < now ? now : at, timeZone)
    if (upcomingMap.has(k)) upcomingMap.set(k, (upcomingMap.get(k) ?? 0) + 1)
  }
  const upcoming = upcomingKeys.map((date) => ({
    date,
    count: upcomingMap.get(date) ?? 0,
  }))

  // Streak + achievements (computed on read, no extra tables).
  const longestStreak = streakRow?.longestStreak ?? 0

  const achievements = [
    {
      label: 'First word',
      achieved: totalVocabulary >= 1,
      hint: 'Collect your first word',
    },
    {
      label: 'Ten words',
      achieved: totalVocabulary >= 10,
      hint: '10 words collected',
    },
    {
      label: 'A hundred',
      achieved: totalVocabulary >= 100,
      hint: '100 words collected',
    },
    {
      label: 'Week streak',
      achieved: longestStreak >= 7,
      hint: 'A 7-day streak',
    },
    {
      label: 'Month streak',
      achieved: longestStreak >= 30,
      hint: 'A 30-day streak',
    },
    {
      label: 'Sharp eye',
      achieved: totalReviews >= 20 && overallAccuracy >= 90,
      hint: '90% accuracy over 20+ reviews',
    },
    {
      label: 'Rooted',
      achieved: masteredCount >= 10,
      hint: '10 words mastered',
    },
    {
      label: 'All caught up',
      achieved: totalVocabulary > 0 && dueToday === 0,
      hint: 'No words due for review',
    },
  ]

  return {
    totalVocabulary,
    dueToday,
    overallAccuracy,
    longestStreak,
    masteryDistribution: [
      { label: 'New', count: newCount, color: 'bg-error' },
      { label: 'Learning', count: learningCount, color: 'bg-warning' },
      { label: 'Reviewing', count: reviewingCount, color: 'bg-accent' },
      { label: 'Mastered', count: masteredCount, color: 'bg-success' },
    ],
    weakWords,
    recentActivity,
    heatmap,
    forecast: { dueIn7, dueIn30, upcoming },
    achievements,
  }
}
