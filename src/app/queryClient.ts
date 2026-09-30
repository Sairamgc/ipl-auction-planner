import { QueryClient } from "@tanstack/react-query";

import { shouldRetryRead } from "@/api";

/**
 * App-wide defaults (N4). Freshness is set per resource in `api/`:
 * read-only reference data never goes stale; plans use normal freshness.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: shouldRetryRead },
    mutations: { retry: false },
  },
});
