import type { Player, SquadRules } from "@shared/contracts";

/** A franchise's position after retentions, before any plan. */
export interface SquadBaseline {
  rules: SquadRules;
  /** Official pre-auction purse (P12). */
  purseLakh: number;
  retained: Player[];
}

/** A plan target resolved with its pool listing and player. */
export interface PlannedTarget {
  auctionEntryId: string;
  expectedPriceLakh: number;
  basePriceLakh: number;
  player: Player;
}
