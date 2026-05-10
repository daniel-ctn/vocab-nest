import { and, eq, isNotNull, lte } from 'drizzle-orm'
import { db } from '@/lib/db'
import {
  groups,
  practiceItems,
  practiceSessions,
  userStats,
  vocabularyEntries,
} from '@/lib/db/schema'

export async function getDashboardSummary(userId: string) {
  const now = new Date()
  const today = now.toISOString().slice(0, 10)

  const totalVocabulary = await db
    .select()
    .from(vocabularyEntries)
    .where(eq(vocabularyEntries.userId, userId))
    .then((rows) => rows.length)

  const totalGroups = await db
    .select()
    .from(groups)
    .where(eq(groups.userId, userId))
    .then((rows) => rows.length)

  const todaySession = await db
    .select({ id: practiceSessions.id })
    .from(practiceSessions)
    .where(
      and(eq(practiceSessions.userId, userId), eq(practiceSessions.date, today))
    )
    .limit(1)
    .then((rows) => rows[0] ?? null)

  let dueToday = 0
  let reviewedToday = 0

  if (todaySession) {
    dueToday = await db
      .select()
      .from(practiceItems)
      .where(
        and(
          eq(practiceItems.practiceSessionId, todaySession.id),
          lte(practiceItems.dueAt, now)
        )
      )
      .then((rows) => rows.length)

    reviewedToday = await db
      .select()
      .from(practiceItems)
      .where(
        and(
          eq(practiceItems.practiceSessionId, todaySession.id),
          isNotNull(practiceItems.reviewedAt)
        )
      )
      .then((rows) => rows.length)
  }

  const stats = await db
    .select({ streakDays: userStats.streakDays })
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
  }
}
