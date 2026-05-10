import {
  createApiResponseSchema,
  type ApiResponse,
} from "@/lib/contracts";
import type { z } from "zod";

import { authTokenStorage } from "../auth/token";
import {
  ApiClientError,
  ApiConnectionError,
  fromApiError,
} from "./errors";

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

type ApiRequestOptions<Body> = {
  method?: HttpMethod;
  body?: Body;
  headers?: HeadersInit;
  token?: string | null;
};

const getApiBaseUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";
  return baseUrl.replace(/\/+$/, "");
};

const buildUrl = (path: string) => `${getApiBaseUrl()}${path}`;

export const apiRequest = async <Data, Body = undefined>(
  path: string,
  responseSchema: z.ZodType<Data>,
  options: ApiRequestOptions<Body> = {},
): Promise<Data> => {
  const headers = new Headers(options.headers);
  const token = options.token === undefined ? authTokenStorage.get() : options.token;

  headers.set("Accept", "application/json");

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;

  try {
    response = await fetch(buildUrl(path), {
      method: options.method ?? "GET",
      headers,
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
      credentials: "include",
    });
  } catch (error) {
    throw new ApiConnectionError(error);
  }

  let payload: unknown;

  try {
    payload = await response.json();
  } catch (error) {
    throw new ApiClientError("API returned a non-JSON response.", {
      code: "API_RESPONSE_PARSE_ERROR",
      statusCode: response.status,
      details: error,
    });
  }

  const apiResponseSchema = createApiResponseSchema(responseSchema);
  const parsed = apiResponseSchema.safeParse(payload);

  if (!parsed.success) {
    throw new ApiClientError("API response did not match the contract.", {
      code: "API_RESPONSE_CONTRACT_ERROR",
      statusCode: response.status,
      details: parsed.error.flatten(),
    });
  }

  const apiResponse = parsed.data as ApiResponse<Data>;

  if (!apiResponse.success) {
    throw fromApiError(apiResponse.error, response.status);
  }

  if (!response.ok) {
    throw new ApiClientError("API request failed.", {
      code: "API_HTTP_ERROR",
      statusCode: response.status,
      details: apiResponse.data,
    });
  }

  return apiResponse.data;
};
