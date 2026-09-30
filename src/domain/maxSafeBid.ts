import type { SquadRules } from "@shared/contracts";

/**
 * Most you can bid for one more player and still afford the minimum squad
 * at the lowest base price (D5):
 *
 *   slotsToFill = max(0, minSquadSize − (squadCount + 1))
 *   maxSafeBid  = remaining − slotsToFill × lowestBasePrice
 *
 * The raw value may be negative; see `displayedMaxSafeBid`.
 */
export function maxSafeBid(
  remainingLakh: number,
  squadCount: number,
  rules: SquadRules,
): number {
  const slotsToFill = Math.max(0, rules.minSquadSize - (squadCount + 1));
  return remainingLakh - slotsToFill * rules.lowestBasePriceLakh;
}

/** A negative max safe bid is shown as ₹0 (and raises a warning). */
export function displayedMaxSafeBid(rawLakh: number): number {
  return Math.max(0, rawLakh);
}
