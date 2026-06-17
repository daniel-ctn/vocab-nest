import { and, eq, inArray, isNull, lte, or, sql } from 'drizzle-orm'
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
  /** Other terms+definitions for building multiple-choice distractors. */
  pool: { term: string; definition: string }[]
}

/** Cap a day's session so a large backlog is spread across days. */
const MAX_SESSION_ITEMS = 30

/**
 * Recall grades, mirroring the four-button SRS scale.
 *   0 = Again (forgot)  1 = Hard  2 = Good  3 = Easy
 * Grades >= 2 count as a successful recall (`remembered`).
 */
export type ReviewGrade = 0 | 1 | 2 | 3

const EASE_MIN = 130
const EASE_MAX = 350
const EASE_DEFAULT = 250

export { EASE_DEFAULT }

function calculateNextReview(
  grade: ReviewGrade,
  current: {
    intervalDays: number
    easeFactor: number
    consecutiveCorrect: number
  }
) {
  let interval = current.intervalDays
  let ease = current.easeFactor
  let streak = current.consecutiveCorrect

  if (grade === 0) {
    // Again — reset the card.
    streak = 0
    interval = 1
    ease = Math.max(EASE_MIN, ease - 20)
  } else if (grade === 1) {
    // Hard — advance gently, lower ease.
    streak += 1
    ease = Math.max(EASE_MIN, ease - 15)
    interval = Math.max(1, Math.round(interval * 1.2))
  } else if (grade === 2) {
    // Good — the standard graduating schedule.
    streak += 1
    if (streak === 1) {
      interval = 1
    } else if (streak === 2) {
      interval = 3
    } else {
      interval = Math.max(1, Math.round(interval * (ease / 100)))
    }
  } else {
    // Easy — reward with a longer interval and higher ease.
    streak += 1
    ease = Math.min(EASE_MAX, ease + 15)
    if (streak === 1) {
      interval = 2
    } else {
      interval = Math.max(1, Math.round(interval * (ease / 100) * 1.3))
    }
  }

  return {
    intervalDays: interval,
    easeFactor: ease,
    consecutiveCorrect: streak,
  }
}

export { calculateNextReview }

type SessionRow = typeof practiceSessions.$inferSelect

/** The state the practice page renders from. The read path never writes. */
export type PracticeState =
  | { kind: 'active'; practice: TodayPractice }
  | { kind: 'ready'; dueCount: number }
  | { kind: 'done' }
  | { kind: 'empty' }

function sessionWhere(
  userId: string,
  groupId: string | undefined,
  today: string
) {
  return groupId
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
}

async function findTodaySession(
  userId: string,
  groupId: string | undefined,
  today: string
): Promise<SessionRow | null> {
  return db
    .select()
    .from(practiceSessions)
    .where(sessionWhere(userId, groupId, today))
    .limit(1)
    .then((rows) => rows[0] ?? null)
}

/** Read-only: load the unreviewed items of an existing session. */
async function loadPracticeFromSession(
  session: SessionRow,
  userId: string
): Promise<TodayPractice | null> {
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

  // A small pool of other words to draw multiple-choice distractors from.
  const poolRows = await db
    .select({
      term: vocabularyEntries.term,
      definition: vocabularyEntries.definition,
    })
    .from(vocabularyEntries)
    .where(eq(vocabularyEntries.userId, userId))
    .limit(60)

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
    pool: poolRows,
  }
}

/** Read-only count of words due now (legacy entries without stats count too). */
async function countDueWords(
  userId: string,
  groupId: string | undefined,
  now: Date
): Promise<number> {
  const dueCond = or(
    isNull(vocabularyReviewStats.vocabularyId),
    lte(vocabularyReviewStats.nextReviewAt, now)
  )

  const base = db
    .select({ count: sql<number>`count(*)` })
    .from(vocabularyEntries)
    .leftJoin(
      vocabularyReviewStats,
      eq(vocabularyReviewStats.vocabularyId, vocabularyEntries.id)
    )

  const rows = groupId
    ? await base
        .innerJoin(
          vocabularyGroups,
          eq(vocabularyGroups.vocabularyId, vocabularyEntries.id)
        )
        .where(
          and(
            eq(vocabularyEntries.userId, userId),
            eq(vocabularyGroups.groupId, groupId),
            dueCond
          )
        )
    : await base.where(and(eq(vocabularyEntries.userId, userId), dueCond))

  return Number(rows[0]?.count ?? 0)
}

/**
 * Read-only. Resolves what the practice page should show without ever writing.
 * Safe to run on a GET/prefetch — the session is only created by
 * {@link startTodayPractice}, invoked from an explicit user action.
 */
export async function getPracticeState(
  userId: string,
  groupId?: string,
  timeZone = 'UTC'
): Promise<PracticeState> {
  const now = new Date()
  const today = dayKeyInTimeZone(now, timeZone)

  const session = await findTodaySession(userId, groupId, today)
  if (session) {
    const practice = await loadPracticeFromSession(session, userId)
    return practice ? { kind: 'active', practice } : { kind: 'done' }
  }

  const dueCount = await countDueWords(userId, groupId, now)
  return dueCount > 0 ? { kind: 'ready', dueCount } : { kind: 'empty' }
}

/**
 * Write path: create today's session and its items. Idempotent — if a session
 * already exists for the day it is a no-op. Only ever called from an explicit
 * user action, never from a GET/prefetch.
 */
export async function startTodayPractice(
  userId: string,
  groupId?: string,
  timeZone = 'UTC'
): Promise<void> {
  const now = new Date()
  const today = dayKeyInTimeZone(now, timeZone)

  const existing = await findTodaySession(userId, groupId, today)
  if (existing) return

  const vocabQuery = groupId
    ? db
        .select({ id: vocabularyEntries.id, term: vocabularyEntries.term })
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
    : db
        .select({ id: vocabularyEntries.id, term: vocabularyEntries.term })
        .from(vocabularyEntries)
        .where(eq(vocabularyEntries.userId, userId))

  const allVocab = await vocabQuery
  if (allVocab.length === 0) return

  const statsRows = await db
    .select()
    .from(vocabularyReviewStats)
    .where(
      inArray(
        vocabularyReviewStats.vocabularyId,
        allVocab.map((v) => v.id)
      )
    )

  const statsMap = new Map(statsRows.map((s) => [s.vocabularyId, s]))

  // Materialise stats for any legacy entries that don't have them yet.
  const missingStats = allVocab.filter((v) => !statsMap.has(v.id))
  if (missingStats.length > 0) {
    const newRows = missingStats.map((v) => ({
      vocabularyId: v.id,
      nextReviewAt: now,
      intervalDays: 1,
      easeFactor: EASE_DEFAULT,
      consecutiveCorrect: 0,
      totalReviews: 0,
      totalCorrect: 0,
      createdAt: now,
      updatedAt: now,
    }))
    await db.insert(vocabularyReviewStats).values(newRows)
    for (const row of newRows) statsMap.set(row.vocabularyId, row)
  }

  const dueVocab = allVocab
    .filter((v) => {
      const stats = statsMap.get(v.id)
      return stats ? stats.nextReviewAt <= now : false
    })
    // Most overdue first, then cap the day's load.
    .sort(
      (a, b) =>
        statsMap.get(a.id)!.nextReviewAt.getTime() -
        statsMap.get(b.id)!.nextReviewAt.getTime()
    )
    .slice(0, MAX_SESSION_ITEMS)

  if (dueVocab.length === 0) return

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
}
