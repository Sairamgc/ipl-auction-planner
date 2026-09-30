/** The workspace h1; the team switcher moves focus here (UI15). */
export const WORKSPACE_TITLE_ID = "workspace-title";

/**
 * Focuses the workspace title once the new team has rendered. The router
 * may remount the page on a team change, so the page can't do this itself.
 */
export function focusWorkspaceTitle() {
  requestAnimationFrame(() => {
    document.getElementById(WORKSPACE_TITLE_ID)?.focus();
  });
}
