import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { vocabularyEntries } from '@/lib/db/schema'
import type { VocabularyEntry } from '@/lib/contracts'

type VocabularyRow = typeof vocabularyEntries.$inferSelect

function toVocabularyEntry(row: VocabularyRow): VocabularyEntry {
  return {
    id: row.id,
    term: row.term,
    definition: row.definition,
    language: row.language ?? undefined,
    partOfSpeech: row.partOfSpeech ?? undefined,
    examples: row.examples,
    tags: row.tags,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

export async function listVocabulary(
  userId: string
): Promise<VocabularyEntry[]> {
  const rows = await db
    .select()
    .from(vocabularyEntries)
    .where(eq(vocabularyEntries.userId, userId))
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
