import { describe, expect, it } from "vitest";

import { contrastRatio } from "./contrast.ts";

describe("contrastRatio", () => {
  it("is 21 for black on white, in either order", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 5);
    expect(contrastRatio("#ffffff", "#000000")).toBeCloseTo(21, 5);
  });

  it("is 1 for identical colours", () => {
    expect(contrastRatio("#FDB913", "#FDB913")).toBe(1);
  });

  it("matches known WCAG reference values", () => {
    // #767676 is the lightest grey that passes 4.5:1 on white
    expect(contrastRatio("#767676", "#FFFFFF")).toBeCloseTo(4.54, 2);
    expect(contrastRatio("#777777", "#FFFFFF")).toBeLessThan(4.5);
  });
});
