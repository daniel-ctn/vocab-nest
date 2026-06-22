import { and, eq, notInArray, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import {
  groups,
  vocabularyEntries,
  vocabularyGroups,
  vocabularyReviewStats,
} from '@/lib/db/schema'
import { toVocabularyEntry } from '@/lib/data/vocabulary'
import type { Group, VocabularyEntry } from '@/lib/contracts'

export type GroupReviewSummary = {
  total: number
  dueCount: number
  /** Word counts by rooting tier: Fresh, Familiar, Steady, Rooted. */
  tiers: [number, number, number, number]
  dueIds: string[]
}

/**
 * A deck's standing: how many words are due now and how they're distributed
 * across the four rooting tiers (by SRS interval). Every word carries a review
 * stats row from creation, so a single join covers the whole group.
 */
export async function getGroupReviewSummary(
  groupId: string,
  userId: string
): Promise<GroupReviewSummary> {
  const rows = await db
    .select({
      vocabularyId: vocabularyReviewStats.vocabularyId,
      nextReviewAt: vocabularyReviewStats.nextReviewAt,
      intervalDays: vocabularyReviewStats.intervalDays,
    })
    .from(vocabularyReviewStats)
    .innerJoin(
      vocabularyEntries,
      eq(vocabularyReviewStats.vocabularyId, vocabularyEntries.id)
    )
    .innerJoin(
      vocabularyGroups,
      eq(vocabularyGroups.vocabularyId, vocabularyEntries.id)
    )
    .where(
      and(
        eq(vocabularyGroups.groupId, groupId),
        eq(vocabularyEntries.userId, userId)
      )
    )

  const now = new Date()
  const tiers: [number, number, number, number] = [0, 0, 0, 0]
  const dueIds: string[] = []
  for (const r of rows) {
    if (r.nextReviewAt <= now) dueIds.push(r.vocabularyId)
    const t =
      r.intervalDays <= 1
        ? 0
        : r.intervalDays <= 6
          ? 1
          : r.intervalDays <= 20
            ? 2
            : 3
    tiers[t]++
  }

  return { total: rows.length, dueCount: dueIds.length, tiers, dueIds }
}

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
    .select({ entry: vocabularyEntries })
    .from(vocabularyEntries)
    .innerJoin(
      vocabularyGroups,
      eq(vocabularyEntries.id, vocabularyGroups.vocabularyId)
    )
    .where(eq(vocabularyGroups.groupId, id))

  const items: VocabularyEntry[] = vocabRows.map((v) =>
    toVocabularyEntry(v.entry)
  )

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

export async function listVocabularyNotInGroup(
  groupId: string,
  userId: string
): Promise<VocabularyEntry[]> {
  const groupCheck = await db
    .select({ id: groups.id })
    .from(groups)
    .where(and(eq(groups.id, groupId), eq(groups.userId, userId)))
    .limit(1)

  if (groupCheck.length === 0) return []

  const linkedIds = await db
    .select({ vocabularyId: vocabularyGroups.vocabularyId })
    .from(vocabularyGroups)
    .where(eq(vocabularyGroups.groupId, groupId))

  const linkedIdSet = new Set(linkedIds.map((r) => r.vocabularyId))

  if (linkedIdSet.size === 0) {
    const rows = await db
      .select()
      .from(vocabularyEntries)
      .where(eq(vocabularyEntries.userId, userId))
      .orderBy(vocabularyEntries.term)
    return rows.map(toVocabularyEntry)
  }

  const rows = await db
    .select()
    .from(vocabularyEntries)
    .where(
      and(
        eq(vocabularyEntries.userId, userId),
        notInArray(vocabularyEntries.id, Array.from(linkedIdSet))
      )
    )
    .orderBy(vocabularyEntries.term)

  return rows.map(toVocabularyEntry)
}
