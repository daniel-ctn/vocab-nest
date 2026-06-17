'use server'

import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { vocabularyEntries } from '@/lib/db/schema'
import { requireUser } from '@/lib/session'
import { isPro } from '@/lib/data/subscription'
import { rateLimit } from '@/lib/rate-limit'
import {
  enrichTerm,
  gradeAnswer,
  isAiConfigured,
  structureBulk,
} from '@/lib/ai/gemini'
import { bulkCreateVocabulary } from '@/lib/actions/vocabulary'
import type { Enrichment, AnswerGrade } from '@/lib/ai/schemas'

async function requireAiPro() {
  const user = await requireUser()
  if (!(await isPro(user.id))) {
    throw new Error('AI features are available on the Pro plan.')
  }
  if (!isAiConfigured()) {
    throw new Error('AI is not configured on this server.')
  }
  return user
}

export async function enrichVocabulary(
  term: string,
  language?: string
): Promise<Enrichment> {
  const user = await requireAiPro()
  if (!rateLimit(`ai-enrich:${user.id}`, 20, 60_000).success) {
    throw new Error('Slow down a moment, then try again.')
  }
  const t = term.trim()
  if (!t) throw new Error('Enter a word first.')
  return enrichTerm(t, language?.trim() || undefined)
}

export async function aiBulkImport(
  text: string
): Promise<{ created: number; failed: number }> {
  const user = await requireAiPro()
  if (!rateLimit(`ai-bulk:${user.id}`, 5, 60_000).success) {
    throw new Error('Slow down a moment, then try again.')
  }
  const entries = await structureBulk(text.slice(0, 8000))
  if (entries.length === 0) return { created: 0, failed: 0 }
  return bulkCreateVocabulary(
    entries.map((e) => ({
      term: e.term,
      definition: e.definition,
      tags: e.tags,
    }))
  )
}

export async function gradeTypedAnswer(
  vocabularyId: string,
  answer: string
): Promise<AnswerGrade> {
  const user = await requireAiPro()
  if (!rateLimit(`ai-grade:${user.id}`, 40, 60_000).success) {
    throw new Error('Slow down a moment, then try again.')
  }
  const entry = await db
    .select({
      term: vocabularyEntries.term,
      definition: vocabularyEntries.definition,
    })
    .from(vocabularyEntries)
    .where(
      and(
        eq(vocabularyEntries.id, vocabularyId),
        eq(vocabularyEntries.userId, user.id)
      )
    )
    .limit(1)
    .then((rows) => rows[0])
  if (!entry) throw new Error('Word not found.')
  return gradeAnswer(entry.term, entry.definition, answer.slice(0, 500))
}
