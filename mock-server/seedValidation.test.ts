import { describe, expect, it } from "vitest";

import type { Database } from "./dbSchema.ts";
import { validateSeed } from "./seedValidation.ts";

/** Fixture element access that fails loudly if the fixture changes shape. */
function at<T>(list: T[], index: number): T {
  const item = list[index];
  if (item === undefined)
    throw new Error(`fixture has no item ${String(index)}`);
  return item;
}

function validSeed(): Database {
  return {
    auction: {
      id: "ipl-2026",
      name: "IPL 2026 Player Auction",
      season: 2026,
      auctionDate: "2025-12-16",
      rules: {
        minSquadSize: 18,
        maxSquadSize: 25,
        maxOverseas: 8,
        lowestBasePriceLakh: 30,
      },
    },
    franchises: [
      {
        id: "csk",
        name: "Chennai Super Kings",
        shortName: "CSK",
        purseRemainingLakh: 4340,
        colors: {
          primary: "#FFFF00",
          onPrimary: "#000000",
          secondary: "#000080",
          onSecondary: "#FFFFFF",
        },
      },
    ],
    players: [
      {
        id: "retained-one",
        name: "Retained One",
        dateOfBirth: "1990-01-01",
        nationality: "IND",
        role: "batter",
        battingHand: "right",
        bowlingStyle: "none",
        isCapped: true,
      },
      {
        id: "pooled-two",
        name: "Pooled Two",
        dateOfBirth: "1995-06-15",
        nationality: "AUS",
        role: "bowler",
        battingHand: "left",
        bowlingStyle: "left-arm-fast",
        isCapped: true,
      },
    ],
    retentions: [{ franchiseId: "csk", playerId: "retained-one" }],
    auctionEntries: [
      { id: "2026-pooled-two", playerId: "pooled-two", basePriceLakh: 200 },
    ],
    auctionResults: [
      {
        auctionEntryId: "2026-pooled-two",
        status: "sold",
        franchiseId: "csk",
        priceLakh: 2520,
      },
    ],
    plans: [{ id: "csk", franchiseId: "csk", targets: [], updatedAt: null }],
  };
}

describe("validateSeed", () => {
  it("accepts a valid seed", () => {
    expect(validateSeed(validSeed())).toEqual([]);
  });

  it("rejects unknown keys anywhere (strict contracts)", () => {
    const seed = validSeed();
    Object.assign(seed.players[0] ?? {}, { nickname: "x" });
    expect(validateSeed(seed)).toEqual([expect.stringContaining("players.0")]);
  });

  it("reports shape errors with their path", () => {
    const seed = {
      ...validSeed(),
      auction: { ...validSeed().auction, season: "2026" },
    };
    expect(validateSeed(seed)).toEqual([
      expect.stringMatching(/^auction\.season:/),
    ]);
  });

  const cases: [string, (seed: Database) => void, RegExp][] = [
    [
      "duplicate player ids",
      (s) => s.players.push({ ...at(s.players, 1), name: "Copy" }),
      /duplicate player id: pooled-two/,
    ],
    [
      "low-contrast team colours",
      (s) => {
        at(s.franchises, 0).colors.onPrimary = "#FFFFAA";
      },
      /csk: onPrimary on primary contrast .* below 4.5:1/,
    ],
    [
      "retention of an unknown player",
      (s) => s.retentions.push({ franchiseId: "csk", playerId: "ghost" }),
      /unknown player ghost/,
    ],
    [
      "retention by an unknown franchise",
      (s) => s.retentions.push({ franchiseId: "mi", playerId: "pooled-two" }),
      /unknown franchise mi/,
    ],
    [
      "a player retained twice",
      (s) =>
        s.retentions.push({ franchiseId: "csk", playerId: "retained-one" }),
      /duplicate retained player: retained-one/,
    ],
    [
      "too many overseas retained",
      (s) => {
        s.auction.rules.maxOverseas = 0;
        at(s.players, 0).nationality = "ENG";
      },
      /1 overseas retained exceeds cap 0/,
    ],
    [
      "a retained player in the pool",
      (s) => (at(s.auctionEntries, 0).playerId = "retained-one"),
      /player retained-one is retained/,
    ],
    [
      "a base price below the lowest base",
      (s) => {
        at(s.auctionEntries, 0).basePriceLakh = 20;
        s.auctionResults = [
          { auctionEntryId: "2026-pooled-two", status: "unsold" },
        ];
      },
      /base 20 is below the lowest base 30/,
    ],
    [
      "a player neither retained nor pooled",
      (s) => s.players.push({ ...at(s.players, 1), id: "orphan" }),
      /player orphan: neither retained nor in the pool/,
    ],
    [
      "a pool entry without a result",
      (s) => {
        s.auctionResults = [];
      },
      /2026-pooled-two: no auction result/,
    ],
    [
      "a result for an unknown entry",
      (s) =>
        s.auctionResults.push({
          auctionEntryId: "2026-ghost",
          status: "unsold",
        }),
      /unknown entry 2026-ghost/,
    ],
    [
      "a sale to a franchise that is not in the data (FU1)",
      (s) => {
        s.auctionResults = [
          {
            auctionEntryId: "2026-pooled-two",
            status: "sold",
            franchiseId: "abc",
            priceLakh: 300,
          },
        ];
      },
      /unknown franchise abc/,
    ],
    [
      "a sale below the base price",
      (s) => {
        s.auctionResults = [
          {
            auctionEntryId: "2026-pooled-two",
            status: "sold",
            franchiseId: "csk",
            priceLakh: 150,
          },
        ];
      },
      /price 150 is below base 200/,
    ],
    [
      "a franchise without a plan",
      (s) => {
        s.plans = [];
      },
      /franchise csk: no plan/,
    ],
    [
      "a seeded plan with targets",
      (s) => {
        at(s.plans, 0).targets = [
          { auctionEntryId: "2026-pooled-two", expectedPriceLakh: 300 },
        ];
      },
      /plan csk: seeded plans must be empty/,
    ],
  ];

  it.each(cases)("reports %s", (_name, mutate, expected) => {
    const seed = validSeed();
    mutate(seed);
    // A broken record can trip related rules too; the named rule must fire
    expect(validateSeed(seed)).toContainEqual(expect.stringMatching(expected));
  });
});
