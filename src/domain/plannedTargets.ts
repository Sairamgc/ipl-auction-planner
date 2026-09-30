import type { AuctionEntry, Player, Target } from "@shared/contracts";

import type { PlannedTarget } from "./types";

export interface ResolvedTargets {
  resolved: PlannedTarget[];
  /** Targets whose auction entry or player is missing: shown, never dropped. */
  unknown: Target[];
}

/** Joins stored targets to their auction entry and player (N28). */
export function plannedTargets(
  targets: Target[],
  entriesById: ReadonlyMap<string, AuctionEntry>,
  playersById: ReadonlyMap<string, Player>,
): ResolvedTargets {
  const resolved: PlannedTarget[] = [];
  const unknown: Target[] = [];
  for (const target of targets) {
    const entry = entriesById.get(target.auctionEntryId);
    const player = entry && playersById.get(entry.playerId);
    if (!entry || !player) {
      unknown.push(target);
      continue;
    }
    resolved.push({
      auctionEntryId: target.auctionEntryId,
      expectedPriceLakh: target.expectedPriceLakh,
      basePriceLakh: entry.basePriceLakh,
      player,
    });
  }
  return { resolved, unknown };
}
