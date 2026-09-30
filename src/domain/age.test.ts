import { describe, expect, it } from "vitest";

import { ageOn } from "./age";

const AUCTION_DATE = "2025-12-16";

describe("ageOn", () => {
  it("counts completed years", () => {
    expect(ageOn("1988-11-05", AUCTION_DATE)).toBe(37);
    expect(ageOn("2007-07-16", AUCTION_DATE)).toBe(18);
  });

  it("counts the birthday itself", () => {
    expect(ageOn("2000-12-16", AUCTION_DATE)).toBe(25);
  });

  it("does not count a birthday later in the month or year", () => {
    expect(ageOn("2000-12-17", AUCTION_DATE)).toBe(24);
    expect(ageOn("1994-12-25", AUCTION_DATE)).toBe(30);
  });

  describe("29 February birthdays", () => {
    it("fall on 1 March in non-leap years", () => {
      expect(ageOn("2004-02-29", "2025-02-28")).toBe(20);
      expect(ageOn("2004-02-29", "2025-03-01")).toBe(21);
    });

    it("fall on 29 February in leap years", () => {
      expect(ageOn("2004-02-29", "2024-02-28")).toBe(19);
      expect(ageOn("2004-02-29", "2024-02-29")).toBe(20);
    });

    it("follow the century rules for leap years", () => {
      // 2100 is not a leap year; 2000 is
      expect(ageOn("2096-02-29", "2100-02-28")).toBe(3);
      expect(ageOn("1996-02-29", "2000-02-29")).toBe(4);
    });
  });

  it("rejects dates that are not YYYY-MM-DD", () => {
    expect(() => ageOn("05/11/1988", AUCTION_DATE)).toThrow(RangeError);
  });
});
