import { z } from "zod";

import { IdSchema } from "./http";

export const PracticeItemSchema = z.object({
  id: IdSchema,
  vocabularyId: IdSchema,
  term: z.string().min(1),
  prompt: z.string().min(1),
  dueAt: z.string().datetime(),
});

export const PracticeSessionSchema = z.object({
  id: IdSchema,
  date: z.string().min(1),
  status: z.enum(["pending", "in_progress", "completed"]),
  items: z.array(PracticeItemSchema),
});

export const TodayPracticeResponseSchema = z.object({
  practice: PracticeSessionSchema.nullable(),
});

export const PracticeReviewParamsSchema = z.object({
  id: IdSchema,
  itemId: IdSchema,
});

export const PracticeReviewRequestSchema = z.object({
  remembered: z.boolean(),
  answer: z.string().min(1).optional(),
});

export const PracticeReviewResponseSchema = z.object({
  practiceId: IdSchema,
  itemId: IdSchema,
  reviewed: z.literal(true),
});

export const PracticeCompleteResponseSchema = z.object({
  practiceId: IdSchema,
  completed: z.literal(true),
});

export type PracticeItem = z.infer<typeof PracticeItemSchema>;
export type PracticeSession = z.infer<typeof PracticeSessionSchema>;
export type TodayPracticeResponse = z.infer<
  typeof TodayPracticeResponseSchema
>;
export type PracticeReviewParams = z.infer<typeof PracticeReviewParamsSchema>;
export type PracticeReviewRequest = z.infer<
  typeof PracticeReviewRequestSchema
>;
export type PracticeReviewResponse = z.infer<
  typeof PracticeReviewResponseSchema
>;
export type PracticeCompleteResponse = z.infer<
  typeof PracticeCompleteResponseSchema
>;
