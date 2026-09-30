import { routeTree } from "@/routeTree.gen";
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { render } from "@testing-library/react";

import { parseSearch, stringifySearch } from "@/lib/searchParams";

import { createTestQueryClient } from "./query";

/** Renders the real route tree at `path`, with a test query client. */
export function renderRoute(
  path: string,
  client: QueryClient = createTestQueryClient(),
) {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
    context: { queryClient: client },
    parseSearch,
    stringifySearch,
  });
  const view = render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return { ...view, router, client };
}
