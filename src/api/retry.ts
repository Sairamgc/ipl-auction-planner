import { ApiError } from "./client";

/** Reads retry twice (N4). */
export const MAX_READ_RETRIES = 2;

/**
 * Retry policy for queries (N4): network errors and 5xx responses retry up
 * to twice with TanStack Query's default backoff. 4xx responses and
 * contract mismatches (ZodError) never retry; trying again cannot fix them.
 */
export function shouldRetryRead(failureCount: number, error: unknown): boolean {
  if (failureCount >= MAX_READ_RETRIES) return false;
  if (error instanceof ApiError) return error.status >= 500;
  // fetch rejects with a TypeError when the network fails
  return error instanceof TypeError;
}
