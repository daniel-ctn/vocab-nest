import { z } from "zod";

import { IdSchema } from "./http";
import { VocabularyEntrySchema } from "./vocabulary";

export const GroupSchema = z.object({
  id: IdSchema,
  name: z.string().min(1),
  description: z.string().min(1).nullable(),
  vocabularyCount: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateGroupRequestSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1).optional(),
});

export const UpdateGroupRequestSchema = CreateGroupRequestSchema.partial();

export const GroupListResponseSchema = z.object({
  items: z.array(GroupSchema),
  total: z.number().int().nonnegative(),
});

export const GroupDetailResponseSchema = z.object({
  group: GroupSchema,
});

export const GroupVocabularyResponseSchema = z.object({
  group: GroupSchema,
  items: z.array(VocabularyEntrySchema),
  total: z.number().int().nonnegative(),
});

export type Group = z.infer<typeof GroupSchema>;
export type CreateGroupRequest = z.infer<typeof CreateGroupRequestSchema>;
export type UpdateGroupRequest = z.infer<typeof UpdateGroupRequestSchema>;
export type GroupListResponse = z.infer<typeof GroupListResponseSchema>;
export type GroupDetailResponse = z.infer<typeof GroupDetailResponseSchema>;
export type GroupVocabularyResponse = z.infer<
  typeof GroupVocabularyResponseSchema
>;
