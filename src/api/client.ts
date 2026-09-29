import type { z } from "zod";

/**
 * Base path of every API request, written only here (decision S5).
 * In development the Vite proxy forwards it to the mock server.
 */
export const API_BASE = "/api";

/** Thrown for any non-2xx response. */
export class ApiError extends Error {
  readonly status: number;
  readonly path: string;

  constructor(status: number, path: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.path = path;
  }
}

export interface ApiRequestOptions {
  method?: "GET" | "PUT";
  /** Serialised as JSON. */
  body?: unknown;
  /** Lets TanStack Query cancel in-flight requests. */
  signal?: AbortSignal;
}

/**
 * Sends a request to `API_BASE + path` and returns the response body
 * validated against `schema`. Throws `ApiError` on non-2xx responses and
 * `ZodError` when the body does not match the contract.
 */
export async function apiRequest<TSchema extends z.ZodType>(
  path: string,
  schema: TSchema,
  { method = "GET", body, signal }: ApiRequestOptions = {},
): Promise<z.output<TSchema>> {
  const headers = new Headers({ Accept: "application/json" });
  if (body !== undefined) headers.set("Content-Type", "application/json");

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    throw new ApiError(
      response.status,
      path,
      `${method} ${path} failed with status ${String(response.status)}`,
    );
  }

  const data: unknown = await response.json();
  return schema.parse(data);
}
