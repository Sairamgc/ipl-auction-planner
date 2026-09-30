import type { PoolFilters } from "@/api";
import {
  BATTING_HAND_LABELS,
  BOWLING_STYLE_LABELS,
  formatLakh,
  ROLE_LABELS,
} from "@/domain";
import {
  BATTING_HANDS,
  BOWLING_STYLES,
  DEFAULT_POOL_SORT,
  DEFAULT_SORT_ORDER,
  PLAYER_ROLES,
  POOL_PAGE_SIZE,
  POOL_SORT_FIELDS,
  SORT_ORDERS,
} from "@shared/contracts";
import { z } from "zod";

/** A comma-separated list in the URL, or an array when navigating. */
function listOf<const T extends readonly [string, ...string[]]>(values: T) {
  return z
    .union([
      z.array(z.enum(values)),
      z
        .string()
        .transform((raw) => raw.split(",").filter(Boolean))
        .pipe(z.array(z.enum(values))),
    ])
    .transform((list) => (list.length > 0 ? list : undefined))
    .optional()
    .catch(undefined);
}

const flag = z.union([z.boolean(), z.stringbool()]).optional().catch(undefined);

const lakh = z
  .union([
    z.number().int().nonnegative(),
    z.string().regex(/^\d+$/).transform(Number),
  ])
  .optional()
  .catch(undefined);

/**
 * Pool search params in `/teams/$teamId` (§3, UI24). Same names and
 * formats as `GET /pool`. Each field falls back on its own when invalid,
 * so a bad link never breaks the page.
 */
export const poolSearchShape = {
  search: z
    .string()
    .trim()
    .max(100)
    .transform((value) => value || undefined)
    .optional()
    .catch(undefined),
  role: listOf(PLAYER_ROLES),
  bowlingStyle: listOf(BOWLING_STYLES),
  overseas: flag,
  capped: flag,
  battingHand: z.enum(BATTING_HANDS).optional().catch(undefined),
  minBase: lakh,
  maxBase: lakh,
  sort: z.enum(POOL_SORT_FIELDS).optional().catch(undefined),
  order: z.enum(SORT_ORDERS).optional().catch(undefined),
};

export const poolSearchSchema = z.object(poolSearchShape);
export type PoolSearch = z.output<typeof poolSearchSchema>;

/** The API query for the current search params (defaults filled in). */
export function toPoolFilters(search: PoolSearch): PoolFilters {
  const sort = search.sort ?? DEFAULT_POOL_SORT;
  const { minBase, maxBase } = search;
  return {
    search: search.search,
    role: search.role,
    bowlingStyle: search.bowlingStyle,
    overseas: search.overseas,
    capped: search.capped,
    battingHand: search.battingHand,
    minBase,
    // An inverted range from a hand-edited link: keep the minimum only
    maxBase:
      minBase !== undefined && maxBase !== undefined && maxBase < minBase
        ? undefined
        : maxBase,
    sort,
    order: search.order ?? DEFAULT_SORT_ORDER[sort],
    pageSize: POOL_PAGE_SIZE,
  };
}

/** Drops defaults and empty values, so URLs stay short. */
export function withoutDefaults(search: PoolSearch): PoolSearch {
  const sort = search.sort ?? DEFAULT_POOL_SORT;
  const order = search.order ?? DEFAULT_SORT_ORDER[sort];
  return {
    ...search,
    search: search.search?.trim() || undefined,
    role: search.role?.length ? search.role : undefined,
    bowlingStyle: search.bowlingStyle?.length ? search.bowlingStyle : undefined,
    sort: sort === DEFAULT_POOL_SORT ? undefined : sort,
    order: order === DEFAULT_SORT_ORDER[sort] ? undefined : order,
  };
}

/** Every filter off (sort kept): what "Clear all" / "Clear filters" do. */
export const CLEARED_FILTERS = {
  search: undefined,
  role: undefined,
  bowlingStyle: undefined,
  overseas: undefined,
  capped: undefined,
  battingHand: undefined,
  minBase: undefined,
  maxBase: undefined,
} satisfies Partial<PoolSearch>;

/** How many filter groups are on (search excluded: it is always visible). */
export function activeFilterCount(search: PoolSearch): number {
  return [
    search.role,
    search.bowlingStyle,
    search.overseas,
    search.capped,
    search.battingHand,
    search.minBase ?? search.maxBase,
  ].filter((value) => value !== undefined).length;
}

export interface FilterChip {
  key: string;
  label: string;
  /** The change that removes just this filter. */
  remove: Partial<PoolSearch>;
}

/** One removable chip per active filter value (UI26). */
export function filterChips(search: PoolSearch): FilterChip[] {
  const chips: FilterChip[] = [];
  if (search.search) {
    chips.push({
      key: "search",
      label: `Search: ${search.search}`,
      remove: { search: undefined },
    });
  }
  for (const role of search.role ?? []) {
    chips.push({
      key: `role-${role}`,
      label: `Role: ${ROLE_LABELS[role]}`,
      remove: { role: search.role?.filter((value) => value !== role) },
    });
  }
  for (const style of search.bowlingStyle ?? []) {
    chips.push({
      key: `bowling-${style}`,
      label: `Bowling: ${BOWLING_STYLE_LABELS[style]}`,
      remove: {
        bowlingStyle: search.bowlingStyle?.filter((value) => value !== style),
      },
    });
  }
  if (search.overseas !== undefined) {
    chips.push({
      key: "overseas",
      label: search.overseas ? "Overseas" : "Indian",
      remove: { overseas: undefined },
    });
  }
  if (search.capped !== undefined) {
    chips.push({
      key: "capped",
      label: search.capped ? "Capped" : "Uncapped",
      remove: { capped: undefined },
    });
  }
  if (search.battingHand) {
    chips.push({
      key: "batting",
      label: `Bats: ${BATTING_HAND_LABELS[search.battingHand]}`,
      remove: { battingHand: undefined },
    });
  }
  if (search.minBase !== undefined) {
    chips.push({
      key: "minBase",
      label: `Base from ${formatLakh(search.minBase)}`,
      remove: { minBase: undefined },
    });
  }
  if (search.maxBase !== undefined) {
    chips.push({
      key: "maxBase",
      label: `Base up to ${formatLakh(search.maxBase)}`,
      remove: { maxBase: undefined },
    });
  }
  return chips;
}
