import {
  DEFAULT_POOL_SORT,
  DEFAULT_SORT_ORDER,
  type PoolSortField,
  type SortOrder,
} from "@shared/contracts";

export interface SortOption {
  id: string;
  label: string;
  sort: PoolSortField;
  order: SortOrder;
}

/** The pool's "Sort by" choices (UI27), in menu order. */
export const SORT_OPTIONS: readonly SortOption[] = [
  {
    id: "basePrice-desc",
    label: "Base price: high to low",
    sort: "basePrice",
    order: "desc",
  },
  {
    id: "basePrice-asc",
    label: "Base price: low to high",
    sort: "basePrice",
    order: "asc",
  },
  { id: "name-asc", label: "Name: A to Z", sort: "name", order: "asc" },
  { id: "name-desc", label: "Name: Z to A", sort: "name", order: "desc" },
  // Age ascending = youngest first (A9)
  { id: "age-asc", label: "Age: youngest first", sort: "age", order: "asc" },
  { id: "age-desc", label: "Age: oldest first", sort: "age", order: "desc" },
];

/** The option for a sort, filling in the default order when none is given. */
export function sortOptionFor(
  sort: PoolSortField = DEFAULT_POOL_SORT,
  order: SortOrder = DEFAULT_SORT_ORDER[sort],
): SortOption {
  const option = SORT_OPTIONS.find(
    (candidate) => candidate.sort === sort && candidate.order === order,
  );
  if (!option) throw new Error(`No sort option for ${sort} ${order}`);
  return option;
}
