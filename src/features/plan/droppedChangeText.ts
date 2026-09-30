import { formatLakh, isEmptyChange, type PlanChange } from "@/domain";

/**
 * Names what a failed save dropped (UI54), e.g. "Couldn't add Devon
 * Conway." Pure, so every wording is tested once.
 */
export function droppedChangeText(
  change: PlanChange,
  names: ReadonlyMap<string, string>,
): string {
  const name = (id: string) => names.get(id) ?? id;
  const parts = [
    ...change.added.map((t) => `add ${name(t.auctionEntryId)}`),
    ...change.removed.map((t) => `remove ${name(t.auctionEntryId)}`),
    ...change.repriced.map(
      (r) =>
        `change ${name(r.auctionEntryId)}’s price to ${formatLakh(r.toLakh)}`,
    ),
  ];
  if (isEmptyChange(change) || parts.length === 0) {
    return "Couldn’t save your last change.";
  }
  if (parts.length === 1) {
    return `Couldn’t ${parts[0] ?? ""}. Your saved plan doesn’t include it.`;
  }
  return `Couldn’t save ${String(parts.length)} changes: ${parts.join("; ")}. Your saved plan doesn’t include them.`;
}
