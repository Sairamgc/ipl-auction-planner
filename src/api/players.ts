import { PlayerSchema } from "@shared/contracts";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { apiRequest } from "./client";
import { READ_ONLY_QUERY } from "./queryDefaults";

export const playerKeys = {
  all: ["players"] as const,
  list: () => [...playerKeys.all, "list"] as const,
};

export function fetchPlayers(signal?: AbortSignal) {
  return apiRequest("/players", z.array(PlayerSchema), { signal });
}

export function playersQueryOptions() {
  return queryOptions({
    queryKey: playerKeys.list(),
    queryFn: ({ signal }) => fetchPlayers(signal),
    ...READ_ONLY_QUERY,
  });
}

export function usePlayers() {
  return useQuery(playersQueryOptions());
}
