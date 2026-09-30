import { AppHeader } from "@/components/common/AppHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { useDocumentTitle } from "@/lib/useDocumentTitle";
import {
  createRootRouteWithContext,
  Link,
  Outlet,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import type { RouterContext } from "@/app/router";

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  notFoundComponent: NotFound,
});

/**
 * Mobile: the document scrolls. Tablet and desktop: the shell fills the
 * viewport and <main> scrolls, so a workspace can pin its header and let
 * each panel scroll on its own (UI12).
 */
function RootLayout() {
  return (
    // viewport-fit=cover: keep content clear of the notch and rounded
    // corners in landscape (UI21)
    <div className="flex min-h-dvh flex-col pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)] md:h-dvh">
      <AppHeader />
      <main className="flex flex-1 flex-col md:min-h-0 md:overflow-y-auto">
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-6 md:min-h-0 md:px-6">
          <Outlet />
        </div>
      </main>
      {/* Excluded from production builds automatically */}
      <TanStackRouterDevtools position="bottom-right" />
    </div>
  );
}

function NotFound() {
  useDocumentTitle("Page not found");
  return (
    <EmptyState title="Page not found." className="max-w-xl">
      <Link to="/" className="text-primary underline underline-offset-4">
        Back to all teams
      </Link>
    </EmptyState>
  );
}
