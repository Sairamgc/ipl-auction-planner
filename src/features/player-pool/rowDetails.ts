import { ageOn, isOverseas, ROLE_LABELS } from "@/domain";
import type { PoolRow } from "@shared/contracts";

/** Age on the auction date, or null until the auction has loaded. */
export function rowAge(row: PoolRow, auctionDate: string | undefined) {
  return auctionDate ? ageOn(row.player.dateOfBirth, auctionDate) : null;
}

/** "Bowler · AUS · 25 · Uncapped", for narrow rows (UI25). */
export function rowSummary(row: PoolRow, auctionDate: string | undefined) {
  const { player } = row;
  const age = rowAge(row, auctionDate);
  return [
    ROLE_LABELS[player.role],
    player.nationality,
    age === null ? null : String(age),
    player.isCapped ? null : "Uncapped",
  ]
    .filter(Boolean)
    .join(" · ");
}

export function rowIsOverseas(row: PoolRow) {
  return isOverseas(row.player.nationality);
}
