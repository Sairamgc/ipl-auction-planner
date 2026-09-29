import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import type { RouterContext } from "@/app/router";

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  // Placeholder until the UI is designed
  notFoundComponent: () => <p className="p-4">Page not found.</p>,
});

function RootLayout() {
  return (
    <>
      <Outlet />
      {/* Excluded from production builds automatically */}
      <TanStackRouterDevtools position="bottom-right" />
    </>
  );
}
