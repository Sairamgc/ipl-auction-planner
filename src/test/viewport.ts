import type { Viewport } from "@/lib/breakpoints";

const WIDTHS: Record<Viewport, number> = {
  mobile: 375,
  tablet: 900,
  desktop: 1440,
};

const ROOT_FONT_SIZE = 16;
let width = WIDTHS.desktop;

/** Evaluates `(min-width: …)` queries, in px or rem, against `width`. */
function matches(query: string): boolean {
  const match = /\(min-width:\s*([\d.]+)(px|rem)\)/.exec(query);
  if (!match) return false;
  const [, value = "0", unit] = match;
  const minPx = Number(value) * (unit === "rem" ? ROOT_FONT_SIZE : 1);
  return width >= minPx;
}

/** jsdom has no layout; stub matchMedia so components see a viewport. */
export function installMatchMedia() {
  window.matchMedia = (query: string) =>
    ({
      media: query,
      get matches() {
        return matches(query);
      },
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }) satisfies MediaQueryList;
}

/** Renders as if on a phone, tablet or desktop screen (V8). */
export function setViewport(viewport: Viewport) {
  width = WIDTHS[viewport];
}

export function resetViewport() {
  width = WIDTHS.desktop;
}
