import { and, eq, inArray, isNull, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import {
  practiceItems,
  practiceSessions,
  vocabularyEntries,
  vocabularyGroups,
  vocabularyReviewStats,
} from '@/lib/db/schema'
import type { PracticeSession } from '@/lib/contracts'
import { dayKeyInTimeZone } from '@/lib/date'

export type TodayPractice = {
  session: PracticeSession
  definitions: Record<string, string>
}

function calculateNextReview(
  remembered: boolean,
  current: {
    intervalDays: number
    easeFactor: number
    consecutiveCorrect: number
  }
) {
  let interval = current.intervalDays
  let ease = current.easeFactor
  let streak = current.consecutiveCorrect

  if (remembered) {
    streak += 1
    if (streak === 1) {
      interval = 1
    } else if (streak === 2) {
      interval = 3
    } else {
      interval = Math.max(1, Math.round(interval * (ease / 100)))
    }
    ease = Math.min(250, ease + 10)
  } else {
    streak = 0
    interval = 1
    ease = Math.max(130, ease - 20)
  }

  return {
    intervalDays: interval,
    easeFactor: ease,
    consecutiveCorrect: streak,
  }
}

export { calculateNextReview }

export async function getOrCreateTodayPractice(
  userId: string,
  groupId?: string,
  timeZone = 'UTC'
): Promise<TodayPractice | null> {
  const now = new Date()
  const today = dayKeyInTimeZone(now, timeZone)

  const sessionWhere = groupId
    ? and(
        eq(practiceSessions.userId, userId),
        eq(practiceSessions.date, today),
        eq(practiceSessions.groupId, groupId)
      )
    : and(
        eq(practiceSessions.userId, userId),
        eq(practiceSessions.date, today),
        isNull(practiceSessions.groupId)
      )

  let session = await db
    .select()
    .from(practiceSessions)
    .where(sessionWhere)
    .limit(1)
    .then((rows) => rows[0] ?? null)

  if (!session) {
    // Build query for vocabulary entries, optionally filtered by group
    let vocabQuery = db
      .select({ id: vocabularyEntries.id, term: vocabularyEntries.term })
      .from(vocabularyEntries)
      .where(eq(vocabularyEntries.userId, userId))

    if (groupId) {
      vocabQuery = db
        .select({
          id: vocabularyEntries.id,
          term: vocabularyEntries.term,
        })
        .from(vocabularyEntries)
        .innerJoin(
          vocabularyGroups,
          eq(vocabularyEntries.id, vocabularyGroups.vocabularyId)
        )
        .where(
          and(
            eq(vocabularyEntries.userId, userId),
            eq(vocabularyGroups.groupId, groupId)
          )
        )
    }

    const allVocab = await vocabQuery

    if (allVocab.length === 0) return null

    const statsRows =
      allVocab.length > 0
        ? await db
            .select()
            .from(vocabularyReviewStats)
            .where(
              inArray(
                vocabularyReviewStats.vocabularyId,
                allVocab.map((v) => v.id)
              )
            )
        : []

    const statsMap = new Map(statsRows.map((s) => [s.vocabularyId, s]))

    // Create missing stats rows for legacy entries
    const missingStats = allVocab.filter((v) => !statsMap.has(v.id))
    if (missingStats.length > 0) {
      await db.insert(vocabularyReviewStats).values(
        missingStats.map((v) => ({
          vocabularyId: v.id,
          nextReviewAt: now,
          intervalDays: 1,
          easeFactor: 250,
          consecutiveCorrect: 0,
          totalReviews: 0,
          totalCorrect: 0,
          createdAt: now,
          updatedAt: now,
        }))
      )
      for (const v of missingStats) {
        statsMap.set(v.id, {
          vocabularyId: v.id,
          nextReviewAt: now,
          intervalDays: 1,
          easeFactor: 250,
          consecutiveCorrect: 0,
          totalReviews: 0,
          totalCorrect: 0,
          createdAt: now,
          updatedAt: now,
        })
      }
    }

    const dueVocab = allVocab.filter((v) => {
      const stats = statsMap.get(v.id)
      if (!stats) return false
      return stats.nextReviewAt <= now
    })

    if (dueVocab.length === 0) return null

    const sessionId = crypto.randomUUID()

    await db.insert(practiceSessions).values({
      id: sessionId,
      userId,
      groupId: groupId ?? null,
      date: today,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    })

    await db.insert(practiceItems).values(
      dueVocab.map((v) => ({
        id: crypto.randomUUID(),
        practiceSessionId: sessionId,
        vocabularyId: v.id,
        prompt: v.term,
        dueAt: now,
      }))
    )

    session = (await db
      .select()
      .from(practiceSessions)
      .where(eq(practiceSessions.id, sessionId))
      .limit(1)
      .then((rows) => rows[0]))!
  }

  const items = await db
    .select({
      id: practiceItems.id,
      vocabularyId: practiceItems.vocabularyId,
      prompt: practiceItems.prompt,
      term: vocabularyEntries.term,
      dueAt: practiceItems.dueAt,
    })
    .from(practiceItems)
    .leftJoin(
      vocabularyEntries,
      eq(practiceItems.vocabularyId, vocabularyEntries.id)
    )
    .where(
      and(
        eq(practiceItems.practiceSessionId, session.id),
        isNull(practiceItems.reviewedAt)
      )
    )

  if (items.length === 0) return null

  const vocabIds = items.map((i) => i.vocabularyId)
  const definitionRows = await db
    .select({
      id: vocabularyEntries.id,
      definition: vocabularyEntries.definition,
    })
    .from(vocabularyEntries)
    .where(inArray(vocabularyEntries.id, vocabIds))

  const definitions: Record<string, string> = {}
  for (const row of definitionRows) {
    definitions[row.id] = row.definition
  }

  return {
    session: {
      id: session.id,
      date: session.date,
      status: session.status as 'pending' | 'in_progress' | 'completed',
      items: items.map((i) => ({
        id: i.id,
        vocabularyId: i.vocabularyId,
        term: i.term ?? i.prompt,
        prompt: i.prompt,
        dueAt: i.dueAt.toISOString(),
      })),
    },
    definitions,
  }
}
