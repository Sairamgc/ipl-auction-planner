import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { teamColorStyle } from "@/components/common/teamColorStyle";
import { useDocumentTitle } from "@/lib/useDocumentTitle";
import { useViewport } from "@/lib/useMediaQuery";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

import { DesktopLayout } from "./DesktopLayout";
import { MobileLayout } from "./MobileLayout";
import { TabletLayout } from "./TabletLayout";
import { useWorkspaceTeam } from "./useWorkspaceTeam";
import { WorkspaceHeader } from "./WorkspaceHeader";

const LAYOUTS = {
  mobile: MobileLayout,
  tablet: TabletLayout,
  desktop: DesktopLayout,
} as const;

/**
 * `/teams/$teamId`: the team workspace shell (§3). One layout is rendered
 * for the current breakpoint, so each panel exists once (UI12).
 */
export function WorkspacePage({ teamId }: { teamId: string }) {
  const state = useWorkspaceTeam(teamId);
  const viewport = useViewport();
  useDocumentTitle(
    state.status === "ready"
      ? state.franchise.name
      : state.status === "not-found"
        ? "Page not found"
        : null,
  );

  if (state.status === "error") {
    return (
      <ErrorState
        title="Couldn't load this team."
        description="Check your connection and try again."
        onRetry={state.retry}
        className="max-w-xl"
      />
    );
  }
  if (state.status === "not-found") {
    return (
      <EmptyState title="Page not found." className="max-w-xl">
        <Link to="/" className="text-primary underline underline-offset-4">
          Back to all teams
        </Link>
      </EmptyState>
    );
  }
  if (state.status === "loading") {
    return (
      <p role="status" className="text-muted-foreground">
        Loading team…
      </p>
    );
  }

  const Layout = LAYOUTS[viewport];
  return (
    <div
      style={teamColorStyle(state.franchise.colors)}
      className={cn(
        "flex flex-col gap-4",
        // Tablet and desktop fill the viewport; panels scroll on their own
        viewport !== "mobile" && "min-h-0 flex-1",
      )}
    >
      <WorkspaceHeader
        franchise={state.franchise}
        franchises={state.franchises}
        figures={state.figures}
      />
      <Layout />
    </div>
  );
}
