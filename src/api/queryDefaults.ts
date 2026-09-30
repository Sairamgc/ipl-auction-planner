/**
 * Options for read-only reference data (N4): auction, franchises, players,
 * retentions, auction entries and the pool never change during a session.
 */
export const READ_ONLY_QUERY = {
  staleTime: Infinity,
  refetchOnWindowFocus: false,
} as const;
