import { z } from 'zod'

import { IdSchema } from './http'

export const GroupSchema = z.object({
  id: IdSchema,
  name: z.string().min(1),
  description: z.string().min(1).nullable(),
  vocabularyCount: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const CreateGroupRequestSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1).optional(),
})

export const UpdateGroupRequestSchema = CreateGroupRequestSchema.partial()

export type Group = z.infer<typeof GroupSchema>
export type CreateGroupRequest = z.infer<typeof CreateGroupRequestSchema>
export type UpdateGroupRequest = z.infer<typeof UpdateGroupRequestSchema>
