import type { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";

import { parseSearch, stringifySearch } from "@/lib/searchParams";
import { routeTree } from "@/routeTree.gen";

import { queryClient } from "./queryClient";

/** Available to every route's loader and beforeLoad via `context`. */
export interface RouterContext {
  queryClient: QueryClient;
}

export const router = createRouter({
  routeTree,
  context: { queryClient } satisfies RouterContext,
  // Readable URLs in the API's format (UI24)
  parseSearch,
  stringifySearch,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
