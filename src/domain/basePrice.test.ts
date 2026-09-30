import { describe, expect, it } from "vitest";

import { BASE_PRICE_SLABS, maxBaseOptions, minBaseOptions } from "./basePrice";

describe("base-price slabs", () => {
  it("lists the eight official slabs in ascending order", () => {
    expect(BASE_PRICE_SLABS).toEqual([30, 40, 50, 75, 100, 125, 150, 200]);
  });

  it("offers every slab when the other end is open", () => {
    expect(minBaseOptions(undefined)).toEqual([...BASE_PRICE_SLABS]);
    expect(maxBaseOptions(undefined)).toEqual([...BASE_PRICE_SLABS]);
  });

  it("never lets the range invert", () => {
    expect(minBaseOptions(75)).toEqual([30, 40, 50, 75]);
    expect(maxBaseOptions(100)).toEqual([100, 125, 150, 200]);
  });
});
