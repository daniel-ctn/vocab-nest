'use server'

import { and, eq, ilike, or, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { vocabularyEntries, vocabularyReviewStats } from '@/lib/db/schema'
import { requireUser } from '@/lib/session'
import { rateLimit } from '@/lib/rate-limit'
import { isPro } from '@/lib/data/subscription'
import { toVocabularyEntry } from '@/lib/data/vocabulary'
import {
  CreateVocabularyRequestSchema,
  UpdateVocabularyRequestSchema,
  VocabularySearchRequestSchema,
  type VocabularySearchResult,
} from '@/lib/contracts'

const FREE_WORD_LIMIT = 100

export async function createVocabulary(
  input: unknown
): Promise<{ id: string }> {
  const user = await requireUser()
  const data = CreateVocabularyRequestSchema.parse(input)

  const limit = rateLimit(`create:${user.id}`, 20, 60_000)
  if (!limit.success) {
    throw new Error('Rate limit exceeded. Please slow down.')
  }

  const pro = await isPro(user.id)
  if (!pro) {
    const count = await db
      .select({ count: sql<number>`count(*)` })
      .from(vocabularyEntries)
      .where(eq(vocabularyEntries.userId, user.id))
      .then((rows) => Number(rows[0]?.count ?? 0))
    if (count >= FREE_WORD_LIMIT) {
      throw new Error(
        'Free plan limit reached. Upgrade to Pro for unlimited vocabulary.'
      )
    }
  }

  const id = crypto.randomUUID()
  const now = new Date()

  await db.transaction(async (tx) => {
    await tx.insert(vocabularyEntries).values({
      id,
      userId: user.id,
      term: data.term,
      definition: data.definition,
      language: data.language ?? null,
      partOfSpeech: data.partOfSpeech ?? null,
      pronunciation: data.pronunciation ?? null,
      notes: data.notes ?? null,
      etymology: data.etymology ?? null,
      mnemonic: data.mnemonic ?? null,
      examples: data.examples ?? [],
      synonyms: data.synonyms ?? [],
      antonyms: data.antonyms ?? [],
      tags: data.tags ?? [],
      createdAt: now,
      updatedAt: now,
    })

    await tx.insert(vocabularyReviewStats).values({
      vocabularyId: id,
      nextReviewAt: now,
      intervalDays: 1,
      easeFactor: 250,
      consecutiveCorrect: 0,
      totalReviews: 0,
      totalCorrect: 0,
      createdAt: now,
      updatedAt: now,
    })
  })

  revalidatePath('/vocabulary')
  revalidatePath('/dashboard')
  return { id }
}

export async function updateVocabulary(id: string, input: unknown) {
  const user = await requireUser()
  const data = UpdateVocabularyRequestSchema.parse(input)

  const owned = await db
    .select({ id: vocabularyEntries.id })
    .from(vocabularyEntries)
    .where(
      and(eq(vocabularyEntries.id, id), eq(vocabularyEntries.userId, user.id))
    )
    .limit(1)

  if (owned.length === 0) {
    throw new Error('Vocabulary entry not found.')
  }

  const updateData: Record<string, unknown> = { updatedAt: new Date() }
  if (data.term !== undefined) updateData.term = data.term
  if (data.definition !== undefined) updateData.definition = data.definition
  if (data.language !== undefined) updateData.language = data.language
  if (data.partOfSpeech !== undefined)
    updateData.partOfSpeech = data.partOfSpeech
  if (data.pronunciation !== undefined)
    updateData.pronunciation = data.pronunciation
  if (data.notes !== undefined) updateData.notes = data.notes
  if (data.etymology !== undefined) updateData.etymology = data.etymology
  if (data.mnemonic !== undefined) updateData.mnemonic = data.mnemonic
  if (data.examples !== undefined) updateData.examples = data.examples
  if (data.synonyms !== undefined) updateData.synonyms = data.synonyms
  if (data.antonyms !== undefined) updateData.antonyms = data.antonyms
  if (data.tags !== undefined) updateData.tags = data.tags

  await db
    .update(vocabularyEntries)
    .set(updateData)
    .where(eq(vocabularyEntries.id, id))

  revalidatePath('/vocabulary')
  revalidatePath(`/vocabulary/${id}`)
}

export async function deleteVocabulary(id: string) {
  const user = await requireUser()

  const owned = await db
    .select({ id: vocabularyEntries.id })
    .from(vocabularyEntries)
    .where(
      and(eq(vocabularyEntries.id, id), eq(vocabularyEntries.userId, user.id))
    )
    .limit(1)

  if (owned.length === 0) {
    throw new Error('Vocabulary entry not found.')
  }

  await db.delete(vocabularyEntries).where(eq(vocabularyEntries.id, id))

  revalidatePath('/vocabulary')
  revalidatePath('/dashboard')
}

export async function searchVocabulary(
  input: unknown
): Promise<VocabularySearchResult[]> {
  const user = await requireUser()
  const data = VocabularySearchRequestSchema.parse(input)

  const limit = rateLimit(`search:${user.id}`, 30, 60_000)
  if (!limit.success) {
    throw new Error('Rate limit exceeded. Please slow down.')
  }

  const q = `%${data.query}%`

  const conditions = [
    eq(vocabularyEntries.userId, user.id),
    or(
      ilike(vocabularyEntries.term, q),
      ilike(vocabularyEntries.definition, q),
      sql`${vocabularyEntries.tags}::text ilike ${q}`
    ),
  ]
  if (data.language) {
    conditions.push(eq(vocabularyEntries.language, data.language))
  }

  const rows = await db
    .select()
    .from(vocabularyEntries)
    .where(and(...conditions))
    .limit(50)

  return rows.map(toVocabularyEntry)
}

type BulkEntry = {
  term: string
  definition: string
  tags?: string[]
}

const BULK_IMPORT_MAX = 100

export async function bulkCreateVocabulary(
  entries: BulkEntry[]
): Promise<{ created: number; failed: number }> {
  const user = await requireUser()

  const limit = rateLimit(`bulk:${user.id}`, 3, 60_000)
  if (!limit.success) {
    throw new Error('Rate limit exceeded. Please wait a minute.')
  }

  if (entries.length > BULK_IMPORT_MAX) {
    throw new Error(`Maximum ${BULK_IMPORT_MAX} entries per import.`)
  }

  const now = new Date()
  const validEntries = entries.filter(
    (e) => e.term.trim().length > 0 && e.definition.trim().length > 0
  )

  if (validEntries.length === 0) {
    return { created: 0, failed: entries.length }
  }

  const created = await db.transaction(async (tx) => {
    const vocabRows = validEntries.map((entry) => ({
      id: crypto.randomUUID(),
      userId: user.id,
      term: entry.term.trim(),
      definition: entry.definition.trim(),
      language: null,
      partOfSpeech: null,
      examples: [],
      tags: entry.tags ?? [],
      createdAt: now,
      updatedAt: now,
    }))

    await tx.insert(vocabularyEntries).values(vocabRows)

    await tx.insert(vocabularyReviewStats).values(
      vocabRows.map((row) => ({
        vocabularyId: row.id,
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

    return vocabRows.length
  })

  revalidatePath('/vocabulary')
  revalidatePath('/dashboard')

  return { created, failed: entries.length - created }
}
