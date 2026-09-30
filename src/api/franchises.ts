import { FranchiseSchema } from "@shared/contracts";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { apiRequest } from "./client";
import { READ_ONLY_QUERY } from "./queryDefaults";

export const franchiseKeys = {
  all: ["franchises"] as const,
  list: () => [...franchiseKeys.all, "list"] as const,
};

export function fetchFranchises(signal?: AbortSignal) {
  return apiRequest("/franchises", z.array(FranchiseSchema), { signal });
}

export function franchisesQueryOptions() {
  return queryOptions({
    queryKey: franchiseKeys.list(),
    queryFn: ({ signal }) => fetchFranchises(signal),
    ...READ_ONLY_QUERY,
  });
}

/** Picker, team switcher and rival purses. */
export function useFranchises() {
  return useQuery(franchisesQueryOptions());
}
