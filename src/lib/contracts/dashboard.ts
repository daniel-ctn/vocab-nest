import { z } from "zod";

export const DashboardSummaryResponseSchema = z.object({
  totalVocabulary: z.number().int().nonnegative(),
  totalGroups: z.number().int().nonnegative(),
  dueToday: z.number().int().nonnegative(),
  reviewedToday: z.number().int().nonnegative(),
  streakDays: z.number().int().nonnegative(),
});

export type DashboardSummaryResponse = z.infer<
  typeof DashboardSummaryResponseSchema
>;
