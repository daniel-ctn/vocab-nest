import { and, eq, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { groups, vocabularyEntries, vocabularyGroups } from '@/lib/db/schema'
import type { Group, VocabularyEntry } from '@/lib/contracts'

export async function listGroups(userId: string): Promise<Group[]> {
  const rows = await db
    .select({
      id: groups.id,
      name: groups.name,
      description: groups.description,
      createdAt: groups.createdAt,
      updatedAt: groups.updatedAt,
      vocabularyCount: sql<number>`COALESCE((
        SELECT COUNT(*)::int
        FROM ${vocabularyGroups}
        WHERE ${vocabularyGroups.groupId} = ${groups.id}
      ), 0)`,
    })
    .from(groups)
    .where(eq(groups.userId, userId))
    .orderBy(groups.updatedAt)

  return rows.map((g) => ({
    id: g.id,
    name: g.name,
    description: g.description,
    vocabularyCount: g.vocabularyCount,
    createdAt: g.createdAt.toISOString(),
    updatedAt: g.updatedAt.toISOString(),
  }))
}

export async function getGroupWithVocabulary(
  id: string,
  userId: string
): Promise<{ group: Group; items: VocabularyEntry[] } | null> {
  const groupRows = await db
    .select()
    .from(groups)
    .where(and(eq(groups.id, id), eq(groups.userId, userId)))
    .limit(1)

  const group = groupRows[0]
  if (!group) return null

  const vocabRows = await db
    .select({
      id: vocabularyEntries.id,
      term: vocabularyEntries.term,
      definition: vocabularyEntries.definition,
      language: vocabularyEntries.language,
      partOfSpeech: vocabularyEntries.partOfSpeech,
      examples: vocabularyEntries.examples,
      tags: vocabularyEntries.tags,
      createdAt: vocabularyEntries.createdAt,
      updatedAt: vocabularyEntries.updatedAt,
    })
    .from(vocabularyEntries)
    .innerJoin(
      vocabularyGroups,
      eq(vocabularyEntries.id, vocabularyGroups.vocabularyId)
    )
    .where(eq(vocabularyGroups.groupId, id))

  const items: VocabularyEntry[] = vocabRows.map((v) => ({
    id: v.id,
    term: v.term,
    definition: v.definition,
    language: v.language ?? undefined,
    partOfSpeech: v.partOfSpeech ?? undefined,
    examples: v.examples,
    tags: v.tags,
    createdAt: v.createdAt.toISOString(),
    updatedAt: v.updatedAt.toISOString(),
  }))

  return {
    group: {
      id: group.id,
      name: group.name,
      description: group.description,
      vocabularyCount: items.length,
      createdAt: group.createdAt.toISOString(),
      updatedAt: group.updatedAt.toISOString(),
    },
    items,
  }
}
