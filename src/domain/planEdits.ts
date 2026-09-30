import type { Target } from "@shared/contracts";

/** Pure plan edits; the UI saves the list they return (D4). */

/** Adds a target; a player already in the plan is left unchanged. */
export function addTarget(
  targets: Target[],
  auctionEntryId: string,
  expectedPriceLakh: number,
): Target[] {
  if (targets.some((target) => target.auctionEntryId === auctionEntryId)) {
    return targets;
  }
  return [...targets, { auctionEntryId, expectedPriceLakh }];
}

export function updatePrice(
  targets: Target[],
  auctionEntryId: string,
  expectedPriceLakh: number,
): Target[] {
  return targets.map((target) =>
    target.auctionEntryId === auctionEntryId
      ? { ...target, expectedPriceLakh }
      : target,
  );
}

export function removeTarget(
  targets: Target[],
  auctionEntryId: string,
): Target[] {
  return targets.filter((target) => target.auctionEntryId !== auctionEntryId);
}

/** Undo of a removal: puts the target back at its old price (UI40). */
export function restoreTarget(targets: Target[], removed: Target): Target[] {
  return addTarget(targets, removed.auctionEntryId, removed.expectedPriceLakh);
}
