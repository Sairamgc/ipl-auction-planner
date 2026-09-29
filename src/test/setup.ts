import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// jsdom does not implement scrolling; the router calls it on navigation
vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);

// RTL only auto-cleans when test globals are enabled; we import explicitly
afterEach(() => {
  cleanup();
});
