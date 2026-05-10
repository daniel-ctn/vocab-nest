'use server'

import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { practiceItems, practiceSessions, userStats } from '@/lib/db/schema'
import { getCurrentUser } from '@/lib/session'
import { PracticeReviewRequestSchema } from '@/lib/contracts'

export async function reviewPracticeItem(
  practiceId: string,
  itemId: string,
  input: unknown
) {
  const user = await getCurrentUser()
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
    .select({ id: practiceItems.id })
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

  await db
    .update(practiceItems)
    .set({
      reviewedAt: now,
      remembered: data.remembered,
      answer: data.answer ?? null,
    })
    .where(eq(practiceItems.id, itemId))

  await db
    .update(practiceSessions)
    .set({ status: 'in_progress', updatedAt: now })
    .where(eq(practiceSessions.id, practiceId))
}

export async function completePractice(practiceId: string) {
  const user = await getCurrentUser()

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
  const today = now.toISOString().slice(0, 10)

  await db
    .update(practiceSessions)
    .set({ status: 'completed', updatedAt: now })
    .where(eq(practiceSessions.id, practiceId))

  const reviewedCount = await db
    .select()
    .from(practiceItems)
    .where(eq(practiceItems.practiceSessionId, practiceId))
    .then((rows) => rows.filter((r) => r.reviewedAt !== null).length)

  if (reviewedCount > 0) {
    const stats = await db
      .select()
      .from(userStats)
      .where(eq(userStats.userId, user.id))
      .limit(1)
      .then((rows) => rows[0])

    if (stats) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().slice(0, 10)

      let streak = stats.streakDays
      if (stats.lastPracticeDate === yesterdayStr) {
        streak += 1
      } else if (stats.lastPracticeDate !== today) {
        streak = 1
      }

      await db
        .update(userStats)
        .set({ streakDays: streak, lastPracticeDate: today })
        .where(eq(userStats.userId, user.id))
    }
  }

  revalidatePath('/practice')
  revalidatePath('/dashboard')
}
