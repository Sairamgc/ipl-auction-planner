/// <reference types="vitest/config" />
import { fileURLToPath, URL } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // Must run before the React plugin (TanStack Router docs)
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
  ],
  server: {
    // The app calls /api/*; forward it unchanged to the mock server
    proxy: { "/api": "http://localhost:3001" },
  },
  resolve: {
    // Keep in sync with `paths` in tsconfig.app.json
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@shared": fileURLToPath(new URL("./shared", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: [
      "src/**/*.test.{ts,tsx}",
      "shared/**/*.test.ts",
      "mock-server/**/*.test.ts",
    ],
    // Undo vi.stubGlobal (e.g. fetch) after every test
    unstubGlobals: true,
  },
});
