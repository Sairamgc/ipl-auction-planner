import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

import { installMatchMedia, resetViewport } from "./viewport";

// jsdom does not implement scrolling; the router calls it on navigation
vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);

// jsdom has no matchMedia; tests render as desktop unless they choose
installMatchMedia();

// RTL only auto-cleans when test globals are enabled; we import explicitly
afterEach(() => {
  cleanup();
  resetViewport();
});
