import type { Player, PlayerRole } from "@shared/contracts";

import type { PlannedTarget } from "./types";

/** Plan panel order: batting first, then keeping, all-rounders, bowling. */
export const ROLE_ORDER: readonly PlayerRole[] = [
  "batter",
  "wicketkeeper",
  "all-rounder",
  "bowler",
];

export interface RoleGroup {
  role: PlayerRole;
  /** Alphabetical. */
  retained: Player[];
  /** Highest expected price first, then name (D7). */
  targets: PlannedTarget[];
}

const byName = new Intl.Collator("en", { sensitivity: "base" });

/**
 * The squad by role: retained players and targets together, so each
 * role's balance is visible at a glance (UI37). Empty roles are left out.
 */
export function groupSquadByRole(
  retained: Player[],
  targets: PlannedTarget[],
): RoleGroup[] {
  return ROLE_ORDER.map((role) => ({
    role,
    retained: retained
      .filter((player) => player.role === role)
      .sort((a, b) => byName.compare(a.name, b.name)),
    targets: targets
      .filter((target) => target.player.role === role)
      .sort(
        (a, b) =>
          b.expectedPriceLakh - a.expectedPriceLakh ||
          byName.compare(a.player.name, b.player.name),
      ),
  })).filter((group) => group.retained.length + group.targets.length > 0);
}
