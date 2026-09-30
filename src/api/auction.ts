import { AuctionSchema } from "@shared/contracts";
import { queryOptions, useQuery } from "@tanstack/react-query";

import { apiRequest } from "./client";
import { READ_ONLY_QUERY } from "./queryDefaults";

export const auctionKeys = {
  all: ["auction"] as const,
};

export function fetchAuction(signal?: AbortSignal) {
  return apiRequest("/auction", AuctionSchema, { signal });
}

export function auctionQueryOptions() {
  return queryOptions({
    queryKey: auctionKeys.all,
    queryFn: ({ signal }) => fetchAuction(signal),
    ...READ_ONLY_QUERY,
  });
}

export function useAuction() {
  return useQuery(auctionQueryOptions());
}
