import type {
  Franchise,
  Player,
  Retention,
  SquadRules,
} from "@shared/contracts";

import type { SquadBaseline } from "./types";

/**
 * A franchise's position after retentions (D15): its official purse and
 * retained players. Throws if a retention names an unknown player; seed
 * validation rules that out, so it only happens if the data is broken.
 */
export function squadBaseline(
  franchise: Franchise,
  rules: SquadRules,
  retentions: Retention[],
  playersById: ReadonlyMap<string, Player>,
): SquadBaseline {
  const retained = retentions
    .filter((retention) => retention.franchiseId === franchise.id)
    .map((retention) => {
      const player = playersById.get(retention.playerId);
      if (!player) {
        throw new Error(
          `Retention of unknown player "${retention.playerId}" by ${franchise.id}`,
        );
      }
      return player;
    });
  return { rules, purseLakh: franchise.purseRemainingLakh, retained };
}
