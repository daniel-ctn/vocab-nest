import { and, eq, inArray, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import {
  groups,
  vocabularyEntries,
  vocabularyGroups,
  vocabularyReviewStats,
} from '@/lib/db/schema'
import type { VocabularyEntry } from '@/lib/contracts'

export type VocabularyDetail = {
  entry: VocabularyEntry
  groupIds: string[]
  groupNames: { id: string; name: string }[]
  stats: {
    totalReviews: number
    totalCorrect: number
    accuracy: number
    consecutiveCorrect: number
    intervalDays: number
    easeFactor: number
    nextReviewAt: string
  } | null
}

type VocabularyRow = typeof vocabularyEntries.$inferSelect

export function toVocabularyEntry(row: VocabularyRow): VocabularyEntry {
  return {
    id: row.id,
    term: row.term,
    definition: row.definition,
    language: row.language ?? undefined,
    partOfSpeech: row.partOfSpeech ?? undefined,
    pronunciation: row.pronunciation ?? undefined,
    notes: row.notes ?? undefined,
    etymology: row.etymology ?? undefined,
    mnemonic: row.mnemonic ?? undefined,
    examples: row.examples,
    synonyms: row.synonyms,
    antonyms: row.antonyms,
    tags: row.tags,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

export async function listVocabulary(
  userId: string,
  tag?: string
): Promise<VocabularyEntry[]> {
  const where = tag
    ? and(
        eq(vocabularyEntries.userId, userId),
        sql`${vocabularyEntries.tags}::jsonb @> ${JSON.stringify([tag])}::jsonb`
      )
    : eq(vocabularyEntries.userId, userId)

  const rows = await db
    .select()
    .from(vocabularyEntries)
    .where(where)
    .orderBy(vocabularyEntries.updatedAt)
  return rows.map(toVocabularyEntry)
}

export async function getVocabulary(
  id: string,
  userId: string
): Promise<VocabularyEntry | null> {
  const rows = await db
    .select()
    .from(vocabularyEntries)
    .where(
      and(eq(vocabularyEntries.id, id), eq(vocabularyEntries.userId, userId))
    )
    .limit(1)
  const row = rows[0]
  return row ? toVocabularyEntry(row) : null
}

export async function getVocabularyGroupIds(
  vocabularyId: string,
  userId: string
): Promise<string[]> {
  const rows = await db
    .select({ groupId: vocabularyGroups.groupId })
    .from(vocabularyGroups)
    .innerJoin(
      vocabularyEntries,
      eq(vocabularyGroups.vocabularyId, vocabularyEntries.id)
    )
    .where(
      and(
        eq(vocabularyGroups.vocabularyId, vocabularyId),
        eq(vocabularyEntries.userId, userId)
      )
    )

  return rows.map((r) => r.groupId)
}

export async function getVocabularyWithGroups(
  id: string,
  userId: string
): Promise<{ entry: VocabularyEntry; groupIds: string[] } | null> {
  const entry = await getVocabulary(id, userId)
  if (!entry) return null
  const groupIds = await getVocabularyGroupIds(id, userId)
  return { entry, groupIds }
}

export async function getVocabularyDetail(
  id: string,
  userId: string
): Promise<VocabularyDetail | null> {
  const entry = await getVocabulary(id, userId)
  if (!entry) return null

  const groupIds = await getVocabularyGroupIds(id, userId)

  const groupNames =
    groupIds.length > 0
      ? await db
          .select({ id: groups.id, name: groups.name })
          .from(groups)
          .where(inArray(groups.id, groupIds))
      : []

  const statsRow = await db
    .select()
    .from(vocabularyReviewStats)
    .where(eq(vocabularyReviewStats.vocabularyId, id))
    .limit(1)
    .then((rows) => rows[0] ?? null)

  const stats = statsRow
    ? {
        totalReviews: statsRow.totalReviews,
        totalCorrect: statsRow.totalCorrect,
        accuracy:
          statsRow.totalReviews > 0
            ? Math.round((statsRow.totalCorrect / statsRow.totalReviews) * 100)
            : 0,
        consecutiveCorrect: statsRow.consecutiveCorrect,
        intervalDays: statsRow.intervalDays,
        easeFactor: statsRow.easeFactor / 100,
        nextReviewAt: statsRow.nextReviewAt.toISOString(),
      }
    : null

  return { entry, groupIds, groupNames, stats }
}
