import type { SquadRules } from "@shared/contracts";

import type { PlanSummary } from "./summary";

/** Informational, not a warning (§7): the squad is below the minimum. */
export interface PlanNote {
  code: "below-min-squad";
  squadCount: number;
  minSquadSize: number;
  playersShort: number;
}

export function planNote(
  summary: PlanSummary,
  rules: SquadRules,
): PlanNote | null {
  if (summary.squadCount >= rules.minSquadSize) return null;
  return {
    code: "below-min-squad",
    squadCount: summary.squadCount,
    minSquadSize: rules.minSquadSize,
    playersShort: rules.minSquadSize - summary.squadCount,
  };
}
