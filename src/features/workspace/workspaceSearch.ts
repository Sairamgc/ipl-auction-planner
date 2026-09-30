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
});
export type WorkspaceSearch = z.infer<typeof workspaceSearchSchema>;
