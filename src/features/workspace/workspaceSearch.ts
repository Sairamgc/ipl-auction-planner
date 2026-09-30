import { poolSearchShape } from "@/features/player-pool/search";
import { z } from "zod";

export const WORKSPACE_TABS = ["pool", "plan", "summary"] as const;
export type WorkspaceTab = (typeof WORKSPACE_TABS)[number];

/** Mobile opens on the pool: finding targets is the main task (UI13). */
export const DEFAULT_TAB: WorkspaceTab = "pool";

/**
 * `/teams/$teamId` search params. The mobile tab lives in the URL (§4);
 * the default is omitted so URLs stay clean, and an invalid value falls
 * back to the default.
 */
export const workspaceSearchSchema = z.object({
  tab: z.enum(WORKSPACE_TABS).optional().catch(undefined),
  // Pool filters, search and sort (§9), carried over on team switch (UI14)
  ...poolSearchShape,
});
export type WorkspaceSearch = z.infer<typeof workspaceSearchSchema>;

const WORKSPACE_SEARCH_KEYS = new Set(Object.keys(workspaceSearchSchema.shape));

/**
 * Route search middleware: drops keys the schema doesn't know (e.g. a stray
 * `?page=-1`), which the router would otherwise carry over from the raw URL.
 */
export function dropUnknownSearchKeys<T extends object>({
  search,
  next,
}: {
  search: T;
  next: (search: T) => T;
}): T {
  const result = next(search);
  return Object.fromEntries(
    Object.entries(result).filter(([key]) => WORKSPACE_SEARCH_KEYS.has(key)),
  ) as T;
}
