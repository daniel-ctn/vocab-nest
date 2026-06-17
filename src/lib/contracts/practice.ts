import { z } from 'zod'

import { IdSchema } from './http'

export const PracticeItemSchema = z.object({
  id: IdSchema,
  vocabularyId: IdSchema,
  term: z.string().min(1),
  prompt: z.string().min(1),
  dueAt: z.string().datetime(),
})

export const PracticeSessionSchema = z.object({
  id: IdSchema,
  date: z.string().min(1),
  status: z.enum(['pending', 'in_progress', 'completed']),
  items: z.array(PracticeItemSchema),
})

export const PracticeReviewRequestSchema = z.object({
  grade: z.number().int().min(0).max(3),
  answer: z.string().min(1).optional(),
})

export type PracticeItem = z.infer<typeof PracticeItemSchema>
export type PracticeSession = z.infer<typeof PracticeSessionSchema>
export type PracticeReviewRequest = z.infer<typeof PracticeReviewRequestSchema>
