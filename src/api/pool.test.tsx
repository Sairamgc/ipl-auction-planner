import { PoolQuerySchema } from "@shared/contracts";
import {
  createTestQueryClient,
  createWrapper,
  jsonResponse,
  mockFetch,
  urlOf,
} from "@/test/query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  nextPoolPage,
  type PoolFilters,
  poolQueryOptions,
  toPoolSearchParams,
  usePool,
} from "./pool";

function filters(input: Record<string, string> = {}): PoolFilters {
  // The infinite query owns the page; drop it from the parsed query
  return Object.fromEntries(
    Object.entries(PoolQuerySchema.parse(input)).filter(
      ([key]) => key !== "page",
    ),
  ) as PoolFilters;
}

describe("toPoolSearchParams", () => {
  it("serialises every filter in the contract's format", () => {
    const params = toPoolSearchParams(
      filters({
        search: "kohli",
        role: "batter,all-rounder",
        overseas: "false",
        capped: "true",
        battingHand: "left",
        bowlingStyle: "leg-spin,off-spin",
        minBase: "30",
        maxBase: "200",
        sort: "name",
      }),
      2,
    );
    expect(Object.fromEntries(params)).toEqual({
      search: "kohli",
      role: "batter,all-rounder",
      overseas: "false",
      capped: "true",
      battingHand: "left",
      bowlingStyle: "leg-spin,off-spin",
      minBase: "30",
      maxBase: "200",
      sort: "name",
      order: "asc",
      page: "2",
      pageSize: "25",
    });
  });

  it("omits filters that are not set", () => {
    expect(toPoolSearchParams(filters(), 1).toString()).toBe(
      "sort=basePrice&order=desc&page=1&pageSize=25",
    );
  });

  it("round-trips through the contract", () => {
    const original = filters({
      role: "bowler",
      overseas: "true",
      minBase: "50",
    });
    const parsed = PoolQuerySchema.parse(
      Object.fromEntries(toPoolSearchParams(original, 3)),
    );
    expect(parsed).toEqual({ ...original, page: 3 });
  });
});

describe("nextPoolPage", () => {
  it("asks for the next page while rows remain", () => {
    expect(nextPoolPage({ items: [], total: 60, page: 1, pageSize: 25 })).toBe(
      2,
    );
    expect(nextPoolPage({ items: [], total: 60, page: 2, pageSize: 25 })).toBe(
      3,
    );
  });

  it("stops after the last page", () => {
    expect(
      nextPoolPage({ items: [], total: 60, page: 3, pageSize: 25 }),
    ).toBeUndefined();
    expect(
      nextPoolPage({ items: [], total: 50, page: 2, pageSize: 25 }),
    ).toBeUndefined();
    expect(
      nextPoolPage({ items: [], total: 0, page: 1, pageSize: 25 }),
    ).toBeUndefined();
  });
});

describe("usePool", () => {
  it("loads pages on demand until the total is reached", async () => {
    const fetchMock = mockFetch((url) =>
      jsonResponse({
        items: [],
        total: 30,
        page: Number(url.searchParams.get("page")),
        pageSize: 25,
      }),
    );
    const { result } = renderHook(() => usePool(filters()), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    await waitFor(() => {
      expect(result.current.hasNextPage).toBe(true);
    });
    await act(() => result.current.fetchNextPage());

    await waitFor(() => {
      expect(result.current.hasNextPage).toBe(false);
    });
    expect(result.current.data?.pages.map((page) => page.page)).toEqual([1, 2]);
    expect(
      fetchMock.mock.calls.map(([url]) => urlOf(url).searchParams.get("page")),
    ).toEqual(["1", "2"]);
  });

  it("keys the cache by filters, so a filter change starts from page 1", () => {
    expect(poolQueryOptions(filters({ role: "bowler" })).queryKey).not.toEqual(
      poolQueryOptions(filters({ role: "batter" })).queryKey,
    );
  });

  it("treats the pool as read-only (N4)", () => {
    expect(poolQueryOptions(filters())).toMatchObject({
      staleTime: Infinity,
      refetchOnWindowFocus: false,
    });
  });
});
