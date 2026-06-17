'use server'

import { and, eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import {
  practiceItems,
  practiceSessions,
  userStats,
  vocabularyReviewStats,
} from '@/lib/db/schema'
import { requireUser } from '@/lib/session'
import { getTimeZone } from '@/lib/timezone'
import { dayKeyInTimeZone, previousDayKey } from '@/lib/date'
import { PracticeReviewRequestSchema } from '@/lib/contracts'
import { calculateNextReview, type ReviewGrade } from '@/lib/data/practice'

export async function reviewPracticeItem(
  practiceId: string,
  itemId: string,
  input: unknown
) {
  const user = await requireUser()
  const data = PracticeReviewRequestSchema.parse(input)

  const session = await db
    .select({ id: practiceSessions.id })
    .from(practiceSessions)
    .where(
      and(
        eq(practiceSessions.id, practiceId),
        eq(practiceSessions.userId, user.id)
      )
    )
    .limit(1)
    .then((rows) => rows[0])

  if (!session) {
    throw new Error('Practice session not found.')
  }

  const item = await db
    .select({ id: practiceItems.id, vocabularyId: practiceItems.vocabularyId })
    .from(practiceItems)
    .where(
      and(
        eq(practiceItems.id, itemId),
        eq(practiceItems.practiceSessionId, practiceId)
      )
    )
    .limit(1)
    .then((rows) => rows[0])

  if (!item) {
    throw new Error('Practice item not found.')
  }

  const now = new Date()
  const grade = data.grade as ReviewGrade
  const remembered = grade >= 2

  await db
    .update(practiceItems)
    .set({
      reviewedAt: now,
      remembered,
      grade,
      answer: data.answer ?? null,
    })
    .where(eq(practiceItems.id, itemId))

  await db
    .update(practiceSessions)
    .set({ status: 'in_progress', updatedAt: now })
    .where(eq(practiceSessions.id, practiceId))

  // Apply spaced repetition algorithm
  const statsRow = await db
    .select()
    .from(vocabularyReviewStats)
    .where(eq(vocabularyReviewStats.vocabularyId, item.vocabularyId))
    .limit(1)
    .then((rows) => rows[0])

  if (statsRow) {
    const next = calculateNextReview(grade, {
      intervalDays: statsRow.intervalDays,
      easeFactor: statsRow.easeFactor,
      consecutiveCorrect: statsRow.consecutiveCorrect,
    })

    const nextReviewAt = new Date(now)
    nextReviewAt.setDate(nextReviewAt.getDate() + next.intervalDays)

    await db
      .update(vocabularyReviewStats)
      .set({
        nextReviewAt,
        intervalDays: next.intervalDays,
        easeFactor: next.easeFactor,
        consecutiveCorrect: next.consecutiveCorrect,
        totalReviews: statsRow.totalReviews + 1,
        totalCorrect: statsRow.totalCorrect + (remembered ? 1 : 0),
        updatedAt: now,
      })
      .where(eq(vocabularyReviewStats.vocabularyId, item.vocabularyId))
  }
}

export async function completePractice(practiceId: string) {
  const user = await requireUser()

  const session = await db
    .select()
    .from(practiceSessions)
    .where(
      and(
        eq(practiceSessions.id, practiceId),
        eq(practiceSessions.userId, user.id)
      )
    )
    .limit(1)
    .then((rows) => rows[0])

  if (!session) {
    throw new Error('Practice session not found.')
  }

  if (session.status === 'completed') {
    return
  }

  const now = new Date()
  const tz = await getTimeZone()
  const today = dayKeyInTimeZone(now, tz)

  await db
    .update(practiceSessions)
    .set({ status: 'completed', updatedAt: now })
    .where(eq(practiceSessions.id, practiceId))

  const reviewedCountResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(practiceItems)
    .where(
      and(
        eq(practiceItems.practiceSessionId, practiceId),
        sql`${practiceItems.reviewedAt} is not null`
      )
    )
    .then((rows) => Number(rows[0]?.count ?? 0))

  if (reviewedCountResult > 0) {
    const yesterdayStr = previousDayKey(today)
    const dayBeforeStr = previousDayKey(yesterdayStr)

    await db.transaction(async (tx) => {
      const stats = await tx
        .select()
        .from(userStats)
        .where(eq(userStats.userId, user.id))
        .limit(1)
        .then((rows) => rows[0])

      if (!stats) return

      let streak = stats.streakDays
      let freezes = stats.streakFreezes
      if (stats.lastPracticeDate === today) {
        // Already practiced today — keep the streak unchanged.
      } else if (stats.lastPracticeDate === yesterdayStr) {
        streak += 1
      } else if (stats.lastPracticeDate === dayBeforeStr && freezes > 0) {
        // Missed exactly one day — spend a freeze to keep the streak alive.
        streak += 1
        freezes -= 1
      } else {
        streak = 1
      }

      await tx
        .update(userStats)
        .set({
          streakDays: streak,
          longestStreak: Math.max(stats.longestStreak, streak),
          streakFreezes: freezes,
          lastPracticeDate: today,
        })
        .where(eq(userStats.userId, user.id))
    })
  }

  revalidatePath('/practice')
  revalidatePath('/dashboard')
  if (session.groupId) {
    revalidatePath(`/practice?group=${session.groupId}`)
  }
}
