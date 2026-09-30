import { RetentionSchema } from "@shared/contracts";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { apiRequest } from "./client";
import { READ_ONLY_QUERY } from "./queryDefaults";

export const retentionKeys = {
  all: ["retentions"] as const,
  list: () => [...retentionKeys.all, "list"] as const,
};

export function fetchRetentions(signal?: AbortSignal) {
  return apiRequest("/retentions", z.array(RetentionSchema), { signal });
}

export function retentionsQueryOptions() {
  return queryOptions({
    queryKey: retentionKeys.list(),
    queryFn: ({ signal }) => fetchRetentions(signal),
    ...READ_ONLY_QUERY,
  });
}

/** Squad baselines and picker previews, joined with players by features. */
export function useRetentions() {
  return useQuery(retentionsQueryOptions());
}
