import { describe, expect, it } from "vitest";

import { formatDate } from "./date";

describe("formatDate", () => {
  it("formats calendar dates as day, short month, year", () => {
    expect(formatDate("2025-12-16")).toBe("16 Dec 2025");
    expect(formatDate("2026-01-01")).toBe("1 Jan 2026");
  });

  it("rejects values that are not dates", () => {
    expect(() => formatDate("16/12/2025")).toThrow(RangeError);
  });
});
