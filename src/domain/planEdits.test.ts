import { describe, expect, it } from "vitest";

import {
  addTarget,
  removeTarget,
  restoreTarget,
  updatePrice,
} from "./planEdits";

const a = { auctionEntryId: "2026-a", expectedPriceLakh: 200 };
const b = { auctionEntryId: "2026-b", expectedPriceLakh: 75 };

describe("plan edits", () => {
  it("adds a target", () => {
    expect(addTarget([a], "2026-b", 75)).toEqual([a, b]);
  });

  it("never adds the same player twice", () => {
    const targets = [a];
    expect(addTarget(targets, "2026-a", 999)).toBe(targets);
  });

  it("updates one target's price", () => {
    expect(updatePrice([a, b], "2026-b", 90)).toEqual([
      a,
      { auctionEntryId: "2026-b", expectedPriceLakh: 90 },
    ]);
  });

  it("removes a target", () => {
    expect(removeTarget([a, b], "2026-a")).toEqual([b]);
  });

  it("restores a removed target at its old price", () => {
    expect(restoreTarget([b], a)).toEqual([b, a]);
    expect(restoreTarget([a, b], a)).toEqual([a, b]);
  });
});
