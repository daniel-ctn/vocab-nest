'use server'

import { and, eq, ilike } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { vocabularyEntries } from '@/lib/db/schema'
import { getCurrentUser } from '@/lib/session'
import {
  CreateVocabularyRequestSchema,
  UpdateVocabularyRequestSchema,
  VocabularySearchRequestSchema,
  type VocabularySearchResult,
} from '@/lib/contracts'

export async function createVocabulary(
  input: unknown
): Promise<{ id: string }> {
  const user = await getCurrentUser()
  const data = CreateVocabularyRequestSchema.parse(input)

  const id = crypto.randomUUID()
  const now = new Date()

  await db.insert(vocabularyEntries).values({
    id,
    userId: user.id,
    term: data.term,
    definition: data.definition,
    language: data.language ?? null,
    partOfSpeech: data.partOfSpeech ?? null,
    examples: data.examples ?? [],
    tags: data.tags ?? [],
    createdAt: now,
    updatedAt: now,
  })

  revalidatePath('/vocabulary')
  revalidatePath('/dashboard')
  return { id }
}

export async function updateVocabulary(id: string, input: unknown) {
  const user = await getCurrentUser()
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
  if (data.examples !== undefined) updateData.examples = data.examples
  if (data.tags !== undefined) updateData.tags = data.tags

  await db
    .update(vocabularyEntries)
    .set(updateData)
    .where(eq(vocabularyEntries.id, id))

  revalidatePath('/vocabulary')
  revalidatePath(`/vocabulary/${id}`)
}

export async function deleteVocabulary(id: string) {
  const user = await getCurrentUser()

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
  const user = await getCurrentUser()
  const data = VocabularySearchRequestSchema.parse(input)

  const conditions = [
    eq(vocabularyEntries.userId, user.id),
    ilike(vocabularyEntries.term, `%${data.query}%`),
  ]
  if (data.language) {
    conditions.push(eq(vocabularyEntries.language, data.language))
  }

  const rows = await db
    .select({
      term: vocabularyEntries.term,
      definition: vocabularyEntries.definition,
      language: vocabularyEntries.language,
      partOfSpeech: vocabularyEntries.partOfSpeech,
      examples: vocabularyEntries.examples,
    })
    .from(vocabularyEntries)
    .where(and(...conditions))
    .limit(50)

  return rows.map((r) => ({
    term: r.term,
    definition: r.definition,
    language: r.language ?? undefined,
    partOfSpeech: r.partOfSpeech ?? undefined,
    examples: r.examples ?? [],
  }))
}
