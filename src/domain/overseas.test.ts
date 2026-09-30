import { describe, expect, it } from "vitest";

import { isOverseas } from "./overseas";

describe("isOverseas", () => {
  it("treats India as home", () => {
    expect(isOverseas("IND")).toBe(false);
  });

  it.each(["AUS", "ENG", "AFG", "SA"] as const)(
    "treats %s as overseas",
    (nationality) => {
      expect(isOverseas(nationality)).toBe(true);
    },
  );
});
