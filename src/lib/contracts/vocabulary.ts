import { z } from 'zod'

import { IdSchema } from './http'

export const VocabularyEntrySchema = z.object({
  id: IdSchema,
  term: z.string().min(1),
  definition: z.string().min(1),
  language: z.string().min(2).optional(),
  partOfSpeech: z.string().min(1).optional(),
  examples: z.array(z.string().min(1)).default([]),
  tags: z.array(z.string().min(1)).default([]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const VocabularySearchRequestSchema = z.object({
  query: z.string().min(1),
  language: z.string().min(2).optional(),
})

export const VocabularySearchResultSchema = z.object({
  term: z.string().min(1),
  definition: z.string().min(1),
  language: z.string().min(2).optional(),
  partOfSpeech: z.string().min(1).optional(),
  examples: z.array(z.string().min(1)).default([]),
})

export const CreateVocabularyRequestSchema = z.object({
  term: z.string().min(1),
  definition: z.string().min(1),
  language: z.string().min(2).optional(),
  partOfSpeech: z.string().min(1).optional(),
  examples: z.array(z.string().min(1)).optional(),
  tags: z.array(z.string().min(1)).optional(),
})

export const UpdateVocabularyRequestSchema =
  CreateVocabularyRequestSchema.partial()

export type VocabularyEntry = z.infer<typeof VocabularyEntrySchema>
export type VocabularySearchRequest = z.infer<
  typeof VocabularySearchRequestSchema
>
export type VocabularySearchResult = z.infer<
  typeof VocabularySearchResultSchema
>
export type CreateVocabularyRequest = z.infer<
  typeof CreateVocabularyRequestSchema
>
export type UpdateVocabularyRequest = z.infer<
  typeof UpdateVocabularyRequestSchema
>
