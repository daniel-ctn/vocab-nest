import { and, eq, inArray, isNull } from 'drizzle-orm'
import { db } from '@/lib/db'
import {
  practiceItems,
  practiceSessions,
  vocabularyEntries,
} from '@/lib/db/schema'
import type { PracticeSession } from '@/lib/contracts'

export type TodayPractice = {
  session: PracticeSession
  definitions: Record<string, string>
}

export async function getOrCreateTodayPractice(
  userId: string
): Promise<TodayPractice | null> {
  const today = new Date().toISOString().slice(0, 10)

  let session = await db
    .select()
    .from(practiceSessions)
    .where(
      and(eq(practiceSessions.userId, userId), eq(practiceSessions.date, today))
    )
    .limit(1)
    .then((rows) => rows[0] ?? null)

  if (!session) {
    const sessionId = crypto.randomUUID()
    const now = new Date()

    await db.insert(practiceSessions).values({
      id: sessionId,
      userId,
      date: today,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    })

    const dueVocab = await db
      .select({
        id: vocabularyEntries.id,
        term: vocabularyEntries.term,
      })
      .from(vocabularyEntries)
      .where(eq(vocabularyEntries.userId, userId))

    if (dueVocab.length > 0) {
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
