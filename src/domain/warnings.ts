import type { SquadRules } from "@shared/contracts";

import type { PlanSummary } from "./summary";

/** Plan rule breaks (D6, D13, D16). They never block (P9); the UI words them. */
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
  // Independent of max safe bid (D16): can the remaining purse buy every
  // player still missing from the minimum squad at the lowest base price?
  const slotsShort = Math.max(0, rules.minSquadSize - summary.squadCount);
  const neededLakh = slotsShort * rules.lowestBasePriceLakh;
  if (slotsShort > 0 && summary.remainingLakh < neededLakh) {
    warnings.push({
      code: "min-squad-unaffordable",
      shortfallLakh: neededLakh - summary.remainingLakh,
    });
  }
  return warnings;
}
