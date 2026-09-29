import { describe, expect, it } from "vitest";

import { AuctionResultSchema } from "./auctionResult.ts";

describe("AuctionResultSchema", () => {
  it("accepts a sold result with franchise and price", () => {
    const sold = {
      auctionEntryId: "2026-cameron-green",
      status: "sold",
      franchiseId: "kkr",
      priceLakh: 2520,
    };
    expect(AuctionResultSchema.parse(sold)).toEqual(sold);
  });

  it("rejects a sold result without a price", () => {
    expect(
      AuctionResultSchema.safeParse({
        auctionEntryId: "2026-cameron-green",
        status: "sold",
        franchiseId: "kkr",
      }).success,
    ).toBe(false);
  });

  it("accepts an unsold result", () => {
    const unsold = { auctionEntryId: "2026-some-player", status: "unsold" };
    expect(AuctionResultSchema.parse(unsold)).toEqual(unsold);
  });

  it("rejects an unknown status", () => {
    expect(
      AuctionResultSchema.safeParse({
        auctionEntryId: "2026-some-player",
        status: "withdrawn",
      }).success,
    ).toBe(false);
  });
});
