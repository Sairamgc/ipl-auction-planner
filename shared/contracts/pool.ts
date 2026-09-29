import { z } from "zod";

import { IdSchema, LakhSchema } from "./common.ts";
import {
  BATTING_HANDS,
  BOWLING_STYLES,
  PLAYER_ROLES,
  PlayerSchema,
} from "./player.ts";

export const POOL_PAGE_SIZE = 25; // I1
export const POOL_MAX_PAGE_SIZE = 100;

export const POOL_SORT_FIELDS = ["name", "basePrice", "age"] as const;
export type PoolSortField = (typeof POOL_SORT_FIELDS)[number];
export const SORT_ORDERS = ["asc", "desc"] as const;
export type SortOrder = (typeof SORT_ORDERS)[number];

export const DEFAULT_POOL_SORT: PoolSortField = "basePrice";

/**
 * Direction used when a request gives `sort` but no `order`: highest base
 * price first, names A–Z, youngest first. Age sorts by date of birth, so
 * `age asc` = newest date of birth first (A9).
 */
export const DEFAULT_SORT_ORDER: Record<PoolSortField, SortOrder> = {
  basePrice: "desc",
  name: "asc",
  age: "asc",
};

/** Comma-separated multi-select, e.g. `role=batter,bowler`. */
function csvOf<const T extends readonly [string, ...string[]]>(values: T) {
  return z
    .string()
    .transform((raw) => raw.split(",").filter(Boolean))
    .pipe(z.array(z.enum(values)).min(1));
}

const wholeNumber = z
  .string()
  .regex(/^\d+$/, "Must be a whole number")
  .transform(Number);

/**
 * `GET /pool` query string. Input is the raw string values; output is typed
 * with defaults applied. Filters combine with AND; values within a
 * multi-select filter combine with OR.
 */
export const PoolQuerySchema = z
  .object({
    search: z
      .string()
      .trim()
      .max(100)
      .transform((value) => value || undefined)
      .optional(),
    role: csvOf(PLAYER_ROLES).optional(),
    overseas: z.stringbool().optional(),
    capped: z.stringbool().optional(),
    battingHand: z.enum(BATTING_HANDS).optional(),
    bowlingStyle: csvOf(BOWLING_STYLES).optional(),
    minBase: wholeNumber.optional(),
    maxBase: wholeNumber.optional(),
    sort: z.enum(POOL_SORT_FIELDS).default(DEFAULT_POOL_SORT),
    order: z.enum(SORT_ORDERS).optional(),
    page: wholeNumber.pipe(z.number().min(1)).default(1),
    pageSize: wholeNumber
      .pipe(z.number().min(1).max(POOL_MAX_PAGE_SIZE))
      .default(POOL_PAGE_SIZE),
  })
  .refine(
    (query) =>
      query.minBase === undefined ||
      query.maxBase === undefined ||
      query.minBase <= query.maxBase,
    { message: "minBase must not exceed maxBase", path: ["minBase"] },
  )
  .transform((query) => ({
    ...query,
    order: query.order ?? DEFAULT_SORT_ORDER[query.sort],
  }));
export type PoolQueryInput = z.input<typeof PoolQuerySchema>;
export type PoolQuery = z.output<typeof PoolQuerySchema>;

/** An auction entry joined with its player. `id` is the auction entry id. */
export const PoolRowSchema = z.object({
  id: IdSchema,
  basePriceLakh: LakhSchema.positive(),
  player: PlayerSchema,
});
export type PoolRow = z.infer<typeof PoolRowSchema>;

export const PoolPageSchema = z.object({
  items: z.array(PoolRowSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
});
export type PoolPage = z.infer<typeof PoolPageSchema>;
