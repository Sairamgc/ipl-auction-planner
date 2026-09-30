import { AuctionEntrySchema } from "@shared/contracts";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { apiRequest } from "./client";
import { READ_ONLY_QUERY } from "./queryDefaults";

export const auctionEntryKeys = {
  all: ["auctionEntries"] as const,
  list: () => [...auctionEntryKeys.all, "list"] as const,
};

export function fetchAuctionEntries(signal?: AbortSignal) {
  return apiRequest("/auctionEntries", z.array(AuctionEntrySchema), {
    signal,
  });
}

export function auctionEntriesQueryOptions() {
  return queryOptions({
    queryKey: auctionEntryKeys.list(),
    queryFn: ({ signal }) => fetchAuctionEntries(signal),
    ...READ_ONLY_QUERY,
  });
}

/**
 * Static reference data (N28): with the players list, resolves any plan
 * target to its base price and player without another request.
 */
export function useAuctionEntries() {
  return useQuery(auctionEntriesQueryOptions());
}
