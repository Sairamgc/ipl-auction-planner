import { describe, expect, it } from "vitest";

import { validateExpectedPrice } from "./validateExpectedPrice";

describe("validateExpectedPrice", () => {
  it.each([
    ["200", 200],
    [" 240 ", 240],
    ["5000", 5000],
  ])("accepts %j as %i lakh", (text, lakh) => {
    expect(validateExpectedPrice(text, 200)).toEqual({ ok: true, lakh });
  });

  it("requires a value", () => {
    expect(validateExpectedPrice("  ", 200)).toEqual({
      ok: false,
      error: "Enter an expected price.",
    });
  });

  it.each(["12.5", "-5", "abc", "2e2", "1,000", "99999999999999999999"])(
    "rejects %j as not whole lakh",
    (text) => {
      expect(validateExpectedPrice(text, 30)).toEqual({
        ok: false,
        error: "Use whole lakh, e.g. 240 for ₹2.40 Cr.",
      });
    },
  );

  it("blocks prices below the base (D10)", () => {
    expect(validateExpectedPrice("199", 200)).toEqual({
      ok: false,
      error: "At least the base price, ₹2.00 Cr.",
    });
    expect(validateExpectedPrice("29", 30)).toEqual({
      ok: false,
      error: "At least the base price, ₹30 L.",
    });
  });
});
