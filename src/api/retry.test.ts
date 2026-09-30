import { describe, expect, it } from "vitest";
import { z } from "zod";

import { ApiError } from "./client";
import { shouldRetryRead } from "./retry";

describe("shouldRetryRead", () => {
  it("retries server errors and network failures twice", () => {
    const serverError = new ApiError(503, "/pool", "unavailable");
    const networkError = new TypeError("Failed to fetch");
    for (const error of [serverError, networkError]) {
      expect(shouldRetryRead(0, error)).toBe(true);
      expect(shouldRetryRead(1, error)).toBe(true);
      expect(shouldRetryRead(2, error)).toBe(false);
    }
  });

  it("never retries client errors", () => {
    expect(shouldRetryRead(0, new ApiError(404, "/plans/xyz", "missing"))).toBe(
      false,
    );
    expect(shouldRetryRead(0, new ApiError(400, "/pool", "bad"))).toBe(false);
  });

  it("never retries contract mismatches or unknown errors", () => {
    const zodError = z.string().safeParse(1).error;
    expect(shouldRetryRead(0, zodError)).toBe(false);
    expect(shouldRetryRead(0, new Error("boom"))).toBe(false);
  });
});
