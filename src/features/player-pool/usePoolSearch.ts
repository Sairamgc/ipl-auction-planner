import { useNavigate, useSearch } from "@tanstack/react-router";
import { useCallback, useMemo } from "react";

import {
  CLEARED_FILTERS,
  type PoolSearch,
  toPoolFilters,
  withoutDefaults,
} from "./poolSearch";

/**
 * The pool's search, filters and sort, read from and written to the URL
 * (§9). Changes replace the history entry, so Back leaves the workspace
 * rather than stepping through every filter change (UI24).
 */
export function usePoolSearch() {
  const all = useSearch({ from: "/teams/$teamId" });
  const navigate = useNavigate({ from: "/teams/$teamId" });

  const search: PoolSearch = useMemo(
    () => ({
      search: all.search,
      role: all.role,
      bowlingStyle: all.bowlingStyle,
      overseas: all.overseas,
      capped: all.capped,
      battingHand: all.battingHand,
      minBase: all.minBase,
      maxBase: all.maxBase,
      sort: all.sort,
      order: all.order,
    }),
    [
      all.search,
      all.role,
      all.bowlingStyle,
      all.overseas,
      all.capped,
      all.battingHand,
      all.minBase,
      all.maxBase,
      all.sort,
      all.order,
    ],
  );
  const filters = useMemo(() => toPoolFilters(search), [search]);

  const update = useCallback(
    (change: Partial<PoolSearch>) => {
      void navigate({
        search: (previous) => ({
          ...previous,
          ...withoutDefaults({ ...previous, ...change }),
        }),
        replace: true,
      });
    },
    [navigate],
  );

  const clearFilters = useCallback(() => {
    update(CLEARED_FILTERS);
  }, [update]);

  return { search, filters, update, clearFilters };
}
