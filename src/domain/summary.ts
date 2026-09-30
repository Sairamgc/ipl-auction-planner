import { PLAYER_ROLES, type PlayerRole } from "@shared/contracts";

import { maxSafeBid } from "./maxSafeBid";
import { isOverseas } from "./overseas";
import type { PlannedTarget, SquadBaseline } from "./types";

export interface PlanSummary {
  purseLakh: number;
  plannedSpendLakh: number;
  /** Purse minus planned spend; negative when the plan is over purse. */
  remainingLakh: number;
  /** Retained players plus targets (D11). */
  squadCount: number;
  overseasCount: number;
  roleBreakdown: Record<PlayerRole, number>;
  /** Raw D5 value; may be negative. */
  maxSafeBidLakh: number;
}

export function summarisePlan(
  baseline: SquadBaseline,
  targets: PlannedTarget[],
): PlanSummary {
  const squad = [...baseline.retained, ...targets.map((t) => t.player)];
  const plannedSpendLakh = targets.reduce(
    (total, target) => total + target.expectedPriceLakh,
    0,
  );
  const remainingLakh = baseline.purseLakh - plannedSpendLakh;

  const roleBreakdown = Object.fromEntries(
    PLAYER_ROLES.map((role) => [role, 0]),
  ) as Record<PlayerRole, number>;
  for (const player of squad) roleBreakdown[player.role] += 1;

  return {
    purseLakh: baseline.purseLakh,
    plannedSpendLakh,
    remainingLakh,
    squadCount: squad.length,
    overseasCount: squad.filter((p) => isOverseas(p.nationality)).length,
    roleBreakdown,
    maxSafeBidLakh: maxSafeBid(remainingLakh, squad.length, baseline.rules),
  };
}
