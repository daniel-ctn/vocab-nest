import type { ApiError } from "@/lib/contracts";

type ApiClientErrorOptions = {
  code: string;
  statusCode?: number;
  details?: unknown;
};

export class ApiClientError extends Error {
  public readonly code: string;
  public readonly statusCode?: number;
  public readonly details?: unknown;

  constructor(message: string, options: ApiClientErrorOptions) {
    super(message);
    this.name = "ApiClientError";
    this.code = options.code;
    this.statusCode = options.statusCode;
    this.details = options.details;
  }
}

export class ApiConnectionError extends ApiClientError {
  constructor(details?: unknown) {
    super(
      "Unable to connect to the API. Check that the backend is running and NEXT_PUBLIC_API_BASE_URL is correct.",
      {
        code: "API_CONNECTION_ERROR",
        details,
      },
    );
    this.name = "ApiConnectionError";
  }
}

export const fromApiError = (error: ApiError, statusCode: number) =>
  new ApiClientError(error.message, {
    code: error.code,
    statusCode,
    details: error.details,
  });
