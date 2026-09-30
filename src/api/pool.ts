import {
  type PoolPage,
  PoolPageSchema,
  type PoolQuery,
} from "@shared/contracts";
import { infiniteQueryOptions, useInfiniteQuery } from "@tanstack/react-query";

import { apiRequest } from "./client";
import { READ_ONLY_QUERY } from "./queryDefaults";

/** Everything in a pool query except the page, which the infinite query owns. */
export type PoolFilters = Omit<PoolQuery, "page">;

export const poolKeys = {
  all: ["pool"] as const,
  list: (filters: PoolFilters) => [...poolKeys.all, "list", filters] as const,
};

/** Serialises typed filters to the `GET /pool` query string (§8, N10). */
export function toPoolSearchParams(
  filters: PoolFilters,
  page: number,
): URLSearchParams {
  const params = new URLSearchParams();
  const set = (key: string, value: string | number | boolean | undefined) => {
    if (value !== undefined) params.set(key, String(value));
  };
  set("search", filters.search);
  set("role", filters.role?.join(","));
  set("overseas", filters.overseas);
  set("capped", filters.capped);
  set("battingHand", filters.battingHand);
  set("bowlingStyle", filters.bowlingStyle?.join(","));
  set("minBase", filters.minBase);
  set("maxBase", filters.maxBase);
  set("sort", filters.sort);
  set("order", filters.order);
  set("page", page);
  set("pageSize", filters.pageSize);
  return params;
}

export function fetchPoolPage(
  filters: PoolFilters,
  page: number,
  signal?: AbortSignal,
) {
  return apiRequest("/pool", PoolPageSchema, {
    signal,
    searchParams: toPoolSearchParams(filters, page),
  });
}

/** Next page number, or undefined once every row has been loaded. */
export function nextPoolPage(lastPage: PoolPage): number | undefined {
  return lastPage.page * lastPage.pageSize < lastPage.total
    ? lastPage.page + 1
    : undefined;
}

export function poolQueryOptions(filters: PoolFilters) {
  return infiniteQueryOptions({
    queryKey: poolKeys.list(filters),
    queryFn: ({ pageParam, signal }) =>
      fetchPoolPage(filters, pageParam, signal),
    initialPageParam: 1,
    getNextPageParam: nextPoolPage,
    ...READ_ONLY_QUERY,
  });
}

/** Server-side filtered, sorted pool with infinite scroll (A3, A7). */
export function usePool(filters: PoolFilters) {
  return useInfiniteQuery(poolQueryOptions(filters));
}
