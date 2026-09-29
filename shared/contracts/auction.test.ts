import { describe, expect, it } from "vitest";

import { AuctionSchema, SquadRulesSchema } from "./auction.ts";

const rules = {
  minSquadSize: 18,
  maxSquadSize: 25,
  maxOverseas: 8,
  lowestBasePriceLakh: 30,
};

describe("SquadRulesSchema", () => {
  it("accepts consistent rules", () => {
    expect(SquadRulesSchema.parse(rules)).toEqual(rules);
  });

  it("rejects a minimum above the maximum", () => {
    const result = SquadRulesSchema.safeParse({ ...rules, minSquadSize: 26 });
    expect(result.error?.issues[0]?.path).toEqual(["minSquadSize"]);
  });

  it("rejects an overseas cap above the maximum squad", () => {
    const result = SquadRulesSchema.safeParse({ ...rules, maxOverseas: 26 });
    expect(result.error?.issues[0]?.path).toEqual(["maxOverseas"]);
  });

  it("rejects a zero lowest base price", () => {
    expect(
      SquadRulesSchema.safeParse({ ...rules, lowestBasePriceLakh: 0 }).success,
    ).toBe(false);
  });
});

describe("AuctionSchema", () => {
  it("accepts an auction with rules", () => {
    const auction = {
      id: "ipl-2026",
      name: "IPL 2026 Auction",
      season: 2026,
      auctionDate: "2025-12-16",
      rules,
    };
    expect(AuctionSchema.parse(auction)).toEqual(auction);
  });
});
