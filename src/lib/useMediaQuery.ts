import { useCallback, useSyncExternalStore } from "react";

import { BREAKPOINTS, type Viewport } from "./breakpoints";

/** Whether a CSS media query currently matches; updates when it changes. */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => {
        list.removeEventListener("change", onChange);
      };
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
  );
}

/** The current layout band (V8). */
export function useViewport(): Viewport {
  const isTablet = useMediaQuery(BREAKPOINTS.tablet);
  const isDesktop = useMediaQuery(BREAKPOINTS.desktop);
  if (isDesktop) return "desktop";
  return isTablet ? "tablet" : "mobile";
}
