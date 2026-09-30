import type { SquadRules } from "@shared/contracts";

import type { PlanSummary } from "./summary";

/** Plan rule breaks (D6, D13). They never block (P9); the UI words them. */
export type PlanWarning =
  | { code: "over-purse"; overByLakh: number }
  | { code: "over-max-squad"; squadCount: number; maxSquadSize: number }
  | { code: "over-overseas-cap"; overseasCount: number; maxOverseas: number }
  | { code: "min-squad-unaffordable"; shortfallLakh: number };

export function planWarnings(
  summary: PlanSummary,
  rules: SquadRules,
): PlanWarning[] {
  const warnings: PlanWarning[] = [];
  if (summary.remainingLakh < 0) {
    warnings.push({ code: "over-purse", overByLakh: -summary.remainingLakh });
  }
  if (summary.squadCount > rules.maxSquadSize) {
    warnings.push({
      code: "over-max-squad",
      squadCount: summary.squadCount,
      maxSquadSize: rules.maxSquadSize,
    });
  }
  if (summary.overseasCount > rules.maxOverseas) {
    warnings.push({
      code: "over-overseas-cap",
      overseasCount: summary.overseasCount,
      maxOverseas: rules.maxOverseas,
    });
  }
  if (summary.maxSafeBidLakh < 0) {
    warnings.push({
      code: "min-squad-unaffordable",
      shortfallLakh: -summary.maxSafeBidLakh,
    });
  }
  return warnings;
}
