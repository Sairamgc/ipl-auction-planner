import type { Player, SquadRules } from "@shared/contracts";

import type { PlannedTarget, SquadBaseline } from "@/domain";

/** IPL 2026 squad rules. */
export function makeRules(overrides: Partial<SquadRules> = {}): SquadRules {
  return {
    minSquadSize: 18,
    maxSquadSize: 25,
    maxOverseas: 8,
    lowestBasePriceLakh: 30,
    ...overrides,
  };
}

let playerCount = 0;

export function makePlayer(overrides: Partial<Player> = {}): Player {
  playerCount += 1;
  return {
    id: `player-${String(playerCount)}`,
    name: `Player ${String(playerCount)}`,
    dateOfBirth: "1995-01-01",
    nationality: "IND",
    role: "batter",
    battingHand: "right",
    bowlingStyle: "none",
    isCapped: true,
    ...overrides,
  };
}

export function makePlayers(count: number, overrides: Partial<Player> = {}) {
  return Array.from({ length: count }, () => makePlayer(overrides));
}

export function makeBaseline(
  overrides: Partial<SquadBaseline> = {},
): SquadBaseline {
  return { rules: makeRules(), purseLakh: 4340, retained: [], ...overrides };
}

export function makeTarget(
  expectedPriceLakh: number,
  playerOverrides: Partial<Player> = {},
): PlannedTarget {
  const player = makePlayer(playerOverrides);
  return {
    auctionEntryId: `2026-${player.id}`,
    expectedPriceLakh,
    basePriceLakh: 30,
    player,
  };
}
