import type { RequestHandler } from "express";

import {
  HOME_NATIONALITY,
  type PoolPage,
  PoolPageSchema,
  type PoolQuery,
  PoolQuerySchema,
  type PoolRow,
  toStrict,
} from "../../shared/contracts/index.ts";
import type { Database } from "../dbSchema.ts";

import { sendError } from "./errors.ts";

const StrictPoolQuery = toStrict(PoolQuerySchema);
const StrictPoolPage = toStrict(PoolPageSchema);

/**
 * Filters, joins, sorts and pages the auction pool (requirements §8, §9).
 * Filters combine with AND; values within a multi-select filter with OR.
 */
export function queryPool(
  db: Pick<Database, "players" | "auctionEntries">,
  query: PoolQuery,
): PoolPage {
  const playersById = new Map(db.players.map((p) => [p.id, p]));
  const rows = db.auctionEntries.flatMap((entry): PoolRow[] => {
    const player = playersById.get(entry.playerId);
    return player
      ? [{ id: entry.id, basePriceLakh: entry.basePriceLakh, player }]
      : [];
  });

  const search = query.search && normalise(query.search);
  const matching = rows.filter(({ basePriceLakh, player }) => {
    const overseas = player.nationality !== HOME_NATIONALITY;
    return (
      (!search || normalise(player.name).includes(search)) &&
      (!query.role || query.role.includes(player.role)) &&
      (query.overseas === undefined || query.overseas === overseas) &&
      (query.capped === undefined || query.capped === player.isCapped) &&
      (!query.battingHand || query.battingHand === player.battingHand) &&
      (!query.bowlingStyle ||
        query.bowlingStyle.includes(player.bowlingStyle)) &&
      (query.minBase === undefined || basePriceLakh >= query.minBase) &&
      (query.maxBase === undefined || basePriceLakh <= query.maxBase)
    );
  });

  const direction = query.order === "asc" ? 1 : -1;
  const sorted = matching.toSorted(
    (a, b) =>
      direction * compareBy(query.sort, a, b) ||
      // Tie-break (I2): always name A–Z, then id, so pages never overlap
      compareNames(a.player.name, b.player.name) ||
      compareStrings(a.id, b.id),
  );

  const start = (query.page - 1) * query.pageSize;
  return {
    items: sorted.slice(start, start + query.pageSize),
    total: sorted.length,
    page: query.page,
    pageSize: query.pageSize,
  };
}

function compareBy(sort: PoolQuery["sort"], a: PoolRow, b: PoolRow): number {
  switch (sort) {
    case "name":
      return compareNames(a.player.name, b.player.name);
    case "basePrice":
      return a.basePriceLakh - b.basePriceLakh;
    case "age":
      // Age ascending = youngest first = latest date of birth first (A9)
      return compareStrings(b.player.dateOfBirth, a.player.dateOfBirth);
  }
}

const nameCollator = new Intl.Collator("en", { sensitivity: "base" });

function compareNames(a: string, b: string) {
  return nameCollator.compare(a, b);
}

function compareStrings(a: string, b: string) {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** Case- and accent-insensitive form for search. */
function normalise(text: string) {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

export function createPoolHandler(getDb: () => Database): RequestHandler {
  return (req, res) => {
    const query = StrictPoolQuery.safeParse(req.query);
    if (!query.success) {
      sendError(res, 400, "Invalid pool query", query.error);
      return;
    }
    // Self-check: never send a response that breaks the contract
    res.json(StrictPoolPage.parse(queryPool(getDb(), query.data)));
  };
}
