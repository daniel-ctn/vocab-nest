import { z } from 'zod'

/** Structured enrichment for a single term. */
export const EnrichmentSchema = z.object({
  definition: z.string().default(''),
  partOfSpeech: z.string().default(''),
  pronunciation: z.string().default(''),
  examples: z.array(z.string()).default([]),
  synonyms: z.array(z.string()).default([]),
  antonyms: z.array(z.string()).default([]),
  etymology: z.string().default(''),
  mnemonic: z.string().default(''),
})
export type Enrichment = z.infer<typeof EnrichmentSchema>

/** Result of structuring a free-form paste into entries. */
export const BulkEntriesSchema = z.object({
  entries: z
    .array(
      z.object({
        term: z.string(),
        definition: z.string(),
        tags: z.array(z.string()).optional(),
      })
    )
    .default([]),
})

/** Semantic grade for a typed recall answer. */
export const AnswerGradeSchema = z.object({
  correct: z.boolean(),
  score: z.number().int().min(0).max(3),
  feedback: z.string(),
})
export type AnswerGrade = z.infer<typeof AnswerGradeSchema>
