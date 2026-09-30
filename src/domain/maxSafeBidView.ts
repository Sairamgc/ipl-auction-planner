import type { SquadRules } from "@shared/contracts";

import type { PlanSummary } from "./summary";
import type { PlanWarning } from "./warnings";

/** Why max safe bid shows what it shows; the UI words each reason (UI47). */
export type MaxSafeBidReason =
  /** Below zero, or the minimum squad is unaffordable: shown as ₹0 (D17). */
  | { code: "unsafe" }
  /** Places still to fill after the next player, at the lowest base price. */
  | { code: "slots"; slotsToFill: number }
  /** One place short: the next player completes the minimum squad. */
  | { code: "completes" }
  /** At or above the minimum squad. */
  | { code: "reached" }
  /** At or above the maximum squad: no bid applies, shown as "—" (D18). */
  | { code: "full" };

export interface MaxSafeBidView {
  /** Null when the squad is full: there is no next player to bid for. */
  displayedLakh: number | null;
  reason: MaxSafeBidReason;
}

/**
 * Max safe bid as displayed (D5, D17, D18). A full squad has no next
 * player, so there is no figure ("—"), whatever the purse. Otherwise ₹0
 * whenever it is not safe to bid: the raw value is negative or the
 * minimum-squad warning is active (one short with too little purse can
 * leave a positive raw value).
 */
export function maxSafeBidView(
  summary: PlanSummary,
  warnings: readonly PlanWarning[],
  rules: SquadRules,
): MaxSafeBidView {
  const { squadCount } = summary;
  if (squadCount >= rules.maxSquadSize) {
    return { displayedLakh: null, reason: { code: "full" } };
  }
  const unsafe =
    summary.maxSafeBidLakh < 0 ||
    warnings.some((warning) => warning.code === "min-squad-unaffordable");
  if (unsafe) return { displayedLakh: 0, reason: { code: "unsafe" } };

  const displayedLakh = summary.maxSafeBidLakh;
  if (squadCount >= rules.minSquadSize) {
    return { displayedLakh, reason: { code: "reached" } };
  }
  const slotsToFill = rules.minSquadSize - (squadCount + 1);
  if (slotsToFill === 0) {
    return { displayedLakh, reason: { code: "completes" } };
  }
  return { displayedLakh, reason: { code: "slots", slotsToFill } };
}
