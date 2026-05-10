import { z } from "zod";

export const IdSchema = z.string().min(1);

export const IdParamsSchema = z.object({
  id: IdSchema,
});

export const DeleteResponseSchema = z.object({
  id: IdSchema,
  deleted: z.literal(true),
});

export const EmptyObjectSchema = z.object({}).strict();

export const ApiErrorSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
  details: z.unknown().optional(),
});

export const ApiErrorResponseSchema = z.object({
  success: z.literal(false),
  error: ApiErrorSchema,
});

export const createApiSuccessResponseSchema = <Schema extends z.ZodTypeAny>(
  data: Schema,
) =>
  z.object({
    success: z.literal(true),
    data,
  });

export const createApiResponseSchema = <Schema extends z.ZodTypeAny>(
  data: Schema,
) => z.union([createApiSuccessResponseSchema(data), ApiErrorResponseSchema]);

export type ApiError = z.infer<typeof ApiErrorSchema>;
export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;
export type ApiSuccessResponse<Data> = {
  success: true;
  data: Data;
};
export type ApiResponse<Data> = ApiSuccessResponse<Data> | ApiErrorResponse;
export type IdParams = z.infer<typeof IdParamsSchema>;
export type DeleteResponse = z.infer<typeof DeleteResponseSchema>;
