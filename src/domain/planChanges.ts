import type { Target } from "@shared/contracts";

/**
 * What a save tried to change, relative to the plan it started from. Used
 * to name and re-apply a change dropped by a failed save (UI54).
 */
export interface PlanChange {
  added: Target[];
  removed: Target[];
  repriced: { auctionEntryId: string; fromLakh: number; toLakh: number }[];
}

export const NO_CHANGE: PlanChange = { added: [], removed: [], repriced: [] };

export function isEmptyChange(change: PlanChange): boolean {
  return (
    change.added.length === 0 &&
    change.removed.length === 0 &&
    change.repriced.length === 0
  );
}

/** The change that turns `before` into `after`. */
export function diffTargets(before: Target[], after: Target[]): PlanChange {
  const beforeById = new Map(before.map((t) => [t.auctionEntryId, t]));
  const afterIds = new Set(after.map((t) => t.auctionEntryId));
  const change: PlanChange = { added: [], removed: [], repriced: [] };
  for (const target of after) {
    const old = beforeById.get(target.auctionEntryId);
    if (!old) change.added.push(target);
    else if (old.expectedPriceLakh !== target.expectedPriceLakh) {
      change.repriced.push({
        auctionEntryId: target.auctionEntryId,
        fromLakh: old.expectedPriceLakh,
        toLakh: target.expectedPriceLakh,
      });
    }
  }
  for (const target of before) {
    if (!afterIds.has(target.auctionEntryId)) change.removed.push(target);
  }
  return change;
}

/** Applies a change on top of `targets`, keeping everything else as it is. */
export function applyChange(targets: Target[], change: PlanChange): Target[] {
  const removedIds = new Set(change.removed.map((t) => t.auctionEntryId));
  const prices = new Map<string, number>([
    ...change.repriced.map((r) => [r.auctionEntryId, r.toLakh] as const),
    ...change.added.map(
      (t) => [t.auctionEntryId, t.expectedPriceLakh] as const,
    ),
  ]);
  const next = targets
    .filter((t) => !removedIds.has(t.auctionEntryId))
    .map((t) => {
      const price = prices.get(t.auctionEntryId);
      return price === undefined ? t : { ...t, expectedPriceLakh: price };
    });
  const present = new Set(next.map((t) => t.auctionEntryId));
  for (const target of change.added) {
    if (!present.has(target.auctionEntryId)) next.push(target);
  }
  return next;
}

/** Whether `targets` already contain the whole change. */
export function containsChange(targets: Target[], change: PlanChange): boolean {
  const byId = new Map(targets.map((t) => [t.auctionEntryId, t]));
  return (
    change.added.every(
      (t) =>
        byId.get(t.auctionEntryId)?.expectedPriceLakh === t.expectedPriceLakh,
    ) &&
    change.removed.every((t) => !byId.has(t.auctionEntryId)) &&
    change.repriced.every(
      (r) => byId.get(r.auctionEntryId)?.expectedPriceLakh === r.toLakh,
    )
  );
}

/**
 * Combines two dropped changes; for a player in both, the later one wins
 * (it reflects what the user asked for last).
 */
export function mergeChanges(
  earlier: PlanChange,
  later: PlanChange,
): PlanChange {
  const laterIds = new Set([
    ...later.added.map((t) => t.auctionEntryId),
    ...later.removed.map((t) => t.auctionEntryId),
    ...later.repriced.map((r) => r.auctionEntryId),
  ]);
  const keep = <T extends { auctionEntryId: string }>(items: T[]) =>
    items.filter((item) => !laterIds.has(item.auctionEntryId));
  return {
    added: [...keep(earlier.added), ...later.added],
    removed: [...keep(earlier.removed), ...later.removed],
    repriced: [...keep(earlier.repriced), ...later.repriced],
  };
}
