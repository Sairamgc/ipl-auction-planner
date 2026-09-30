import { describe, expect, it } from "vitest";

import { formatLakh, formatLakhLabel } from "./money";

describe("formatLakh", () => {
  it.each([
    [240, "₹2.40 Cr"],
    [200, "₹2.00 Cr"],
    [100, "₹1.00 Cr"],
    [2520, "₹25.20 Cr"],
    [4340, "₹43.40 Cr"],
    [10000, "₹100.00 Cr"],
    [99, "₹99 L"],
    [75, "₹75 L"],
    [0, "₹0 L"],
    [-0, "₹0 L"],
  ])("formats %i lakh as %s", (lakh, expected) => {
    expect(formatLakh(lakh)).toBe(expected);
  });

  it("formats negatives with a true minus sign", () => {
    expect(formatLakh(-120)).toBe("−₹1.20 Cr");
    expect(formatLakh(-75)).toBe("−₹75 L");
  });

  it("rejects fractional lakh", () => {
    expect(() => formatLakh(12.5)).toThrow(RangeError);
  });
});

describe("formatLakhLabel", () => {
  it("reads negatives as minus", () => {
    expect(formatLakhLabel(-120)).toBe("minus ₹1.20 Cr");
    expect(formatLakhLabel(-75)).toBe("minus ₹75 L");
  });

  it("matches the display text for other amounts", () => {
    expect(formatLakhLabel(240)).toBe(formatLakh(240));
    expect(formatLakhLabel(0)).toBe("₹0 L");
  });

  it("rejects fractional lakh", () => {
    expect(() => formatLakhLabel(-0.5)).toThrow(RangeError);
  });
});
