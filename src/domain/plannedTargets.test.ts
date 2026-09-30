import { makePlayer } from "@/test/factories";
import { describe, expect, it } from "vitest";

import { plannedTargets } from "./plannedTargets";

const green = makePlayer({ id: "cameron-green", name: "Cameron Green" });
const entries = new Map([
  [
    "2026-cameron-green",
    { id: "2026-cameron-green", playerId: "cameron-green", basePriceLakh: 200 },
  ],
  ["2026-ghost", { id: "2026-ghost", playerId: "ghost", basePriceLakh: 30 }],
]);
const players = new Map([[green.id, green]]);

describe("plannedTargets", () => {
  it("joins each target to its base price and player", () => {
    const { resolved, unknown } = plannedTargets(
      [{ auctionEntryId: "2026-cameron-green", expectedPriceLakh: 240 }],
      entries,
      players,
    );
    expect(resolved).toEqual([
      {
        auctionEntryId: "2026-cameron-green",
        expectedPriceLakh: 240,
        basePriceLakh: 200,
        player: green,
      },
    ]);
    expect(unknown).toEqual([]);
  });

  it("reports targets with a missing entry or player instead of dropping them", () => {
    const missingEntry = {
      auctionEntryId: "2026-nobody",
      expectedPriceLakh: 50,
    };
    const missingPlayer = {
      auctionEntryId: "2026-ghost",
      expectedPriceLakh: 40,
    };
    const { resolved, unknown } = plannedTargets(
      [missingEntry, missingPlayer],
      entries,
      players,
    );
    expect(resolved).toEqual([]);
    expect(unknown).toEqual([missingEntry, missingPlayer]);
  });
});
