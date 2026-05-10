import { NextResponse } from "next/server";
import { z, ZodError, type ZodTypeAny } from "zod";
import type { ApiError } from "@/lib/contracts";
import { verifyJwt } from "./auth/jwt";

export class ApiException extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiException";
  }
}

export function apiSuccess<Data>(data: Data, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiError(
  statusCode: number,
  code: string,
  message: string,
  details?: unknown,
) {
  const error: ApiError = {
    code,
    message,
    ...(details === undefined ? {} : { details }),
  };
  return NextResponse.json({ success: false, error }, { status: statusCode });
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiException) {
    return apiError(error.statusCode, error.code, error.message, error.details);
  }
  if (error instanceof ZodError) {
    return apiError(400, "VALIDATION_ERROR", "Request validation failed.", error.flatten());
  }
  console.error("Unhandled API error:", error);
  return apiError(500, "INTERNAL_SERVER_ERROR", "Unexpected API error.");
}

export async function parseBody<Schema extends ZodTypeAny>(
  request: Request,
  schema: Schema,
): Promise<z.infer<Schema>> {
  const body = await request.json();
  return schema.parse(body);
}

export type AuthContext = {
  userId: string;
  email: string;
};

export async function requireAuth(request: Request): Promise<AuthContext> {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : undefined;

  if (!token) {
    throw new ApiException(401, "UNAUTHORIZED", "A bearer token is required.");
  }

  try {
    const { payload } = await verifyJwt(token);
    return { userId: payload.sub!, email: payload.email as string };
  } catch {
    throw new ApiException(401, "UNAUTHORIZED", "Invalid or expired token.");
  }
}
